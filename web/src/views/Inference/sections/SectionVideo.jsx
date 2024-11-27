import React, { useContext, useEffect, useState } from "react";
import { Row, Button } from "antd";
import { useUpdateHandler } from "./hooks/updateHandler";
import CardWithSelect from "./components/CardWithSelect";
import CardWithInput from "./components/CardWithInput";
import {
  stream_resolution,
  stream_fps,
  stream_channel,
  stream_source,
} from "../../../../src/constants/constants";
import { DeviceContext } from "../../../api/DeviceContext";
import baseURL from "../../../api/baseUrl";

const SectionVideo = () => {
  const {
    handleUpdateStreamSource,
    handleUpdateStreamResolution,
    handleUpdateStreamFps,
    handleUpdateStreamChannel,
    handleUpdateStreamUrl,
    handleUpdateStreamUrlResolution,
  } = useUpdateHandler();
  const { data } = useContext(DeviceContext);
  const deviceConfigs = data?.deviceConfigs || [];

  const cardItemsSelect = [
    {
      title: "Videoquelle",
      value: deviceConfigs[0]?.stream_source,
      options: stream_source,
      width: "100px",
      tooltip: "Die Quelle des Videostreams.",
      onChange: handleUpdateStreamSource,
    },
    ...(deviceConfigs[0]?.stream_source === "0"
      ? [
          {
            title: "Bildauflösung",
            loading: true,
            value: deviceConfigs[0]?.stream_resolution,
            options: stream_resolution,
            width: "120px",
            tooltip:
              "Die Auflösung des Videostreams. Eine Auflösung die höher als die Inputgröße ist, wird automatisch auf diese herunterskaliert, was Leistung kosten kann. Eine leicht erhöhte Auflösung kann jedoch in manchen Fällen die Genauigkeit der Erkennung verbessern.",
            onChange: handleUpdateStreamResolution,
          },
          {
            title: "Bildrate",
            value: deviceConfigs[0]?.stream_fps,
            options: stream_fps,
            width: "90px",
            tooltip:
              "Die Bildrate die durch den Videostream angepeilt werden soll.",
            onChange: handleUpdateStreamFps,
          },
          {
            title: "Farbkanal",
            value: deviceConfigs[0]?.stream_channel,
            options: stream_channel,
            width: "120px",
            onChange: handleUpdateStreamChannel,
          },
        ]
      : []),
  ];

  //const [url, setUrl] = useState(deviceConfigs[0]?.youtube_url || "");
  const [formats, setFormats] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleRequestClick = async () => {
    if (!deviceConfigs[0]?.stream_url) {
      alert("Bitte geben Sie eine gültige YouTube-URL ein.");
      return;
    }
    setFormats([]);
    setLoading(true);
    try {
      const response = await fetch(
        `${baseURL}api/youtube?url=${encodeURIComponent(
          deviceConfigs[0]?.stream_url
        )}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error("Netzwerkantwort war nicht ok");
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Die Antwort von der API ist kein Array.");
      }

      const formattedOptions = data
        .map((formatString) => {
          if (typeof formatString !== "string") {
            console.warn(
              "Ein Formatstring ist kein gültiger String:",
              formatString
            );
            return null;
          }

          const parts = formatString.split(" - ");

          if (parts.length < 4) {
            return null;
          }

          // ID und Details extrahieren
          const idPart = parts[0].split(":")[0].trim();
          const valueNumber = parts[0].split(":")[1].trim();
          const resolutionDetails = parts.slice(1).join(" - ");

          return {
            value: idPart,
            label: `${resolutionDetails}`,
          };
        })
        .filter(Boolean);

      setFormats(formattedOptions);
      setLoading(false);
    } catch (error) {
      console.error("Es gab ein Problem mit der Anfrage:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (deviceConfigs[0]?.stream_url) {
      handleRequestClick();
    }
  }, []);

  return (
    <>
      <Row style={{ display: "flex", alignItems: "stretch" }}>
        {cardItemsSelect.map((item, index) => (
          <CardWithSelect
            key={index}
            item={item}
            deviceConfigs={deviceConfigs[0]}
            width={item.width}
          />
        ))}
        {deviceConfigs[0]?.stream_source === "youtube" && (
          <>
            <CardWithInput
              item={{
                title: "YouTube-URL",
                tooltip:
                  "Die URL des YouTube-Videos, das als Quelle für den Videostream verwendet werden soll. Live-Streams werden unterstützt.",
                value: deviceConfigs[0]?.stream_url,
                placeholder: "https://www.youtube.com/watch?v=...",
                addonAfter: (
                  <Button
                    type="primary"
                    onClick={handleRequestClick}
                    loading={loading}
                  >
                    Anfragen
                  </Button>
                ),
              }}
              onInputChange={(e) => {
                const newUrl = e.target.value;
                //setUrl(newUrl);
                // handleUpdateStreamUrl mit configId aufrufen
                handleUpdateStreamUrl(deviceConfigs[0]?.id, newUrl);
              }}
              width="100%"
            />

            <CardWithSelect
              item={{
                title: "Quellauflösung",
                options: formats,
                width: "160px",
                default: formats[formats.length - 1]?.value,
                onChange: handleUpdateStreamUrlResolution, // TODO: ungenutzt?
                value: formats.find(
                  (format) =>
                    format.value === deviceConfigs[0]?.stream_url_resolution
                )?.value,
              }}
              deviceConfigs={deviceConfigs[0]}
              onInputChange={(e) => {
                handleUpdateStreamUrl(deviceConfigs[0]?.id, e.target.value);
              }}
              width="160px"
            />
          </>
        )}
      </Row>
    </>
  );
};

export default SectionVideo;
