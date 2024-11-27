import React, { useContext, useState, useEffect } from "react";
import { Layout, Tooltip, theme } from "antd";
import {
  DatabaseOutlined,
  SettingOutlined,
  BellOutlined,
  AppstoreOutlined,
  ScanOutlined,
} from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import BaseDashboardView from "./Dashboard/BaseDashboardView";
import BaseInferenceView from "./Inference/BaseInferenceView";
import BaseDataView from "./Data/BaseDataView";
import BaseNotifcationsView from "./Notifications/BaseNotifcationsView";
import BaseSettingsView from "./Settings/BaseSettingsView";
import LoadingOverlay from "./LoadingOverlay";
import { DeviceContext } from "../api/DeviceContext";
import CustomFooter from "./components/Footer";
import CustomHeader from "./components/Header";
import StatusBar from "./components/StatusBar";
import useIsMobile from "../useIsMobile";

const { Content } = Layout;

const iconMenuItems = [
  {
    key: "home",
    icon: (
      <Tooltip title="Dashboard">
        <AppstoreOutlined style={{ fontSize: 20, color: "white" }} />
      </Tooltip>
    ),
    title: "Dashboard",
    path: "/",
  },
  {
    key: "inference",
    icon: (
      <Tooltip title="Inferenz">
        <ScanOutlined style={{ fontSize: 20, color: "white" }} />
      </Tooltip>
    ),
    title: "Inferenz",
    path: "/inference",
  },
  {
    key: "data",
    icon: (
      <Tooltip title="Daten">
        <DatabaseOutlined style={{ fontSize: 20, color: "white" }} />
      </Tooltip>
    ),
    title: "Daten",
    path: "/data",
  },
  {
    key: "logs",
    icon: (
      <Tooltip title="Logs">
        <BellOutlined style={{ fontSize: 20, color: "white" }} />
      </Tooltip>
    ),
    title: "Logs",
    path: "/logs",
  },
  {
    key: "settings",
    icon: (
      <Tooltip title="Einstellungen">
        <SettingOutlined style={{ fontSize: 20, color: "white" }} />
      </Tooltip>
    ),
    title: "Einstellungen",
    path: "/settings",
  },
];

const BaseView = () => {
  const isMobile = useIsMobile();
  const { loading, fetchConfig, fetchHealth } = useContext(DeviceContext);
  const [activeNavKey, setActiveNavKey] = useState("home");
  const location = useLocation();

  useEffect(() => {
    const intervalId = setInterval(async () => {
      await fetchHealth();
    }, 3000);

    return () => clearInterval(intervalId);
  }, []); // Kein fetchHealth in den Dependencies

  const handleNavChange = (e) => {
    const key = e.key;
    setActiveNavKey(key);
  };

  useEffect(() => {
    const path = location.pathname.split("/")[1] || "home";
    setActiveNavKey(
      iconMenuItems.find((item) => item.path.split("/")[1] === path)?.key ||
        "home"
    );
  }, [location.pathname]);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const renderContent = () => {
    switch (activeNavKey) {
      case "home":
        return <BaseDashboardView />;
      case "inference":
        return <BaseInferenceView />;
      case "data":
        return <BaseDataView />;
      case "settings":
        return <BaseSettingsView />;
      case "logs":
        return <BaseNotifcationsView />;
      default:
        return <BaseDashboardView />;
    }
  };

  useEffect(() => {
    const fetchDataFromContext = async () => {
      await fetchConfig();
    };
    fetchDataFromContext();
  }, []);

  return (
    <>
      <Layout style={{ height: "100vh", overflow: "hidden" }}>
        <CustomHeader
          activeNavKey={activeNavKey}
          onNavChange={handleNavChange}
        />

        <StatusBar />

        <Layout
          style={{
            height: "calc(100vh - 64px - 70px - 40px)",
            overflow: "hidden",
          }}
        >
          <Content
            style={{
              overflowY: "auto",
              backgroundColor: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {loading && <LoadingOverlay />}
            {renderContent()}
          </Content>
        </Layout>

        {/*
        {!isMobile && <CustomFooter />}
              */}
      </Layout>
    </>
  );
};

export default BaseView;
