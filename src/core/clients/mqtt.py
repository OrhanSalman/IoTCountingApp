import json
import threading
import time
import paho.mqtt.client as mqtt
import settings
from src.utils.logger import Logger
from src.utils.topic_payload_parser import parse_topics_and_payloads, parse_topics_and_payloads_from_queue
from src.core.clients.mongo import MongoDB

logger = Logger("MQTT", settings.LOG_PATH + "/mqtt.log")

error = None

class MQTTClient:
    def __init__(self, dataendpoint, counts_publish_intervall, topics, authEnabled, client_id, host, port, username=None, password=None, tls=False, willMsg=None, qos=0, cleanSession=True, keepalive=60):
        self.lock = threading.Lock()
        self.counts_publish_intervall = counts_publish_intervall
        self.timer = 0
        self.last_counts_published_time = 0
        self.config = { "topics": topics }
        self.client_id = client_id
        self.willMsg = willMsg
        self.qos = qos
        self.cleanSession = cleanSession
        self.client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id=self.client_id, clean_session=cleanSession)
        self.host = host
        self.port = port
        self.keepalive = keepalive
        self.connected = False
        self.authEnabled = authEnabled
        self.client.username_pw_set(username, password) if authEnabled else None
        self.client.tls_set() if tls else None
        self.client.keepalive = self.keepalive
        self.dataendpoint = dataendpoint
        self.connect_event = threading.Event()
        self.publish_counts_job = True
        self.published_messages_since_start = 0

        # Callbacks
        self.client.on_connect = self.on_connect
        #self.client.on_disconnect = self.on_disconnect
        #self.client.on_message = self.on_message # TODO:
        self.client.on_connect_fail = self.on_connect_fail


    def get_published_messages_since_start(self):
        return self.published_messages_since_start

    def start(self):
        global error
        try:
            self.client.connect(self.host, self.port, keepalive=self.keepalive)
            self.client.loop_start()
            self.client.reconnect_delay_set(min_delay=1, max_delay=60)
            self.connect_event.wait()

            self.loop_thread = threading.Thread(target=self.publish_counts, daemon=True)
            self.loop_thread.start()
            if self.is_connected() and self.loop_thread.is_alive():
                info = "MQTT Client started."
                logger.info(info)
                return True, info
            elif self.is_connected() and not self.loop_thread.is_alive():
                warning = "MQTT Client started, but failed to start Service for publishing counts."
                logger.error(warning)
                return True, warning
            else:
                logger.error(error)
                self.publish_counts_job = False
                #self.loop_thread.join()
                self.client.loop_stop()
                self.client.disconnect()
                #raise Exception(error)
                return False, error
        except Exception as e:
            error = str(e)
            logger.error(e)
            return False, error
        

    def is_connected(self):
        return self.client.is_connected()


    def on_connect(self, client, userdata, flags, rc, properties):
        global error
        if rc == 0:
            self.connected = True
            logger.info(f"Connected to MQTT Broker with result code {rc}")
            # start nachricht
            self.publish(f"action/device/{self.client_id}/status", "ready", qos=self.qos, retain=True)  # TODO....

            # end willmsg nachricht
            #self.client.publish(self.willMsg["topic"], self.willMsg["payload"], qos=self.qos, retain=True) if self.willMsg else None
            for topic in self.config["topics"].keys():
                self.client.subscribe(topic, qos=self.qos)
                logger.info(f"Subscribed to topic {topic}")
        else:
            self.connected = False
            error = f"Failed to connect with result code {rc}"
            logger.error(error)
            self.client.disconnect()

        self.connect_event.set()

            #self.client.publish(self.willMsg["topic"], self.willMsg["payload"], qos=self.qos, retain=True) if self.willMsg else None

    def on_connect_fail(self, client, userdata, rc, properties):
        global error
        if rc != 0:
            self.connected = False
            error = f"Failed to connect with result code {rc}"
            logger.error(error)
            self.client.reconnect()
            return False, error
        self.connect_event.set()


    #def on_disconnect(self, client, userdata, rc, properties):
    #    if rc != 0:
    #        self.connected = False
    #        logger.error(f"Connection lost with result code {rc}. Attempting to reconnect...")
    #        try:
    #            self.client.reconnect()
    #        except Exception as e:
    #            error = f"Reconnect failed: {e}"
    #            logger.error(error)
    #            return False, error

    #def on_connect_fail(self, client, userdata, rc, properties):
    #    if rc == 0:
    #        self.connected = True
    #        info = f"Connected to MQTT Broker with result code {rc}"
    #        logger.info(info)
    #        return True, info
    #        #mqtt_client.publish(f"action/device/{client_id}/status", "ready", qos=qos, retain=True)  # TODO....
    #    else:
    #        self.connected = False
    #        error = f"Failed to connect with result code {rc}"
    #        logger.error(error)
    #        self.client.reconnect()
    #        return False, error
    #        #self.client.reconnect()
        

    def on_message(self, client, userdata, msg):
        from src.control import (
            start_stream,
            stop_stream,
            take_snapshot,
            start_counting,
            stop_counting,
            start_model_benchmark,
            stop_model_benchmark,
            send_status,
        )
        global_actions = {
            "start_stream": start_stream,
            "stop_stream": stop_stream,
            "start_counting": start_counting,
            "stop_counting": stop_counting,
            "take_snapshot": take_snapshot,
            "start_model_benchmark": start_model_benchmark,
            "stop_model_benchmark": stop_model_benchmark,
            "send_status": send_status,
        }
        
        message = msg.payload.decode()
        logger.info(f"Received message: {message} on topic: {msg.topic}")

        try:
            data = json.loads(message)
            action_key = data.get('action')
            parameters = data.get('parameters', {})
            action_name = self.config.get("topics", {}).get(msg.topic, {}).get(action_key)

            if action_name and action_name in global_actions:
                action_func = global_actions[action_name]
                result = action_func(parameters) if parameters else action_func()
                response_topic = f"{msg.topic}/res"
                self.client.publish(response_topic, str(result), qos=self.qos)
            else:
                logger.error(f"Action {action_name} not found.")
        except json.JSONDecodeError:
            error = "Failed to decode JSON message in MQTT."
            logger.error(error)
            return error
        except Exception as e:
            error = f"Error in on_message: {e}"
            logger.error(error)
            self.publish(f"{msg.topic}/res", error, 2) # QOS ?

    def publish(self, topic, message, qos, retain=False):
        try:
            self.client.publish(topic, message, qos, retain)
            info = f"Published message: {message} to topic: {topic} with QoS {qos}"
            #logger.info(info)
            self.published_messages_since_start += 1
            return True, info
        except Exception as e:
            error = f"Failed to publish message: {e}"
            logger.error(error)
            return False, error


    def publish_counts(self):
        while self.publish_counts_job:
            try:
                time.sleep(self.counts_publish_intervall)
                from src.control import mongo_client, queue_manager

                if not self.is_connected():
                    #logger.warning("Cannot work for publishing data. MQTT client is not connected.")
                    continue
                # Vorrang haben temporäre Daten aus der Queue
                elif not queue_manager.is_queue_empty():
                    logger.info("Found unpublished data in queue.")
                    self.publish_from_queue()
                    continue
                elif not isinstance(mongo_client, MongoDB):
                    #logger.warning("Cannot get unpublished data. No MongoDB instance provided.")
                    continue
                elif not hasattr(mongo_client, "is_connected") and mongo_client.is_connected():
                    #logger.warning("Cannot get unpublished data. MongoDB client is not connected.")
                    continue
                else:
                    self.publish_from_mongo()
            except Exception as e:
                error = f"Failed to publish counts: {e}"
                logger.error(error)
                #raise Exception(error)
                #return False, error
        logger.info("Stopped publishing counts thread.")
        return None, None


    def publish_from_mongo(self):
        try:
            from src.control import mongo_client

            collections = mongo_client.get_collections()
            collections = [collection for collection in collections if collection.startswith(f"counts_" + settings.DEVICE_ID )]
            if collections:
                for collection in collections:
                    status, unpublished_data = mongo_client.get_unpublished_data(collection)

                    if not status:
                        logger.warning(f"Cannot get unpublished data from {collection}: {unpublished_data}")
                        break
                    elif unpublished_data is None:
                        pass
                    else:
                        unpublished_data = unpublished_data
                        payloads = parse_topics_and_payloads(unpublished_data)
                        # Veröffentliche die Daten
                        for topic, payload in payloads.items():
                            self.publish(topic, str(payload), qos=self.qos)
                            time.sleep(0.01)

                            # TODO: entfernen, wir wollen nur aus der queue veröffentlichen...
                            # Setze die Einträge als veröffentlicht
                            for entry in unpublished_data:
                                mongo_client.set_data_published(collection, entry["_id"])
        except Exception as e:
            error = f"Failed to publish data from MongoDB: {e}"
            logger.error(error)
            raise Exception(error)
            #return False, error
                                    
    def publish_from_queue(self):   # TODO: vorher in mongo schreiben, aber macht keinen sinn, wenn mongo leer ist...
        try:
            from src.control import queue_manager

            unpublished_data = queue_manager.get_counts_history()

            if unpublished_data:
                payloads = parse_topics_and_payloads_from_queue(unpublished_data)
                # Veröffentliche die Daten
                for topic, payload in payloads.items():
                    self.publish(topic, str(payload), qos=self.qos)
                    time.sleep(0.01)
        except Exception as e:
            error = f"Failed to publish data from Queue: {e}"
            logger.error(error)
            #raise Exception(error)
            #return False, error
                        