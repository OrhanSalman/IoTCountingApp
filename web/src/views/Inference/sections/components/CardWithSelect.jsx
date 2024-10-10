import React from "react";
import { Card, Tooltip, Select, Col } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";

const CardWithSelect = ({ item, deviceConfigs, width, height }) => (
  <Col style={{ flex: "1 0 auto", padding: "10px 5px", margin: "0" }}>
    <Card
      title={item?.title}
      bordered={false}
      size="small"
      style={{ minWidth: width, minHeight: height }}
      extra={
        item?.tooltip && (
          <Tooltip title={item?.tooltip}>
            <QuestionCircleOutlined />
          </Tooltip>
        )
      }
    >
      <Select
        value={item?.value}
        options={item?.options?.map((option, optionIndex) => ({
          ...option,
          label: (
            <Tooltip title={option?.tooltip} placement="right">
              <span>{option.label}</span>
            </Tooltip>
          ),
        }))}
        style={{ width: "100%", textAlign: "center" }}
        dropdownStyle={{ textAlign: "center" }}
        onChange={(value) => {
          if (item?.onChange) {
            item?.onChange(deviceConfigs?.id, value);
          }
        }}
      />
    </Card>
  </Col>
);

export default CardWithSelect;
