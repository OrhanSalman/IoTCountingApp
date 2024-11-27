import React, { useEffect, useRef, useState, useContext } from "react";
import { DeviceContext } from "../../../api/DeviceContext";
import { Select, Row, Col, Slider, ColorPicker, Button, message } from "antd";
import { categories } from "../../../constants/constants";
import { SaveOutlined } from "@ant-design/icons";

const { Option } = Select;

const RoutesView = () => {
  const { image, tracking } = useContext(DeviceContext);
  const [selectedClass, setSelectedClass] = useState("Alle");
  const [strokeColor, setStrokeColor] = useState("#002fff");
  const [opacity, setOpacity] = useState(0.5);
  const [drawMode, setDrawMode] = useState("linien");
  const canvasRef = useRef(null);
  const allTrackingData = tracking || [];

  // Extrahiere alle eindeutigen Klassen aus allen Tracks
  const uniqueClasses = Array.from(
    new Set(
      allTrackingData.flatMap((trackObj) =>
        Object.values(trackObj).map((track) => track.class)
      )
    )
  ).filter((c) => c !== undefined);

  // Funktion, um Routen nach Klasse zu filtern
  const getTracksByClass = (classValue) => {
    return allTrackingData.flatMap((trackObj) =>
      Object.values(trackObj).filter(
        (track) =>
          track && (track.class === classValue || classValue === "Alle")
      )
    );
  };

  // Die Routen, die gezeichnet werden sollen
  const routesToDraw = getTracksByClass(selectedClass);

  // useEffect um das Canvas zu zeichnen, wenn sich das Bild oder die Routen ändern
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.src = image;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Canvas leeren und Bild zeichnen
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = opacity;
      ctx.drawImage(img, 0, 0);
      ctx.globalAlpha = 1;

      // Routen zeichnen
      drawRoutes(ctx, routesToDraw);
    };

    img.onerror = () => {
      message.error("Fehler beim Laden des Bildes.");
    };
  }, [image, routesToDraw, strokeColor, opacity, drawMode]);

  // Funktion zum Zeichnen der Routen
  const drawRoutes = (ctx, routes) => {
    ctx.lineWidth = 2;
    ctx.strokeStyle = strokeColor;
    ctx.fillStyle = strokeColor;

    routes.forEach((route) => {
      if (Array.isArray(route.tracks) && route.tracks.length > 0) {
        ctx.beginPath();
        ctx.moveTo(route.tracks[0][0], route.tracks[0][1]);
        route.tracks.forEach((point) => {
          ctx.lineTo(point[0], point[1]);
        });

        if (drawMode === "linien") {
          ctx.stroke();
        } else if (drawMode === "flaechen") {
          ctx.closePath();
          ctx.fill();
        }
      }
    });
  };

  const getLabelFromValue = (value) => {
    for (const category of categories) {
      const item = category.items.find(
        (item) => item.value === value.toString()
      );
      if (item) {
        return item.label;
      }
    }
    return "";
  };

  const saveCanvasAsImage = () => {
    const canvas = canvasRef.current;
    const image = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
    const a = document.createElement("a");
    a.href = image;
    a.download = "canvas_image.png";
    a.click();
  };

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <Row gutter={16} style={{ marginTop: 0 }}>
          <Col>
            <Select
              defaultValue="Alle"
              style={{ width: 200 }}
              onChange={(value) => setSelectedClass(value)}
              value={selectedClass}
            >
              <Option key="alle" value="Alle">
                Alle
              </Option>
              {uniqueClasses.map((cls) => (
                <Option key={cls} value={cls}>
                  {getLabelFromValue(cls)}
                </Option>
              ))}
            </Select>
          </Col>

          <Col>
            <Select
              defaultValue="linien"
              style={{ width: 120, marginLeft: 10 }}
              onChange={(value) => setDrawMode(value)}
            >
              <Option value="linien">Linien</Option>
              <Option value="flaechen">Flächen</Option>
            </Select>
          </Col>

          <Col>
            <ColorPicker
              defaultFormat="hex"
              value={strokeColor}
              onChange={(color, colorString) => {
                const hexColor = color.toHexString
                  ? color.toHexString()
                  : colorString;
                setStrokeColor(hexColor);
              }}
              style={{ marginLeft: 10 }}
            />
          </Col>

          <Col style={{ width: 200 }}>
            <Slider
              min={0}
              max={1}
              step={0.1}
              value={opacity}
              onChange={(value) => setOpacity(value)}
            />
          </Col>
          <Col>
            <Button
              onClick={saveCanvasAsImage}
              type="primary"
              style={{ marginLeft: 10 }}
              disabled={!image}
              icon={<SaveOutlined />}
            />
          </Col>
        </Row>
      </div>

      <div>
        {image && (
          <canvas
            ref={canvasRef}
            style={{ display: "block", width: "100%", height: "auto" }}
          />
        )}
      </div>
    </>
  );
};

export default RoutesView;
