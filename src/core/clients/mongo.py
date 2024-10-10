import settings
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from datetime import datetime, timezone
from bson import ObjectId
from src.utils.logger import Logger


logger = Logger("MongoClient", settings.LOG_PATH + "/mongoclient.log")


class MongoDB:
    def __init__(self, host, port, db, authEnabled, username=None, password=None):
        self.host = host
        self.port = port
        self.db = db
        self.authEnabled = authEnabled
        self.username = username
        self.password = password

        if authEnabled and username and password:
            self.mongo_uri = f"mongodb://{username}:{password}@{host}:{port}/"
        else:
            self.mongo_uri = f"mongodb://{host}:{port}/"
        
        try:
            self.client = MongoClient(self.mongo_uri)
            self.db = self.client[db]
        except ConnectionFailure as e:
            logger.error(f"Fehler beim Herstellen der Verbindung: {e}")


    def connect(self):
        """
        Stellt die Verbindung zu MongoDB her.
        """
        try:
            # TODO: das blockiert den Thread, sollte asynchron sein
            self.client.server_info()  # Wirft eine Exception, falls die Verbindung fehlschlägt
            info = "Mongo Client started."
            logger.info(info)
            return True, info
        except Exception as e:
            error = f"Fehler beim Herstellen der Verbindung: {e}"
            logger.error(error)
            self.client.close()
            return False, error
        

    def is_connected(self):
        """
        Prüft, ob eine Verbindung zu MongoDB besteht.
        """
        try:
            self.client.server_info()
            return True
        except Exception as e:
            error = f"Keine Verbindung zu MongoDB: {e}"
            logger.error(error)
            return False, error

    def get_collections(self):
        """
        Ruft alle vorhandenen Collections in der Datenbank ab.
        """
        try:
            collections = self.db.list_collection_names()
            return collections
        except Exception as e:
            error = f"Fehler beim Abrufen der Collections: {e}"
            logger.error(error)
            return error

    def create_collections_for_inference(self, inference_id, deviceConfigId):
        try:
            print(f"Creating collections for inference {inference_id} and device {deviceConfigId}")
            self.counts_collection = self._get_or_create_collection(settings.MONGO_COLLECTION_COUNTS + "_" + deviceConfigId + "_" + inference_id)
            self.tracking_collection = self._get_or_create_collection(settings.MONGO_COLLECTION_TRACKING + "_" + deviceConfigId + "_" + inference_id)
            self.times_collection = self._get_or_create_collection(settings.MONGO_COLLECTION_TIMES + "_" + deviceConfigId + "_" + inference_id)
            return True, None
        except Exception as e:
            error = f"Fehler beim Erstellen der Collections für {inference_id}: {e}"
            logger.error(error)
            return False, error


    def _get_or_create_collection(self, collection_name: str):
        """
        Erstellt eine Collection mit dem angegebenen Namen, falls sie nicht bereits existiert,
        und gibt die Collection zurück.

        Args:
            collection_name (str): Der Name der zu erstellenden oder abzurufenden Collection.

        Returns:
            Collection: Die vorhandene oder neu erstellte Collection.
        """
        try:
            existing_collections = self.db.list_collection_names()

            if collection_name not in existing_collections:
                self.db.create_collection(collection_name)
            return self.db[collection_name]
        except Exception as e:
            error = f"Fehler beim Erstellen der Collection: {e}"
            logger.error(error)
            return error

    def save_to_collection(self, data, collection_name):
        """
        Speichert Daten in der angegebenen Collection.
        """
        try:
            self._get_or_create_collection(collection_name)
            
            data['timestamp'] = datetime.now(timezone.utc)
            data['published'] = False

            collection = self.db[collection_name]

            if collection is None:
                logger.warning(f"Collection {collection_name} existiert nicht.")
                return

            collection.insert_one(data)
            return True, None
        except Exception as e:
            error = f"Fehler beim Speichern der Daten: {e}"
            logger.error(error)
            return False, error
        
    def get_unpublished_data(self, collection_name: str):
        """
        Ruft alle Daten aus der angegebenen Collection ab, bei denen 'published' auf false gesetzt ist.

        Args:
            collection_name (str): Der Name der Collection.

        Returns:
            List: Die ungefilterten Daten in der Collection, bei denen 'published' False ist.
        """
        try:
            #if not self.is_connected():
            #    warning = "Abfrage fehlgeschlagen: Keine Verbindung zu MongoDB."
            #    logger.warning(warning)
            #    return False, warning
            
            collection = self.db.get_collection(collection_name)
            unpublished_data = list(collection.find({"published": False}).limit(50)) # TODO: maximale anzahl an verschickenden nachrichten gleichzeitig
            
            return True, unpublished_data if unpublished_data else None
        except Exception as e:
            error = f"Fehler beim Abrufen der ungefilterten Daten: {e}"
            logger.error(error)
            return False, error

    def set_data_published(self, collection_name: str, data_id):
        """
        Setzt das 'published'-Flag für das Dokument mit der angegebenen ID in der Collection auf True.
        """
        try:
            collection = self.db.get_collection(collection_name)

            # Wenn data_id ein Dictionary ist, hole die ID aus dem Dictionary
            if isinstance(data_id, dict):
                data_id = data_id.get("_id")  # Hier anpassen, um die richtige ID zu holen

            object_id = ObjectId(data_id)  # Umwandlung in ObjectId
            result = collection.update_one({"_id": object_id}, {"$set": {"published": True}})
        except Exception as e:
            error = f"Fehler beim Markieren des Dokuments als veröffentlicht: {e}"
            logger.error(error)
            return error

    def update_data(self, filter: dict, update: dict, collection_name: str):
        """
        Aktualisiert Daten in der angegebenen Collection basierend auf einem Filter und Update-Daten.
        """
        try:
            collection = getattr(self, collection_name, None)
            if collection:
                result = collection.update_many(filter, {'$set': update})
                logger.info(f"{result.modified_count} Dokument(e) aktualisiert in {collection_name}.")
            else:
                warning = f"Collection {collection_name} existiert nicht."
                logger.warning(warning)
                return warning
        except Exception as e:
            error = f"Fehler beim Aktualisieren der Daten: {e}"
            logger.error(error)
            return error

    def delete_data(self, filter: dict, collection_name: str):
        """
        Löscht Daten, die dem angegebenen Filter in der Collection entsprechen.
        """
        try:
            collection = getattr(self, collection_name, None)
            if collection:
                result = collection.delete_many(filter)
                logger.info(f"{result.deleted_count} Dokument(e) gelöscht in {collection_name}.")
            else:
                logger.warning(f"Collection {collection_name} existiert nicht.")
        except Exception as e:
            error = f"Fehler beim Löschen der Daten: {e}"
            logger.error(error)
            return error

    # TODO: entfernen, ungenutzt, unnötig
    def close_connection(self):
        """
        Beendet die Verbindung zu MongoDB.
        """
        try:
            self.client.close()
            info = "Verbindung zu MongoDB geschlossen."
            logger.info(info)
            return True, info
        except Exception as e:
            error = f"Fehler beim Schließen der Verbindung: {e}"
            logger.error(error)
            return False, error
