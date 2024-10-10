import os
import json
import secrets
import subprocess
import sys
import threading
from dotenv import load_dotenv
import pkg_resources

from src.utils.messyFunctions import randomName

load_dotenv(override=True)


settings_loaded_event = threading.Event()

APP_DEV_MODE = os.getenv("APP_DEV_MODE", "False").lower() == "true"
APP_PORT = os.getenv("APP_PORT", 5000)
APP_DOMAIN = os.getenv("APP_DOMAIN", "0.0.0.0")
APP_REDIS_SERVER = os.getenv("APP_REDIS_SERVER", "False").lower() == "true"
REDIS_HOST = os.getenv("REDIS_HOST", "redis")
REDIS_PORT = os.getenv("REDIS_PORT", 6379)

NODE_EXPORTER_URL = os.getenv("NODE_EXPORTER_URL", "http://0.0.0.0:9100/metrics")

DEVICE_NAME = os.getenv("DEVICE_LOCATION", randomName())
DEVICE_LOCATION = os.getenv("DEVICE_NAME", "Musterstadt")

MONGO_COLLECTION_COUNTS = os.getenv("MONGO_COLLECTION_COUNTS", "counts")
MONGO_COLLECTION_TRACKING = os.getenv("MONGO_COLLECTION_TRACKING", "tracking")
MONGO_COLLECTION_TIMES = os.getenv("MONGO_COLLECTION_TIMES", "times")

BENCHED = os.getenv("BENCHED", "False").lower() == "true"

SECRET_KEY = os.getenv("SECRET_KEY", secrets.token_urlsafe(16))
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY", secrets.token_urlsafe(32))
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "").split(",") if os.getenv("ALLOWED_ORIGINS") else []
ALLOWED_ORIGINS.append(APP_DOMAIN)
if APP_DEV_MODE:
    ALLOWED_ORIGINS.append("http://localhost:3000")

USE_OIDC = os.getenv("USE_OIDC", "False").lower() == "true"
OIDC_HOST = os.getenv("OIDC_HOST")
OIDC_CLIENT_ID = os.getenv("OIDC_CLIENT_ID")
OIDC_CLIENT_SECRET = os.getenv("OIDC_CLIENT_SECRET")
OIDC_ISSUER = f"{OIDC_HOST}{os.getenv('OIDC_ISSUER')}"
OIDC_USERINFO_URI = f"{OIDC_HOST}{os.getenv('OIDC_USERINFO_URI')}"
OIDC_TOKEN_INTROSPECTION_URI = f"{OIDC_HOST}{os.getenv('OIDC_TOKEN_INTROSPECTION_URI')}"
OIDC_SERVER_METADATA_URL = f"{OIDC_HOST}{os.getenv('OIDC_SERVER_METADATA_URL')}"
OIDC_SCOPES = os.getenv("OIDC_SCOPES").split(",") if os.getenv("OIDC_SCOPES") else []
OIDC_ID_TOKEN_COOKIE_SECURE = True

#OIDC_REALM_NAME = os.getenv("OIDC_REALM_NAME")

#OIDC_CERT_URL = f"{OIDC_HOST}{os.getenv('OIDC_CERT_URL')}"
#OIDC_AUTH_URI = f"{OIDC_HOST}{os.getenv('OIDC_AUTH_URI')}"
#OIDC_TOKEN_URI = f"{OIDC_HOST}{os.getenv('OIDC_TOKEN_URI')}"
#OIDC_REDIRECT_URI = f"{OIDC_HOST}{os.getenv('OIDC_REDIRECT_URI')}"
#OIDC_ALLOWED_ROLES = os.getenv("OIDC_ALLOWED_ROLES").split(",") if os.getenv("OIDC_ALLOWED_ROLES") else []


# Define paths
HOME_DIR = os.path.dirname(os.path.abspath(__file__))
IMG_PATH = os.path.join(HOME_DIR, "data/imgs")
VID_PATH = os.path.join(HOME_DIR, "data/vids")
LOG_PATH = os.path.join(HOME_DIR, "data/logs")
CONFIG_FOLDER_PATH = os.path.join(HOME_DIR, "data/configs")

BENCHMARKS_PATH = os.path.join(HOME_DIR, "data/benchmarks")
CONFIG_PATH = os.path.join(HOME_DIR, "data/configs/config.json")
CAM_SOLUTIONS_PATH = os.path.join(HOME_DIR, "data/configs/cam_solutions.json")
BUILD_PATH = os.path.join(HOME_DIR, "build")
YOLO_PREDICTIONS_PATH = os.path.join(HOME_DIR, "runs/detect")
SYSTEM_SETTINGS_PATH = os.path.join(HOME_DIR, "data/configs/settings.json")


# Ensure the directories exist
for path in [CONFIG_FOLDER_PATH, IMG_PATH, VID_PATH, LOG_PATH, BENCHMARKS_PATH, YOLO_PREDICTIONS_PATH]:
    os.makedirs(path, exist_ok=True)

# Ensure the json files exist
for path in [CAM_SOLUTIONS_PATH]:
    if not os.path.exists(path):
        with open(path, "w") as file:
            json.dump({}, file)



def load_camera_solutions():
    try:
        with open(CAM_SOLUTIONS_PATH, "r") as file:
            return json.load(file)
    except FileNotFoundError:
        return {"cv2": False, "picam2": False}

def update_camera_solutions():
    from src.core.stream.stream_solution import initialize_camera_solutions, load_current_settings
    initialize_camera_solutions()
    cam_solutions = load_current_settings()
    return cam_solutions

# Load camera solutions and update variables
cam_solutions = load_camera_solutions()

# Ensure that cam_solutions is not None and contains the necessary keys
if cam_solutions is None or not cam_solutions.get("cv2", False) and not cam_solutions.get("picam2", False):
    cam_solutions = update_camera_solutions()

CV2_INSTALLED = cam_solutions.get("cv2", False)
PICAMERA2_INSTALLED = cam_solutions.get("picam2", False)


# Install ultralytics if not installed
ULTRALYTICS_VERSION = os.getenv("ULTRALYTICS_VERSION", "8.3.6")

def is_package_installed(package_name, version):
    """Überprüfen, ob ein Paket in der gewünschten Version installiert ist."""
    try:
        pkg_resources.require(f"{package_name}=={version}")
        return True
    except (pkg_resources.DistributionNotFound, pkg_resources.VersionConflict):
        return False

def install_package(package_name, version):
    """Installiere ein Paket über pip mit einer bestimmten Version."""
    subprocess.check_call([sys.executable, "-m", "pip", "install", f"{package_name}=={version}"])

if not is_package_installed("ultralytics", ULTRALYTICS_VERSION):
    install_package("ultralytics", ULTRALYTICS_VERSION)
    print(f"Paket 'ultralytics' in Version {ULTRALYTICS_VERSION} wurde erfolgreich installiert.")



# Check if CUDA is available
try:
    import torch
    CUDA_AVAILABLE = torch.cuda.is_available()
    CUDA_DEVICE_COUNT = torch.cuda.device_count()
    CUDA_DEVICE_NAME = torch.cuda.get_device_name()
    #print(f"CUDA_AVAILABLE: {CUDA_AVAILABLE}")
    #print(f"CUDA_DEVICE_COUNT: {CUDA_DEVICE_COUNT}")
    #print(f"CUDA_DEVICE_NAME: {CUDA_DEVICE_NAME}")
except Exception as e:
    CUDA_AVAILABLE = False
    CUDA_DEVICE_COUNT = 0
    CUDA_DEVICE_NAME = "None"
    #print(f"Error: {e}")


# Check if MPS is available
try:
    import torch.backends.mps
    MPS_AVAILABLE = torch.backends.mps.is_available() if torch.backends.mps.is_available() else False
    MPS_BUILT = torch.backends.mps.is_built() if torch.backends.mps.is_built() else False
    MPS_MACOS13_OR_NEWER = torch.backends.mps.is_macos13_or_newer() if torch.backends.mps.is_macos13_or_newer() else False
    #print(f"MPS_AVAILABLE: {MPS_AVAILABLE}")
    #print(f"MPS_BUILT: {MPS_BUILT}")
    #print(f"MPS_MACOS13_OR_NEWER: {MPS_MACOS13_OR_NEWER}")
except Exception as e:
    MPS_AVAILABLE = False
    MPS_BUILT = False
    MPS_MACOS13_OR_NEWER = False
    #print(f"Error: {e}")


# Generate default config and system settings if not exists
from src.utils.generateDefaults import generateDefaultConfigIfNotExists, generateDefaultSystemSettingsIfNotExists
generateDefaultConfigIfNotExists()
generateDefaultSystemSettingsIfNotExists()


# Check settings.json for auto start inference
with open(SYSTEM_SETTINGS_PATH, "r") as file:
    system_settings = json.load(file)
    AUTO_START_INFERENCE = system_settings.get("auto_start_inference", False)
    AUTO_START_MQTT_CLIENT = system_settings.get("auto_start_mqtt_client", False)
    AUTO_START_MONGO_CLIENT = system_settings.get("auto_start_mongo_client", False)


settings_loaded_event.set()
