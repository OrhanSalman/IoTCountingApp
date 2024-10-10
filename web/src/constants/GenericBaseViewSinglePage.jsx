import React from "react";
import { Layout, Row, Col, theme } from "antd";
import useIsMobile from "../useIsMobile";
import { Outlet } from "react-router-dom";

const GenericBaseViewSinglePage = ({ components }) => {
  // Destructure components
  const { Content } = Layout;

  const isMobile = useIsMobile();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <>
      <Outlet />

      <Layout style={{ flex: 1 }}>
        <Content
          style={{
            padding: isMobile ? "16px 3px" : "24px",
            overflowY: "auto",
            backgroundColor: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Row>
            <Col span={24}>
              {Object.keys(components).map((key) => {
                const Component = components[key];
                return <Component key={key} />;
              })}
            </Col>
          </Row>
        </Content>
      </Layout>
    </>
  );
};

export default GenericBaseViewSinglePage;
