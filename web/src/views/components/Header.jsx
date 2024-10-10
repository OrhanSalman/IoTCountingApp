import React, { useState, useContext, useEffect } from "react";
import {
  Layout,
  Menu,
  Space,
  Button,
  Tooltip,
  Modal,
  Dropdown,
  theme,
  Badge,
} from "antd";
import {
  LogoutOutlined,
  AppstoreOutlined,
  ScanOutlined,
  DatabaseOutlined,
  BellOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { NavLink } from "react-router-dom";
import { DeviceContext } from "../../api/DeviceContext";
import useHandleLogout from "../../api/useHandleLogout";
import useIsMobile from "../../useIsMobile";

const { Header } = Layout;
const { confirm } = Modal;

const iconMenuItems = [
  { key: "home", icon: <AppstoreOutlined />, title: "Dashboard", path: "/" },
  {
    key: "inference",
    icon: <ScanOutlined />,
    title: "Inferenz",
    path: "/inference",
  },
  { key: "data", icon: <DatabaseOutlined />, title: "Daten", path: "/data" },
  {
    key: "logs",
    icon: <BellOutlined />,
    title: "Logs",
    path: "/logs",
  },
  {
    key: "settings",
    icon: <SettingOutlined />,
    title: "Einstellungen",
    path: "/settings",
  },
];

const CustomHeader = ({ activeNavKey, onNavChange }) => {
  const { data, user, logs } = useContext(DeviceContext);

  const logout = useHandleLogout();
  const isMobile = useIsMobile();

  const {
    token: { colorTextBase },
  } = theme.useToken();

  const handleLogout = () => {
    confirm({
      title: "Logout bestätigen",
      //content: "",
      okText: "Ja",
      cancelText: "Abbrechen",
      onOk: () => {
        logout();
      },
    });
  };

  const [dropdownVisible, setDropdownVisible] = useState(false);

  const menu = (
    <Menu
      theme="dark"
      selectedKeys={[activeNavKey]}
      onClick={onNavChange}
      items={iconMenuItems.map((item) => ({
        key: item.key,
        icon: item.icon,
        label: (
          <NavLink
            to={item.path}
            style={({ isActive }) => ({
              color: isActive ? colorTextBase : colorTextBase,
              padding: "5px",
              display: "block",
            })}
          >
            {item.title}
          </NavLink>
        ),
      }))}
    />
  );

  return (
    <Header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1,
        width: "100%",
        height: "60px",
        display: "flex",
        alignItems: "center",
        backgroundColor: "#001529",
        padding: "0 16px",
      }}
    >
      {/* Gerätename */}
      <div
        style={{
          color: "white",
          fontWeight: "bold",
          fontSize: isMobile ? "16px" : "20px",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          overflow: "hidden",
          maxWidth: "50%",
          marginRight: "auto",
        }}
      >
        {data?.deviceName || ""}
      </div>

      {isMobile ? (
        <Dropdown
          overlay={menu}
          onOpenChange={setDropdownVisible}
          open={dropdownVisible}
          trigger={["click"]}
        >
          <Button type="text" style={{ color: "white", marginLeft: "auto" }}>
            <AppstoreOutlined style={{ fontSize: 20 }} />
          </Button>
        </Dropdown>
      ) : (
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[activeNavKey]}
          onClick={onNavChange}
          style={{
            lineHeight: "40px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
            backgroundColor: "transparent",
          }}
          items={iconMenuItems.map((item) => ({
            key: item.key,
            icon: item.icon,
            label: (
              <NavLink
                to={item.path}
                style={({ isActive }) => ({
                  color: isActive ? "white" : "white",
                  padding: "5px",
                })}
              >
                {item.title}
                {item?.badge && (
                  <Badge size="small" count={5} offset={[5, -15]} />
                )}
              </NavLink>
            ),
          }))}
        />
      )}

      <p
        style={{ color: "white", fontSize: 15, fontWeight: "bold", margin: 0 }}
      >
        {isMobile ? "" : user?.preferred_username || ""}
      </p>

      {user && (
        <Tooltip title="Logout">
          <Button
            type="text"
            icon={<LogoutOutlined />}
            style={{ color: "white", marginLeft: "8px" }} // Margin anpassen
            size={{ xs: "small", sm: "middle" }}
            onClick={handleLogout}
          />
        </Tooltip>
      )}
    </Header>
  );
};

export default CustomHeader;
