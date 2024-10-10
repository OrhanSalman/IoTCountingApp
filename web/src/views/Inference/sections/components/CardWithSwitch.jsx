import React from "react";
import { Card, Tooltip, Switch, Col } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";

const CardWithSwitch = ({ item, deviceConfigs, width, height }) => (
  <Col
    style={{
      flex: "1 0 auto",
      padding: "10px 5px",
      margin: "0",
    }}
  >
    <Card
      title={item.title}
      bordered={false}
      size="small"
      style={{ minWidth: width, minHeight: height }}
      extra={
        item.tooltip && (
          <Tooltip title={item.tooltip}>
            <QuestionCircleOutlined style={{ marginLeft: 8 }} />
          </Tooltip>
        )
      }
    >
      <Switch
        checked={item.value}
        onChange={(value) => {
          if (item?.onChange) {
            item?.onChange(deviceConfigs?.id, value);
          }
        }}
        style={{ textAlign: "center" }}
      />
    </Card>
  </Col>
);

export default CardWithSwitch;
