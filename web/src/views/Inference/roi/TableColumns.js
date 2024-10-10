import React from "react";
import {
  Input,
  Select,
  InputNumber,
  ColorPicker,
  Tag,
  Space,
  Button,
  Popconfirm,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { findLabelByTagId } from "./hooks/statics/staticFunctions";

export const getColumns = (
  deviceTags,
  handleRoiNameChange,
  handleColorChange,
  handleToggleTag,
  handleDelete,
  handleLineWidthChange,
  handleLogicChange
) => [
  {
    title: "Name",
    dataIndex: "roiName",
    key: "roiName",
    //editable: "true", // Drin lassen für die Validierung mit EditableCell (EditableCell.js)
    align: "center",
    render: (roiName, record) => (
      <Input
        value={roiName}
        onChange={(e) => handleRoiNameChange(record.id, e.target.value)}
        onBlur={() => handleRoiNameChange(record.id, roiName)}
      />
    ),
  },
  {
    title: "Linienstärke",
    dataIndex: "line_thickness",
    key: "line_thickness",
    align: "center",
    render: (line_thickness, record) => (
      <InputNumber
        min={1}
        max={10}
        value={line_thickness}
        onChange={(newLineWidth) =>
          handleLineWidthChange(record.id, newLineWidth)
        }
      />
    ),
  },
  {
    title: "Farbe",
    dataIndex: "region_color",
    key: "region_color",
    align: "center",
    render: (region_color, record) => (
      <ColorPicker
        defaultFormat="hex"
        value={region_color}
        onChange={(color, colorString) => {
          const hexColor = color.toHexString
            ? color.toHexString()
            : colorString;
          handleColorChange(record.id, hexColor);
        }}
      />
    ),
  },
  {
    title: "Tags",
    dataIndex: "tagsInThisRegion",
    key: "tagsInThisRegion",
    align: "center",
    render: (tagsInThisRegion, record) => {
      if (!deviceTags[0] || !deviceTags[0].tags) {
        return null; // Return null, wenn keine Tags verfügbar sind
      }
      // Sicherstellen, dass tagsInThisRegion vorhanden und ein Array ist
      const validTagsInThisRegion = tagsInThisRegion || [];

      return (
        <>
          {deviceTags[0].tags.map((tagId, index) => {
            // Überprüfen, ob die aktuelle Tag-ID in tagsInThisRegion für diesen Datensatz enthalten ist
            const isActive = validTagsInThisRegion.includes(tagId);
            return (
              <Tag
                key={`${tagId}-${index}`} // Eindeutigen Key sicherstellen
                color={isActive ? "green" : "default"}
                onClick={() => handleToggleTag(record.id, tagId)}
                style={{ cursor: "pointer", margin: "2px" }}
              >
                {findLabelByTagId(tagId)}
              </Tag>
            );
          })}
        </>
      );
    },
  },
  {
    title: "Aktionen",
    dataIndex: "aktionen",
    key: "aktionen",
    align: "center",
    render: (_, record) => (
      <Space size="middle">
        <Popconfirm
          title="Sicher löschen?"
          onConfirm={() => handleDelete(record.id)}
        >
          <Button icon={<DeleteOutlined style={{ color: "red" }} />} />
        </Popconfirm>
      </Space>
    ),
  },
];
