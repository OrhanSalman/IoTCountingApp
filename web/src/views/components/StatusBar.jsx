import React, { useContext, useState } from "react";
import {
  Row,
  Col,
  Divider,
  Button,
  Tooltip,
  Dropdown,
  Modal,
  message,
} from "antd";
import {
  HomeOutlined,
  PlayCircleOutlined,
  CameraOutlined,
  AppstoreAddOutlined,
  DashboardOutlined,
  LinkOutlined,
  CloudUploadOutlined,
  BulbOutlined,
  ThunderboltOutlined,
  WifiOutlined,
  SaveOutlined,
  ReloadOutlined,
  DeleteOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import GradientButton from "../GradientButton";
import { DeviceContext } from "../../api/DeviceContext";
import { deleteData, deleteBenchmarkData } from "../../api/deleteData";
import runCommand from "../../api/runCommand";
import useIsMobile from "../../useIsMobile";

const { confirm } = Modal;

const StatusBar = () => {
  const {
    dispatch,
    health,
    isModified,
    loading,
    fetchData,
    fetchImage,
    fetchLogs,
    fetchHealth,
    fetchBenchmarks,
    fetchSimulations,
    //fetchSimulationImages,
    fetchCounts,
    updateData,
  } = useContext(DeviceContext);

  const isMobile = useIsMobile();
  const [loadingStates, setLoadingStates] = useState({
    camera: false,
    counting: false,
    mqtt: false,
    mongo: false,
    benchmark: false,
    exporter: false,
  });

  const handleDeleteFunction = async (type) => {
    if (type === "benchmarks") {
      await deleteBenchmarkData();
      await fetchBenchmarks();
    } else {
      await deleteData(type);
      await fetchSimulations(type);
    }
  };

  const deleteOptions = [
    {
      key: "simimg",
      label: "Bildsimulationen",
      onClick: () => {
        confirm({
          title: "Bildsimulationen löschen",
          content: "Möchten Sie wirklich alle Bildsimulationen löschen?",
          onOk: () => {
            handleDeleteFunction("simimg");
          },
        });
      },
    },
    {
      key: "simvid",
      label: "Videosimulationen",
      onClick: () => {
        confirm({
          title: "Videosimulationen löschen",
          content: "Möchten Sie wirklich alle Videosimulationen löschen?",
          onOk: () => {
            handleDeleteFunction("simvid");
          },
        });
      },
    },
    {
      key: "benchmarks",
      label: "Benchmarks",
      onClick: () => {
        confirm({
          title: "Benchmarks löschen",
          content: "Möchten Sie wirklich alle Benchmarks löschen?",
          onOk: () => {
            handleDeleteFunction("benchmarks");
          },
        });
      },
    },
  ];

  const handleButtonClick = async (key, command) => {
    setLoadingStates((prevState) => ({
      ...prevState,
      [key]: true,
    }));

    try {
      await runCommand(command, key);
    } finally {
      setLoadingStates((prevState) => ({
        ...prevState,
        [key]: false,
      }));
      await fetchHealth();
    }
  };

  const moreOptions = [
    {
      key: "restart",
      label: "Neustart",
      onClick: () => {
        confirm({
          title: "Neustart",
          content:
            "Dies wird die Anwendung neustarten und ein Cleanup aller Prozesse durchführen. Fortfahren?",
          onOk: () => {
            runCommand("restart", "server");
            dispatch({ type: "FETCH_INIT" });
          },
        });
      },
    },
  ];

  const handleSave = async () => {
    await updateData();

    if (!health?.inference.simulation && health?.inference?.status) {
      Modal.confirm({
        title: "Zählung neu starten?",
        content:
          "Die Änderungen sind nicht auf die laufende Zählung angewandt. Ein Neustart ist erforderlich.",
        okText: "Ja",
        cancelText: "Nein",
        onOk: async () => {
          await runCommand("stop", "counting");
          await runCommand("stop", "camera");
          //await runCommand("start", "counting");
          runCommand("start", "counting");
        },
      });
    }
  };

  const handleReloadData = async () => {
    const date = new Date().toISOString().split("T")[0];
    await Promise.all([
      fetchData(),
      fetchImage(),
      fetchLogs(),
      fetchHealth(),
      fetchBenchmarks(),
      fetchSimulations("simvid"),
      fetchSimulations("simimg"),
      //fetchSimulationImages(),
      fetchCounts(date),
    ]);
    message.info("Gerätedaten neu geladen");
  };

  const actionButtons = () => {
    return (
      <>
        <Tooltip title="Speichern">
          <Button
            icon={<SaveOutlined />}
            type="primary"
            style={{
              width: "36px",
              boxShadow: isModified ? "0 4px 8px rgba(0, 0, 0, 0.2)" : "none",
            }}
            disabled={!isModified}
            onClick={handleSave}
          />
        </Tooltip>
        <Tooltip title="Neu laden">
          <Button
            type="default"
            disabled={loading}
            onClick={handleReloadData}
            loading={loading}
            icon={<ReloadOutlined />}
            style={{ width: "36px" }}
          />
        </Tooltip>
        <Dropdown
          menu={{ items: deleteOptions }}
          trigger={["hover"]}
          placement="bottomRight"
        >
          <Button danger style={{ width: "36px" }} icon={<DeleteOutlined />} />
        </Dropdown>
      </>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        position: "sticky",
        zIndex: 1,
        margin: 0,
        fontSize: 15,
        fontWeight: "bold",
        maxHeight: "30px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
      }}
    >
      <Row style={{ width: "100%" }}>
        {/* Spalte 1: Links */}
        <Col
          span={8}
          style={{
            display: "flex",
            justifyContent: "flex-start",
            gap: "10px",
          }}
        >
          {/*
          {!isMobile && (
            <>
              <GradientButton
                icon={<HomeOutlined />}
                tooltip={"Home"}
                loading={loadingStates?.counting || false}
              />
            </>
          )}
          */}
        </Col>

        {/* Spalte 2: Zentrum */}
        <Col
          span={8}
          style={{
            display: "flex",
            justifyContent: isMobile ? "center" : "center",
            gap: isMobile ? "12px" : "32px",
            fontSize: isMobile ? "12px" : "inherit",
          }}
        >
          <Divider solid type="vertical" />
          <Tooltip
            title={
              health?.inference?.simulation
                ? "Simulation läuft"
                : health?.inference?.status
                ? `Inferenz aktiv seit ${health?.inference?.details?.init_time}`
                : "Inferenz starten"
            }
          >
            <Button
              icon={<PlayCircleOutlined />}
              type="text"
              loading={loadingStates.counting}
              onClick={() =>
                handleButtonClick(
                  "counting",
                  health?.inference?.status ? "stop" : "start"
                )
              }
              style={{
                backgroundColor: health?.inference?.simulation
                  ? "lightblue"
                  : health?.inference?.status
                  ? "blue"
                  : "lightgray",
                color: "white",
                fontSize: isMobile ? "12px" : "inherit",
                width: isMobile ? "32px" : "auto",
                height: isMobile ? "32px" : "auto",
              }}
              shape="circle"
            />
          </Tooltip>
          <Tooltip title="Kamera">
            <Button
              icon={<CameraOutlined />}
              type="text"
              loading={loadingStates.camera}
              disabled={health?.inference?.status || loadingStates?.counting}
              onClick={() =>
                handleButtonClick(
                  "camera",
                  health?.camera?.status ? "stop" : "start"
                )
              }
              style={{
                backgroundColor: health?.camera?.status ? "blue" : "lightgray",
                color: "white",
                fontSize: isMobile ? "12px" : "inherit",
                width: isMobile ? "32px" : "auto",
                height: isMobile ? "32px" : "auto",
              }}
              shape="circle"
            />
          </Tooltip>
          <Tooltip title="Exporter">
            <Button
              icon={<AppstoreAddOutlined />}
              type="text"
              loading={health?.inference?.exporter}
              disabled
              style={{
                backgroundColor: health?.inference?.exporter
                  ? "blue"
                  : "lightgray",
                color: "white",
                fontSize: isMobile ? "12px" : "inherit",
                width: isMobile ? "32px" : "auto",
                height: isMobile ? "32px" : "auto",
              }}
              shape="circle"
            />
          </Tooltip>
          <Tooltip title="Benchmark">
            <Button
              icon={<DashboardOutlined />}
              type="text"
              loading={loadingStates.benchmark}
              onClick={() =>
                handleButtonClick(
                  "benchmark",
                  health?.benchmark?.status ? "stop" : "start"
                )
              }
              style={{
                backgroundColor: health?.benchmark?.status
                  ? "blue"
                  : "lightgray",
                color: "white",
                fontSize: isMobile ? "12px" : "inherit",
                width: isMobile ? "32px" : "auto",
                height: isMobile ? "32px" : "auto",
              }}
              shape="circle"
            />
          </Tooltip>
          <Tooltip
            title={
              loadingStates?.mqtt && health?.mqtt?.connected
                ? "Verbunden"
                : !health?.mqtt?.connected && health?.mqtt?.status
                ? "MQTT Nicht verbunden"
                : "MQTT Client starten"
            }
          >
            <Button
              icon={<LinkOutlined />}
              type="text"
              loading={loadingStates?.mqtt}
              onClick={() =>
                handleButtonClick(
                  "mqtt",
                  health?.mqtt?.status ? "stop" : "start"
                )
              }
              style={{
                backgroundColor:
                  !health?.mqtt?.connected && health?.mqtt?.status
                    ? "orange"
                    : health?.mqtt?.status
                    ? "blue"
                    : "lightgray",
                color: "white",
                fontSize: isMobile ? "12px" : "inherit",
                width: isMobile ? "32px" : "auto",
                height: isMobile ? "32px" : "auto",
              }}
              shape="circle"
            />
          </Tooltip>
          <Tooltip
            title={
              loadingStates?.mongo && health?.mongo?.connected
                ? "Verbunden"
                : !health?.mongo?.connected && health?.mongo?.status
                ? "Mongo Nicht verbunden"
                : "Mongo Client starten"
            }
          >
            <Button
              icon={<CloudUploadOutlined />}
              type="text"
              loading={loadingStates?.mongo}
              onClick={() =>
                handleButtonClick(
                  "mongo",
                  health?.mongo?.status ? "stop" : "start"
                )
              }
              style={{
                backgroundColor:
                  !health?.mongo?.connected && health?.mongo?.status
                    ? "orange"
                    : health?.mongo?.status
                    ? "blue"
                    : "lightgray",
                color: "white",
                fontSize: isMobile ? "12px" : "inherit",
                width: isMobile ? "32px" : "auto",
                height: isMobile ? "32px" : "auto",
              }}
              shape="circle"
            />
          </Tooltip>
          <Tooltip title="Energiesparmodus">
            <Button
              disabled
              icon={<BulbOutlined />}
              type="text"
              onClick={() =>
                handleButtonClick("energy", "energy", "start", "stop")
              }
              style={{
                backgroundColor: health?.energy?.status ? "blue" : "lightgray",
                color: "white",
                fontSize: isMobile ? "12px" : "inherit",
                width: isMobile ? "32px" : "auto",
                height: isMobile ? "32px" : "auto",
              }}
              shape="circle"
            />
          </Tooltip>
          <Divider solid type="vertical" />
        </Col>

        {/* Spalte 3: Rechts */}
        <Col
          span={8}
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            alignItems: "center",
          }}
        >
          {/*
          {!isMobile && (
            <>
              <Divider solid type="vertical" />
              <Tooltip title="Akku Stand">
                <Button icon={<ThunderboltOutlined />} type="text" disabled />
              </Tooltip>
              <Tooltip title="WLAN">
                <Button icon={<WifiOutlined />} type="text" disabled />
              </Tooltip>
              <Divider solid type="vertical" />
            </>
          )}
          */}

          <div style={{ display: "flex", gap: "12px" }}>
            {!isMobile && <>{actionButtons()}</>}

            <Dropdown
              menu={{
                items: isMobile
                  ? [
                      ...moreOptions,
                      {
                        key: "actionButtons",
                        label: (
                          <div style={{ display: "flex", gap: "10px" }}>
                            {actionButtons()}
                          </div>
                        ),
                      },
                    ]
                  : moreOptions,
              }}
              trigger={["hover"]}
              placement="bottomRight"
            >
              <MoreOutlined style={{ fontSize: "20px" }} />
            </Dropdown>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default StatusBar;
