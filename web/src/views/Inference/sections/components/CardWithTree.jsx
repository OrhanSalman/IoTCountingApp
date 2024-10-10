import React from "react";
import { Card, Tooltip, TreeSelect, Checkbox, Col } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";

const CardWithTree = ({
  item,
  treeData,
  width,
  height,
  handleSelectedTagsChange,
}) => (
  <Col
    style={{
      flex: "1 0 auto",
      padding: "10px 5px",
      margin: "0 0",
      maxWidth: width,
    }}
  >
    <Card
      title={item.title}
      bordered={false}
      size="small"
      style={{ width: width, height: height }}
      extra={
        <>
          {item.checkbox && (
            <Checkbox
              defaultChecked={item.checkbox.value}
              onChange={item.checkbox.onChange}
            >
              {item.checkbox.label}
            </Checkbox>
          )}
          {item.tooltip && (
            <Tooltip title={item.tooltip}>
              <QuestionCircleOutlined style={{ marginLeft: 8 }} />
            </Tooltip>
          )}
        </>
      }
    >
      <TreeSelect
        showSearch
        style={{ width: "100%" }}
        treeData={treeData}
        value={item.value}
        dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
        placeholder="Bitte auswählen"
        multiple
        treeDefaultExpandAll
        treeLine
        treeNodeFilterProp="title"
        onChange={handleSelectedTagsChange}
      />
    </Card>
  </Col>
);

export default CardWithTree;
