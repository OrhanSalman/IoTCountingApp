import React from "react";
import { Card, Tooltip, Col, Row, Slider, InputNumber } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";

const CardWithSlider = ({ item, deviceConfigs, width, height }) => (
  <Col style={{ flex: "1 0 auto", padding: "10px 5px", margin: "0" }}>
    <Card
      title={item.title}
      bordered={false}
      size="small"
      style={{ minWidth: width, minHeight: height }}
      extra={
        <Tooltip title={item.options?.tooltip}>
          <QuestionCircleOutlined />
        </Tooltip>
      }
    >
      <Row align="middle">
        <Slider
          style={{ width: "66%" }}
          min={item?.options?.min}
          max={item?.options?.max}
          step={item?.options?.steps}
          onChange={(value) => {
            if (item.onChange) {
              item.onChange(deviceConfigs?.id, value);
            }
          }}
          value={typeof item.value === "number" ? item?.value : 0}
        />
        <InputNumber
          style={{ width: "24%", marginLeft: "10px" }}
          min={item?.options?.min}
          max={item?.options?.max}
          step={item?.options?.steps}
          value={item?.value}
          onChange={(value) => {
            if (item.onChange) {
              item.onChange(deviceConfigs?.id, value);
            }
          }}
        />
      </Row>
    </Card>
  </Col>
);

export default CardWithSlider;
