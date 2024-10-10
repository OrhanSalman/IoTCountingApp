import React, { useContext, useState, useEffect } from "react";
import {
  Stage,
  Text,
  Layer,
  Line,
  Circle,
  Image as KonvaImage,
} from "react-konva";
import useImage from "use-image";
import { DeviceContext } from "../../../api/DeviceContext";
import { handleDragMove as handleDragMoveStatic } from "./hooks/statics/staticFunctions";
import { getLabelPositions } from "./calculateInOut";

const KonvaStage = ({
  imageSrc,
  imageSize,
  scale,
  onImageSizeChange,
  updateImageSize,
  showInOut,
  showDirections,
}) => {
  const [image] = useImage(imageSrc);
  const { data, dispatch } = useContext(DeviceContext);

  useEffect(() => {
    if (image) {
      onImageSizeChange({
        width: image.width,
        height: image.height,
      });
      updateImageSize(image?.width, image?.height);
    }
  }, [image]);

  const stageWidth = imageSize?.width * scale;
  const stageHeight = imageSize?.height * scale;

  const handleDragMove = (roiIndex, pointIndex, e) => {
    const updatedDeviceRois = handleDragMoveStatic(
      roiIndex,
      pointIndex,
      e,
      data
    );
    dispatch({
      type: "LOCAL_UPDATE_DEVICE",
      path: ["deviceRois"],
      payload: updatedDeviceRois,
    });
  };

  return (
    <Stage
      width={stageWidth}
      height={stageHeight}
      scale={{ x: scale, y: scale }}
    >
      <Layer>
        {image && (
          <KonvaImage
            image={image}
            x={0}
            y={0}
            width={imageSize?.width}
            height={imageSize?.height}
          />
        )}
        {data?.deviceRois?.map((roi, index) => (
          <React.Fragment key={index}>
            <Line
              points={roi?.points?.flatMap((point) => [point?.x, point?.y])}
              stroke={roi?.region_color}
              strokeWidth={roi?.line_thickness}
              lineCap="round"
              lineJoin="round"
              closed={roi?.isFormationClosed}
            />
            {showInOut &&
              ["IN", "OUT"].map((dir) =>
                getLabelPositions(roi.points, dir, 38).map(
                  (pos, pointIndex) => (
                    <Text
                      key={`${index}-${pointIndex}-${dir.toLowerCase()}`}
                      x={pos.x}
                      y={pos.y}
                      text={`${dir}`}
                      fontSize={5.5 * roi?.line_thickness}
                      fill={roi?.region_color}
                      align="center"
                      verticalAlign="middle"
                    />
                  )
                )
              )}
            {roi?.points.map((point, pointIndex) => {
              if (pointIndex < roi?.points?.length - 1) {
                const nextIndex = pointIndex + 1;
                const x1 = roi?.points[pointIndex].x;
                const y1 = roi?.points[pointIndex].y;
                const x2 = roi?.points[nextIndex].x;
                const y2 = roi?.points[nextIndex].y;
                const centerX = (x1 + x2) / 2;
                const centerY = (y1 + y2) / 2;
                const label = `${pointIndex + 1} ${point.direction || ""}`;

                return (
                  <>
                    {showDirections && (
                      <Text
                        key={`${index}-${pointIndex}`}
                        x={centerX}
                        y={centerY}
                        text={label}
                        fontSize={6 * roi?.line_thickness}
                        fill={roi?.region_color}
                        align="center"
                        verticalAlign="middle"
                      />
                    )}
                  </>
                );
              } else if (
                roi?.isFormationClosed &&
                pointIndex === roi?.points.length - 1
              ) {
                const x1 = roi?.points[pointIndex].x;
                const y1 = roi?.points[pointIndex].y;
                const x2 = roi?.points[0].x;
                const y2 = roi?.points[0].y;
                const centerX = (x1 + x2) / 2;
                const centerY = (y1 + y2) / 2;
                const label = `${pointIndex + 1} ${point.direction || ""}`;

                return (
                  <>
                    {showDirections && (
                      <Text
                        key={`${index}-${pointIndex}-close`}
                        x={centerX}
                        y={centerY}
                        text={label}
                        fontSize={6 * roi?.line_thickness}
                        fill={roi?.region_color}
                        align="center"
                        verticalAlign="middle"
                      />
                    )}

                    {showInOut &&
                      ["IN", "OUT"].map((dir, dirIndex) => {
                        const pos = getLabelPositions(
                          [roi.points[pointIndex], roi.points[0]],
                          dir,
                          38
                        )[0];
                        return (
                          <Text
                            key={`${index}-${pointIndex}-${dir.toLowerCase()}-close`}
                            x={pos.x}
                            y={pos.y}
                            text={dir}
                            fontSize={5.5 * roi?.line_thickness}
                            fill={roi?.region_color}
                            align="center"
                            verticalAlign="middle"
                          />
                        );
                      })}
                  </>
                );
              }

              return null;
            })}
            {roi?.points.map((point, pointIndex) => (
              <Circle
                key={`${index}-${pointIndex}`}
                x={point.x}
                y={point.y}
                radius={roi?.line_thickness + 5}
                fill="grey"
                stroke="black"
                strokeWidth={roi?.line_thickness}
                draggable
                onDragMove={(e) => handleDragMove(index, pointIndex, e)}
              />
            ))}
          </React.Fragment>
        ))}
      </Layer>
    </Stage>
  );
};

export default KonvaStage;
