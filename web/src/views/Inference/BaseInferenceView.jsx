import React from "react";
import GenericBaseView from "../../constants/GenericBaseView";
import ConfigView from "./pages/ConfigView";
import ROIView from "./pages/ROIView";
import SimulationView from "./pages/SimulationView";
import BenchmarkView from "./pages/BenchmarkView";
import LivefeedView from "./pages/LivefeedView";
import {
  SettingOutlined,
  AreaChartOutlined,
  PlayCircleOutlined,
  BarChartOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { Outlet } from "react-router-dom";

const BaseInferenceView = () => {
  const menuItems = [
    {
      key: "1",
      label: "Konfiguration",
      icon: <SettingOutlined />,
      path: "/inference/config",
    },
    {
      key: "2",
      label: "ROI",
      icon: <AreaChartOutlined />,
      path: "/inference/roi",
    },
    {
      key: "3",
      label: "Simulation",
      icon: <PlayCircleOutlined />,
      path: "/inference/simulation",
    },
    {
      key: "4",
      label: "Benchmark",
      icon: <BarChartOutlined />,
      path: "/inference/benchmark",
    },
    {
      key: "5",
      label: "Livefeed",
      icon: <VideoCameraOutlined />,
      path: "/inference/livefeed",
    },
  ];

  const contentComponents = {
    1: ConfigView,
    2: ROIView,
    3: SimulationView,
    4: BenchmarkView,
    5: LivefeedView,
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

export default BaseInferenceView;
