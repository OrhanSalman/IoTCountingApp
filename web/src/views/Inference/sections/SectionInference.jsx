import React, { useContext, useEffect, useState } from "react";
import { Row, Divider, Col } from "antd";
import { useUpdateHandler } from "./hooks/updateHandler";
import CardWithSelect from "./components/CardWithSelect";
import CardWithSwitch from "./components/CardWithSwitch";
import CardWithSlider from "./components/CardWithSlider";
import {
  model,
  accelerator,
  format,
  imgsz,
  iou,
  conf,
  vid_stride,
  limit,
  quantization,
  tracker,
} from "../../../../src/constants/constants";
import { DeviceContext } from "../../../api/DeviceContext";

const SectionInference = () => {
  const {
    handleUpdateModel,
    handleUpdateVidStride,
    handleUpdateFormat,
    handleUpdateDeviceType,
    handleUpdateImgsz,
    handleUpdatePrecision,
    handleUpdateIOU,
    handleUpdateConf,
    handleUpdateMaxDet,
    handleUpdateTracker,
    handleUpdateOptimize,
    handleUpdateKeras,
    handleUpdateSimplify,
  } = useUpdateHandler();
  const { data } = useContext(DeviceContext);
  const deviceConfigs = data?.deviceConfigs || [];
  const [gpuEnabled, setGpuEnabled] = useState(false);

  useEffect(() => {
    const isGpuEnabled =
      data?.cuda === true ||
      (data?.mps_available === true && data?.mps_built === true);

    setGpuEnabled(isGpuEnabled);
  }, [data]);

  const availableAccelerators = gpuEnabled
    ? accelerator // Wenn GPU verfügbar ist, dann alle Acceleratoren anzeigen
    : accelerator.filter((a) => a.value !== "gpu"); // Wenn keine GPU verfügbar ist, dann nur CPU anzeigen

  const cardItemsSelect = [
    {
      title: "Model",
      value: deviceConfigs[0]?.model,
      options: model,
      tooltip:
        "Kleinere Modelle: schnelle Erkennung, CPU-günstig. Größere Modelle: höhere Genauigkeit, GPU-geeignet.",
      width: "140px",
      height: "100px",
      onChange: handleUpdateModel,
    },
    {
      title: "Format",
      value: deviceConfigs[0]?.modelFormat,
      options: format,
      width: "250px",
      height: "100px",
      onChange: handleUpdateFormat,
    },
    {
      title: "Beschleuniger",
      value: deviceConfigs[0]?.deviceType,
      options: availableAccelerators,
      width: "140px",
      height: "100px",
      onChange: handleUpdateDeviceType,
    },
    {
      title: "Inputgröße",
      value: deviceConfigs[0]?.imgsz,
      options: imgsz,
      tooltip:
        "256-512: schnelle Verarbeitung, nahe Objekte. 640-1280: maximale Größe, für entfernte Objekte geeignet.",
      width: "100px",
      height: "100px",
      onChange: handleUpdateImgsz,
    },
    {
      title: "Quantization",
      value: deviceConfigs[0]?.quantization,
      options: quantization,
      width: "100px",
      height: "100px",
      onChange: handleUpdatePrecision,
    },
    {
      title: "Tracker",
      value: deviceConfigs[0]?.tracker,
      options: tracker,
      width: "200px",
      height: "100px",
      onChange: handleUpdateTracker,
    },
  ];

  const cardItemsSlider = [
    {
      title: "IoU",
      value: deviceConfigs[0]?.iou,
      options: iou,
      //width: "300px",
      //height: "100px",
      onChange: handleUpdateIOU,
    },
    {
      title: "Vertrauensschwelle",
      value: deviceConfigs[0]?.conf,
      options: conf,
      //width: "300px",
      //height: "100px",
      onChange: handleUpdateConf,
    },
    {
      title: "Limit",
      value: deviceConfigs[0]?.max_det,
      options: limit,
      //width: "300px",
      //height: "100px",
      onChange: handleUpdateMaxDet,
    },
    {
      title: "Stride",
      value: deviceConfigs[0]?.vid_stride,
      options: vid_stride,
      //width: "300px",
      //height: "100px",
      tooltip: vid_stride.tooltip,
      onChange: handleUpdateVidStride,
    },
  ];

  const cardItemsSwitch = [
    {
      title: "Optimize",
      value: deviceConfigs[0]?.optimize,
      width: "140px",
      height: "100px",
      onChange: handleUpdateOptimize,
      tooltip:
        "Wendet beim Export nach TorchScript eine Optimierung für mobile Geräte an, wodurch die Modellgröße reduziert und die Leistung verbessert werden kann.",
    },
    {
      title: "Keras",
      value: deviceConfigs[0]?.keras,
      width: "140px",
      height: "100px",
      onChange: handleUpdateKeras,
      tooltip:
        "Ermöglicht den Export in das Keras-Format für TensorFlow SavedModel und bietet Kompatibilität mit TensorFlow Serving und APIs.",
    },
    {
      title: "Simplify",
      value: deviceConfigs[0]?.simplify,
      width: "140px",
      height: "100px",
      onChange: handleUpdateSimplify,
      tooltip:
        "Vereinfacht das Modelldiagramm für ONNX Exporte mit onnxslim, was die Leistung und Kompatibilität verbessern kann..",
    },
  ];

  return (
    <>
      <Row style={{ display: "flex", alignItems: "stretch" }}>
        {cardItemsSelect.map((item, index) => (
          <CardWithSelect
            key={index}
            item={item}
            deviceConfigs={deviceConfigs[0]}
            width={item.width}
            height={item.height}
          />
        ))}
      </Row>
      <Row style={{ display: "flex", alignItems: "stretch" }}>
        {cardItemsSlider.map((item, index) => (
          <CardWithSlider
            key={index}
            item={item}
            deviceConfigs={deviceConfigs[0]}
            width={item.width}
            height={item.height}
          />
        ))}
      </Row>
      <Row style={{ display: "flex", alignItems: "stretch" }}>
        {cardItemsSwitch.map((item, index) => (
          <CardWithSwitch
            key={index}
            item={item}
            deviceConfigs={deviceConfigs[0]}
            width={item.width}
            height={item.height}
          />
        ))}
      </Row>
    </>
  );
};

export default SectionInference;
