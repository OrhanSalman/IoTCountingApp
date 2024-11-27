from ultralytics import YOLO

def export(
        weights,
        format,
        imgsz,
        keras,
        optimize,
        half,
        int8,
        dynamic,
        simplify,
        opset,
        workspace,
        nms,
        batch
    ):

    model = YOLO(weights)

    export_args = {
        "imgsz": imgsz,
        "half": half,
        "int8": int8,
        "dynamic": dynamic,
        "simplify": simplify,
        "opset": opset,
        "workspace": workspace,
        "nms": nms,
        "batch": batch,
        "keras": keras,
        "optimize": optimize,
    }
    
    # https://docs.ultralytics.com/de/modes/export/#arguments
    if format == 'torchscript':
        export_args = {k: v for k, v in export_args.items() if k in ['imgsz', 'optimize', 'batch']}
    elif format == 'onnx':
        export_args = {k: v for k, v in export_args.items() if k in ['imgsz', 'half', 'dynamic', 'simplify', 'opset', 'batch']}
    elif format == 'openvino':
        export_args = {k: v for k, v in export_args.items() if k in ['imgsz', 'half', 'int8', 'batch']}
    elif format == 'engine':
        export_args = {k: v for k, v in export_args.items() if k in ['imgsz', 'half', 'dynamic', 'simplify', 'workspace', 'int8', 'batch']}
    elif format == 'coreml':
        export_args = {k: v for k, v in export_args.items() if k in ['imgsz', 'half', 'int8', 'nms', 'batch']}
    elif format == 'saved_model':
        export_args = {k: v for k, v in export_args.items() if k in ['imgsz', 'keras', 'int8', 'batch']}
    elif format == 'pb':
        export_args = {k: v for k, v in export_args.items() if k in ['imgsz', 'batch']}
    elif format == 'tflite':
        export_args = {k: v for k, v in export_args.items() if k in ['imgsz', 'half', 'int8', 'batch']}
    elif format == 'edgetpu':
        export_args = {k: v for k, v in export_args.items() if k in ['imgsz']}
    elif format == 'tfjs':
        export_args = {k: v for k, v in export_args.items() if k in ['imgsz', 'half', 'int8', 'batch']}
    elif format == 'paddle':
        export_args = {k: v for k, v in export_args.items() if k in ['imgsz', 'batch']}
    elif format == 'ncnn':
        export_args = {k: v for k, v in export_args.items() if k in ['imgsz', 'half', 'batch']}


    try:
        model.export(format=format, **export_args)
    except Exception as e:
        raise Exception(f"Error exporting model: {e}")
