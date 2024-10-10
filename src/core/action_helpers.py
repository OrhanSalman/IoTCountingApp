
import threading
from src.core.yolo.exporter import export
from src.utils.logger import Logger


error = None
export_thread: threading.Thread = None

def export_model(parameters, logger: Logger):
    global error, export_thread
    error = None

    def target():
        global error
        try:
            logger.info(f"Exporting with parameters: {parameters}")
            export(**parameters)
        except Exception as e:
            error = str(e)
            logger.error(f"Exception in export: {error}")

    export_thread = threading.Thread(target=target, daemon=True)
    export_thread.start()
    export_thread.join()

    if error:
        logger.error(f"Error in export: {error}")
        return False, error
    return True, None
