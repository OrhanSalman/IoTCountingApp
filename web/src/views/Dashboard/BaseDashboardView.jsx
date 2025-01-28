import React, { useState, useContext, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Card, Statistic, Row, Col, Progress, Alert, Image } from "antd";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  ArrowsAltOutlined,
} from "@ant-design/icons";
import { DeviceContext } from "../../api/DeviceContext";
import baseUrl from "../../api/baseUrl";
//import useIsMobile from "../../useIsMobile";

const BaseDashboardView = () => {
  const { data, health } = useContext(DeviceContext);

  // CPU
  const cpu_temp = health?.cpu?.temp || 0;
  const cpu_percent = health?.cpu?.percent || 0;
  const [prevCpuTemp, setPrevCpuTemp] = useState(null);
  const [prevCpuLoad, setPrevCpuLoad] = useState(null);
  const [cpuTempChange, setCpuTempChange] = useState("equal");
  const [cpuLoadChange, setCpuLoadChange] = useState("equal");

  // RAM
  const ram_total = health?.ram?.total || 0;
  const ram_used = health?.ram?.used || 0;
  const ramUsedPercent = Math.round((ram_used / ram_total) * 100);
  const [prevRamUsed, setPrevRamUsed] = useState(null);
  const [ramChange, setRamChange] = useState("equal");

  // GPU
  const gpu_temp =
    health?.gpu && health.gpu.length > 0 ? health.gpu[0]?.temperature || 0 : 0;
  const gpu_percent =
    health?.gpu && health.gpu.length > 0 ? health.gpu[0]?.load || 0 : 0;

  const [prevGpuTemp, setPrevGpuTemp] = useState(null);
  const [prevGpuLoad, setPrevGpuLoad] = useState(null);
  const [gpuTempChange, setGpuTempChange] = useState("equal");
  const [gpuLoadChange, setGpuLoadChange] = useState("equal");

  // VRAM
  const vram_total =
    health?.gpu && health.gpu.length > 0 ? health.gpu[0]?.memory_total || 0 : 0;
  const vram_used =
    health?.gpu && health.gpu.length > 0 ? health.gpu[0]?.memory_used || 0 : 0;
  const vramUsedPercent = Math.round((vram_used / vram_total) * 100);
  const [prevVramUsed, setPrevVramUsed] = useState(null);
  const [vramChange, setVramChange] = useState("equal");

  // AVG_FPS
  const avg_fps = health?.inference?.details?.avg_fps || 0;
  const [prevAvgFps, setPrevAvgFps] = useState(null);
  const [fpsChange, setFpsChange] = useState("equal");

  // AVG_MODEL_FPS
  const avg_fps_model = health?.inference?.details?.avg_fps_model || 0;
  const [prevAvgModelFps, setPrevAvgModelFps] = useState(null);
  const [modelFpsChange, setModelFpsChange] = useState("equal");

  const real_time = health?.inference?.real_time || 0;
  const [frame, setFrame] = useState([]);

  //const init_time = new Date().getTime();
  //const inference_init_time = health?.inference?.details?.init_time || 0;

  const conicColors = {
    "0%": "#108ee9",
    "50%": "#87d068",
    "75%": "#faad14",
    "100%": "#cf1322",
  };

  const getTempPercentage = (temp) => {
    if (temp <= 40) return (temp / 100) * 100;
    if (temp <= 70) return 50 + ((temp - 40) / 30) * 25;
    if (temp <= 90) return 75 + ((temp - 70) / 20) * 25;
    return 100;
  };

  useEffect(() => {
    const currentAvgFps = avg_fps;
    const currentAvgModelFps = avg_fps_model;

    // FPS-Änderungen
    if (prevAvgFps !== null && currentAvgFps !== undefined) {
      if (currentAvgFps - prevAvgFps > 0.25) {
        setFpsChange("up");
      } else if (prevAvgFps - currentAvgFps > 0.25) {
        setFpsChange("down");
      } else {
        setFpsChange("equal");
      }
    }

    // Model FPS-Änderungen
    if (prevAvgModelFps !== null && currentAvgModelFps !== undefined) {
      if (currentAvgModelFps - prevAvgModelFps > 0.25) {
        setModelFpsChange("up");
      } else if (currentAvgModelFps - prevAvgModelFps > 0.25) {
        setModelFpsChange("down");
      } else {
        setModelFpsChange("equal");
      }
    }

    // CPU-Temperaturänderungen
    if (cpuTempChange !== null && cpu_temp !== undefined) {
      if (cpu_temp - prevCpuTemp > 0.25) {
        setCpuTempChange("up");
      } else if (prevCpuTemp - cpu_temp > 0.25) {
        setCpuTempChange("down");
      } else {
        setCpuTempChange("equal");
      }
    }

    // RAM-Änderungen
    if (prevRamUsed !== null) {
      if (ram_used - prevRamUsed > 0) {
        setRamChange("up");
      } else if (prevRamUsed - ram_used > 0) {
        setRamChange("down");
      } else {
        setRamChange("equal");
      }
    }

    // CPU-Auslastung Änderungen
    if (prevCpuLoad !== null) {
      if (cpu_percent - prevCpuLoad > 0) {
        setCpuLoadChange("up");
      } else if (prevCpuLoad - cpu_percent > 0) {
        setCpuLoadChange("down");
      } else {
        setCpuLoadChange("equal");
      }
    }

    // GPU-Temperaturänderungen
    if (gpuTempChange !== null && gpu_temp !== undefined) {
      if (gpu_temp - prevGpuTemp > 0.25) {
        setGpuTempChange("up");
      } else if (prevGpuTemp - gpu_temp > 0.25) {
        setGpuTempChange("down");
      }
    }

    // GPU-Auslastung Änderungen
    if (gpuLoadChange !== null && gpu_percent !== undefined) {
      if (gpu_percent - prevGpuLoad > 0.25) {
        setGpuLoadChange("up");
      } else if (prevGpuLoad - gpu_percent > 0.25) {
        setGpuLoadChange("down");
      }
    }

    // VRAM-Änderungen
    if (prevVramUsed !== null) {
      if (vram_used - prevVramUsed > 0) {
        setVramChange("up");
      } else if (prevVramUsed - vram_used > 0) {
        setVramChange("down");
      }
    }

    setPrevGpuTemp(gpu_temp);
    setPrevGpuLoad(gpu_percent);
    setPrevVramUsed(vram_used);
    setPrevAvgFps(currentAvgFps);
    setPrevAvgModelFps(currentAvgModelFps);
    setPrevCpuTemp(cpu_temp);
    setPrevRamUsed(ram_used);
    setPrevCpuLoad(cpu_percent);
  }, [health]);

  useEffect(() => {
    if (health?.inference?.status) {
      const interval = setInterval(() => {
        fetch(`${baseUrl}api/inference/frame`)
          .then((response) => {
            if (!response.ok) {
              return null;
            }
            return response.blob();
          })
          .then((blob) => {
            const imageUrl = URL.createObjectURL(blob);
            setFrame(imageUrl);
            localStorage.setItem("lastFrame", imageUrl);
          })
          .catch((error) => {
            console.error("Fetch error:", error);
          });
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [health?.inference?.status]);

  useEffect(() => {
    const savedFrame = localStorage.getItem("lastFrame");
    if (savedFrame) {
      setFrame(savedFrame);
    }
  }, []);

  const getFpsIcon = (change) => {
    if (change === "up") return <ArrowUpOutlined />;
    if (change === "down") return <ArrowDownOutlined />;
    return <ArrowsAltOutlined />;
  };

  const getRamIcon = (change) => {
    if (change === "up") return <ArrowUpOutlined />;
    if (change === "down") return <ArrowDownOutlined />;
    return <ArrowsAltOutlined />;
  };

  const config_fps =
    (data?.deviceConfigs?.length > 0 && data.deviceConfigs[0]?.stream_fps) || 0;
  const cam_fps = health?.camera?.details?.fps || 0;
  const inference_status = health?.inference?.status || false;

  let alertMessage = "";
  let alertDescription = "";
  let alertType = "success";
  if (real_time === 2) {
    alertMessage = "Echtzeit";
    alertDescription = `Die ausgewählte Konfiguration erfüllt die Echtzeitanforderung mit einer Ziel-FPS von ${cam_fps}.`;
  } else if (real_time === 1) {
    alertMessage = "Warnung";
    alertDescription = `Die ausgewählte Konfiguration erfüllt die Ziel-FPS von ${cam_fps} nicht vollständig.`;
    alertType = "warning";
  } else if (real_time === 0) {
    alertMessage = "Achtung";
    alertDescription = `Die ausgewählte Konfiguration ist für die Echtzeitverarbeitung von ${cam_fps} FPS nicht geeignet.`;
    alertType = "error";
  }

  let modelAlertDescription = "";
  let modelAlertMessage = "";
  let modelAlertType = "info";
  if (
    real_time === 2 &&
    avg_fps_model > health?.inference?.details?.avg_fps * 1.25
  ) {
    modelAlertMessage = "Empfehlung";
    modelAlertType = "success";
    modelAlertDescription =
      "Die Inferenzleistung liegt in einem sehr guten Rahmen. Es empfiehlt sich, die Modelparameter zu erhöhen.";
  } else if (avg_fps_model < config_fps) {
    modelAlertMessage = "Empfehlung";
    modelAlertType = "warning";
    modelAlertDescription =
      "Die Inferenzleistung liegt unterhalb der Zielfps. Es empfiehlt sich, die Modelparameter zu verringern.";
  }

  return (
    <>
      <div style={{ width: "100%", padding: "12px", margin: "0 auto" }}>
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col xs={24} sm={24} md={12} lg={12} style={{ marginBottom: 16 }}>
            <Card
              size="small"
              title="Modelleistung"
              style={{ marginBottom: 16, cursor: "default" }}
              bordered={false}
            >
              {inference_status && cam_fps !== config_fps ? (
                <Alert
                  message="Achtung"
                  description={`Die Kamera lässt sich mit dieser Auflösung nicht auf die gewünschte ${config_fps} FPS setzen. Aktuelle FPS: ${cam_fps}`}
                  type="error"
                  showIcon
                  style={{ marginBottom: 16 }}
                  size="small"
                />
              ) : (
                ""
              )}
              <Card size="small" hoverable style={{ cursor: "default" }}>
                <Row gutter={12} justify="start" align="middle">
                  <Col span={10}>
                    <Statistic
                      title="AVG FPS"
                      value={health?.inference?.details?.avg_fps}
                      precision={2}
                      valueStyle={{
                        color:
                          fpsChange === "up"
                            ? "#3f8600"
                            : fpsChange === "down"
                            ? "#cf1322"
                            : "#000000",
                      }}
                      prefix={getFpsIcon(fpsChange)}
                      suffix="FPS"
                    />
                  </Col>
                  <Col span={14}>
                    {inference_status && (
                      <Alert
                        message={alertMessage}
                        description={alertDescription}
                        type={alertType}
                        showIcon
                        style={{ marginTop: 0, height: "100%" }}
                      />
                    )}
                  </Col>
                </Row>
              </Card>

              <Card
                size="small"
                hoverable
                style={{ marginTop: 16, cursor: "default" }}
              >
                <Row gutter={12} justify="start" align="middle">
                  <Col span={10}>
                    <Statistic
                      title="AVG Model FPS"
                      value={avg_fps_model}
                      precision={2}
                      valueStyle={{
                        color:
                          modelFpsChange === "up"
                            ? "#3f8600"
                            : modelFpsChange === "down"
                            ? "#cf1322"
                            : "#000000",
                      }}
                      prefix={getFpsIcon(modelFpsChange)}
                      suffix="FPS"
                    />
                  </Col>
                  <Col span={14}>
                    {inference_status && modelAlertDescription && (
                      <Alert
                        message={modelAlertMessage}
                        description={modelAlertDescription}
                        type={modelAlertType}
                        showIcon
                        style={{ marginTop: 0 }}
                      />
                    )}
                  </Col>
                </Row>
              </Card>
            </Card>

            <Card
              size="small"
              title="Zusätzliche Metriken"
              style={{ marginTop: 16 }}
            >
              <p>
                Inferenz aktiv seit:{" "}
                {health?.inference?.details?.init_time || "--.--.----"}
              </p>
              <p>Warteschlange: {health?.inference?.queue_size}</p>
              {/*<p>2.1. Anzahl gezählter Objekte</p>*/}
              {/*<p>2.2. Zeiten durchschnittlich</p>*/}
              {/*<p>2.3. Routen</p>*/}
            </Card>
          </Col>

          <Col xs={24} sm={24} md={12} lg={12}>
            <Card
              size="small"
              title="Systemmetriken"
              extra={
                health?.gpu && health.gpu.length > 0 ? (
                  <span
                    style={{
                      color: "#76B900",
                      fontWeight: "bold",
                      fontSize: 15,
                    }}
                  >
                    {health.gpu[0]?.name}
                  </span>
                ) : (
                  ""
                )
              }
              style={{ marginBottom: 16 }}
              bordered={false}
            >
              <Card
                size="small"
                hoverable
                style={{ marginBottom: 16, cursor: "default" }}
              >
                <Row gutter={[20, 0]} align="middle">
                  <Col span={12} style={{ padding: 0, textAlign: "center" }}>
                    <Statistic
                      title="CPU Auslastung"
                      value={cpu_percent}
                      precision={0}
                      valueStyle={{
                        color:
                          cpuLoadChange === "up"
                            ? "#cf1322"
                            : cpuLoadChange === "down"
                            ? "#3f8600"
                            : "#000000",
                      }}
                      prefix={getFpsIcon(cpuLoadChange)}
                      suffix="%"
                    />
                    <Progress
                      showInfo={false}
                      type="line"
                      size={"large"}
                      percent={cpu_percent}
                      strokeColor={conicColors}
                      format={() => (
                        <span
                          style={{
                            color:
                              cpu_percent > 100
                                ? conicColors["100%"]
                                : "#000000",
                          }}
                        >
                          {`${cpu_percent} %`}
                        </span>
                      )}
                    />
                  </Col>
                  <Col span={12} style={{ padding: 0, textAlign: "center" }}>
                    <Statistic
                      title="CPU Temp"
                      value={cpu_temp}
                      precision={0}
                      valueStyle={{
                        color:
                          cpuTempChange === "up"
                            ? "#cf1322"
                            : cpuTempChange === "down"
                            ? "#3f8600"
                            : "#000000",
                      }}
                      prefix={getFpsIcon(cpuTempChange)}
                      suffix="&deg;C"
                    />
                    <Progress
                      showInfo={false}
                      type="line"
                      size={"large"}
                      percent={getTempPercentage(cpu_temp)}
                      strokeColor={conicColors}
                      format={() => (
                        <span
                          style={{
                            color:
                              cpu_temp > 100 ? conicColors["100%"] : "#000000",
                          }}
                        >
                          {`${cpu_temp} °C`}
                        </span>
                      )}
                    />
                  </Col>
                </Row>
              </Card>
              <Card
                size="small"
                hoverable
                style={{ marginBottom: 16, cursor: "default" }}
              >
                <Row gutter={4} align="middle">
                  <Col span={4} style={{ padding: 0 }}>
                    <Statistic
                      title="RAM"
                      value={ramUsedPercent}
                      precision={0}
                      valueStyle={{
                        color:
                          ramChange === "down"
                            ? "#3f8600"
                            : ramChange === "up"
                            ? "#cf1322"
                            : "#000000",
                      }}
                      prefix={getRamIcon(ramChange)}
                      suffix="%"
                    />
                  </Col>
                  <Col span={16} style={{ padding: 0 }}>
                    <Progress
                      showInfo={false}
                      type="line"
                      size={"large"}
                      percent={(ram_used / ram_total) * 100}
                      strokeColor={conicColors}
                      format={() => (
                        <span
                          style={{
                            color:
                              ram_used / ram_total > 1
                                ? conicColors["100%"]
                                : "#000000",
                          }}
                        >
                          {`${ram_used} MB`}
                        </span>
                      )}
                    />
                  </Col>
                  <Col span={4} style={{ padding: 0, textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: "bold",
                        color: "#000000",
                        margin: 0,
                      }}
                    >
                      {ram_total.toFixed(0)} MB
                    </div>
                  </Col>
                </Row>
              </Card>

              {health?.gpu && health.gpu.length > 0 && (
                <Card
                  size="small"
                  hoverable
                  style={{ marginBottom: 16, cursor: "default" }}
                >
                  <Row gutter={[20, 0]} align="middle">
                    <Col span={12} style={{ padding: 0, textAlign: "center" }}>
                      <Statistic
                        title="GPU Auslastung"
                        value={gpu_percent}
                        precision={0}
                        valueStyle={{
                          color:
                            gpuLoadChange === "up"
                              ? "#cf1322"
                              : gpuLoadChange === "down"
                              ? "#3f8600"
                              : "#000000",
                        }}
                        prefix={getFpsIcon(gpuLoadChange)}
                        suffix="%"
                      />
                      <Progress
                        showInfo={false}
                        type="line"
                        size={"large"}
                        percent={gpu_percent}
                        strokeColor={conicColors}
                        format={() => (
                          <span
                            style={{
                              color:
                                gpu_percent > 100
                                  ? conicColors["100%"]
                                  : "#000000",
                            }}
                          >
                            {`${gpu_percent} %`}
                          </span>
                        )}
                      />
                    </Col>
                    <Col span={12} style={{ padding: 0, textAlign: "center" }}>
                      <Statistic
                        title="GPU Temp"
                        value={gpu_temp}
                        precision={0}
                        valueStyle={{
                          color:
                            gpuTempChange === "up"
                              ? "#cf1322"
                              : gpuTempChange === "down"
                              ? "#3f8600"
                              : "#000000",
                        }}
                        prefix={getFpsIcon(gpuTempChange)}
                        suffix="&deg;C"
                      />
                      <Progress
                        showInfo={false}
                        type="line"
                        size={"large"}
                        percent={getTempPercentage(gpu_temp)}
                        strokeColor={conicColors}
                        format={() => (
                          <span
                            style={{
                              color:
                                gpu_temp > 100
                                  ? conicColors["100%"]
                                  : "#000000",
                            }}
                          >
                            {`${gpu_temp} °C`}
                          </span>
                        )}
                      />
                    </Col>
                  </Row>
                </Card>
              )}

              {health?.gpu && health.gpu.length > 0 && (
                <Card
                  size="small"
                  hoverable
                  style={{ marginBottom: 16, cursor: "default" }}
                >
                  <Row gutter={4} align="middle">
                    <Col span={4} style={{ padding: 0 }}>
                      <Statistic
                        title="VRAM"
                        value={vramUsedPercent}
                        precision={0}
                        valueStyle={{
                          color:
                            vramChange === "down"
                              ? "#3f8600"
                              : vramChange === "up"
                              ? "#cf1322"
                              : "#000000",
                        }}
                        prefix={getRamIcon(vramChange)}
                        suffix="%"
                      />
                    </Col>
                    <Col span={16} style={{ padding: 0 }}>
                      <Progress
                        showInfo={false}
                        type="line"
                        size={"large"}
                        percent={(vram_used / vram_total) * 100}
                        strokeColor={conicColors}
                        format={() => (
                          <span
                            style={{
                              color:
                                vram_used / vram_total > 1
                                  ? conicColors["100%"]
                                  : "#000000",
                            }}
                          >
                            {`${vram_used} MB`}
                          </span>
                        )}
                      />
                    </Col>
                    <Col span={4} style={{ padding: 0, textAlign: "center" }}>
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: "bold",
                          color: "#000000",
                          margin: 0,
                        }}
                      >
                        {vram_total.toFixed(0)} MB
                      </div>
                    </Col>
                  </Row>
                </Card>
              )}
            </Card>

            {frame && (
              <Card
                size="small"
                title="Vorschau"
                style={{
                  width: "100%",
                  marginBottom: 16,
                }}
              >
                <Image
                  src={frame}
                  style={{
                    height: "auto",
                  }}
                />
              </Card>
            )}
          </Col>
        </Row>

        <Outlet />
      </div>
    </>
  );
};

export default BaseDashboardView;
