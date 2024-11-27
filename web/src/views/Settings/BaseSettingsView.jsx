import React from "react";
import GenericBaseView from "../../constants/GenericBaseView";
import MQTTSettingsView from "./pages/MQTTSettingsView";
import MongoDbSettingsView from "./pages/MongoDbSettingsView";
import APISettingsView from "./pages/APISettingsView";
import SystemInfoView from "./pages/SystemInfoView";
import ConfigSettingsView from "./pages/ConfigSettingsView";
import {
  LinkOutlined,
  DatabaseOutlined,
  ApiOutlined,
  InfoCircleOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Outlet } from "react-router-dom";

const BaseSettingsView = () => {
  const menuItems = [
    {
      key: "1",
      label: "MQTT",
      icon: <LinkOutlined />,
      path: "/settings/mqtt",
    },
    {
      key: "2",
      label: "MongoDB",
      icon: <DatabaseOutlined />,
      path: "/settings/mongodb",
    },
    {
      key: "3",
      label: "API",
      icon: <ApiOutlined />,
      path: "/settings/api",
    },
    {
      key: "4",
      label: "Konfiguration",
      icon: <SettingOutlined />,
      path: "/settings/config",
    },
    {
      key: "5",
      label: "System",
      icon: <InfoCircleOutlined />,
      path: "/settings/system",
    },
  ];

  const contentComponents = {
    1: MQTTSettingsView,
    2: MongoDbSettingsView,
    3: APISettingsView,
    4: ConfigSettingsView,
    5: SystemInfoView,
  };

  return (
    <>
      <GenericBaseView
        menuItems={menuItems}
        defaultKey="1"
        contentComponents={contentComponents}
      />
      <Outlet />
    </>
  );
};

export default BaseSettingsView;
