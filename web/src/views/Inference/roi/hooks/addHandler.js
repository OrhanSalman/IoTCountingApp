import { useCallback, useContext } from "react";
import { DeviceContext } from "../../../../api/DeviceContext";
import { message } from "antd";
import {
  getDeviceTags,
  calculateNewColor,
  calculatePointCoordinates,
  generateTempId,
} from "./statics/staticFunctions";

export const useAddHandler = (imageSize) => {
  const { data, dispatch } = useContext(DeviceContext);
  const maxNumberOfRegions = 5;
  const maxNumberOfRegionPoints = 8;

  const handleAdd = useCallback(() => {
    if (data?.deviceRois?.length >= maxNumberOfRegions) {
      message.error(
        `Maximale Anzahl an Regionen erreicht (${maxNumberOfRegions}).`
      );
      return;
    }

    const newRoiId = generateTempId();
    const newKey = Date.now();
    const { x1, y1, x2, y2 } = calculatePointCoordinates(imageSize);

    const newROI = {
      deviceId: data?.id,
      id: newRoiId,
      isFormationClosed: false,
      line_thickness: 3,
      points: [
        {
          id: generateTempId(),
          direction: "Norden",
          x: x1,
          y: y1,
          roi: newRoiId,
        },
        {
          id: generateTempId(),
          direction: "Norden",
          x: x2,
          y: y2,
          roi: newRoiId,
        },
      ],
      region_color: calculateNewColor(data),
      roiName: `ROI_${newKey}`,
      tagsInThisRegion: getDeviceTags(data),
    };

    dispatch({
      type: "LOCAL_UPDATE_DEVICE",
      path: ["deviceRois"],
      payload: [...(data?.deviceRois || []), newROI],
    });
  }, [data, dispatch, imageSize]);

  const handleAddPointToRoi = useCallback(
    (roiId) => {
      if (!imageSize || !imageSize.width || !imageSize.height) {
        message.error("Inputgröße ist nicht definiert oder unvollständig.");
        return;
      }
      const roiIndex = data?.deviceRois?.findIndex((roi) => roi.id === roiId);
      if (roiIndex === -1) {
        message.error("ROI not found.");
        return;
      }

      const roi = data?.deviceRois[roiIndex];

      if (roi.points.length >= maxNumberOfRegionPoints) {
        message.error(
          `Maximale Anzahl an Koordinaten in dieser Region erreicht (${maxNumberOfRegionPoints}).`
        );
        return;
      }

      const newPoint = {
        id: generateTempId(),
        direction: "Norden",
        x: imageSize.width / 2,
        y: imageSize.height / 2,
        roi: roiId ?? null,
      };

      const updatedRoi = {
        ...roi,
        points: [...roi.points, newPoint],
      };

      const updatedDeviceRois = data?.deviceRois?.map((roi) =>
        roi.id === roiId ? updatedRoi : roi
      );
      dispatch({
        type: "LOCAL_UPDATE_DEVICE",
        path: ["deviceRois"],
        payload: updatedDeviceRois,
      });
    },
    [data, dispatch, imageSize, maxNumberOfRegionPoints]
  );

  return {
    handleAdd,
    handleAddPointToRoi,
  };
};
