import subprocess


def get_nvidia_version():
    try:
        result = subprocess.run(["nvidia-smi", "--query-gpu=driver_version", "--format=csv,noheader"], capture_output=True, text=True)
        return result.stdout.strip()
    except Exception as e:
        return "NVIDIA driver not found"

def get_cuda_version():
    try:
        result = subprocess.run(["nvcc", "--version"], capture_output=True, text=True)
        for line in result.stdout.split('\n'):
            if "release" in line:
                return line.split("release")[-1].strip().split(",")[0]
        return "CUDA not found"
    except Exception as e:
        return "CUDA not found"

def get_cudnn_version():
    try:
        result = subprocess.run(["cat", "/usr/include/cudnn_version.h"], capture_output=True, text=True)
        for line in result.stdout.split('\n'):
            if "#define CUDNN_MAJOR" in line:
                major = line.split()[-1]
            if "#define CUDNN_MINOR" in line:
                minor = line.split()[-1]
            if "#define CUDNN_PATCHLEVEL" in line:
                patch = line.split()[-1]
        return f"{major}.{minor}.{patch}"
    except Exception as e:
        return "cuDNN not found"
    
def get_tensorflow_version():
    try:
        result = subprocess.run(["pip", "show", "tensorflow"], capture_output=True, text=True)
        for line in result.stdout.split('\n'):
            if "Version" in line:
                return line.split(":")[-1].strip()
        return "TensorFlow not found"
    except Exception as e:
        return "TensorFlow not found"
    
def get_torch_version():
    try:
        result = subprocess.run(["pip", "show", "torch"], capture_output=True, text=True)
        for line in result.stdout.split('\n'):
            if "Version" in line:
                return line.split(":")[-1].strip()
        return "PyTorch not found"
    except Exception as e:
        return "PyTorch not found"
    
def get_opencv_version():
    try:
        result = subprocess.run(["pip", "show", "opencv-python"], capture_output=True, text=True)
        for line in result.stdout.split('\n'):
            if "Version" in line:
                return line.split(":")[-1].strip()
        return "OpenCV not found"
    except Exception as e:
        return "OpenCV not found"
    
def get_ultralytics_version():
    try:
        result = subprocess.run(["pip", "show", "ultralytics"], capture_output=True, text=True)
        for line in result.stdout.split('\n'):
            if "Version" in line:
                return line.split(":")[-1].strip()
        return "Ultralytics not found"
    except Exception as e:
        return "Ultralytics not found"
