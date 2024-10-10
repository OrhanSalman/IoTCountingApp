import React, { useContext, useState } from "react";
import { Carousel, Descriptions } from "antd";
import { DeviceContext } from "../../../api/DeviceContext";

const SectionImages = () => {
  const { simulation_images } = useContext(DeviceContext);
  const [currentIndex, setCurrentIndex] = useState(0);

  const extractDateTimeFromUrl = (url) => {
    const match = url.match(/_(\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2})\.jpg$/);
    return match ? match[1] : null;
  };

  const sortedImages = [...simulation_images].sort((a, b) => {
    const dateA = extractDateTimeFromUrl(a?.image_url);
    const dateB = extractDateTimeFromUrl(b?.image_url);
    return dateB.localeCompare(dateA);
  });

  return (
    <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
      <Carousel
        arrows
        arrowSize={32}
        //nextArrow={}
        //prevArrow={}
        infinite={false}
        afterChange={(current) => setCurrentIndex(current)}
        style={{
          height: "100%",
          width: "100%",
          backgroundColor: "black",
        }}
      >
        {sortedImages.length > 0 &&
          sortedImages.map((image, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <img
                src={image.image_url}
                alt={`Simulation Image ${index + 1}`}
                style={{
                  aspectRatio: "16/9",
                  maxHeight: "80%",
                  maxWidth: "80%",
                  objectFit: "scale-down", // https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit#fill
                  display: "block",
                  margin: "0 auto",
                }}
              />
            </div>
          ))}
      </Carousel>

      {sortedImages.length > 0 && sortedImages[currentIndex].config && (
        <Descriptions
          bordered
          column={1}
          size="small"
          style={{
            fontSize: "12px",
            padding: "0",
            textAlign: "center",
            marginTop: "10px",
          }}
        >
          {/* Kategorie Konfiguration */}
          <Descriptions.Item
            label="Konfiguration"
            span={3}
            style={{ textAlign: "center" }}
          >
            <Descriptions
              bordered
              column={3}
              size="small"
              style={{ textAlign: "center" }}
            >
              <Descriptions.Item label="Gerät" style={{ margin: 0 }}>
                {sortedImages[currentIndex].config?.device}
              </Descriptions.Item>
              <Descriptions.Item
                label="Vertrauensschwelle"
                style={{ margin: 0 }}
              >
                {sortedImages[currentIndex].config?.conf}
              </Descriptions.Item>
              <Descriptions.Item label="Inputgröße" style={{ margin: 0 }}>
                {sortedImages[currentIndex].config?.imgsz}
              </Descriptions.Item>
            </Descriptions>
          </Descriptions.Item>

          {/* Kategorie Modell */}
          <Descriptions.Item
            label="Modell"
            span={3}
            style={{ textAlign: "center" }}
          >
            <Descriptions
              bordered
              column={2}
              size="small"
              style={{ textAlign: "center" }}
            >
              <Descriptions.Item label="Modell" style={{ margin: 0 }}>
                {sortedImages[currentIndex].config?.model}
              </Descriptions.Item>
              <Descriptions.Item label="Inferenzzeit" style={{ margin: 0 }}>
                {parseFloat(
                  sortedImages[currentIndex].config?.speed.inference
                ).toFixed(2)}
                ms
              </Descriptions.Item>
              <Descriptions.Item
                label="Vorverarbeitungszeit"
                style={{ margin: 0 }}
              >
                {parseFloat(
                  sortedImages[currentIndex].config?.speed.preprocess
                ).toFixed(2)}
                ms
              </Descriptions.Item>
              <Descriptions.Item
                label="Nachverarbeitungszeit"
                style={{ margin: 0 }}
              >
                {parseFloat(
                  sortedImages[currentIndex].config?.speed.postprocess
                ).toFixed(2)}
                ms
              </Descriptions.Item>
            </Descriptions>
          </Descriptions.Item>

          {/* Kategorie Messung */}
          <Descriptions.Item
            label="Messung"
            span={3}
            style={{ textAlign: "center" }}
          >
            <Descriptions
              bordered
              column={3}
              size="small"
              style={{ textAlign: "center" }}
            >
              {Object.entries(sortedImages[currentIndex].config?.counts).map(
                ([key, value]) => (
                  <Descriptions.Item
                    key={key}
                    label={key}
                    style={{ margin: 0 }}
                  >
                    {value}
                  </Descriptions.Item>
                )
              )}
            </Descriptions>
          </Descriptions.Item>
        </Descriptions>
      )}
    </div>
  );
};

export default SectionImages;
