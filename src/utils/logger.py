import logging
from logging.handlers import TimedRotatingFileHandler
import os

class Logger:
    def __init__(self, name, log_file, level=logging.INFO, when='W0', interval=1, backup_count=7):
        """
        Initializes a new logger with timed rotation of log files.

        :param name: Name of the logger.
        :param log_file: Path to the log file.
        :param level: Logging level.
        :param when: Time interval for rotating the log files (default: weekly rotation).
        :param interval: Interval for rotating the log files (default: every week).
        :param backup_count: How many backup files to keep (default: 7).
        """
        log_dir = os.path.dirname(log_file)
        if not os.path.exists(log_dir):
            os.makedirs(log_dir)

        self.logger = logging.getLogger(name)
        self.logger.setLevel(level)

        # Ensure no duplicate handlers are added
        if not self.logger.handlers:
            # Create a TimedRotatingFileHandler that writes log entries to a file
            file_handler = TimedRotatingFileHandler(
                log_file, 
                when=when, 
                interval=interval, 
                backupCount=backup_count
            )
            file_handler.setLevel(level)

            # Create a console handler that writes log entries to the console
            console_handler = logging.StreamHandler()
            console_handler.setLevel(level)

            # Create a logging format
            formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
            file_handler.setFormatter(formatter)
            console_handler.setFormatter(formatter)

            # Add the handlers to the logger
            self.logger.addHandler(file_handler)
            self.logger.addHandler(console_handler)

    def info(self, message):
        self.logger.info(message)

    def warning(self, message):
        self.logger.warning(message)

    def error(self, message):
        self.logger.error(message)

    def debug(self, message):
        self.logger.debug(message)
