import React from "react";
import GenericBaseView from "../../constants/GenericBaseView";
import CountsView from "./pages/CountsView";
import RoutesView from "./pages/RoutesView";
import TimesView from "./pages/TimesView";
import DataControls from "./pages/DataControls";
import {
  BarChartOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { Outlet } from "react-router-dom";

const BaseDataView = () => {
  const menuItems = [
    {
      key: "1",
      label: "Zählungen",
      icon: <BarChartOutlined />,
      path: "/data/counts",
    },
    {
      key: "2",
      label: "Routen",
      icon: <EnvironmentOutlined />,
      path: "/data/tracking",
    },
    {
      key: "3",
      label: "Zeiten",
      icon: <ClockCircleOutlined />,
      path: "/data/times",
    },
  ];

  const contentComponents = {
    1: CountsView,
    2: RoutesView,
    3: TimesView,
  };

  return (
    <>
      <GenericBaseView
        controlTap={DataControls}
        menuItems={menuItems}
        defaultKey="1"
        contentComponents={contentComponents}
      />
      <Outlet />
    </>
  );
};

export default BaseDataView;
