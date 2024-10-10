import React, { useContext, useEffect, useState } from "react";
import { Collapse, Button, message } from "antd";
import SectionInference from "../sections/SectionInference";
//import SectionBenchmark from "../sections/SectionBenchmark";
import SectionVideo from "../sections/SectionVideo";
import SectionTags from "../sections/SectionTags";
import SectionImages from "../sections/SectionImages";
import { DeviceContext } from "../../../api/DeviceContext";
import runCommand from "../../../api/runCommand";
import { getSystemSettings } from "../../../api/apiSystemSettings";

const { Panel } = Collapse;

const ConfigView = () => {
  const {
    data,
    health,
    fetchHealth,
    loading,
    fetchImage,
    fetchSimulations,
    //fetchSimulationImages,
  } = useContext(DeviceContext);
  const [blurHumans, setBlurHumans] = useState(true);
  const [customInferenceLoading, setCustomInferenceLoading] = useState(false);

  const [simulationState, setSimulationState] = useState(false);

  const fetchDeviceImage = async () => {
    await fetchImage(true);
  };

  useEffect(() => {
    const fetchSystemSettings = async () => {
      const systemSettings = await getSystemSettings();
      if (systemSettings) {
        setBlurHumans(systemSettings?.blur_humans);
      }
    };

    fetchSystemSettings();
  }, []);

  const handleRunSimulation = async () => {
    const finished = await runCommand("start", "counting", {
      only_simulation: false,
      only_simulation_img: true,
      blur_humans: blurHumans,
    });
    if (finished && !health?.inference?.simulation) {
      await fetchSimulations("simimg");
    }
    setCustomInferenceLoading(false);
    //await fetchHealth();
  };

  //  useEffect(() => {
  //    const checkSimulationState = async () => {
  //      const currentSimulation = health?.inference?.simulation;
  //
  //      if (simulationState && !currentSimulation) {
  //        //await fetchSimulationImages();
  //        await fetchSimulations("simimg");
  //      }
  //
  //      setSimulationState(currentSimulation);
  //    };
  //
  //    checkSimulationState();
  //  }, [health?.inference?.simulation]);

  const panels = [
    {
      header: "Inferenzparameter",
      key: "1",
      content: <SectionInference />,
    },

    {
      header: "Videoparameter",
      key: "2",
      content: <SectionVideo />,
    },
    {
      header: "Tags",
      key: "3",
      content: <SectionTags />,
    },
    {
      header: (
        <span
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          Testläufe
          <div>
            <Button
              type="default"
              loading={loading}
              onClick={(e) => {
                e.stopPropagation();
                fetchDeviceImage();
              }}
              disabled={data?.deviceConfigs?.length === 0}
              style={{ marginRight: 8 }}
            >
              {loading ? "Hole Snap..." : "Neues Bild"}
            </Button>
            <Button
              type="primary"
              onClick={(e) => {
                setCustomInferenceLoading(true);
                e.stopPropagation();
                handleRunSimulation();
              }}
              disabled={
                health?.inference?.status ||
                health?.inference?.simulation ||
                health?.inference?.exporter ||
                customInferenceLoading
              }
              loading={health?.inference?.simulation || customInferenceLoading}
            >
              Ausführen
            </Button>
          </div>
        </span>
      ),
      key: "5",
      content: <SectionImages />,
    },
  ];

  return (
    <Collapse defaultActiveKey={panels.map((panel) => panel.key)}>
      {panels.map((panel) => (
        <Panel header={panel.header} key={panel.key}>
          {panel.content}
        </Panel>
      ))}
    </Collapse>
  );
};

export default ConfigView;
