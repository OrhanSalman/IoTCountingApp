import os
import signal
import time
import settings
import asyncio
import multiprocessing
import threading
from src.utils.logger import Logger
from src.control import start_counting, start_model_benchmark, start_mongo_client, start_mqtt_client, stop_stream
from src.core.api.server import app
from hypercorn.config import Config
from hypercorn.asyncio import serve
from src.utils.tools import daily_restart, load_config

cleanup_done = False

logger = Logger("Main", settings.LOG_PATH + "/main.log")
#server_access_logger = Logger("ServerAccess", settings.LOG_PATH + "/server_access.log")
#server_error_logger = Logger("ServerError", settings.LOG_PATH + "/server_error.log")

def create_app():
    """Erstellt und konfiguriert die Flask-Anwendung."""
    return app

def initialize_services():
    #settings.settings_loaded_event.wait()

    #daily_restart()
    #set = load_config(settings.SYSTEM_SETTINGS_PATH)
    #
    #auto_start_inference = set.get("auto_start_inference", False)
    #auto_start_mqtt_client = set.get("auto_start_mqtt_client", False)
    #auto_start_mongo_client = set.get("auto_start_mongo_client", False)
    
    if settings.AUTO_START_MONGO_CLIENT:
        logger.info("Autostart des MongoDB Clients ist aktiviert.")
        start_mongo_client()

    if settings.AUTO_START_MQTT_CLIENT:
        logger.info("Autostart des MQTT Clients ist aktiviert.")
        start_mqtt_client()

    if not settings.BENCHED and not settings.APP_DEV_MODE:
        logger.info("Starte erstes Benchmarking. Ein Neustart im Anschluss ist empfohlen.")
        start_model_benchmark()
    elif settings.AUTO_START_INFERENCE:
        logger.info("Autostart der Inferenz ist aktiviert.")
        start_counting()
    else:
        pass



# Konfiguration für Hypercorn
config = Config()
config.bind = [f"0.0.0.0:{settings.APP_PORT}"]
config.workers = 1 # Leave it as it is
config.read_timeout = 60
config.startup_timeout = 60
config.shutdown_timeout = 60
config.keep_alive_timeout = 5
config.graceful_timeout = 60
config.use_reloader = False
config.loglevel = "info"
#config.accesslog = settings.LOG_PATH + "/server_access.log"
#config.errorlog = settings.LOG_PATH + "/server_error.log"


def cleanup():
    """Bereinigt alle Services und sorgt dafür, dass es nur einmal ausgeführt wird."""
    global cleanup_done
    if cleanup_done:
        return True, None

    from src.control import stop_counting, stop_model_benchmark, stop_mongo_client, stop_mqtt_client
    logger.info("Bereinigung wird durchgeführt.")
    try:
        stop_counting()
        stop_mqtt_client()
        stop_model_benchmark()
        stop_stream()
        stop_mongo_client()
        logger.info("Bereinigung abgeschlossen.")
        cleanup_done = True
        return True, None
    except Exception as e:
        error = f"Fehler beim Beenden der Services: {e}"
        logger.error(error)
        return False, error


def force_kill():
    """Erzwinge das Beenden des Prozesses mit SIGKILL."""
    logger.error("SIGTERM fehlgeschlagen, sende SIGKILL...")
    os.kill(os.getpid(), signal.SIGKILL)

def signal_handler(sig, frame):
    """Signal-Handler für SIGINT und SIGTERM."""
    global cleanup_done
    if cleanup_done:
        return
    
    # RAM Release
    import gc
    gc.collect()
    
    

    logger.info(f"Signal {sig} empfangen, versuche Anwendung zu beenden...")
    success, error_message = cleanup()
    
    if not success:
        logger.error(f"Aufräumen fehlgeschlagen: {error_message}")
    else:
        logger.info("Anwendung sauber beendet.")
    exit(0)


if __name__ == "__main__":
    try:
        multiprocessing.set_start_method("spawn", force=True)
    except Exception as e:
        pass

    settings.settings_loaded_event.wait()
    application = create_app()
    initialize_services()

    # https://www.gnu.org/software/libc/manual/html_node/Termination-Signals.html
    signal.signal(signal.SIGINT, signal_handler)  # STRG+C. Beendet den Prozess. Kann ignoriert werden.
    signal.signal(signal.SIGTERM, signal_handler)  # Der gesunde Weg. Bittet den Prozess, sich ordentlich zu beenden und sich selbst aufzuräumen. Kann ignoriert werden.

    try:
        with open("server.pid", "w") as f:
            f.write(str(os.getpid()))

        if settings.APP_DEV_MODE:
            application.run(host="0.0.0.0", port=settings.APP_PORT, debug=True, use_reloader=True)
        else:
            asyncio.run(serve(application, config=config))

    except Exception as e:
        logger.error(f"Fehler beim Ausführen des Servers: {e}")
    finally:
        success, error_message = cleanup()
        if not success:
            logger.error(f"Fehler beim endgültigen Aufräumen: {error_message}")

        if os.path.exists("server.pid"):
            os.remove("server.pid")
            logger.info("PID-Datei entfernt.")
        
        logger.info("Anwendung beendet.")
        