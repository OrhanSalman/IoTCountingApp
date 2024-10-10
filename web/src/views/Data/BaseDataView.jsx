import React from "react";
import GenericBaseView from "../../constants/GenericBaseView";
import CountsView from "./pages/CountsView";
import RoutesView from "./pages/RoutesView";
import TimesView from "./pages/TimesView";
import { DatabaseOutlined } from "@ant-design/icons";
import { Outlet } from "react-router-dom";

const BaseDataView = () => {
  const menuItems = [
    {
      key: "1",
      label: "Messungen",
      icon: <DatabaseOutlined />,
      path: "/data/counts",
    },
    {
      key: "2",
      label: "Routen",
      icon: <DatabaseOutlined />,
      path: "/data/routes",
    },
    {
      key: "3",
      label: "Zeiten",
      icon: <DatabaseOutlined />,
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
        menuItems={menuItems}
        defaultKey="1"
        contentComponents={contentComponents}
      />
      <Outlet />
    </>
  );
};

export default BaseDataView;
