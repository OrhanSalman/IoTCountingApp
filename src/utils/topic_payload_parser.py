from bson import ObjectId
import datetime

# ONLY FOR COUNTS
def parse_topics_and_payloads(json_data_list):
    """
    Processes the JSON data and returns the topics and payloads.

    :param json_data_list: list, a list of dictionaries with the input data in JSON format
    :return: dict, the topics and their associated payloads
    """
    
    all_payloads = {} 

    for json_data in json_data_list:

        record_id = json_data["_id"]
        timestamp = json_data["timestamp"].isoformat() + 'Z'  # InfluxDB-compatible format

        topics = set()
        payloads = {}

        for roi in json_data:
            if roi in ("published", "_id", "timestamp"):
                continue
            
            for direction in json_data[roi]:
                # Combine ROI and direction
                base_topic = f"{roi}/{direction}"
                
                # Count visitors in the IN and OUT categories
                for category in ["IN", "OUT"]:
                    visitors = json_data[roi][direction].get(category, {})
                    for visitor_type, count in visitors.items():

                        topic = f"{base_topic}/{visitor_type}"
                        topics.add(topic)
                        
                        if topic not in payloads:
                            payloads[topic] = {"IN": 0, "OUT": 0, "timestamp": timestamp}
                        
                        payloads[topic][category] += count

        for topic, payload in payloads.items():
            if topic not in all_payloads:
                all_payloads[topic] = payload
            else:
                all_payloads[topic]["IN"] += payload["IN"]
                all_payloads[topic]["OUT"] += payload["OUT"]

    return all_payloads



def parse_topics_and_payloads_from_queue(queue_data):
    """
    Processes the queue data and returns the topics and payloads.

    :param queue_data: list, a list of dictionaries with the input data in JSON format
    :return: dict, the topics and their associated payloads
    """
    
    all_payloads = {}

    # Iterate over each element in queue_data
    for data in queue_data:
        for region_name, directions in data.items():
            for direction, counts in directions.items():
                for category in ["IN", "OUT"]:
                    visitor_types = counts.get(category, {}) 
                    for visitor_type, count in visitor_types.items():
                        # Create the topic
                        topic = f"{region_name}/{direction}/{visitor_type}"
                        
                        # Create the payload for each topic
                        if topic not in all_payloads:
                            all_payloads[topic] = {"IN": 0, "OUT": 0, "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat() + 'Z'}
                        
                        # Update the payload for the current topic
                        all_payloads[topic][category] += count

    return all_payloads
