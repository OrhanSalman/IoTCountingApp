from bson import ObjectId
import datetime

# NUR FÜR COUNTS
def parse_topics_and_payloads(json_data_list):
    """
    Verarbeitet die JSON-Daten und gibt die Themen und Payloads zurück.

    :param json_data_list: list, eine Liste von Dictionaries mit den Eingabedaten im JSON-Format
    :return: dict, die Themen und ihre zugehörigen Payloads
    """
    
    all_payloads = {} 

    for json_data in json_data_list:

        record_id = json_data["_id"]
        timestamp = json_data["timestamp"].isoformat() + 'Z'  # InfluxDB-kompatibles Format

        topics = set()
        payloads = {}

        for roi in json_data:
            if roi in ("published", "_id", "timestamp"):
                continue
            
            for direction in json_data[roi]:
                # Kombiniere ROI und Richtung
                base_topic = f"{roi}/{direction}"
                
                # Zähle die Besucher in den IN- und OUT-Kategorien
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
    Verarbeitet die Warteschlangen-Daten und gibt die Themen und Payloads zurück.

    :param queue_data: list, eine Liste von Dictionaries mit den Eingabedaten im JSON-Format
    :return: dict, die Themen und ihre zugehörigen Payloads
    """
    
    all_payloads = {}

    # Iteriere über jedes Element in queue_data
    for data in queue_data:
        for region_name, directions in data.items():
            for direction, counts in directions.items():
                for category in ["IN", "OUT"]:
                    visitor_types = counts.get(category, {}) 
                    for visitor_type, count in visitor_types.items():
                        # Erstelle das Thema
                        topic = f"{region_name}/{direction}/{visitor_type}"
                        
                        # Erstelle den Payload für jedes Topic          # TODO: dieses timestamp ist nicht der Zeitraum der Erfassung, sondern der Zeitpunkt des Speicherns in Mongo
                        if topic not in all_payloads:                   # TODO: dieses timestamp benötigen wir hier nicht...
                            all_payloads[topic] = {"IN": 0, "OUT": 0, "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat() + 'Z'}
                        
                        # Aktualisiere den Payload für das aktuelle Topic
                        all_payloads[topic][category] += count

    return all_payloads

