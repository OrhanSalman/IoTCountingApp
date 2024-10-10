from src.core.clients.mongo import MongoDB
from src.core.clients.mqtt import MQTTClient
from src.core.yolo.queuemanager import QueueManager


def check_mongo_client_exists():
    from src.control import mongo_client
    if isinstance(mongo_client, MongoDB) and mongo_client.is_connected():
        return mongo_client
    else:
        return None

def check_mqtt_client_exists():
    from src.control import mqtt_client
    if isinstance(mqtt_client, MQTTClient) and mqtt_client.is_connected():
        return mqtt_client
    else:
        return None
    
def check_queue_manager_exists():
    from src.control import queue_manager
    if isinstance(queue_manager, QueueManager):
        return queue_manager
    else:
        return None
