import json
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

def save_to_json(data, path):
    with open(path, "w") as file:
        json.dump(data, file, indent=4)
    print(f"Data saved to {path}")
        

def add_session(session, path):
    with open(path, "r") as file:
        session_counter = json.load(file)

    session_counter["counter"] += 1
    session_counter["sessions"].append(session)

    with open(path, "w") as file:
        json.dump(session_counter, file, indent=4)


def add_end_datetime_to_session(session_id, end_datetime, path):
    with open(path, "r") as file:
        session_counter = json.load(file)
        
    for session in session_counter["sessions"]:
        if session["id"] == session_id:
            session["end"] = end_datetime
            
    with open(path, "w") as file:
        json.dump(session_counter, file, indent=4)


def delete_session(session_id, path):
    with open(path, "r") as file:
        session_counter = json.load(file)
        
    # Entferne die Sitzung mit der angegebenen ID
    session_counter["sessions"] = [session for session in session_counter["sessions"] if session["id"] != session_id]
    
    with open(path, "w") as file:
        json.dump(session_counter, file, indent=4)
        