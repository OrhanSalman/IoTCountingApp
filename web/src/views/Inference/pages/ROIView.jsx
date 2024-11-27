import React, { useState, useEffect, useContext } from "react";
import { Select, Button, Table, Tabs, Checkbox } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { ExpandedRowRender } from "../roi/ExpandedRowRender";
import KonvaStage from "../roi/KonvaStage";
import { useAddHandler } from "../roi/hooks/addHandler";
import { useDeleteHandler } from "../roi/hooks/deleteHandler";
import { useUpdateHandler } from "../roi/hooks/updateHandler";
import { getColumns } from "../roi/TableColumns";
import { DeviceContext } from "../../../api/DeviceContext";

const { Option } = Select;

const ROIView = () => {
  const { data, loading, image, fetchImage } = useContext(DeviceContext);
  const [deviceTags, setDeviceTags] = useState([]);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);
  const [showInOut, setShowInOut] = useState(true);
  const [showDirections, setShowDirections] = useState(true);

  const { handleDelete, handleDeletePointFromRoi } = useDeleteHandler();
  const {
    handleRoiNameChange,
    handleDragMove,
    handleFormationChange,
    handleColorChange,
    handleLineWidthChange,
    handleLogicChange,
    handleToggleTag,
    handleRoiDirectionChange,
  } = useUpdateHandler();

  const handleSetImageSize = (newSize) => {
    setImageSize(newSize);
  };
  const handleScaleChange = (value) => {
    setScale(value);
  };

  const handleShowInOut = (e) => {
    setShowInOut(e.target.checked);
  };

  const handleShowDirections = (e) => {
    setShowDirections(e.target.checked);
  };

  const { handleAdd, handleAddPointToRoi } = useAddHandler(imageSize);

  const updateImageSize = (newWidth, newHeight) => {
    const oldWidth = imageSize.width;
    const oldHeight = imageSize.height;
    if (newWidth !== oldWidth || newHeight !== oldHeight) {
      setImageSize({ width: newWidth, height: newHeight });
      const scaleFactorX = newWidth / oldWidth;
      const scaleFactorY = newHeight / oldHeight;
      return data?.deviceRois?.map((roi) => ({
        ...roi,
        points: roi?.points?.map((point) => ({
          ...point,
          x: Math.round(point?.x * scaleFactorX),
          y: Math.round(point?.y * scaleFactorY),
        })),
      }));
    }
    return data.deviceRois;
  };

  useEffect(() => {
    if (data) {
      setDeviceTags(data?.deviceTags ?? []);
    }
  }, [data]);

  const columns = getColumns(
    deviceTags,
    handleRoiNameChange,
    handleColorChange,
    handleToggleTag,
    handleDelete,
    handleLineWidthChange,
    handleLogicChange,
    handleRoiDirectionChange
  );

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataindex: col.dataIndex,
        title: col.title,
      }),
    };
  });

  const fetchDeviceImage = async () => {
    await fetchImage(true);
  };

  return (
    <>
      <div
        style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            overflow: "auto",
          }}
        >
          {data && (
            <KonvaStage
              imageSrc={image ?? []}
              imageSize={imageSize}
              //loading={loading}
              scale={scale}
              onImageSizeChange={handleSetImageSize}
              updateImageSize={updateImageSize}
              handleDragMove={handleDragMove}
              data={data?.deviceRois ?? []}
              showInOut={showInOut}
              showDirections={showDirections}
            />
          )}
        </div>
      </div>
      <div style={{ marginBottom: 8, margin: 32 }}>
        <Tabs
          tabBarExtraContent={{
            left: (
              <>
                <Button
                  onClick={handleAdd}
                  style={{ marginBottom: 8 }}
                  icon={<PlusOutlined />}
                  disabled={
                    !image || !imageSize.width || !imageSize.height || loading
                  }
                >
                  Neuer Bereich
                </Button>
                <Select
                  defaultValue="Original"
                  style={{ marginBottom: 8, marginLeft: 16, width: 100 }}
                  onChange={handleScaleChange}
                >
                  <Option value={0.25}>-75%</Option>
                  <Option value={0.5}>-50%</Option>
                  <Option value={0.75}>-25%</Option>
                  <Option value={1}>Original</Option>
                  <Option value={1.25}>+25%</Option>
                  <Option value={1.5}>+50%</Option>
                  <Option value={1.75}>+75%</Option>
                  <Option value={2}>+100%</Option>
                </Select>

                <Checkbox
                  style={{ marginBottom: 8, marginLeft: 16 }}
                  checked={showInOut}
                  onChange={handleShowInOut}
                >
                  IN / OUT anzeigen
                </Checkbox>
                <Checkbox
                  style={{ marginBottom: 8, marginLeft: 16 }}
                  checked={showDirections}
                  onChange={handleShowDirections}
                >
                  Richtungen anzeigen
                </Checkbox>
              </>
            ),
            //right: (
            //  <Button
            //    type="primary"
            //    style={{ marginBottom: 8, marginLeft: 16 }}
            //    loading={loading}
            //    onClick={fetchDeviceImage}
            //    disabled={data?.deviceConfigs?.length === 0}
            //  >
            //    {loading ? "Hole Snap..." : "Neues Bild"}
            //  </Button>
            //),
          }}
        />
      </div>
      <Table
        bordered
        loading={loading}
        dataSource={data?.deviceRois ?? []}
        columns={mergedColumns}
        rowClassName="editable-row"
        size="small"
        rowKey={(record) => record.id}
        expandable={{
          expandedRowRender: (record, index, indent, expanded) => (
            <ExpandedRowRender
              record={record}
              handleAddPointToRoi={handleAddPointToRoi}
              handleDeletePointFromRoi={handleDeletePointFromRoi}
              handleRoiDirectionChange={handleRoiDirectionChange}
              handleFormationChange={handleFormationChange}
            />
          ),
        }}
      />
    </>
  );
};

export default ROIView;
