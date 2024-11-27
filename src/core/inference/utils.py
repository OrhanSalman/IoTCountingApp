
import cv2
import json
import os
import datetime
import settings
from src.utils.logger import Logger
from src.core.stream.ffmpeg import convert_video


logger = Logger("Inference", settings.LOG_PATH + "/inference.log")


def save_simulation(frames, counts, deviceConfigId, model_str, imgsz, iou, conf, tracker, quantization, device, vid_stride, fps, frame_width, frame_height):
    try:
        # Speichern des Videos mit Name "simulation" + Datum Uhrzeit
        datetime_str = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')

        # Das letzte Bild in frames als Cover Image speichern
        cover_image = frames[-1]
        cover_image_filename = f"simvid_{deviceConfigId}_{datetime_str}.jpg"
        cover_image_path = os.path.join(settings.VID_PATH, cover_image_filename)
        cv2.imwrite(cover_image_path, cover_image)

        # Video-Dateinamen definieren
        video_filename = f"simvid_{deviceConfigId}_{datetime_str}.mp4"
        video_filename_temp = f"simvid_{deviceConfigId}_{datetime_str}_temp.mp4"
        output_file = os.path.join(settings.VID_PATH, video_filename_temp)
        final_output_file = os.path.join(settings.VID_PATH, video_filename)

        # VideoWriter initialisieren
        video_writer = cv2.VideoWriter(output_file, cv2.VideoWriter_fourcc(*'mp4v'), fps, (frame_width, frame_height))

        if not frames:
            logger.warning("No frames to save.")
            return

        for frame in frames:
            video_writer.write(frame)

        video_writer.release()
            
        # Konvertiere das Video mit der convert_video-Funktion
        try:
            convert_video(output_file, final_output_file)
            logger.info(f"Video successfully converted")

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
            "deviceConfigId": deviceConfigId,
            "model": model_str,
            "imgsz": imgsz,
            "iou": iou,
            "conf": conf,
            "tracker": tracker,
            "quantization": quantization,
            "device": device,
            "vid_stride": vid_stride,
            "resolution": (frame_width, frame_height),
            "fps": fps,
            "performance": get_performance_metrics(),
            "counts": counts,
        }

        json_filename = f"simvid_{deviceConfigId}_{datetime_str}.json"
        json_file_path = os.path.join(settings.VID_PATH, json_filename)

        with open(json_file_path, 'w') as f:
            json.dump(json_data, f, indent=4)

        logger.info(f"JSON file saved successfully: {json_file_path}")

    except Exception as e:
        logger.error(f"Error saving video or JSON file: {str(e)}")
    finally:
        from src.control import stop_stream
        stop_stream(force=True)


def save_simulation_img(predicted_frame_path, counts_and_classes, deviceConfigId, model_str, format, imgsz, iou, conf, quantization, device, speed):
    try:
        # Bild von dem gegebenen Pfad einlesen
        predicted_frame = cv2.imread(predicted_frame_path)
        if predicted_frame is None:
            logger.error("Could not read predicted frame from path.")
            return

        datetime_str = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
        cover_image_filename = f"simimg_{deviceConfigId}_{datetime_str}.jpg"
        cover_image_path = os.path.join(settings.IMG_PATH, cover_image_filename)
        cv2.imwrite(cover_image_path, predicted_frame) 

        json_data = {
            "datetime": datetime_str,
            "deviceConfigId": deviceConfigId,
            "model": model_str,
            "format": format,
            "imgsz": imgsz,
            "iou": iou,
            "conf": conf,
            "quantization": quantization,
            "device": device,
            "counts": counts_and_classes,
            "speed": speed
        }

        json_filename = f"simimg_{deviceConfigId}_{datetime_str}.json"
        json_file_path = os.path.join(settings.IMG_PATH, json_filename)

        with open(json_file_path, 'w') as f:
            json.dump(json_data, f, indent=4)

        logger.info(f"JSON file saved successfully: {json_file_path}")

    except Exception as e:
        logger.error(f"Error saving image or JSON file: {str(e)}")
