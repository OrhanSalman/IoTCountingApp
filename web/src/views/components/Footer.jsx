import React from "react";
import { Layout } from "antd";
import { GithubOutlined } from "@ant-design/icons";

const { Footer } = Layout;

const CustomFooter = () => {
  return (
    <Footer
      style={{
        textAlign: "center",
        backgroundColor: "#001529",
        color: "white",
        position: "sticky",
        bottom: 0,
        padding: "4px 20px",
        lineHeight: "1.2",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div style={{ flexGrow: 1, textAlign: "center" }}>
        IoT Counting App © Sal-Winfo-Thesis 2024
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <span style={{ marginRight: "12px" }}>Version 0.1.0</span>
        <GithubOutlined style={{ fontSize: "24px", marginLeft: "8px" }} />
      </div>
    </Footer>
  );
};

export default CustomFooter;
