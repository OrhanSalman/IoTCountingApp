import React from "react";
import { Layout, Menu } from "antd";
import { NavLink } from "react-router-dom";

const { Sider } = Layout;

const SiderComponent = ({ menuItems, activeKey, onSelect }) => {
  return (
    <Sider
      //width={256}
      breakpoint="lg"
      collapsedWidth="45px"
      style={{
        position: "fixed",
        height: "100vh",
        overflowY: "auto",
        marginTop: "16px",
        borderRight: "1px solid #e8e8e8",
        top: 100, // Oben fixiert
        left: 0, // Links fixiert
      }}
    >
      <Menu
        theme="light"
        mode="inline"
        selectedKeys={[activeKey]}
        onClick={onSelect}
        style={{ height: "100%", borderRight: 0 }}
      >
        {menuItems.map((item) => (
          <Menu.Item key={item.key} icon={item.icon}>
            <NavLink to={item.path}>{item.label}</NavLink>
          </Menu.Item>
        ))}
      </Menu>
    </Sider>
  );
};

export default SiderComponent;
