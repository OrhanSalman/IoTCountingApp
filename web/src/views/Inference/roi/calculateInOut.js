// Description: This file contains the functions to calculate the in and out points of a polygon.

const calculateLabelPosition = (x1, y1, x2, y2, direction, offset) => {
  const centerX = (x1 + x2) / 2;
  const centerY = (y1 + y2) / 2;
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const offsetX =
    offset *
    Math.cos(angle + (direction === "OUT" ? Math.PI / 2 : -Math.PI / 2));
  const offsetY =
    offset *
    Math.sin(angle + (direction === "OUT" ? Math.PI / 2 : -Math.PI / 2));
  return { x: centerX + offsetX, y: centerY + offsetY };
};

export const getLabelPositions = (points, direction, offset) => {
  const labelPositions = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const position = calculateLabelPosition(
      p1.x,
      p1.y,
      p2.x,
      p2.y,
      direction,
      offset
    );
    labelPositions.push(position);
  }
  return labelPositions;
};
