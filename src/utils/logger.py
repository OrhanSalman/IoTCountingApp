import logging
from logging.handlers import TimedRotatingFileHandler
import os

class Logger:
    def __init__(self, name, log_file, level=logging.INFO, when='W0', interval=1, backup_count=7):
        """
        Initialisiert einen neuen Logger mit zeitgesteuerter Rotation der Log-Dateien.

        :param name: Name des Loggers.
        :param log_file: Pfad zur Log-Datei.
        :param level: Logging Level.
        :param when: Zeitintervall für die Rotation der Log-Dateien (Standard: wöchentliche Rotation).
        :param interval: Intervall für die Rotation der Log-Dateien (Standard: jede Woche).
        :param backup_count: Wie viele Backup-Dateien behalten werden sollen (Standard: 7).
        """
        log_dir = os.path.dirname(log_file)
        if not os.path.exists(log_dir):
            os.makedirs(log_dir)

        self.logger = logging.getLogger(name)
        self.logger.setLevel(level)

        # Stellt sicher, dass keine doppelten Handler hinzugefügt werden
        if not self.logger.handlers:
            # Erstellt einen TimedRotatingFileHandler, der Log-Einträge in eine Datei schreibt
            file_handler = TimedRotatingFileHandler(
                log_file, 
                when=when, 
                interval=interval, 
                backupCount=backup_count
            )
            file_handler.setLevel(level)

            # Erstellt einen console handler, der Log-Einträge auf die Konsole schreibt
            console_handler = logging.StreamHandler()
            console_handler.setLevel(level)

            # Erstellt ein Logging-Format
            formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
            file_handler.setFormatter(formatter)
            console_handler.setFormatter(formatter)

            # Fügt die Handler zum Logger hinzu
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
