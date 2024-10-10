# Eine Session Klasse die grundlegende und wichtige Daten bereithält
# Bei Inference start wird eine Session erstellt.
# Eine Session ist für einen Tag gültig
# Erlaubt z.B. auch die Wiederaufnahme der Session wenn die Inferenz beendet und neugestartet wurde

from datetime import datetime
import uuid


class Session:
    def __init__(self):
        self.session_id = str(uuid.uuid4())
        self.collection_id = None

        self.date = datetime.now().strftime("%Y-%m-%d")
        self.start_time = datetime.now()
        self.end_time = None
        self.inference_id = None
        self.device_config_id = None

        self.mqtt_published_msg_count = 0

        self.model = None
        self.imgsz = None
        self.iou = None
        self.conf = None
        self.tracker = None
        self.quantization = None
        self.device = None
        self.vid_stride = None
        self.resolution = None
        self.fps = None
        self.performance = None

        self.counts = None
        self.object_times = None
        self.tracking = None

        self.json_filename = None



        self.cleanup_done = None
