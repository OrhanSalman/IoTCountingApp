
import threading
from src.core.inference.exporter import export
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


def real_time_status(reached_fps, expected_fps):
    global real_time
    real_time = None

    if expected_fps is None or reached_fps is None:
        return None

    tolerated_fps = expected_fps * 0.9
    acceptable_fps = expected_fps * 0.75

    if reached_fps >= expected_fps:
        real_time = 2
    elif tolerated_fps <= reached_fps < expected_fps:
        real_time = 2
    elif acceptable_fps <= reached_fps < tolerated_fps:
        real_time = 1
    else:
        real_time = 0

    return real_time
