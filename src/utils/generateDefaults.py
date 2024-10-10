import settings, os, json
from src.utils.messyFunctions import generateUUID, randomName

id = generateUUID()

config_data = {
    "id": id,
    "deviceName": settings.DEVICE_NAME if settings.DEVICE_NAME is not None else randomName(),
    "deviceLocation": settings.DEVICE_LOCATION if settings.DEVICE_LOCATION is not None else "Unknown",
    "deviceConfigs": [
        {
            "id": generateUUID(),
            "batch": 1,
            "conf": 0.25,
            "deviceType": "cpu",
            "dynamic": False,
            "imgsz": 256,
            "iou": 0.7,
            "keras": False,
            "max_det": 300,
            "model": "yolov8n",
            "modelFormat": "pt",
            "nms": False,
            "opset": None,
            "optimize": False,
            "persist": False,
            "quantization": "default",
            "simplify": False,
            "stream_buffer": 0,
            "stream_channel": "RGB888",
            "stream_fps": 30,
            "stream_resolution": "640x480",
            "stream_source": "0",
            "tracker": "botsort.yaml",
            "vid_stride": 1,
            "workspace": 4
        }
    ],
    "deviceTags": [
        {
            "tags": ["0", "1", "2", "3", "5", "7"]
        }
    ],
    "cuda": settings.CUDA_AVAILABLE,
    "cuda_device_count": settings.CUDA_DEVICE_COUNT,
    "cuda_device_name": settings.CUDA_DEVICE_NAME,
    "mps_available": settings.MPS_AVAILABLE,
    "mps_built": settings.MPS_BUILT,
}


def generateDefaultConfigIfNotExists():
    if not os.path.exists(settings.CONFIG_PATH):
        with open(settings.CONFIG_PATH, "w") as file:
            json.dump(config_data, file)


system_settings_data = {
    "automatic_update": False,
    "auto_start_inference": False,
    "auto_start_mongo_client": False,
    "auto_start_mqtt_client": False,
    "counts_save_intervall": 5,
    "counts_save_intervall_format": "min",
    "counts_publish_intervall": 5,
    "counts_publish_intervall_format": "min",
    "detect_count_timespan": False,
    "detect_count_routes": False,
    "blur_humans": True,
    "max_tracking_points_length": 25,
    "save_counts_to_mongo": False,
    "save_counts_to_queue_if_mongo_down": True, # TODO
    "ensure_not_data_loss_to_file": False,
    "daily_cleanup_time": "00:00",
    "mqtt_max_publish_limit": 100,
}

def generateDefaultSystemSettingsIfNotExists():
    if not os.path.exists(settings.SYSTEM_SETTINGS_PATH):
        with open(settings.SYSTEM_SETTINGS_PATH, "w") as file:
            json.dump(system_settings_data, file)