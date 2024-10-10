import os
import settings
from cryptography.fernet import Fernet

class EncryptionManager:
    MQTT_DATA_FILE = 'mqtt_settings.enc'
    MONGO_DATA_FILE = 'mongo_settings.enc'

    def __init__(self):
        # Lade den Verschlüsselungsschlüssel
        self.key = self._load_key_from_env()
        self.cipher_suite = Fernet(self.key)

    def _load_key_from_env(self):
        """Lade den Schlüssel aus der Umgebungsvariable oder generiere einen neuen Schlüssel."""
        key_env = settings.ENCRYPTION_KEY
        
        if key_env:
            try:
                key = key_env.encode()  # Umwandeln des Strings in Bytes
                # Versuche, mit dem Schlüssel ein Fernet-Objekt zu erstellen, um die Validität zu überprüfen
                Fernet(key)
            except (TypeError, ValueError):
                # Schlüssel ist ungültig
                key = Fernet.generate_key()
                self._save_key_to_env(key)  # Speichere den neuen Schlüssel in der Umgebungsvariable
        else:
            # Keine Umgebungsvariable gefunden
            key = Fernet.generate_key()
            self._save_key_to_env(key)  # Speichere den neuen Schlüssel in der Umgebungsvariable
        
        return key

    def _save_key_to_env(self, key):
        """Speichere den Schlüssel in der .env-Datei oder in einer anderen dauerhaften Quelle."""
        with open('.env', 'a') as f:
            f.write(f'ENCRYPTION_KEY={key.decode()}\n')

    def encrypt_data(self, data):
        """Verschlüssele die übergebenen Daten."""
        return self.cipher_suite.encrypt(data.encode())

    def decrypt_data(self, encrypted_data):
        """Entschlüssele die übergebenen Daten."""
        try:
            return self.cipher_suite.decrypt(encrypted_data).decode()
        except Exception as e:
            raise e

    def save_data(self, data, type):
        """Speichere die verschlüsselten Daten in einer Datei."""
        if type == "mqtt":
            file_path = self.MQTT_DATA_FILE
        elif type == "mongo":
            file_path = self.MONGO_DATA_FILE
        else:
            raise ValueError("Unbekannter Datentyp. Erwartet 'mqtt' oder 'mongo'.")

        # Daten in die entsprechende Datei schreiben
        with open(file_path, 'wb') as file:
            file.write(data)

    def load_data(self, type):
        """Lade die verschlüsselten Daten aus der Datei."""
        if type == "mqtt":
            file_path = self.MQTT_DATA_FILE
        elif type == "mongo":
            file_path = self.MONGO_DATA_FILE
        else:
            raise ValueError("Unbekannter Datentyp. Erwartet 'mqtt' oder 'mongo'.")

        # Überprüfen, ob die Datei existiert, bevor versucht wird, die Daten zu laden
        if not os.path.exists(file_path):
            return None
        
        with open(file_path, 'rb') as file:
            return file.read()
