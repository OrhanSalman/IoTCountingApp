import React from "react";
import GenericBaseView from "../../constants/GenericBaseView";
import MQTTSettingsView from "./pages/MQTTSettingsView";
import MongoDbSettingsView from "./pages/MongoDbSettingsView";
import DataSettingsView from "./pages/DataSettingsView";
import EnergySettingsView from "./pages/EnergySettingsView";
import APISettingsView from "./pages/APISettingsView";
import ThirdPartySettingsView from "./pages/ThirdPartySettingsView";
import UpdatesSettingsView from "./pages/UpdatesSettingsView";
import SoftwareSettingsView from "./pages/SoftwareSettingsView";
import SystemSettingsView from "./pages/SystemSettingsView";
import {
  LinkOutlined,
  DatabaseOutlined,
  ThunderboltOutlined,
  BulbOutlined,
  ApiOutlined,
  LoginOutlined,
  CloudSyncOutlined,
  ToolOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Outlet } from "react-router-dom";
import OIDCSettingsView from "./pages/OIDCSettingsView";

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
    //{
    //  key: "3",
    //  label: "OIDC",
    //  icon: <LoginOutlined />,
    //  path: "/settings/oidc",
    //},
    {
      key: "4",
      label: "Energie",
      icon: <BulbOutlined />,
      path: "/settings/energy",
    },
    {
      key: "5",
      label: "API",
      icon: <ApiOutlined />,
      path: "/settings/api",
    },
    {
      key: "6",
      label: "Drittanbieter",
      icon: <CloudSyncOutlined />,
      path: "/settings/thirdparty",
    },
    {
      key: "7",
      label: "Software",
      icon: <ToolOutlined />,
      path: "/settings/software",
    },
    {
      key: "8",
      label: "Einstellungen",
      icon: <SettingOutlined />,
      path: "/settings/system",
    },
  ];

  const contentComponents = {
    1: MQTTSettingsView,
    2: MongoDbSettingsView,
    //3: OIDCSettingsView,
    4: EnergySettingsView,
    5: APISettingsView,
    6: ThirdPartySettingsView,
    7: SoftwareSettingsView,
    8: SystemSettingsView,
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
