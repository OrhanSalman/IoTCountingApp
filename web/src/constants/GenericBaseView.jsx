import React, { useState, useEffect } from "react";
import { Layout, theme } from "antd";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import SiderComponent from "./SiderComponent";
import useIsMobile from "../useIsMobile";

const { Sider, Content } = Layout;

const GenericBaseView = ({ menuItems, defaultKey, contentComponents }) => {
  const [activeSiderKey, setActiveSiderKey] = useState(
    defaultKey || menuItems[0]?.key
  );

  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSiderChange = (e) => {
    setActiveSiderKey(e.key);
    navigate(menuItems.find((item) => item.key === e.key)?.path);
  };

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
    // Wenn der `activeSiderKey` nicht gesetzt ist, navigiere zum `defaultKey`
    if (
      defaultKey &&
      !location.pathname.startsWith(
        menuItems.find((item) => item.key === activeSiderKey)?.path
      )
    ) {
      const defaultPath = menuItems.find(
        (item) => item.key === defaultKey
      )?.path;
      navigate(defaultPath);
    }
  }, [defaultKey, activeSiderKey, location.pathname, menuItems, navigate]);

  const ActiveContent = contentComponents[activeSiderKey] || null;

  return (
    <>
      <Outlet />
      <Layout
        style={{
          overflow: "hidden",
          display: "flex",
        }}
      >
        {/* Sider */}
        <Sider
          breakpoint="lg"
          collapsedWidth="42px"
          style={{
            backgroundColor: "#fff",
            overflow: "auto",
          }}
        >
          <SiderComponent
            menuItems={menuItems}
            activeKey={activeSiderKey}
            showSider={true}
            onSelect={handleSiderChange}
          />
        </Sider>

        {/* Content */}
        <Layout style={{ flex: 1 }}>
          <Content
            style={{
              padding: isMobile ? "16px 3px" : "24px",
              overflowY: "auto",
              backgroundColor: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {ActiveContent && <ActiveContent />}
          </Content>
        </Layout>
      </Layout>
    </>
  );
};

export default GenericBaseView;
