import settings
from pymongo import MongoClient, AsyncMongoClient
from pymongo.errors import ConnectionFailure
from datetime import datetime, timezone
from bson import ObjectId
from src.utils.logger import Logger
from src.utils.tools import load_config

#https://pymongo.readthedocs.io/en/stable/

logger = Logger("MongoClient", settings.LOG_PATH + "/mongoclient.log")


class MongoDB:
    def __init__(self, host, port, db, authEnabled, username=None, password=None):
        self.host = host
        self.port = port
        self.db = db
        self.authEnabled = authEnabled
        self.username = username
        self.password = password
        # TODO:
        self.tls = False

        if authEnabled and username and password:
            self.mongo_uri = f"mongodb://{username}:{password}@{host}:{port}/"
        else:
            self.mongo_uri = f"mongodb://{host}:{port}/"
        
        try:
            #self.client = AsyncMongoClient(self.mongo_uri)
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

            if isinstance(data_id, dict):
                data_id = data_id.get("_id")

            object_id = ObjectId(data_id)
            result = collection.update_one({"_id": object_id}, {"$set": {"published": True}})
        except Exception as e:
            error = f"Fehler beim Markieren des Dokuments als veröffentlicht: {e}"
            logger.error(error)
            return error
    
    def get_data(self, type, session_id):
        """
        Ruft alle Collections für die angegebene Session-ID ab.
        """
        ID = settings.DEVICE_ID

        try:
            collection_name = f"{type}_{ID}_{session_id}"
            data = list(self.db[collection_name].find())
            
            return True, data

        except Exception as e:
            error = f"Fehler beim Abrufen der Collections: {e}"
            logger.error(error)
            return False, error
    
    def get_collection_document_size(self, collection_name):
        """
        Gibt die Anzahl der Dokumente in der angegebenen Collection zurück.
        """
        try:
            collection = self.db.get_collection(collection_name)
            return collection.count_documents({})
        except Exception as e:
            error = f"Fehler beim Abrufen der Dokumentgröße: {e}"
            logger.error(error)
            return error
