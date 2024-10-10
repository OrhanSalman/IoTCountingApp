import { Divider } from "antd";

export const model = [
  {
    label: <Divider>YOLOv8</Divider>,
    title: "YOLOv8",
    options: [
      {
        value: "yolov8n",
        label: "YOLOv8n",
      },
      {
        value: "yolov8s",
        label: "YOLOv8s",
      },
      {
        value: "yolov8m",
        label: "YOLOv8m",
      },
      {
        value: "yolov8l",
        label: "YOLOv8l",
      },
      {
        value: "yolov8x",
        label: "YOLOv8x",
      },
    ],
  },
  {
    label: <Divider>YOLO11</Divider>,
    title: "YOLO11",
    options: [
      {
        value: "yolo11n",
        label: "YOLO11n",
      },
      {
        value: "yolo11s",
        label: "YOLO11s",
      },
      {
        value: "yolo11m",
        label: "YOLO11m",
      },
      {
        value: "yolo11l",
        label: "YOLO11l",
      },
      {
        value: "yolo11x",
        label: "YOLO11x",
      },
    ],
  },
];

export const tracker = [
  {
    value: "botsort.yaml",
    label: "BoT-SORT",
    tooltip:
      "BoT-SORT: Ein robuster Online-Tracker, der auf einer Transformer-basierten Architektur basiert. Ideal für Szenarien, in denen eine hohe Genauigkeit und Robustheit bei der Verfolgung mehrerer Objekte erforderlich ist, insbesondere bei komplexen Bewegungsmustern.",
  },
  {
    value: "bytetrack.yaml",
    label: "ByteTrack",
    tooltip:
      "ByteTrack: Ein leistungsstarker Multi-Objekt-Tracker, der auch mit niedrig-konfidenten Detektionen umgehen kann. Geeignet für Anwendungen, bei denen Geschwindigkeit und Effizienz im Vordergrund stehen, wie z. B. Echtzeitanalysen.",
  },
];

export const quantization = [
  {
    value: "default",
    label: "Default",
    tooltip: "Standardpräzision",
  },
  {
    value: "fp16",
    label: "FP16",
    tooltip:
      "Ermöglicht die Inferenz mit halber Genauigkeit (FP16), was die Modellinferenz auf unterstützten GPUs mit minimalen Auswirkungen auf die Genauigkeit beschleunigen kann.",
  },
  {
    value: "int8",
    label: "INT8",
    tooltip:
      "Aktiviert die INT8-Quantisierung, um das Modell weiter zu komprimieren und die Inferenz mit minimalem Genauigkeitsverlust zu beschleunigen, vor allem für Edge-Geräte.",
  },
];

export const accelerator = [
  {
    value: "cpu",
    label: "CPU",
  },
  {
    value: "gpu",
    label: "GPU",
  },
];

export const format = [
  {
    value: "pt",
    label: "PyTorch",
    tooltip: "Empfohlen für GPU basierte Inferenz",
    allowedExportArgs: [],
  },
  {
    value: "torchscript",
    label: "TorchScript",
    tooltip: "Für die serialisierte Ausführung von PyTorch-Modellen",
    allowedExportArgs: ["imgsz", "optimize", "batch"],
  },
  {
    value: "onnx",
    label: "ONNX",
    tooltip: "Empfohlen für CPU basierte Inferenz",
    allowedExportArgs: [
      "imgsz, dynamic, simplify, opset, batch",
      { quantization: ["fp16"] },
    ],
  },
  {
    value: "openvino",
    label: "OpenVINO",
    tooltip: "Optimiert für Intel CPUs und Neural Compute Sticks",
    allowedExportArgs: ["imgsz", "batch", { quantization: ["fp16", "int8"] }],
  },
  {
    value: "engine",
    label: "TensorRT",
    tooltip: "Optimiert für NVIDIA GPUs",
    allowedExportArgs: [
      "imgsz",
      "dynamic",
      "simplify",
      "workspace",
      "batch",
      { quantization: ["fp16", "int8"] },
    ],
  },
  {
    value: "coreml",
    label: "CoreML",
    tooltip: "Für die Inferenz auf Apple-Geräten (iOS/macOS)",
    allowedExportArgs: [
      "imgsz",
      "nms",
      "batch",
      { quantization: ["fp16", "int8"] },
    ],
  },
  {
    value: "saved_model",
    label: "TensorFlow SavedModel",
    tooltip: "Standardformat für TensorFlow-Modelle",
    allowedExportArgs: ["imgsz", "keras", "batch", { quantization: ["int8"] }],
  },
  {
    value: "pb",
    label: "TensorFlow GraphDef",
    tooltip: "Ein älteres TensorFlow-Format für die Inferenz",
    allowedExportArgs: ["imgsz", "batch"],
  },
  {
    value: "tflite",
    label: "TensorFlow Lite",
    tooltip: "Für Mikrocontroller und mobile Geräte",
    allowedExportArgs: ["imgsz, batch", { quantization: ["fp16", "int8"] }],
  },
  {
    value: "edgetpu",
    label: "TFLite Edge TPU",
    tooltip: "Für Geräte mit Beschleuniger wie Google Coral",
    allowedExportArgs: ["imgsz"],
  },
  {
    value: "tfjs",
    label: "TensorFlow.js",
    tooltip: "Für Inferenz im Browser",
    allowedExportArgs: ["imgsz", "batch", { quantization: ["fp16", "int8"] }],
  },

  {
    value: "paddle",
    label: "PaddlePaddle",
    tooltip: "Für Deep Learning in industriellen Anwendungen",
    allowedExportArgs: ["imgsz", "batch"],
  },
  {
    value: "ncnn",
    label: "NCNN",
    tooltip: "Für mobile eingebettete Geräte",
    allowedExportArgs: ["imgsz", "batch", { quantization: ["fp16"] }],
  },
];

export const imgsz = [
  {
    value: 256,
    label: "256",
  },
  {
    value: 320,
    label: "320",
  },
  {
    value: 384,
    label: "384",
  },
  {
    value: 448,
    label: "448",
  },
  {
    value: 512,
    label: "512",
  },
  {
    value: 576,
    label: "576",
  },
  {
    value: 640,
    label: "640",
  },
  {
    value: 768,
    label: "768",
  },
  {
    value: 896,
    label: "896",
  },
  {
    value: 1024,
    label: "1024",
  },
  {
    value: 1152,
    label: "1152",
  },
  {
    value: 1280,
    label: "1280",
  },
];

export const categories = [
  {
    isUrban: true,
    category: "Verkehr und Transport",
    items: [
      { value: "0", label: "Person" },
      { value: "1", label: "Fahrrad" },
      { value: "2", label: "Auto" },
      { value: "3", label: "Motorrad" },
      { value: "4", label: "Flugzeug" },
      { value: "5", label: "Bus" },
      { value: "6", label: "Zug" },
      { value: "7", label: "LKW" },
      { value: "8", label: "Boot" },
      { value: "9", label: "Ampel" },
      { value: "10", label: "Hydrant" },
      { value: "11", label: "Stoppschild" },
      { value: "12", label: "Parkuhr" },
      { value: "13", label: "Bank" },
    ],
  },
  {
    isUrban: false,
    category: "Essen und Trinken",
    items: [
      { value: "46", label: "Banane" },
      { value: "47", label: "Apfel" },
      { value: "48", label: "Sandwich" },
      { value: "49", label: "Orange" },
      { value: "50", label: "Brokkoli" },
      { value: "51", label: "Karotte" },
      { value: "52", label: "Hotdog" },
      { value: "53", label: "Pizza" },
      { value: "54", label: "Donut" },
      { value: "55", label: "Kuchen" },
      { value: "39", label: "Flasche" },
      { value: "40", label: "Weinglas" },
      { value: "41", label: "Tasse" },
    ],
  },
  {
    isUrban: false,
    category: "Freizeit und Sport",
    items: [
      { value: "29", label: "Frisbee" },
      { value: "30", label: "Skier" },
      { value: "31", label: "Snowboard" },
      { value: "32", label: "Sportball" },
      { value: "33", label: "Drachen" },
      { value: "34", label: "Baseballschläger" },
      { value: "35", label: "Baseballhandschuh" },
      { value: "36", label: "Skateboard" },
      { value: "37", label: "Surfbrett" },
      { value: "38", label: "Tennisschläger" },
    ],
  },
  {
    isUrban: false,
    category: "Tiere",
    items: [
      { value: "14", label: "Vogel" },
      { value: "15", label: "Katze" },
      { value: "16", label: "Hund" },
      { value: "17", label: "Pferd" },
      { value: "18", label: "Schaf" },
      { value: "19", label: "Kuh" },
      { value: "20", label: "Elefant" },
      { value: "21", label: "Bär" },
      { value: "22", label: "Zebra" },
      { value: "23", label: "Giraffe" },
    ],
  },
  {
    isUrban: false,
    category: "Elektrogeräte",
    items: [
      { value: "62", label: "Fernseher" },
      { value: "65", label: "Fernbedienung" },
      { value: "68", label: "Mikrowelle" },
      { value: "69", label: "Ofen" },
      { value: "70", label: "Toaster" },
      { value: "71", label: "Spüle" },
      { value: "72", label: "Kühlschrank" },
      { value: "63", label: "Laptop" },
      { value: "64", label: "Maus" },
      { value: "66", label: "Tastatur" },
      { value: "67", label: "Handy" },
      { value: "68", label: "Haartrockner" },
    ],
  },
  {
    isUrban: false,
    category: "Sonstiges",
    items: [
      { value: "73", label: "Buch" },
      { value: "74", label: "Uhr" },
      { value: "75", label: "Vase" },
      { value: "76", label: "Schere" },
      { value: "77", label: "Teddybär" },
      { value: "58", label: "Topfpflanze" },
      { value: "24", label: "Rucksack" },
      { value: "25", label: "Regenschirm" },
      { value: "26", label: "Handtasche" },
      { value: "27", label: "Krawatte" },
      { value: "28", label: "Koffer" },
      { value: "42", label: "Gabel" },
      { value: "43", label: "Messer" },
      { value: "44", label: "Löffel" },
      { value: "45", label: "Schüssel" },
      { value: "56", label: "Stuhl" },
      { value: "57", label: "Couch" },
      { value: "59", label: "Bett" },
      { value: "60", label: "Esstisch" },
      { value: "61", label: "Toilette" },
      { value: "79", label: "Zahnbürste" },
    ],
  },
];

export const iou = {
  default: 0.7,
  min: 0.05,
  max: 1,
  steps: 0.05,
  tooltip:
    "Intersection over Union (IoU) ist ein Maß für die Genauigkeit der Objekterkennung. Ein höherer Wert bedeutet, dass die Objekte genauer erkannt werden, aber auch mehr falsche Positiv-Ergebnisse erzeugt werden.",
};

export const conf = {
  default: 0.25,
  min: 0.05,
  max: 1,
  steps: 0.05,
  tooltip:
    "Die Confidence-Schwelle bestimmt, wie sicher das Modell sein muss, um ein Objekt zu erkennen. Ein höherer Wert bedeutet, dass das Modell nur sehr sichere Erkennungen ausgibt, aber auch mehr Objekte verpasst.",
};

export const limit = {
  default: 300,
  max: 1000,
  min: 100,
  steps: 25,
  tooltip: "Maximale Anzahl von Objekten, die erkannt werden sollen.",
};

export const vid_stride = {
  default: 1,
  min: 1,
  max: 10,
  steps: 1,
  tooltip:
    "Stride für die Videoanalyse. Ein höherer Wert bedeutet, dass weniger Frames analysiert werden, was die Geschwindigkeit erhöht, aber auch die Genauigkeit verringert. Bei einem Wert von 1 wird jedes Frame analysiert, bei höhere Werten nur jedes n-te Frame.",
};

// TODO: kann weg ?
export const stream_buffer = {
  default: false,
  tooltip:
    "Stream-Buffer legt fest, ob bei der Verarbeitung von Videostreams ein Puffer verwendet werden soll, um die Verarbeitungsgeschwindigkeit zu erhöhen. Dies kann zu einer besseren Leistung führen, aber auch zu einer Verzögerung bei der Anzeige des Streams.",
};

export const stream_resolution = [
  {
    value: "426x240",
    label: "240p",
  },
  {
    value: "640x360",
    label: "360p",
  },
  {
    value: "852x480",
    label: "480p",
  },
  {
    value: "1280x720",
    label: "720p",
  },
  {
    value: "1920x1080",
    label: "1080",
  },
  {
    value: "2560x1440",
    label: "1440p",
  },
  {
    value: "3840x2160",
    label: "4k",
  },
];

export const stream_fps = [
  {
    value: 5,
    label: "5",
  },
  {
    value: 10,
    label: "10",
  },
  {
    value: 15,
    label: "15",
  },
  {
    value: 20,
    label: "20",
  },
  {
    value: 25,
    label: "25",
  },
  {
    value: 30,
    label: "30",
  },
  {
    value: 60,
    label: "60",
  },
  {
    value: 120,
    label: "120",
  },
];

// TODO: default werte können entfernt werden, da sie in den addHandlern bereits gesetzt werden
// TODO: umbenennen in color channel
export const stream_channel = [
  {
    value: "RGB888",
    label: "RGB",
    tooltip: "(Rot, Grün, Blau)",
  },
  {
    value: "BGR888",
    label: "BGR",
    tooltip: "(Blau, Grün, Rot)",
  },
  {
    value: "greyscale",
    label: "Graustufen",
    tooltip: "Graustufenbild",
  },
];

export const stream_source = [
  {
    value: "0",
    label: "Webcam",
    tooltip: "Webcam-Stream",
  },
  {
    value: "youtube",
    label: "YouTube",
  },
];
