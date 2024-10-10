import React, { useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Popconfirm,
  Select,
  Tooltip,
  message,
} from "antd";
import { DeleteOutlined, PlusOutlined, LinkOutlined } from "@ant-design/icons";

export const ExpandedRowRender = ({
  record,
  handleAddPointToRoi,
  handleDeletePointFromRoi,
  handleRoiDirectionChange,
  handleFormationChange,
}) => {
  const possibleDirections = [
    "Norden",
    "Sueden",
    "Osten",
    "Westen",
    "Nordosten",
    "Nordwesten",
    "Suedosten",
    "Suedwesten",
  ];

  const usedDirections = record.points.map((point) => point.direction);
  const availableDirections = possibleDirections.filter(
    (direction) => !usedDirections.includes(direction)
  );

  const columnsNested = [
    {
      title: "ID",
      key: "id",
      align: "center",
      render: (_, record, index) => index + 1,
    },
    {
      title: "Richtung",
      dataIndex: "direction",
      key: "direction",
      align: "center",
      render: (direction, nestedRecord, index) => (
        <Select
          value={direction}
          style={{ width: 120 }}
          disabled={
            !record.isFormationClosed && index === record.points.length - 1
          }
          onChange={(newDirection) =>
            handleRoiDirectionChange(record.id, nestedRecord.id, newDirection)
          }
        >
          {availableDirections.map((dir) => (
            <Select.Option key={dir} value={dir}>
              {dir}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: "X-Koordinate",
      dataIndex: "x",
      key: "x",
      align: "center",
      render: (value) => {
        const roundedValue = Math.round(value);
        return roundedValue;
      },
    },
    {
      title: "Y-Koordinate",
      dataIndex: "y",
      key: "y",
      align: "center",
      render: (value) => {
        const roundedValue = Math.round(value);
        return roundedValue;
      },
    },
    {
      title: "Aktionen",
      key: "operation",
      align: "center",
      render: (_, nestedRecord) => (
        <Space size="middle">
          <Popconfirm
            title="Sicher löschen?"
            onConfirm={() =>
              handleDeletePointFromRoi(record.id, nestedRecord.id)
            }
          >
            <Button icon={<DeleteOutlined style={{ color: "red" }} />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          flexShrink: 0,
          marginRight: "16px",
        }}
      >
        <Button
          onClick={() => handleAddPointToRoi(record.id)}
          icon={<PlusOutlined />}
          size="small"
        />
        <Tooltip title="Formation schließen">
          <Button
            onClick={() => {
              handleFormationChange(record.id, !record.isFormationClosed);
            }}
            style={{ marginLeft: 6 }}
            icon={<LinkOutlined />}
            size="small"
          />
        </Tooltip>
      </div>
      <div style={{ flexGrow: 1, width: "100%" }}>
        <Table
          columns={columnsNested}
          dataSource={record.points.map((point) => ({
            ...point,
            key: point.id,
          }))}
          pagination={false}
          size="small"
        />
      </div>
    </div>
  );
};
