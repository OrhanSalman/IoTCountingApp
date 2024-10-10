import { useCallback, useContext } from "react";
import { DeviceContext } from "../../../../api/DeviceContext";
import { message } from "antd";

export const useUpdateHandler = () => {
  const { data, dispatch } = useContext(DeviceContext);

  const handleRoiNameChange = useCallback(
    (roiId, newName) => {
      const filteredName = newName.replace(/[^a-zA-Z0-9_]/g, "");

      const updatedDeviceRois = data.deviceRois.map((roi) =>
        roi.id === roiId ? { ...roi, roiName: filteredName } : roi
      );

      dispatch({
        type: "LOCAL_UPDATE_DEVICE",
        path: ["deviceRois"],
        payload: updatedDeviceRois,
      });
    },
    [data, dispatch]
  );

  const handleRoiDirectionChange = useCallback(
    (roiId, pointId, direction) => {
      const roiIndex = data.deviceRois.findIndex((roi) => roi.id === roiId);
      if (roiIndex === -1) {
        message.error(`ROI ${roiId} nicht gefunden.`);
        return;
      }

      const roi = data.deviceRois[roiIndex];
      const pointIndex = roi.points.findIndex((point) => point.id === pointId);
      if (pointIndex === -1) {
        message.error(`Punkt ${pointId} in ROI ${pointId} nicht gefunden.`);
        return;
      }

      const updatedPoint = {
        ...roi.points[pointIndex],
        direction,
      };

      const updatedPoints = roi.points.map((point) =>
        point.id === pointId ? updatedPoint : point
      );
      const updatedRoi = {
        ...roi,
        points: updatedPoints,
      };

      const updatedDeviceRois = data.deviceRois.map((roi) =>
        roi.id === roiId ? updatedRoi : roi
      );
      dispatch({
        type: "LOCAL_UPDATE_DEVICE",
        path: ["deviceRois"],
        payload: updatedDeviceRois,
      });
    },
    [data, dispatch]
  );

  const handleColorChange = useCallback(
    (roiId, newColor) => {
      const updatedDeviceRois = data.deviceRois.map((roi) =>
        roi.id === roiId ? { ...roi, region_color: newColor } : roi
      );
      dispatch({
        type: "LOCAL_UPDATE_DEVICE",
        path: ["deviceRois"],
        payload: updatedDeviceRois,
      });
    },
    [data, dispatch]
  );

  const handleLineWidthChange = useCallback(
    (roiId, newLineWidth) => {
      const updatedDeviceRois = data.deviceRois.map((roi) =>
        roi.id === roiId ? { ...roi, line_thickness: newLineWidth } : roi
      );
      dispatch({
        type: "LOCAL_UPDATE_DEVICE",
        path: ["deviceRois"],
        payload: updatedDeviceRois,
      });
    },
    [data, dispatch]
  );

  const handleFormationChange = useCallback(
    (roiId, isFormationClosed) => {
      if (isFormationClosed) {
        const roiIndex = data.deviceRois.findIndex((roi) => roi.id === roiId);
        if (roiIndex === -1) {
          message.error(`ROI ${roiId} nicht gefunden.`);
          return;
        }

        const roi = data.deviceRois[roiIndex];
        if (roi.points.length < 3) {
          message.error(
            "Es müssen mindestens drei Koordinatenpaare vorhanden sein."
          );
          return;
        }
      }

      const updatedDeviceRois = data.deviceRois.map((roi) =>
        roi.id === roiId ? { ...roi, isFormationClosed } : roi
      );
      dispatch({
        type: "LOCAL_UPDATE_DEVICE",
        path: ["deviceRois"],
        payload: updatedDeviceRois,
      });
    },
    [data, dispatch]
  );

  const handleLogicChange = useCallback(
    (roiId, newLogic) => {
      const updatedDeviceRois = data.deviceRois.map((roi) =>
        roi.id === roiId ? { ...roi, logic: newLogic } : roi
      );
      dispatch({
        type: "LOCAL_UPDATE_DEVICE",
        path: ["deviceRois"],
        payload: updatedDeviceRois,
      });
    },
    [data, dispatch]
  );

  const handleToggleTag = useCallback(
    (roiId, tagId) => {
      const updatedDeviceRois = data.deviceRois.map((roi) => {
        if (roi.id === roiId) {
          const currentTags = roi.tagsInThisRegion || [];
          const updatedTags = currentTags.includes(tagId)
            ? currentTags.filter((id) => id !== tagId)
            : [...currentTags, tagId];

          return { ...roi, tagsInThisRegion: updatedTags };
        }

        return roi;
      });
      dispatch({
        type: "LOCAL_UPDATE_DEVICE",
        path: ["deviceRois"],
        payload: updatedDeviceRois,
      });
    },
    [data, dispatch]
  );

  return {
    handleRoiNameChange,
    handleFormationChange,
    handleColorChange,
    handleLineWidthChange,
    handleLogicChange,
    handleToggleTag,
    handleRoiDirectionChange,
  };
};
