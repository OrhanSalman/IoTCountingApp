import React, {
  createContext,
  useReducer,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { message } from "antd";
import errorHandler from "./utils/errorHandler";

import baseURL from "./baseUrl";

export const DeviceContext = createContext();

const initialState = {
  data: [],
  counts: [],
  tracking: [],
  times: [],
  user: {},
  originalData: [],
  isModified: false,
  isCamModified: false,
  image: null,
  logs: [],
  health: {},
  benchmarks: [],
  simulations: [],
  simulation_images: [],
  sessions: [],
  loading: false,
  loadingLogs: false,
  error: null,
};

// TODO: brauche ich das noch?
const updateNestedObject = (obj, path, value) => {
  if (path.length === 0) return value;
  const [head, ...rest] = path;

  // Handle arrays properly
  if (Array.isArray(obj)) {
    const index = parseInt(head, 10);
    if (isNaN(index)) {
      throw new Error(`Invalid array index: ${head}`);
    }
    const updatedArray = [...obj];
    updatedArray[index] = updateNestedObject(obj[index], rest, value);
    return updatedArray;
  }

  // If obj is not an array, treat it as an object
  return {
    ...obj,
    [head]: updateNestedObject(obj ? obj[head] : {}, rest, value),
  };
};

function reducer(state, action) {
  switch (action.type) {
    case "FETCH_INIT":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return {
        ...state,
        loading: false,
        data: action.payload,
        originalDevice: action.payload,
        isModified: false,
      };
    case "FETCH_FAILURE":
      return { ...state, loading: false, error: action.error };

    // IMAGE
    case "FETCH_IMAGE_INIT":
      return { ...state, loading: true, error: null };
    case "FETCH_IMAGE_SUCCESS":
      return { ...state, loading: false, image: action.payload };
    case "FETCH_IMAGE_FAILURE":
      return { ...state, loading: false, error: action.error };

    // LOGS
    case "FETCH_LOGS_INIT":
      return { ...state, loadingLogs: true, error: null };
    case "FETCH_LOGS_SUCCESS":
      return { ...state, loadingLogs: false, logs: action.payload };
    case "FETCH_LOGS_FAILURE":
      return { ...state, loadingLogs: false, error: action.error };

    // HEALTH
    case "FETCH_HEALTH_INIT":
      return { ...state, loading: false, error: null };
    case "FETCH_HEALTH_SUCCESS":
      return { ...state, loading: false, health: action.payload }; // TODO: in allen success error
    case "FETCH_HEALTH_FAILURE":
      return { ...state, loading: false, error: action.error };

    // BENCHMARKS
    case "FETCH_BENCHMARKS_INIT":
      return { ...state, loading: true, error: null };
    case "FETCH_BENCHMARKS_SUCCESS":
      return { ...state, loading: false, benchmarks: action.payload };
    case "FETCH_BENCHMARKS_FAILURE":
      return { ...state, loading: false, error: action.error };

    // SIMULATION VIDEOS
    case "FETCH_SIMULATIONS_INIT":
      return { ...state, loading: true, error: null };
    case "FETCH_SIMULATIONS_SUCCESS":
      return { ...state, loading: false, simulations: action.payload };
    case "FETCH_SIMULATIONS_FAILURE":
      return { ...state, loading: false, error: action.error };

    // SIMULATION IMAGES
    case "FETCH_SIMULATION_IMAGES_INIT":
      return { ...state, loading: true, error: null };
    case "FETCH_SIMULATION_IMAGES_SUCCESS":
      return { ...state, loading: false, simulation_images: action.payload };
    case "FETCH_SIMULATION_IMAGES_FAILURE":
      return { ...state, loading: false, error: action.error };

    // COUNTS
    case "FETCH_COUNTSDATA_INIT":
      return { ...state, loading: true, error: null };
    case "FETCH_COUNTSDATA_SUCCESS":
      return { ...state, loading: false, counts: action.payload };
    case "FETCH_COUNTSDATA_FAILURE":
      return { ...state, loading: false, error: action.error };

    // TRACKING
    case "FETCH_TRACKINGDATA_INIT":
      return { ...state, loading: true, error: null };
    case "FETCH_TRACKINGDATA_SUCCESS":
      return { ...state, loading: false, tracking: action.payload };
    case "FETCH_TRACKINGDATA_FAILURE":
      return { ...state, loading: false, error: action.error };

    // TIMES
    case "FETCH_TIMESDATA_INIT":
      return { ...state, loading: true, error: null };
    case "FETCH_TIMESDATA_SUCCESS":
      return { ...state, loading: false, times: action.payload };
    case "FETCH_TIMESDATA_FAILURE":
      return { ...state, loading: false, error: action.error };

    case "FETCH_SESSIONSDATA_INIT":
      return { ...state, loading: true, error: null };
    case "FETCH_SESSIONSDATA_SUCCESS":
      return { ...state, loading: false, sessions: action.payload };
    case "FETCH_SESSIONSDATA_FAILURE":
      return { ...state, loading: false, error: action.error };

    // UPDATE CONFIG
    case "UPDATE_CONFIG_INIT":
      return { ...state, loading: true, error: null };
    case "UPDATE_CONFIG_SUCCESS":
      return {
        ...state,
        loading: false,
        data: action.payload,
        originalDevice: action.payload,
        isModified: false,
      };
    case "UPDATE_CONFIG_FAILURE":
      return { ...state, loading: false, error: action.error };

    // FETCH USER
    case "FETCH_USER_INIT":
      return { ...state, loading: false, error: null };
    case "FETCH_USER_SUCCESS":
      return { ...state, loading: false, user: action.payload };
    case "FETCH_USER_FAILURE":
      return { ...state, loading: false, error: action.error };

    // LOCAL UPDATE TO STORAGE
    case "LOCAL_UPDATE_DEVICE":
      const updatedState = {
        ...state,
        data: updateNestedObject(state.data, action.path, action.payload),
        loading: false,
        isModified: true,
      };
      return updatedState;

    case "LOCAL_UPDATE_DEVICE_TAGS":
      const updatedDeviceTags = {
        ...state.data,
        deviceTags: action.payload,
      };

      const newDeviceTagsState = {
        ...state,
        data: updatedDeviceTags,
        isModified: true,
        loading: false,
      };

      return newDeviceTagsState;

    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}

export const DeviceProvider = ({ children }) => {
  const deviceIdRef = useRef(null);
  const userIdRef = useRef(null);
  const [state, dispatch] = useReducer(reducer, initialState);
  //const [cookies] = useCookies([]);

  const fetchConfig = useCallback(async () => {
    dispatch({ type: "FETCH_INIT" });
    try {
      const response = await fetch(`${baseURL}api/config`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          //authorization: `Bearer ${cookies.access_token}`,
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        deviceIdRef.current = data.id;
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } else {
        dispatch({
          type: "FETCH_FAILURE",
          error: `${response.status} ${response.statusText}`,
        });
        errorHandler(response.status, response.statusText);
      }
    } catch (error) {
      const status = error?.status || "Unbekannt";
      const statusText = error?.statusText || "Unbekannter Fehler";
      dispatch({ type: "FETCH_FAILURE", error: statusText });
      errorHandler(status, statusText);
    }
  }, []);

  const fetchImage = useCallback(async (snap = false) => {
    dispatch({ type: "FETCH_IMAGE_INIT" });

    try {
      const response = await fetch(`${baseURL}api/image?snap=${snap}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // authorization: `Bearer ${cookies.access_token}`,
        },
        credentials: "include",
      });

      if (response.ok) {
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        dispatch({ type: "FETCH_IMAGE_SUCCESS", payload: imageUrl });
      } else {
        const result = await response.text();

        dispatch({
          type: "FETCH_IMAGE_FAILURE",
          error: result,
        });
        errorHandler(response.status, result);
      }
    } catch (error) {
      const status = error?.status || "Unbekannt";
      const statusText = error?.message || "Unbekannter Fehler";
      dispatch({
        type: "FETCH_IMAGE_FAILURE",
        error: statusText,
      });
      errorHandler(status, statusText);
    }
  }, []);

  const fetchLogs = useCallback(async (limit = 50) => {
    dispatch({ type: "FETCH_LOGS_INIT" });

    try {
      const response = await fetch(`${baseURL}api/logs?limit=${limit}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          //authorization: `Bearer ${cookies.access_token}`,
        },
        credentials: "include",
      });

      if (response.ok) {
        const logs = await response.json();
        dispatch({ type: "FETCH_LOGS_SUCCESS", payload: logs });
      } else {
        dispatch({
          type: "FETCH_LOGS_FAILURE",
          error: `${response.status} ${response.statusText}`,
        });
        errorHandler(response.status, response.statusText);
      }
    } catch (error) {
      const status = error?.status || "Unbekannt";
      const statusText = error?.statusText || "Unbekannter Fehler";
      dispatch({
        type: "FETCH_LOGS_FAILURE",
        error: statusText,
      });
      errorHandler(status, statusText);
    }
  }, []);

  const fetchHealth = useCallback(async () => {
    dispatch({ type: "FETCH_HEALTH_INIT" });

    try {
      const response = await fetch(`${baseURL}api/health`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          //authorization: `Bearer ${cookies.access_token}`,
        },
        credentials: "include",
      });

      if (response.ok) {
        const healthData = await response.json();
        // TODO: Siehe useEffect TODO. Dispatch nur, wenn sich die Daten geändert haben
        if (JSON.stringify(healthData) !== JSON.stringify(state.health)) {
          dispatch({ type: "FETCH_HEALTH_SUCCESS", payload: healthData });
        }
        //dispatch({ type: "FETCH_HEALTH_SUCCESS", payload: health });
      } else {
        dispatch({
          type: "FETCH_HEALTH_FAILURE",
          error: `${response.status} ${response.statusText}`,
        });
        //errorHandler(response.status, response.statusText);
      }
    } catch (error) {
      const status = error?.status || "Unbekannt";
      const statusText = error?.statusText || "Unbekannter Fehler";
      dispatch({
        type: "FETCH_HEALTH_FAILURE",
        error: statusText,
      });
      //errorHandler(status, statusText);
    }
  }, []);

  const fetchBenchmarks = useCallback(async () => {
    dispatch({ type: "FETCH_BENCHMARKS_INIT" });

    try {
      const response = await fetch(`${baseURL}api/benchmarks`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          //authorization: `Bearer ${cookies.access_token}`,
        },
        credentials: "include",
      });

      if (response.ok) {
        const benchmarks = await response.json();
        dispatch({ type: "FETCH_BENCHMARKS_SUCCESS", payload: benchmarks });
      } else {
        dispatch({
          type: "FETCH_BENCHMARKS_FAILURE",
          error: `${response.status} ${response.statusText}`,
        });
        errorHandler(response.status, response.statusText);
      }
    } catch (error) {
      const status = error?.status || "Unbekannt";
      const statusText = error?.statusText || "Unbekannter Fehler";
      dispatch({
        type: "FETCH_BENCHMARKS_FAILURE",
        error: statusText,
      });
      errorHandler(status, statusText);
    }
  }, []);

  const fetchSimulations = useCallback(async (simType) => {
    let dispatcher = "";
    if (simType === "simvid") {
      dispatcher = "FETCH_SIMULATIONS_";
    } else if (simType === "simimg") {
      dispatcher = "FETCH_SIMULATION_IMAGES_";
    } else {
      message.error("Ungültiger Daten-Typ für die Fetch-Anforderung");
      return;
    }

    dispatch({ type: `${dispatcher}INIT` });

    try {
      const response = await fetch(
        `${baseURL}api/simulations?type=${simType}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            //authorization: `Bearer ${cookies.access_token}`,
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        const simulations = await response.json();
        dispatch({ type: `${dispatcher}SUCCESS`, payload: simulations });
      } else {
        dispatch({
          type: `${dispatcher}FAILURE`,
          error: `${response.status} ${response.statusText}`,
        });
        errorHandler(response.status, response.statusText);
      }
    } catch (error) {
      const status = error?.status || "Unbekannt";
      const statusText = error?.statusText || "Unbekannter Fehler";
      dispatch({
        type: `${dispatcher}FAILURE`,
        error: statusText,
      });
      errorHandler(status, statusText);
    }
  }, []);

  const fetchData = useCallback(async (type, session_id) => {
    dispatch({ type: `FETCH_${type.toUpperCase()}DATA_INIT` });

    try {
      const response = await fetch(
        `${baseURL}api/data?type=${type}&session_id=${session_id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (type === "tracking") {
        }
        dispatch({
          type: `FETCH_${type.toUpperCase()}DATA_SUCCESS`,
          payload: data,
        });
      } else {
        dispatch({
          type: `FETCH_${type.toUpperCase()}DATA_FAILURE`,
          error: `${response.status} ${response.statusText}`,
        });
      }
    } catch (error) {
      const status = error?.status || "Unbekannt";
      const statusText = error?.statusText || "Unbekannter Fehler";
      dispatch({
        type: `FETCH_${type.toUpperCase()}DATA_FAILURE`,
        error: statusText,
      });
      errorHandler(status, statusText);
    }
  }, []);

  const fetchSessionData = useCallback(async () => {
    dispatch({ type: "FETCH_SESSIONSDATA_INIT" });

    try {
      const response = await fetch(`${baseURL}api/sessions`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          //authorization: `Bearer ${cookies.access_token}`,
        },
        credentials: "include",
      });

      if (response.ok) {
        const sessions = await response.json();
        dispatch({ type: "FETCH_SESSIONSDATA_SUCCESS", payload: sessions });
      } else {
        dispatch({
          type: "FETCH_SESSIONSDATA_FAILURE",
          error: `${response.status} ${response.statusText}`,
        });
        errorHandler(response.status, response.statusText);
      }
    } catch (error) {
      const status = error?.status || "Unbekannt";
      const statusText = error?.statusText || "Unbekannter Fehler";
      dispatch({
        type: "FETCH_SESSIONSDATA_FAILURE",
        error: statusText,
      });
      errorHandler(status, statusText);
    }
  }, []);

  const updateData = useCallback(async () => {
    dispatch({ type: "UPDATE_CONFIG_INIT" });

    try {
      const response = await fetch(`${baseURL}api/config`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          //authorization: `Bearer ${cookies.access_token}`,
        },
        credentials: "include",
        body: JSON.stringify(state.data),
      });

      if (response.ok) {
        dispatch({ type: "UPDATE_CONFIG_SUCCESS", payload: state.data });
        message.success("Konfiguration erfolgreich gespeichert");
        return response;
      } else {
        const errorText = await response.text();
        dispatch({
          type: "UPDATE_CONFIG_FAILURE",
          error: `${response.status} ${errorText}`,
        });
        errorHandler(response.status, errorText);
        return response;
      }
    } catch (error) {
      dispatch({
        type: "UPDATE_CONFIG_FAILURE",
        error: error.message || "Unbekannter Fehler",
      });
      errorHandler(error.message || "Unbekannter Fehler");
    }
  }, [state.data]);

  const fetchUserData = useCallback(async () => {
    dispatch({ type: "FETCH_USER_INIT" });
    try {
      const response = await fetch(`${baseURL}api/userinfo`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          //authorization: `Bearer ${cookies.access_token}`,
        },
        credentials: "include",
      });

      if (response.ok) {
        const user = await response.json();
        userIdRef.current = user.id;
        dispatch({ type: "FETCH_USER_SUCCESS", payload: user });
      } else {
        dispatch({
          type: "FETCH_USER_FAILURE",
          error: `${response.status} ${response.statusText}`,
        });
        //errorHandler(response.status, response.statusText);
      }
    } catch (error) {
      const status = error?.status || "Unbekannt";
      const statusText = error?.statusText || "Unbekannter Fehler";
      dispatch({ type: "FETCH_FAILURE", error: statusText });
      //errorHandler(status, statusText);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchConfig(),
          fetchImage(),
          fetchUserData(),
          fetchHealth(),
          fetchBenchmarks(),
          fetchSimulations("simvid"),
          fetchSimulations("simimg"),
          //fetchSimulationImages(),
          //fetchData("counts"),
          //fetchData("tracking"),
          //fetchData("times"),
          fetchLogs(),
          fetchSessionData(),
        ]);
      } catch (error) {
        errorHandler(error.status, error.statusText);
      }
    };

    loadData();
  }, [
    fetchConfig,
    fetchImage,
    fetchLogs,
    fetchUserData,
    fetchHealth,
    fetchSimulations,
    //fetchSimulationImages,
    fetchBenchmarks,
    fetchData,
    fetchSessionData,
  ]);

  /* 
    Dieses useEffect mit Intervall ist ein Indiz dafür, dass dieses API Context nicht geeignet ist
    Denn es sorgt für ständiges re-rendering auf einigen (warum?) Pages
    Redux oder Zustand probieren, heben wir uns mal auf für später
  */
  useEffect(() => {
    const intervalId = setInterval(async () => {
      await fetchHealth();
    }, 3000);

    return () => clearInterval(intervalId);
  }, [fetchHealth]);

  useEffect(() => {
    const userCheckInterval = setInterval(async () => {
      await fetchUserData();
    }, 60000);

    return () => clearInterval(userCheckInterval);
  }, [fetchUserData]);

  return (
    <DeviceContext.Provider
      value={{
        ...state,
        dispatch,
        fetchConfig,
        fetchImage,
        fetchLogs,
        fetchHealth,
        fetchBenchmarks,
        fetchSimulations,
        updateData,
        fetchUserData,
        fetchData,
        fetchSessionData,
      }}
    >
      {children}
    </DeviceContext.Provider>
  );
};
