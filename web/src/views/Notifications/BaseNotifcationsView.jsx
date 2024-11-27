import React, { useState, useMemo, useContext } from "react";
import GenericBaseView from "../../constants/GenericBaseView";
import LogsView from "./pages/LogsView";
import {
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { Outlet } from "react-router-dom";
//import DataControls from "./pages/DataControls";

// TODO: keinen sider, besser mit tabs

// !!! Re-render-Bug fix (rerendering durch timer fetchHealth)
const LogsComponent = React.memo(({ filter }) => {
  return <LogsView filter={filter} />;
});

const BaseNotificationsView = () => {
  const [selectedFilter, setSelectedFilter] = useState("error");

  const menuItems = useMemo(
    () => [
      {
        key: "1",
        label: "Fehler",
        icon: <CloseCircleOutlined />,
        path: "/logs/errors",
        filter: "error",
      },
      {
        key: "2",
        label: "Warnungen",
        icon: <ExclamationCircleOutlined />,
        path: "/logs/warnings",
        filter: "warning",
      },
      {
        key: "3",
        label: "Infos",
        icon: <InfoCircleOutlined />,
        path: "/logs/infos",
        filter: "info",
      },
    ],
    []
  );

  const contentComponents = useMemo(
    () => ({
      1: (props) => <LogsComponent {...props} filter="error" />,
      2: (props) => <LogsComponent {...props} filter="warning" />,
      3: (props) => <LogsComponent {...props} filter="info" />,
    }),
    []
  );

  const handleMenuItemClick = (filter) => {
    setSelectedFilter(filter);
  };

  return (
    <>
      <GenericBaseView
        //controlTap={DataControls}
        menuItems={menuItems}
        defaultKey="1"
        contentComponents={contentComponents}
        onMenuItemClick={handleMenuItemClick}
      />
      <Outlet />
    </>
  );
};

export default BaseNotificationsView;
