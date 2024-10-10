import React, { useContext, useState, useEffect } from "react";
import {
  Image,
  message,
  Select,
  Row,
  InputNumber,
  Col,
  Typography,
  Card,
  Button,
  Checkbox,
  Radio,
  Drawer,
  Tooltip,
  Modal,
  Divider,
} from "antd";
import {
  PlayCircleOutlined,
  FilterOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { DeviceContext } from "../../../api/DeviceContext";
import { EyeOutlined, SaveOutlined } from "@ant-design/icons";
import runCommand from "../../../api/runCommand";
import { getSystemSettings } from "../../../api/apiSystemSettings";
import baseURL from "../../../api/baseUrl";
import SplitterComponent from "../components/SplitterComponent";

const { Title } = Typography;
const { Text } = Typography;

const SimulationView = () => {
  const [splitter, setSplitter] = useState(0);
  const [customInferenceLoading, setCustomInferenceLoading] = useState(false);
  const { health, simulations, fetchSimulations, fetchHealth } =
    useContext(DeviceContext);
  const [selectedFilters, setSelectedFilters] = useState({
    model: null,
    imgsz: null,
    iou: null,
    conf: null,
    tracker: null,
    quantization: null,
    device: null,
    vid_stride: null,
    resolution: null,
    fps: null,
  });
  const [blurHumans, setBlurHumans] = useState(true);
  const [visibleDrawer, setVisibleDrawer] = useState(false);
  const [selectedSimulation, setSelectedSimulation] = useState(null);

  useEffect(() => {
    const fetchSystemSettings = async () => {
      const systemSettings = await getSystemSettings();
      if (systemSettings) {
        setBlurHumans(systemSettings?.blur_humans);
      }
    };

    fetchSystemSettings();
  }, []);

  useEffect(() => {
    if (!health?.inference?.simulation) {
      setCustomInferenceLoading(false);
    }
  }, [health?.inference?.simulation]);

  const getUniqueValues = (array) => {
    return Array.from(new Set(array));
  };

  const deviceConfigId = getUniqueValues(
    simulations?.map((simulation) => simulation.config?.id)
  );
  const models = getUniqueValues(
    simulations?.map((simulation) => simulation.config?.model)
  );
  const imgsz = getUniqueValues(
    simulations?.map((simulation) => simulation.config?.imgsz)
  );
  const iou = getUniqueValues(
    simulations?.map((simulation) => simulation.config?.iou)
  );
  const conf = getUniqueValues(
    simulations?.map((simulation) => simulation.config?.conf)
  );
  const tracker = getUniqueValues(
    simulations?.map((simulation) => simulation.config?.tracker)
  );
  const quantization = getUniqueValues(
    simulations?.map((simulation) => simulation.config?.quantization)
  );
  const device = getUniqueValues(
    simulations?.map((simulation) => simulation.config?.device)
  );
  const vid_stride = getUniqueValues(
    simulations?.map((simulation) => simulation.config?.vid_stride)
  );
  const resolution = getUniqueValues(
    simulations?.map((simulation) => {
      const res = simulation.config?.resolution;
      return Array.isArray(res) ? `${res[0]} x ${res[1]}` : res;
    })
  );

  const fps = getUniqueValues(
    simulations?.map((simulation) => simulation.config?.fps)
  );

  const speeds = {
    preprocess: "schnellste Vorverarbeitungszeit",
    inference: "schnellste Verarbeitungszeit",
    postprocess: "schnellste Nachbearbeitungszeit",
    total: "schnellste Gesamtzeit",
    avg_fps: "schnellste AVG FPS Rückgabe",
    avg_fps_model: "schnellste AVG FPS Modell",
  };

  const selectItems = [
    {
      label: "Modell",
      value: models,
      key: "model",
    },
    {
      label: "Inputgröße",
      value: imgsz,
      key: "imgsz",
    },
    {
      label: "IOU",
      value: iou,
      key: "iou",
    },
    {
      label: "Vertrauensgrad",
      value: conf,
      key: "conf",
    },
    {
      label: "Tracker",
      value: tracker,
      key: "tracker",
    },
    {
      label: "Quantization",
      value: quantization,
      key: "quantization",
    },
    {
      label: "Gerät",
      value: device,
      key: "device",
    },
    {
      label: "Video-Schritt",
      value: vid_stride,
      key: "vid_stride",
    },
    {
      label: "Auflösung",
      value: resolution,
      key: "resolution",
    },
    {
      label: "FPS",
      value: fps,
      key: "fps",
    },
    /*
    {
      label: "Geschwindigkeit",
      value: speeds,
      key: "speeds",
    }
      */
  ];

  const [activeCreatingTestVideo, setActiveCreatingTestVideo] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [duration, setDuration] = useState(10);

  const handleRunSimulation = async () => {
    setCustomInferenceLoading(true);
    runCommand("start", "counting", {
      only_simulation: true,
      only_simulation_img: false,
      blur_humans: blurHumans,
    });
    await fetchHealth();
  };

  // TODO: wird bei jedem page reload ausgeführt
  useEffect(() => {
    if (!health?.inference?.simulation) {
      fetchSimulations("simvid");
    }
  }, [fetchSimulations, health?.inference?.simulation]);

  const handleCreateNewTestVideo = () => {
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    if (!duration) {
      message.error("Bitte geben Sie eine Dauer ein.");
      return;
    }

    setActiveCreatingTestVideo(true);
    setIsModalVisible(false);

    //if (health?.camera?.status) {
    //  await runCommand("stop", "camera", { duration: duration });
    //}
    await runCommand("video", "camera", { duration: duration });
    setActiveCreatingTestVideo(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleFilterChange = (key, value) => {
    setSelectedFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  const handleEyeClick = (simulation) => {
    setSelectedSimulation(simulation);
    setVisibleDrawer(true);
  };

  const formatDateTime = (datetime) => {
    if (!datetime) return "Kein Datum verfügbar";

    const [date, time] = datetime.split("_");
    if (!date || !time) return "Ungültiges Datum/Zeit-Format";

    const [year, month, day] = date.split("-");
    const [hour, minute] = time.split("-");

    if (!year || !month || !day || !hour || !minute)
      return "Ungültiges Datum/Zeit-Format";

    return `${day}.${month}.${year} - ${hour}:${minute}`;
  };

  const parseDateTime = (datetime) => {
    if (!datetime) return new Date(0);

    const [date, time] = datetime.split("_");
    if (!date || !time) return new Date(0);

    const [year, month, day] = date.split("-");
    const [hour, minute] = time.split("-");

    if (!year || !month || !day || !hour || !minute) return new Date(0);

    return new Date(year, month - 1, day, hour, minute);
  };

  const addIndexToSimulations = (simulations) => {
    return simulations
      .sort(
        (a, b) =>
          parseDateTime(b.config.datetime) - parseDateTime(a.config.datetime)
      )
      .map((simulation, index) => ({
        ...simulation,
        originalIndex: index + 1,
      }));
  };

  const simulationsWithIndex = addIndexToSimulations(simulations);

  const filteredSimulations = simulationsWithIndex
    ?.filter((simulation) => {
      const config = simulation.config;
      const resolutionStr = Array.isArray(config.resolution)
        ? `${config.resolution[0]} x ${config.resolution[1]}`
        : config.resolution;

      return (
        (!selectedFilters.model || config.model === selectedFilters.model) &&
        (!selectedFilters.imgsz || config.imgsz === selectedFilters.imgsz) &&
        (!selectedFilters.iou || config.iou === selectedFilters.iou) &&
        (!selectedFilters.conf || config.conf === selectedFilters.conf) &&
        (!selectedFilters.tracker ||
          config.tracker === selectedFilters.tracker) &&
        (!selectedFilters.quantization ||
          config.quantization === selectedFilters.quantization) &&
        (!selectedFilters.device || config.device === selectedFilters.device) &&
        (!selectedFilters.vid_stride ||
          config.vid_stride === selectedFilters.vid_stride) &&
        (!selectedFilters.resolution ||
          resolutionStr === selectedFilters.resolution) &&
        (!selectedFilters.fps || config.fps === selectedFilters.fps)
      );
    })
    .sort(
      (a, b) =>
        parseDateTime(b.config.datetime) - parseDateTime(a.config.datetime)
    );

  // Helper function to format the performance and counts data
  const formatCardDescription = (simulation) => {
    const { performance, counts } = simulation.config;

    // Calculate counts totals by category
    const categoryTotals = {};

    for (const roi in counts) {
      for (const region in counts[roi]) {
        for (const direction in counts[roi][region]) {
          const countsDirection = counts[roi][region][direction];
          for (const item in countsDirection) {
            const count = countsDirection[item];

            if (!categoryTotals[item]) {
              categoryTotals[item] = { IN: 0, OUT: 0 };
            }
            categoryTotals[item][direction] += count;
          }
        }
      }
    }

    return (
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ flex: 1, marginRight: "16px" }}>
          <strong>Leistungsdaten:</strong>
          <div>
            <strong>Durchschnittliche FPS:</strong>
            {performance.avg_fps.toFixed(2)}
          </div>
          <div>
            <strong>FPS Modell:</strong> {performance.avg_fps_model.toFixed(2)}
          </div>
          <div>
            <strong>Verarbeitungszeit:</strong>
            {performance.avg_time_inference.toFixed(2)} ms
          </div>
          <div>
            <strong>Nachbearbeitungszeit:</strong>
            {performance.avg_time_postprocess.toFixed(2)} ms
          </div>
          <div>
            <strong>Vorverarbeitungszeit:</strong>
            {performance.avg_time_preprocess.toFixed(2)} ms
          </div>
          <div>
            <strong>Gesamtzeit:</strong> {performance.avg_time_total.toFixed(2)}
            ms
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <strong>Zählungen:</strong>
          {Object.entries(categoryTotals).map(([category, counts]) => (
            <div key={category}>
              <strong>{category}:</strong> IN {counts.IN}, OUT {counts.OUT}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const resetFilters = () => {
    setSelectedFilters({
      model: null,
      imgsz: null,
      iou: null,
      conf: null,
      tracker: null,
      quantization: null,
      device: null,
      vid_stride: null,
      resolution: null,
      fps: null,
    });
  };

  return (
    <div style={{ padding: 16 }}>
      {/* <Title level={4}>Simulationsansicht</Title> */}

      <Row gutter={16} justify="start">
        {selectItems.map((item) => (
          <Col key={item.key} xs={24} sm={12} md={8} lg={6}>
            <div style={{ marginBottom: 16 }}>
              <span>{item.label}:</span>
              <Select
                allowClear
                style={{ width: "100%" }}
                placeholder={`Wähle ${item.label}`}
                onChange={(value) => handleFilterChange(item.key, value)}
                value={selectedFilters[item.key]}
              >
                {item.value.map((value) => (
                  <Select.Option key={value} value={value}>
                    {value}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </Col>
        ))}
        <Row gutter={16} justify="center" style={{ margin: "16px auto" }}>
          <Col>
            <Button
              icon={<FilterOutlined />}
              type="default"
              danger
              onClick={resetFilters}
            >
              Filter zurücksetzen
            </Button>
          </Col>
          {/*
          <Col>
            <Button
              icon={<UploadOutlined />}
              type="default"
              onClick={handleCreateNewTestVideo}
              disabled={
                activeCreatingTestVideo ||
                health?.video_converter?.status ||
                health?.inference?.status
              }
              loading={
                activeCreatingTestVideo || health?.video_converter?.status
              }
            >
              {health?.video_converter ? "Konvertiere..." : "Upload"}
            </Button>
          </Col>
          */}
          <Col>
            <Button
              icon={<PlayCircleOutlined />}
              type="default"
              onClick={handleCreateNewTestVideo}
              disabled={
                activeCreatingTestVideo ||
                health?.video_converter?.status ||
                health?.inference?.status
              }
              loading={
                activeCreatingTestVideo || health?.video_converter?.status
              }
            >
              {health?.video_converter ? "Konvertiere..." : "Neues Testvideo"}
            </Button>

            <Modal
              title="Neues Testvideo erstellen"
              open={isModalVisible}
              onOk={handleOk}
              onCancel={handleCancel}
              okText="Erstellen"
              cancelText="Abbrechen"
            >
              <InputNumber
                placeholder="Geben Sie die Dauer in Sekunden ein"
                defaultValue={duration}
                onChange={(value) => setDuration(value)}
                type="number"
                min={10}
                max={60}
                style={{ width: "80%", marginLeft: "10px" }}
              />
              <p>
                Die Länge des Testvideos kann zwischen 10 und 60 Sekunden
                liegen. Eine höhere Dauer kann zu längeren Wartezeiten führen,
                da das Video noch konvertiert werden muss.
              </p>
            </Modal>
          </Col>
          <Col>
            <Tooltip title="Führt eine Simulation mit den derzeit gesetzten Konfigurationen durch.">
              <Button
                icon={<PlayCircleOutlined />}
                type="primary"
                onClick={() => handleRunSimulation()}
                disabled={
                  health?.inference?.status ||
                  health?.inference?.simulation ||
                  health?.inference?.exporter
                }
                loading={
                  health?.inference?.simulation //|| customInferenceLoading
                }
              >
                {health?.inference?.simulation
                  ? "Simulation läuft..."
                  : "Simulation ausführen"}
              </Button>
            </Tooltip>
          </Col>
        </Row>
      </Row>

      <Divider />
      <div style={{ marginTop: 24 }}>
        <Row gutter={16} justify="center">
          {filteredSimulations?.map((simulation) => (
            <Col
              key={simulation.originalIndex}
              xs={24}
              sm={12}
              md={8}
              lg={6}
              style={{ minWidth: "50%", padding: "8px" }}
            >
              <Card
                hoverable
                title={
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>
                      Simulation {simulation.originalIndex} -
                      {formatDateTime(simulation.config.datetime)}
                    </span>
                    <div
                      style={{
                        marginLeft: "auto",
                        display: "flex",
                        gap: "8px",
                      }}
                    >
                      <Checkbox
                        key={simulationsWithIndex}
                        //onChange={(e) => {
                        //  console.log(e.target.checked);
                        //  console.log(simulation?.originalIndex);
                        //}}
                      />

                      <Tooltip title="Filterdetails">
                        <Button
                          type="text"
                          icon={<EyeOutlined />}
                          onClick={() => handleEyeClick(simulation)}
                        />
                      </Tooltip>
                      <Tooltip title="Konfiguration übernehmen">
                        <Button
                          type="text"
                          icon={<SaveOutlined />}
                          disabled={true}
                          onClick={() => {
                            message.info("Noch nicht implementiert.");
                          }}
                        />
                      </Tooltip>
                    </div>
                  </div>
                }
                style={{ width: "100%" }}
                cover={
                  <Image
                    width="100%"
                    style={{ maxWidth: "100%", height: "auto" }}
                    src={simulation.image_url}
                    fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAK..."
                    onError={() => {
                      message.error("Fehler beim Laden des Bildes.");
                    }}
                    preview={{
                      destroyOnClose: true,
                      imageRender: () => (
                        <a
                          href={`${baseURL}/api/video/${simulation.video_url
                            .split("/")
                            .pop()}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <video
                            muted
                            width="100%"
                            controls
                            src={simulation.video_url}
                          />
                        </a>
                      ),
                      toolbarRender: () => null,
                    }}
                  />
                }
              >
                <Card.Meta description={formatCardDescription(simulation)} />
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      <Drawer
        title="Filterdetails"
        placement="right"
        closable={true}
        onClose={() => setVisibleDrawer(false)}
        open={visibleDrawer}
        width={300}
      >
        {selectedSimulation && (
          <div>
            <p>
              <strong>Modell:</strong> {selectedSimulation.config.model}
            </p>
            <p>
              <strong>Inputgröße:</strong> {selectedSimulation.config.imgsz}
            </p>
            <p>
              <strong>IOU:</strong> {selectedSimulation.config.iou}
            </p>
            <p>
              <strong>Vertrauensgrad:</strong> {selectedSimulation.config.conf}
            </p>
            <p>
              <strong>Tracker:</strong> {selectedSimulation.config.tracker}
            </p>
            <p>
              <strong>Quantization:</strong>{" "}
              {selectedSimulation.config.quantization}
            </p>
            <p>
              <strong>Gerät:</strong> {selectedSimulation.config.device}
            </p>
            <p>
              <strong>Video-Schritt:</strong>
              {selectedSimulation.config.vid_stride}
            </p>
            <p>
              <strong>Auflösung:</strong>
              {selectedSimulation.config.resolution.join(" x ")}
            </p>
            <p>
              <strong>FPS:</strong> {selectedSimulation.config.fps}
            </p>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default SimulationView;
