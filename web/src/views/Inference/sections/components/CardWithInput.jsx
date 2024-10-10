import React from "react";
import { Card, Tooltip, Input, Col } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";

const CardWithInput = ({ item, width, height, onInputChange }) => (
  <Col style={{ flex: "1 0 auto", padding: "10px 5px", margin: "0" }}>
    <Card
      title={item.title}
      bordered={false}
      size="small"
      style={{ minWidth: width, minHeight: height }}
      extra={
        item.tooltip && (
          <Tooltip title={item.tooltip}>
            <QuestionCircleOutlined />
          </Tooltip>
        )
      }
    >
      <Input
        value={item.value}
        style={{ width: "100%" }}
        onChange={onInputChange}
        placeholder={item?.placeholder}
        addonAfter={item?.addonAfter}
      />
    </Card>
  </Col>
);

export default CardWithInput;
