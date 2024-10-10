import json
import random
from uuid import uuid4


def load_config(path):
    with open(path, "r") as file:
        return json.load(file)


def generateUUID():
    return str(uuid4())


def convert_to_seconds(value, unit):
    if unit == 'min':
        return value * 60
    elif unit == 'h':
        return value * 3600
    return value


def whereModel(weights, int8, quantization, format):
    model_str = ''
    
    if format in ['pt', 'torchscript', 'engine', 'onnx', 'pb']:
        model_str = weights
    if format == 'openvino':
        weights = weights + '_int8_openvino_model' if int8 else weights + '_openvino_model'
        format = ''
        model_str = weights
    if format == 'openvino_':
        weights = weights + '_openvino_model'
        format = ''
        model_str = weights
    if format == 'engine':
        model_str = weights
    if format == 'saved_model': # int8 zeigt er in der konsole an, aber fp16 (half) nicht...
        weights = weights + '_saved_model'
        format = ''
        model_str = weights
    if format == 'tflite':
        weights = weights + '_saved_model/' + weights
        format_quantization = quantization
        if format_quantization == 'fp16':
            weights = weights + '_float16.tflite'
        elif format_quantization == 'int8':
            weights = weights + '_int8.tflite'
        else:
            weights = weights + '_float32.tflite'
        format = ''
        model_str = weights
    if format == 'edgetpu':
        weights = weights + '_saved_model/' + weights
        format = ''
        """ 
            Aktuell ist der Dateinamen immer full_integer_quant_edgetpu.tflite
            Vermutlich weil auf diesem Gerät EDGE TPU nicht unterstützt wird
        """
        weights = weights + '_full_integer_quant_edgetpu.tflite'
        #if format_quantization == 'int8':
        #    weights = weights + '_full_integer_quant_edgetpu.tflite'
        #elif format_quantization == 'fp16':
        #    weights = weights + '_full_float16_quant_edgetpu.tflite'
        #else:
        #    weights = weights + '_full_float32_quant_edgetpu.tflite'
        format = ''
        model_str = weights
        return False, "Edge TPU not implemented."
    if format == 'tfjs':
        weights = weights + '_web_model'
        format = ''
        model_str = weights
    if format == 'paddle':
        weights = weights + '_paddle_model'
        format = ''
        model_str = weights       
    if format == 'coreml':
        weights = weights + '.mlpackage'
        format = ''
        model_str = weights
    if format == 'ncnn':
        weights = weights + '_ncnn_model'
        format = ''
        model_str = weights

    return model_str

    
def randomName():
    names = [
        "Orion Alpha",
        "Nova Prime",
        "Quantum Z5",
        "Astra Echo",
        "Vega Pro",
        "Lumen XT",
        "Nebula 200",
        "Zeta Core",
        "Apollo X7",
        "Solstice 500",
        "Taurus M4",
        "Zenith Omega",
        "Polaris Lite",
        "Helios Wave",
        "Draco Flex",
        "Cosmos Max",
        "Phoenix Delta",
        "Artemis Ultra",
        "Lynx Vector",
        "Titan Surge",
        "Hyperion Pulse",
        "Eclipse X3",
        "Atlas G7",
        "Stellar Fusion",
        "Mercury Blade",
        "Zephyr Quantum",
        "Griffin Axis",
        "Nebula Spark",
        "Stratus Edge",
        "Chronos Pro",
        "Pegasus Volt",
        "Gladius Core",
        "Aurora Wave",
        "Cetus Prime",
        "Cygnus Flux",
        "Aether Blaze",
        "Icarus Lite",
        "Vortex Ultra",
        "Falcon Zenith",
        "Argon X9",
        "Oberon Pulse",
        "Helix Nova",
        "Mirage Flex",
        "Altair Pro",
        "Raven Optic",
        "Pulsar X2",
        "Hydra Prime",
        "Vega Sync",
        "Phoenix Vector",
        "Orion Pulse",
        "Nova Spark",
        "Quantum Blade",
        "Astra Pro",
        "Vega Wave",
        "Lumen Core",
        "Nebula Ultra",
        "Zeta Flex",
        "Apollo Omega",
    ]

    return names[random.randint(0, len(names) - 1)]
