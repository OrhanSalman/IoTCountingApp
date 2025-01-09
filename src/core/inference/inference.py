import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

import settings
import glob
import shutil
import threading
import cv2
import json
import time
import numpy as np
from collections import defaultdict
from datetime import datetime
from shapely.geometry import LineString
from ultralytics import YOLO
from ultralytics.utils.plotting import Annotator, colors
from src.utils.logger import Logger
from src.core.inference.names import names
from src.core.stream.ffmpeg import convert_video
from src.utils.exists_helper import check_mongo_client_exists, check_mqtt_client_exists, check_queue_manager_exists
from src.utils.messyFunctions import load_config, generateUUID, add_session, add_end_datetime_to_session, convert_to_seconds
#from line_profiler import profile


logger = Logger("Inference", settings.LOG_PATH + "/inference.log")

names = names

class Inference:
    def __init__(self, stream, model_str, only_simulation, only_simulation_img):
        # PROPS
        self.only_simulation = only_simulation
        self.only_simulation_img = only_simulation_img
        self.model_str = model_str
        self.stream = stream
        self.last_frame = None
        self.annotate = True # False
        self.show_regions = True # False
        
        if self.only_simulation or self.only_simulation_img:
            self.annotate = True
            self.show_regions = True
        
        # BASIC
        self.session_id = generateUUID()
        self.timestamp = datetime.now()
        self.inference_started_event = threading.Event()
        self.frames = [] if self.only_simulation else None  # Liste zum Speichern der Frames für das Video
        self.frame_width = int(self.stream.get_details()['resolution'][0]) if not self.only_simulation_img else None
        self.frame_height = int(self.stream.get_details()['resolution'][1]) if not self.only_simulation_img else None
        self.fps = int(self.stream.get_details()['fps']) if not self.only_simulation_img else None

        # DATA
        self.init_time = None
        self.frame_count = 0
        self.avg_performance = {
            "avg_fps": 0,
            "avg_fps_model": 0,
            "avg_time_preprocess": 0,
            "avg_time_inference": 0,
            "avg_time_postprocess": 0,
            "avg_time_total": 0
        }
        self.counts = defaultdict(lambda: defaultdict(lambda: {"IN": defaultdict(int), "OUT": defaultdict(int)}))
        self.track_history = defaultdict(lambda: {"class": None, "tracks": []})
        self.crossed_lines = defaultdict(lambda: defaultdict(bool))
        self.object_crossing_times = {}
        self.times_history = defaultdict(lambda: {"IN": None, "OUT": None}) # Wird als Zwischenspeicher für object_crossing_times verwendet

        # Set Config
        DATA = load_config(settings.CONFIG_PATH)
        CONFIG = next(config for config in DATA["deviceConfigs"])
        self.deviceConfigId = CONFIG['id']
        self.deviceId = settings.DEVICE_ID
        self.format = CONFIG['modelFormat']
        self.imgsz = CONFIG['imgsz']
        self.iou = CONFIG['iou']
        self.conf = CONFIG['conf']
        self.tracker = CONFIG['tracker']
        self.persist = CONFIG['persist']
        self.quantization = CONFIG['quantization']
        self.device = CONFIG['deviceType']
        self.vid_stride = CONFIG['vid_stride']
        self.hasRegions = True if "deviceRois" in DATA and len(DATA["deviceRois"]) > 0 else False
        self.obj_clss = list(map(int, DATA["deviceTags"][0]["tags"])) if "deviceTags" in DATA else None
        self.regions = self.build_regions(DATA["deviceRois"]) if self.hasRegions else None
        
        # VALIDATION
        if not self.only_simulation_img:
            self.validate_regions()

        # Load system settings
        SYSTEM_SETTINGS = load_config(settings.SYSTEM_SETTINGS_PATH)
        self.blur_humans = SYSTEM_SETTINGS['blur_humans']
        self.detect_count_timespan = SYSTEM_SETTINGS['detect_count_timespan']
        self.detect_count_routes = SYSTEM_SETTINGS['detect_count_routes']
        counts_save_intervall_tmp = SYSTEM_SETTINGS['counts_save_intervall']
        self.counts_save_intervall = convert_to_seconds(counts_save_intervall_tmp, SYSTEM_SETTINGS['counts_save_intervall_format'])
        self.max_tracking_points_length = SYSTEM_SETTINGS['max_tracking_points_length']

        # Init Functions
        self.mongo_client = check_mongo_client_exists()
        self.mqtt_client = check_mqtt_client_exists()
        self.queue_manager = check_queue_manager_exists()
        self.set_device() if self.device != "cpu" else None

        # Set active default
        self.active = True

    def validate_regions(self):
        if not self.hasRegions or not self.regions:
            warning = "You need to define regions with at least one tag."
            logger.warning(warning)
            raise Exception(warning)

        if any(not roi["tagsInThisRegion"] for roi in self.regions):
            warning = "You need to select at least one tag for your regions."
            logger.warning(warning)
            raise Exception(warning)

    def activate(self):
        self.inference_started_event.set()
        self.active = True

    def deactivate(self):
        self.inference_started_event.clear()
        self.active = False

    def set_device(self):
        if settings.CUDA_AVAILABLE:
            self.device = "cuda"
        elif settings.MPS_AVAILABLE:
            self.device = "mps"
        else:
            error = "No GPU Device available."
            logger.error(error)
            raise Exception(error) # wirft 500 an server endpunkt

    def get_last_frame(self):
        return self.last_frame
    
    def change_vars(self, annotate, show_regions):
        self.annotate = annotate
        self.show_regions = show_regions

    def is_simulation(self):
        return self.only_simulation, self.only_simulation_img

    #@profile
    def save_counts_data(self):
        from src.control import mongo_client
        if not self.counts:
            return
        try:
            status, msg = mongo_client.save_to_collection(self.counts, settings.MONGO_COLLECTION_COUNTS + "_" + self.deviceId + "_" + self.session_id)
            if status:
                self.counts = defaultdict(lambda: defaultdict(lambda: {"IN": defaultdict(int), "OUT": defaultdict(int)}))
        except Exception as e:
            warning = f"Could not save counts data to MongoDB: {e}. Data will be hold."
            logger.warning(warning)

    #@profile
    def save_tracking_data(self, max_tracking_points_length):
        if not self.track_history:
            return
        aggregated_data = {}
        for track_id, track in self.track_history.items():
            sumData = len(track['tracks']) # TODO: enumerate statt len
    
            if sumData > max_tracking_points_length:
                step = sumData // max_tracking_points_length
                
                # Wenn step 0 ist, dann setze step auf 1, damit wir immer mindestens 1 Punkt bekommen
                step = max(1, step)
    
                # Nimm jeden "step"-Eintrag aus der Liste
                track['tracks'] = track['tracks'][::step]
                # Wenn das Slicing immer noch mehr Punkte als erlaubt gibt, kürzen wir weiter
                if len(track['tracks']) > max_tracking_points_length:
                    track['tracks'] = track['tracks'][:max_tracking_points_length]
        
            aggregated_data[track_id] = track
    
        try:
            status, msg = self.mongo_client.save_to_collection(aggregated_data, settings.MONGO_COLLECTION_TRACKING + "_" + self.deviceId + "_" +self.session_id)
            if status:
                self.track_history = defaultdict(lambda: {"class": None, "tracks": []})
        except Exception as e:
            warning = f"Could not save tracking data to MongoDB: {e}. Data will be hold."
            logger.warning(warning)

    #@profile
    def save_object_crossing_times(self):
        if not self.object_crossing_times:
            return
        try:
            status, msg = self.mongo_client.save_to_collection(self.object_crossing_times, settings.MONGO_COLLECTION_TIMES + "_" + self.deviceId + "_" +self.session_id)
            if status:
                self.object_crossing_times = {}
        except Exception as e:
            warning = f"Could not save object crossing times to MongoDB: {e}. Data will be hold."
            logger.warning(warning)

    #@profile
    def build_regions(self, data):
        regions = []
        for region in data:
            lines = []
            points = region["points"]
            isFormationClosed = region["isFormationClosed"]

            for i in range(len(points) - 1):
                line = {
                    "start_coord": [points[i]["x"], points[i]["y"]],
                    "end_coord": [points[i + 1]["x"], points[i + 1]["y"]],
                    "direction": points[i]["direction"],
                    "counts": {"in": 0, "out": 0},
                    "id": f"{region['id']}-{i}"
                }
                lines.append(line)

            if isFormationClosed and len(points) > 1:
                line = {
                    "start_coord": [points[-1]["x"], points[-1]["y"]],
                    "end_coord": [points[0]["x"], points[0]["y"]],
                    "direction": points[-1]["direction"],
                    "counts": {"in": 0, "out": 0},
                    "id": f"{region['id']}-{len(points) - 1}"
                }
                lines.append(line)

            regions.append({
                "name": region["roiName"],
                "lines": lines,
                "region_color": tuple(int(region["region_color"].lstrip('#')[i:i+2], 16) for i in (0, 2, 4)),
                "text_color": (255, 255, 255),
                "line_thickness": region.get("line_thickness", 2),
                "tagsInThisRegion": list(map(int, region["tagsInThisRegion"]))
            })

        return regions

    #@profile
    def draw_regions(self, frame, regions):
        for region in regions:
            for line in region["lines"]:
                # Zeichne die Linie
                start_point = tuple(line["start_coord"])
                end_point = tuple(line["end_coord"])
                color = region["region_color"]
                thickness = region["line_thickness"]
                cv2.line(frame, start_point, end_point, color, thickness)
                
                # Zeichne die Start- und Endpunkte
                cv2.circle(frame, start_point, 5, color, -1)
                cv2.circle(frame, end_point, 5, color, -1)
                
                # Berechne die Mitte der Linie
                mid_point = (
                    (start_point[0] + end_point[0]) // 2,
                    (start_point[1] + end_point[1]) // 2
                )
                
                # Zeichne die Richtung und die Zähler an der Mittellinie
                text = f"{line['direction']} in: {line['counts']['in']} out: {line['counts']['out']}"
                cv2.putText(frame, text, mid_point, cv2.FONT_HERSHEY_SIMPLEX, 0.5, region["text_color"], 1, cv2.LINE_AA)
        
        return frame

    #@profile
    def performance_metrics(self, preprocess, inference, postprocess):
        # Berechnung der durchschnittlichen FPS
        current_time = time.time()
        elapsed_time = current_time - self.start_time
        #self.frame_count += 1
        avg_fps = self.frame_count / elapsed_time if elapsed_time > 0 else 0

        # Berechnung der Gesamtzeit für das aktuelle Modell
        total_time = preprocess + inference + postprocess


        # avg_fps_model ist die Leistung des Models
        # avg_fps ist die Leistung des gesamten Prozesses
        self.avg_performance["avg_fps"] = avg_fps
        avg_time_total = (self.avg_performance["avg_time_total"] * (self.frame_count - 1) + total_time) / self.frame_count
        self.avg_performance["avg_fps_model"] = 1000 / avg_time_total if avg_time_total > 0 else 0
        self.avg_performance["avg_time_preprocess"] = (self.avg_performance["avg_time_preprocess"] * (self.frame_count - 1) + preprocess) / self.frame_count
        self.avg_performance["avg_time_inference"] = (self.avg_performance["avg_time_inference"] * (self.frame_count - 1) + inference) / self.frame_count
        self.avg_performance["avg_time_postprocess"] = (self.avg_performance["avg_time_postprocess"] * (self.frame_count - 1) + postprocess) / self.frame_count
        self.avg_performance["avg_time_total"] = avg_time_total

        # Debug
        #print(f"Avg_FPS: {self.avg_performance['avg_fps']:.2f}  Avg_FPS_MODEL: {self.avg_performance['avg_fps_model']:.2f}  Avg_TIME_PREPROCESS: {self.avg_performance['avg_time_preprocess']:.2f}ms  Avg_TIME_INFERENCE: {self.avg_performance['avg_time_inference']:.2f}ms  Avg_TIME_POSTPROCESS: {self.avg_performance['avg_time_postprocess']:.2f}ms  Avg_TIME_TOTAL: {self.avg_performance['avg_time_total']:.2f}ms", end='\r')

    def get_performance_metrics(self):
        inference_performance = {
            'init_time': self.init_time,
            "avg_fps": self.avg_performance["avg_fps"],
            "avg_fps_model": self.avg_performance["avg_fps_model"],
            "avg_time_preprocess": self.avg_performance["avg_time_preprocess"],
            "avg_time_inference": self.avg_performance["avg_time_inference"],
            "avg_time_postprocess": self.avg_performance["avg_time_postprocess"],
            "avg_time_total": self.avg_performance["avg_time_total"],
            "frames_processed": self.frame_count,
        }
        return inference_performance

    def blur_objects(self, frame, boxes, blur_factor=55):
        for box in boxes:
            x1, y1, x2, y2 = map(int, box)
            roi = frame[y1:y2, x1:x2]
            roi = cv2.GaussianBlur(roi, (blur_factor, blur_factor), 0)
            frame[y1:y2, x1:x2] = roi
        return frame

    def track_id_already_counted(self, track_id) -> bool:
        """
        Check if the track_id has already been counted IN and OUT.
        If yes, we already have measured the duration of the object in the region and we can skip it to save performance.

        Args:
            track_id (_string_): The track_id

        Returns:
            bool: True if the track_id has already been counted, False otherwise.
        """
        return track_id in self.object_crossing_times

    #@profile
    def count(self, regions, cls, track_id, track):
        if self.track_id_already_counted(track_id):
            return
        
        current_frame_time = self.stream.get_CAP_PROP_POS_MSEC() # Aktuelle Frame-Zeit in Millisekunden
        cls_name = names.get(cls, str(cls))
        
        # Iteriere über jede Region
        for region in regions:
            # Überspringe den Rest der Schleife, wenn die Objektklasse nicht in den Tags der Region enthalten ist
            if cls not in region["tagsInThisRegion"]:
                continue
            
            for line in region["lines"]:
                line_geom = LineString([line["start_coord"], line["end_coord"]])

                # Sicherstellen, dass die Liste track mindestens zwei Elemente enthält
                if len(track) > 1:
                    previous_position, current_position = track[-2], track[-1]
                
                    # Prüfen, ob die Linie überquert wurde
                    if line_geom.crosses(LineString([previous_position, current_position])):
                        if not self.crossed_lines[track_id][line['id']]:  # Nur zählen, wenn nicht bereits gezählt
                            cross_product = (current_position[0] - line["start_coord"][0]) * (line["end_coord"][1] - line["start_coord"][1]) - \
                                            (current_position[1] - line["start_coord"][1]) * (line["end_coord"][0] - line["start_coord"][0])
                            
                            direction = line["direction"]

                            if cross_product < 0:
                                #if self.only_simulation:
                                line["counts"]["out"] += 1
                                self.counts[region["name"]][direction]["OUT"][cls_name] += 1    # Zähle das Objekt als OUT
                                self.times_history[track_id]["OUT"] = current_frame_time    # speichern der erfassten zeit
                                self.times_history[track_id]["exit"] = direction
                                self.times_history[track_id]["exit_coords"] = current_position
                                # DEBUG
                                #print(f"OUT Object {track_id} crossed line {line['id']} in direction {direction} in time {current_frame_time}")
                            else:
                                #if self.only_simulation:
                                line["counts"]["in"] += 1
                                self.counts[region["name"]][direction]["IN"][cls_name] += 1   # Zähle das Objekt als IN
                                self.times_history[track_id]["IN"] = current_frame_time   # speichern der erfassten zeit
                                self.times_history[track_id]["entry"] = direction
                                self.times_history[track_id]["entry_coords"] = current_position

                                # DEBUG
                                #print(f"IN Object {track_id} crossed line {line['id']} in direction {direction} in time {current_frame_time}")

                            # Markiere die Linie als überquert für den aktuellen track_id
                            self.crossed_lines[track_id][line['id']] = True
                            
                            # prüfe ob die track_id für beide IN und OUT True hat. wenn ja, dann speichere seine Zeit
                            if self.times_history[track_id]["IN"] is not None and self.times_history[track_id]["OUT"] is not None:
                                entry_frame_time = self.times_history[track_id]["IN"]
                                exit_frame_time = self.times_history[track_id]["OUT"]
                                entry = self.times_history[track_id]["entry"]
                                exit = self.times_history[track_id]["exit"]
                                entryCoords = self.times_history[track_id]["entry_coords"]
                                exitCoords = self.times_history[track_id]["exit_coords"]
                                duration = int(exit_frame_time - entry_frame_time)
                            
                                self.object_crossing_times[track_id] = {
                                    "cls": cls_name,
                                    "roiCrossed": region["name"],
                                    "entry": entry,
                                    "exit": exit,
                                    "entryCoords": entryCoords,
                                    "exitCoords": exitCoords,
                                    "duration": duration
                                }
                                #print(f"Object {track_id} exited region. Time spent: {duration} ms")

    #@profile
    def run(self):
        try:
            model = YOLO(self.model_str)
            
            if self.only_simulation_img: # TODO: blur_humans funktioniert hier nicht

                if not os.path.exists(settings.YOLO_PREDICTIONS_PATH):
                    os.makedirs(settings.YOLO_PREDICTIONS_PATH)
                shutil.rmtree(settings.YOLO_PREDICTIONS_PATH)

                # Inference auf das Bild anwenden
                results = model.predict(self.stream, save=True, imgsz=self.imgsz, device=self.device, iou=self.iou, conf=self.conf, classes=self.obj_clss)
                self.inference_started_event.set()

                # Performance-Metriken
                preprocess = results[0].speed['preprocess']
                inference = results[0].speed['inference']
                postprocess = results[0].speed['postprocess']
                speed = {
                    "preprocess": preprocess,
                    "inference": inference,
                    "postprocess": postprocess
                }

                detected_objects = results[0].boxes
                object_classes = [model.names[int(box.cls)] for box in detected_objects]

                counts_and_classes = {cls: object_classes.count(cls) for cls in object_classes}

                prediction_folder = "predict"
                predicted_frame_path = glob.glob(os.path.join(settings.YOLO_PREDICTIONS_PATH, prediction_folder, "*.jpg"))[0]

                if os.path.isfile(predicted_frame_path):
                    self.save_simulation_img(predicted_frame_path, counts_and_classes, speed)
                else:
                    logger.error("Predicted frame does not exist.")
                return True
            
            
            if not self.only_simulation:
                if check_mongo_client_exists():
                    #self.mongo_client.create_collections_for_inference(self.timestamp, self.deviceId)
                    self.collection_names = {
                        "counts": settings.MONGO_COLLECTION_COUNTS + "_" + self.deviceId + "_" + self.session_id,
                        "tracking": settings.MONGO_COLLECTION_TRACKING + "_" + self.deviceId + "_" + self.session_id if self.detect_count_routes else None,
                        "times": settings.MONGO_COLLECTION_TIMES + "_" + self.deviceId + "_" + self.session_id if self.detect_count_timespan else None
                    }
                    for collection_name in filter(None, self.collection_names.values()):
                        self.mongo_client._get_or_create_collection(collection_name)
                        
                elif self.mqtt_client is not None:
                    pass
                else:
                    logger.warning("Keine MongoDB oder MQTT Verbindung gefunden. Die Daten werden nur temporär gehalten.")
            
            self.start_time = time.time()
            self.init_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            last_save_time = time.time()
            self.frame_count += 1
            stream_read_attempts = 0

            self.create_session() if not self.only_simulation and not self.only_simulation_img else None
            while self.active:
                ret, frame = self.stream.read()
                if not ret and self.only_simulation:
                    info = "Simulation Video has ended."
                    logger.info(info)
                    return info
                if not ret:
                    stream_read_attempts += 1
                    if stream_read_attempts > 10:
                        error = "Could not read image from camera or the video has ended."
                        logger.error(error)
                        #return error
                        raise Exception(error)
                    warning = "Could not read image from camera. Retrying... attempt: " + str(stream_read_attempts)
                    logger.warning(warning)
                    time.sleep(3)


                # vid_stride issue: https://github.com/ultralytics/ultralytics/issues/5770
                # https://github.com/ultralytics/ultralytics/issues/11723
                # officially vid_stride is not supported in tracking mode
                # https://docs.ultralytics.com/usage/cfg/#predict-settings
                if self.frame_count % (self.vid_stride) == 0:
                    frame = self.draw_regions(frame, self.regions) if (self.show_regions and self.hasRegions) else frame
                    results = model.track(frame, imgsz=self.imgsz, device=self.device, iou=self.iou, conf=self.conf, persist=True, tracker=self.tracker, classes=self.obj_clss, verbose=False)
                    
                    if self.active and not self.inference_started_event.is_set():
                        self.inference_started_event.set()

                    """ PROCESS DETECTION """
                    if results[0].boxes.id is not None and len(results[0].boxes.id) > 0:
                        boxes = results[0].boxes.xyxy.cpu()
                        track_ids = results[0].boxes.id.int().cpu().tolist()
                        clss = results[0].boxes.cls.cpu().tolist()      
                        confs = results[0].boxes.conf.cpu().tolist()

                        annotator = Annotator(frame, line_width=2, example=str(names)) if self.annotate else None
                        blur_boxes = []

                        # TODO: in eigene funktion auslagern
                        for box, track_id, cls, conf in zip(boxes, track_ids, clss, confs):
                            cls = int(cls)

                            track_id = "track_" + str(track_id)

                            #blur_boxes.append(box) if self.only_simulation and self.blur_humans and cls == 0 else None
                            blur_boxes.append(box) if self.annotate and cls == 0 else None

                            annotator.box_label(box, f"{str(names[cls])} ID:{track_id} Conf:{conf:.2f}", color=colors(cls, True)) if self.annotate else None
                            bbox_center = (box[0] + box[2]) / 2, (box[1] + box[3]) / 2

                            self.track_history[track_id]["class"] = cls
                            track = self.track_history[track_id]["tracks"]
                            track.append((float(bbox_center[0]), float(bbox_center[1])))

                            # Optional: die aktuelle Position für die nächste Überprüfung speichern
                            #self.track_history[(track_id)]["class"] = track

                            points = np.hstack(track).astype(np.int32).reshape((-1, 1, 2))
                            cv2.polylines(frame, [points], isClosed=False, color=colors(cls, True), thickness=2)

                            # Bis hierhin geht die AVG_FPS_Model, der rest beeinflusst die AVG_FPS
                            self.count(self.regions, cls, track_id, track) if self.hasRegions else None

                        if not self.only_simulation_img and self.blur_humans:
                            frame = self.blur_objects(frame, blur_boxes)

                    # Speichern der Tracking-Daten, Zählungen und Tracking-Zeiten
                    if not self.only_simulation:
                        if time.time() - last_save_time >= self.counts_save_intervall:
                            
                            # TODO: save counts sollte trotzdem gemacht werden...
                            # Verhidnert, dass man grade gespeicherte daten nochmal abfragt...
                            if check_mongo_client_exists():
                                self.save_tracking_data(self.max_tracking_points_length) if self.detect_count_routes else None
                                self.save_counts_data()
                                self.save_object_crossing_times() if self.detect_count_timespan else None
                            else:
                                self.queue_manager.save_counts(self.counts) if self.counts else None
                                self.counts = defaultdict(lambda: defaultdict(lambda: {"IN": defaultdict(int), "OUT": defaultdict(int)}))
                                
                            last_save_time = time.time()
                    
                    preprocess = results[0].speed['preprocess']
                    inference = results[0].speed['inference']
                    postprocess = results[0].speed['postprocess']
                    self.performance_metrics(preprocess, inference, postprocess)

                    if self.only_simulation:
                        self.frames.append(frame)

                    try:
                        self.last_frame = frame.copy()
                    except Exception as e:
                        logger.error("Could not copy frame: " + str(e))
                        self.last_frame = None
                        
                    #cv2.imshow("Frame", frame)
                    #if cv2.waitKey(1) & 0xFF == ord('q'):
                    #    break
                    
                    time.sleep(0.001)
                    
                self.frame_count += 1
            logger.info("Inference peacefully stopped.")
        except Exception as e:
            error = "Error in inference: " + str(e)
            logger.error(error)
            self.deactivate()
            raise Exception(error)
        finally:
            if self.only_simulation and self.frames:
                self.save_simulation()
            if not self.only_simulation and not self.only_simulation_img:
                self.save_tracking_data(self.max_tracking_points_length) if self.mongo_client and self.detect_count_routes else None
                self.save_counts_data() if self.mongo_client else None
                self.save_object_crossing_times() if self.mongo_client and self.detect_count_timespan else None

                # Aktualisiere die sessions, setzte das end datetime
                add_end_datetime_to_session(self.session_id, str(datetime.now()), settings.SESSIONS_PATH)
            
                # self.mongo_client.get_collection_document_size(self.collection_names["counts"])
            self.deactivate()
            #cv2.destroyAllWindows()


    def create_session(self):
        # Lade SESSION_COUNTER
        c = load_config(settings.SESSIONS_PATH)
        count = c.get("counter")
        count += 1
        
        # Erstelle eine JSON Datei
        data = {
            "id": self.session_id,
            "no": f"{count}",
            "start": str(datetime.now()),
            "end": "",
            "types": {
                "tracking": self.detect_count_routes,
                "times": self.detect_count_timespan
            },
            "collections": {
                "counts": {
                    "name": self.collection_names["counts"] if check_mongo_client_exists() else None, # TODO: was soll passieren, wenn wir mittendrin mongo aktivieren?
                    "documents": 0
                },
                "tracking": {
                    "name": self.collection_names["tracking"] if check_mongo_client_exists() else None, # TODO: was soll passieren, wenn wir mittendrin mongo aktivieren?
                    "documents": 0
                },
                "times": {
                    "name": self.collection_names["times"] if check_mongo_client_exists() else None, # TODO:was soll passieren, wenn wir mittendrin mongo aktivieren?
                    "documents": 0
                }
            },
        }
        add_session(data, settings.SESSIONS_PATH)


    # TODO auslagern
    def save_simulation(self):
        try:
            # Speichern des Videos mit Name "simulation" + Datum Uhrzeit
            datetime_str = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')

            # Das letzte Bild in self.frames als Cover Image speichern
            cover_image = self.frames[-1]
            cover_image_filename = f"simvid_{self.deviceConfigId}_{datetime_str}.jpg"
            cover_image_path = os.path.join(settings.VID_PATH, cover_image_filename)
            cv2.imwrite(cover_image_path, cover_image)

            # Video-Dateinamen definieren
            video_filename = f"simvid_{self.deviceConfigId}_{datetime_str}.mp4"
            video_filename_temp = f"simvid_{self.deviceConfigId}_{datetime_str}_temp.mp4"
            output_file = os.path.join(settings.VID_PATH, video_filename_temp)
            final_output_file = os.path.join(settings.VID_PATH, video_filename)

            # VideoWriter initialisieren
            video_writer = cv2.VideoWriter(output_file, cv2.VideoWriter_fourcc(*'mp4v'), self.fps, (self.frame_width, self.frame_height))

            if not self.frames:
                logger.warning("No frames to save.")
                return

            for frame in self.frames:
                video_writer.write(frame)

            video_writer.release()
            
            # Konvertiere das Video mit der convert_video-Funktion
            try:
                convert_video(output_file, final_output_file)
                logger.info(f"Video successfully converted")
                # TODO MERK DIR: keine returns wenn du auf das ergebnis wartest
            except RuntimeError as e:
                logger.error(str(e))
                #return False
                raise Exception(str(e))

            # Lösche die temporäre Datei
            if os.path.exists(output_file):
                os.remove(output_file)

            # Erstellen der JSON-Datei mit den Variablen
            json_data = {
                "datetime": datetime_str,
                "video_filename": video_filename,
                "deviceConfigId": self.deviceConfigId,
                "model": self.model_str,
                "imgsz": self.imgsz,
                "iou": self.iou,
                "conf": self.conf,
                "tracker": self.tracker,
                "quantization": self.quantization,
                "device": self.device,
                "vid_stride": self.vid_stride,
                "resolution": (self.frame_width, self.frame_height),
                "fps": self.fps,
                "performance": self.get_performance_metrics(),
                "counts": self.counts,
            }

            json_filename = f"simvid_{self.deviceConfigId}_{datetime_str}.json"
            json_file_path = os.path.join(settings.VID_PATH, json_filename)

            with open(json_file_path, 'w') as f:
                json.dump(json_data, f, indent=4)

            logger.info(f"JSON file saved successfully: {json_file_path}")

        except Exception as e:
            logger.error(f"Error saving video or JSON file: {str(e)}")
        finally:
            from src.control import stop_stream
            stop_stream(force=True)


    def save_simulation_img(self, predicted_frame_path, counts_and_classes, speed):
        try:
            # Bild von dem gegebenen Pfad einlesen
            predicted_frame = cv2.imread(predicted_frame_path)
            if predicted_frame is None:
                logger.error("Could not read predicted frame from path.")
                return

            datetime_str = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
            cover_image_filename = f"simimg_{self.deviceConfigId}_{datetime_str}.jpg"
            cover_image_path = os.path.join(settings.IMG_PATH, cover_image_filename)
            cv2.imwrite(cover_image_path, predicted_frame) 

            json_data = {
                "datetime": datetime_str,
                "deviceConfigId": self.deviceConfigId,
                "model": self.model_str,
                "format": self.format,
                "imgsz": self.imgsz,
                "iou": self.iou,
                "conf": self.conf,
                "quantization": self.quantization,
                "device": self.device,
                "counts": counts_and_classes,
                "speed": speed
            }

            json_filename = f"simimg_{self.deviceConfigId}_{datetime_str}.json"
            json_file_path = os.path.join(settings.IMG_PATH, json_filename)

            with open(json_file_path, 'w') as f:
                json.dump(json_data, f, indent=4)

            logger.info(f"JSON file saved successfully: {json_file_path}")

        except Exception as e:
            logger.error(f"Error saving image or JSON file: {str(e)}")



    # https://github.com/ultralytics/ultralytics/blob/main/examples/YOLOv8-Region-Counter/yolov8_region_counter.py
    

# Testzwecke
if __name__ == "__main__":
    # PYTHONPATH=. python -m kernprof -lvr src/core/yolo/inference.py
    from src.core.stream.cv2.stream_cv2 import CameraStream
    stream = CameraStream("test.webm", (1280, 720), 30, "RGB888")
    stream.start_camera()
    
    inf = Inference(stream, "yolov8n.pt", only_simulation=False, only_simulation_img=False, blur_humans=False)
    inf.run()