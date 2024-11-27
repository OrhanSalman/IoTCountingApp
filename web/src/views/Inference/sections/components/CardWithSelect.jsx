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
      {/* TODO: das "value" als default muss geprüft werden, könnte an anderer stelle für probleme sorgen */}
      <Select
        value={
          item?.value ??
          (item?.options?.length > 0
            ? item?.options[item?.options?.length - 1].value
            : undefined)
        }
        //value={item?.value}
        disabled={item?.options?.length === 0}
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
