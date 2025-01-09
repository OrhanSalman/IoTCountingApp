import { useCallback, useContext } from "react";
import { DeviceContext } from "../../../../api/DeviceContext";

export const useUpdateHandler = () => {
  const { data, dispatch } = useContext(DeviceContext);

  const handleSelectedTagsChange = useCallback(
    (selectedTags) => {
      const updatedDeviceTags = [
        {
          tags: selectedTags,
        },
      ];

      const updatedDevice = {
        ...data,
        deviceTags: updatedDeviceTags,
      };

      dispatch({
        type: "LOCAL_UPDATE_DEVICE_TAGS",
        path: ["deviceTags"],
        payload: updatedDevice.deviceTags,
      });
    },
    [data, dispatch]
  );

  const handleUpdateModel = useCallback(
    (configId, model) => {
      const updatedDeviceConfigs = data?.deviceConfigs?.map((deviceConfig) =>
        deviceConfig?.id === configId
          ? { ...deviceConfig, model: model }
          : deviceConfig
      );
      dispatch({
        type: "LOCAL_UPDATE_DEVICE",
        path: ["deviceConfigs"],
        payload: updatedDeviceConfigs,
      });
    },
    [data, dispatch]
  );

  const handleUpdateFormat = useCallback(
    (configId, modelFormat) => {
      const updatedDeviceConfigs = data?.deviceConfigs?.map((deviceConfig) =>
        deviceConfig?.id === configId
          ? { ...deviceConfig, modelFormat: modelFormat }
          : deviceConfig
      );
      dispatch({
        type: "LOCAL_UPDATE_DEVICE",
        path: ["deviceConfigs"],
        payload: updatedDeviceConfigs,
      });
    },
    [data, dispatch]
  );

  const handleUpdateDeviceType = useCallback(
    (configId, deviceType) => {
      const updatedDeviceConfigs = data?.deviceConfigs?.map((deviceConfig) =>
        deviceConfig?.id === configId
          ? { ...deviceConfig, deviceType: deviceType }
          : deviceConfig
      );
      dispatch({
        type: "LOCAL_UPDATE_DEVICE",
        path: ["deviceConfigs"],
        payload: updatedDeviceConfigs,
      });
    },
    [data, dispatch]
  );

  const handleUpdateImgsz = useCallback(
    (configId, imgsz) => {
      const updatedDeviceConfigs = data?.deviceConfigs?.map((deviceConfig) =>
        deviceConfig?.id === configId
          ? { ...deviceConfig, imgsz: imgsz }
          : deviceConfig
      );
      dispatch({
        type: "LOCAL_UPDATE_DEVICE",
        path: ["deviceConfigs"],
        payload: updatedDeviceConfigs,
      });
    },
    [data, dispatch]
  );

  const handleUpdatePrecision = useCallback(
    (configId, quantization) => {
      const updatedDeviceConfigs = data?.deviceConfigs?.map((deviceConfig) =>
        deviceConfig?.id === configId
          ? { ...deviceConfig, quantization: quantization }
          : deviceConfig
      );
      dispatch({
        type: "LOCAL_UPDATE_DEVICE",
        path: ["deviceConfigs"],
        payload: updatedDeviceConfigs,
      });
    },
    [data, dispatch]
  );

  const handleUpdateIOU = useCallback(
    (configId, iou) => {
      const updatedDeviceConfigs = data?.deviceConfigs?.map((deviceConfig) =>
        deviceConfig?.id === configId
          ? { ...deviceConfig, iou: iou }
          : deviceConfig
      );
      dispatch({
        type: "LOCAL_UPDATE_DEVICE",
        path: ["deviceConfigs"],
        payload: updatedDeviceConfigs,
      });
    },
    [data, dispatch]
  );

  const handleUpdateConf = useCallback(
    (configId, conf) => {
      const updatedDeviceConfigs = data?.deviceConfigs?.map((deviceConfig) =>
        deviceConfig?.id === configId
          ? { ...deviceConfig, conf: conf }
          : deviceConfig
      );
      dispatch({
        type: "LOCAL_UPDATE_DEVICE",
        path: ["deviceConfigs"],
        payload: updatedDeviceConfigs,
      });
    },
    [data, dispatch]
  );

  const handleUpdateConfigName = useCallback(
    (configId, configName) => {
      const updatedDeviceConfigs = data?.deviceConfigs?.map((deviceConfig) =>
        deviceConfig?.id === configId
          ? { ...deviceConfig, configName: configName }
          : deviceConfig
      );
      dispatch({
        type: "LOCAL_UPDATE_DEVICE",
        path: ["deviceConfigs"],
        payload: updatedDeviceConfigs,
      });
    },
    [data, dispatch]
  );

  const handleUpdateMaxDet = useCallback(
    (configId, max_det) => {
      const updatedDeviceConfigs = data?.deviceConfigs?.map((deviceConfig) =>
        deviceConfig?.id === configId
          ? { ...deviceConfig, max_det: max_det }
          : deviceConfig
      );
      dispatch({
        type: "LOCAL_UPDATE_DEVICE",
        path: ["deviceConfigs"],
        payload: updatedDeviceConfigs,
      });
    },
    [data, dispatch]
  );

  const handleUpdateVidStride = useCallback(
    (configId, vid_stride) => {
      const updatedDeviceConfigs = data?.deviceConfigs?.map((deviceConfig) =>
        deviceConfig?.id === configId
          ? { ...deviceConfig, vid_stride: vid_stride }
          : deviceConfig
      );
      dispatch({
        type: "LOCAL_UPDATE_DEVICE",
        path: ["deviceConfigs"],
        payload: updatedDeviceConfigs,
      });
    },
    [data, dispatch]
  );

  const handleUpdateStreamBuffer = useCallback(
    (configId, stream_buffer) => {
      const updatedDeviceConfigs = data?.deviceConfigs?.map((deviceConfig) =>
        deviceConfig?.id === configId
          ? { ...deviceConfig, stream_buffer: stream_buffer }
          : deviceConfig
      );
      dispatch({
        type: "LOCAL_UPDATE_DEVICE",
        path: ["deviceConfigs"],
        payload: updatedDeviceConfigs,
      });
    },
    [data, dispatch]
  );

  const handleUpdateStreamResolution = useCallback(
    (configId, stream_resolution) => {
      const updatedDeviceConfigs = data?.deviceConfigs?.map((deviceConfig) =>
        deviceConfig?.id === configId
          ? { ...deviceConfig, stream_resolution: stream_resolution }
          : deviceConfig
      );
      dispatch({
        type: "LOCAL_UPDATE_DEVICE",
        path: ["deviceConfigs"],
        payload: updatedDeviceConfigs,
      });
    },
    [data, dispatch]
  );

  const handleUpdateStreamFps = useCallback(
    (configId, stream_fps) => {
      const updatedDeviceConfigs = data?.deviceConfigs?.map((deviceConfig) =>
        deviceConfig?.id === configId
          ? { ...deviceConfig, stream_fps: stream_fps }
          : deviceConfig
      );
      dispatch({
        type: "LOCAL_UPDATE_DEVICE",
        path: ["deviceConfigs"],
        payload: updatedDeviceConfigs,
      });
    },
    [data, dispatch]
  );

  const handleUpdateStreamChannel = useCallback(
    (configId, stream_channel) => {
      const updatedDeviceConfigs = data?.deviceConfigs?.map((deviceConfig) =>
        deviceConfig?.id === configId
          ? { ...deviceConfig, stream_channel: stream_channel }
          : deviceConfig
      );
      dispatch({
        type: "LOCAL_UPDATE_DEVICE",
        path: ["deviceConfigs"],
        payload: updatedDeviceConfigs,
      });
    },
    [data, dispatch]
  );

  const handleUpdateStreamSource = useCallback(
    (configId, stream_source) => {
      const updatedDeviceConfigs = data?.deviceConfigs?.map((deviceConfig) => {
        if (deviceConfig?.id === configId) {
          // Wenn stream_source auf "0" gesetzt wird, entfernen wir stream_url und stream_url_resolution
          const updatedConfig = { ...deviceConfig, stream_source };

          if (stream_source === "0") {
            // Felder stream_url und stream_url_resolution vollständig entfernen
            const { stream_url, stream_url_resolution, ...remainingConfig } =
              updatedConfig;
            return remainingConfig;
          }

          return updatedConfig;
        }
        return deviceConfig;
      });

      dispatch({
        type: "LOCAL_UPDATE_DEVICE",
        path: ["deviceConfigs"],
        payload: updatedDeviceConfigs,
      });
    },
    [data, dispatch]
  );

  const handleUpdateTracker = useCallback(
    (configId, tracker) => {
      const updatedDeviceConfigs = data?.deviceConfigs?.map((deviceConfig) =>
        deviceConfig?.id === configId
          ? { ...deviceConfig, tracker: tracker }
          : deviceConfig
      );
      dispatch({
        type: "LOCAL_UPDATE_DEVICE",
        path: ["deviceConfigs"],
        payload: updatedDeviceConfigs,
      });
    },
    [data, dispatch]
  );

  const handleUpdateKeras = useCallback(
    (configId, keras) => {
      const updatedDeviceConfigs = data?.deviceConfigs?.map((deviceConfig) =>
        deviceConfig?.id === configId
          ? { ...deviceConfig, keras: keras }
          : deviceConfig
      );
      dispatch({
        type: "LOCAL_UPDATE_DEVICE",
        path: ["deviceConfigs"],
        payload: updatedDeviceConfigs,
      });
    },
    [data, dispatch]
  );

  const handleUpdateOptimize = useCallback(
    (configId, optimize) => {
      const updatedDeviceConfigs = data?.deviceConfigs?.map((deviceConfig) =>
        deviceConfig?.id === configId
          ? { ...deviceConfig, optimize: optimize }
          : deviceConfig
      );
      dispatch({
        type: "LOCAL_UPDATE_DEVICE",
        path: ["deviceConfigs"],
        payload: updatedDeviceConfigs,
      });
    },
    [data, dispatch]
  );

  const handleUpdateSimplify = useCallback(
    (configId, simplify) => {
      const updatedDeviceConfigs = data?.deviceConfigs?.map((deviceConfig) =>
        deviceConfig?.id === configId
          ? { ...deviceConfig, simplify: simplify }
          : deviceConfig
      );
      dispatch({
        type: "LOCAL_UPDATE_DEVICE",
        path: ["deviceConfigs"],
        payload: updatedDeviceConfigs,
      });
    },
    [data, dispatch]
  );

  const handleUpdateStreamUrl = useCallback(
    (configId, stream_url) => {
      const updatedDeviceConfigs = data?.deviceConfigs?.map((deviceConfig) =>
        deviceConfig?.id === configId
          ? { ...deviceConfig, stream_url: stream_url }
          : deviceConfig
      );
      dispatch({
        type: "LOCAL_UPDATE_DEVICE",
        path: ["deviceConfigs"],
        payload: updatedDeviceConfigs,
      });
    },
    [data, dispatch]
  );

  const handleUpdateStreamUrlResolution = useCallback(
    (configId, stream_url_resolution) => {
      const updatedDeviceConfigs = data?.deviceConfigs?.map((deviceConfig) =>
        deviceConfig?.id === configId
          ? { ...deviceConfig, stream_url_resolution: stream_url_resolution }
          : deviceConfig
      );
      dispatch({
        type: "LOCAL_UPDATE_DEVICE",
        path: ["deviceConfigs"],
        payload: updatedDeviceConfigs,
      });
    },
    [data, dispatch]
  );

  return {
    handleSelectedTagsChange,
    handleUpdateModel,
    handleUpdateFormat,
    handleUpdateDeviceType,
    handleUpdateImgsz,
    handleUpdatePrecision,
    handleUpdateIOU,
    handleUpdateConf,
    handleUpdateConfigName,
    handleUpdateMaxDet,
    handleUpdateVidStride,
    handleUpdateStreamBuffer,
    handleUpdateStreamResolution,
    handleUpdateStreamFps,
    handleUpdateStreamChannel,
    handleUpdateStreamSource,
    handleUpdateTracker,
    handleUpdateKeras,
    handleUpdateOptimize,
    handleUpdateSimplify,
    handleUpdateStreamUrl,
    handleUpdateStreamUrlResolution,
  };
};
