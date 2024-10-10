import React, { useState, useMemo, useContext } from "react";
import GenericBaseView from "../../constants/GenericBaseView";
import LogsView from "./pages/LogsView";
import { NotificationOutlined } from "@ant-design/icons";
import { Outlet } from "react-router-dom";
import { DeviceContext } from "../../api/DeviceContext";

const LogsComponent = React.memo(({ filter }) => {
  return <LogsView filter={filter} />;
});

const BaseNotificationsView = () => {
  const { logs, fetchLogs, fetchHealth } = useContext(DeviceContext);
  const [selectedFilter, setSelectedFilter] = useState("error");

  const menuItems = useMemo(
    () => [
      {
        key: "1",
        label: "Fehler",
        icon: <NotificationOutlined />,
        path: "/logs/errors",
        filter: "error",
      },
      {
        key: "2",
        label: "Warnungen",
        icon: <NotificationOutlined />,
        path: "/logs/warnings",
        filter: "warning",
      },
      {
        key: "3",
        label: "Infos",
        icon: <NotificationOutlined />,
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
