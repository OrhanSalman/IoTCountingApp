import React, {
  createContext,
  useReducer,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { message } from "antd";
import errorHandler from "./utils/errorHandler";
import {
  getSessionStorage,
  setSessionStorage,
  removeSessionStorage,
} from "../helper/sessionStorage";
import baseURL from "./baseUrl";

export const DeviceContext = createContext();

const initialState = {
  data: [],
  counts: {},
  user: {},
  originalData: [],
  isModified: false,
  isCamModified: false,
  loadedFromSession: false,
  image: null,
  logs: [],
  health: {},
  benchmarks: [],
  simulations: [],
  simulation_images: [],
  loading: false,
  loadingLogs: false,
  error: null,
};

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

// TODO: sehr redundant, sollte vereinfacht werden
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
      return {
        ...state,
        loading: false,
        error: null,
      };
    case "FETCH_HEALTH_SUCCESS":
      return {
        ...state,
        loading: false,
        health: action.payload,
      };
    case "FETCH_HEALTH_FAILURE":
      return {
        ...state,
        loading: false,
        error: action.error,
      };

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
    case "FETCH_COUNTS_INIT":
      return { ...state, loading: true, error: null };
    case "FETCH_COUNTS_SUCCESS":
      return { ...state, loading: false, counts: action.payload };
    case "FETCH_COUNTS_FAILURE":
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
      return { ...state, loading: true, error: null };
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
      setSessionStorage(`device_${action.deviceId}`, updatedState.data);
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

      setSessionStorage(`device_${action.deviceId}`, newDeviceTagsState.data);
      return newDeviceTagsState;

    // SESSION STORAGE
    case "LOAD_FROM_SESSION_STORAGE":
      const sessionData = getSessionStorage(`device_${action.deviceId}`);
      return {
        ...state,
        data: sessionData || state.data,
        isModified: !!sessionData,
        loadedFromSession: !!sessionData,
      };
    case "LOAD_FROM_SESSION_STORAGE_SUCCESS":
      return {
        ...state,
        data: action.payload,
        benchmarks: action.payload.benchmarks,
        health: action.payload.health,
        logs: action.payload.logs,
        image: action.payload.image,
        isModified: true,
        error: null,
        loadedFromSession: true,
      };
    case "LOAD_FROM_SESSION_STORAGE_FAILURE":
      return { ...state, error: action.error, loadedFromSession: false };
    case "SAVE_TO_SESSION_STORAGE":
      setSessionStorage(`device_${action.deviceId}`, state.data);
      return state;
    case "REMOVE_FROM_SESSION_STORAGE":
      removeSessionStorage(`device_${action.deviceId}`);
      return state;
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}

export const DeviceProvider = ({ children }) => {
  const deviceIdRef = useRef(null);
  const userIdRef = useRef(null);
  const [state, dispatch] = useReducer(reducer, initialState);
  //const [cookies] = useCookies([]);

  const fetchData = useCallback(async () => {
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
        dispatch({
          type: "REMOVE_FROM_SESSION_STORAGE",
          deviceId: deviceIdRef.current,
        });
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
        const health = await response.json();
        dispatch({ type: "FETCH_HEALTH_SUCCESS", payload: health });
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

  /*
  const fetchSimulationImages = useCallback(async () => {


    dispatch({ type: "FETCH_SIMULATION_IMAGES_INIT" });

    try {
      const response = await fetch(`${baseURL}api/simulation_images`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "authorization": `Bearer ${cookies.access_token}`,
        },
        credentials: "include",
      });

      if (response.ok) {
        const simulation_images = await response.json();
        dispatch({
          type: "FETCH_SIMULATION_IMAGES_SUCCESS",
          payload: simulation_images,
        });
      } else {
        dispatch({
          type: "FETCH_SIMULATION_IMAGES_FAILURE",
          error: `${response.status} ${response.statusText}`,
        });
        errorHandler(response.status, response.statusText);
      }
    } catch (error) {
      const status = error?.status || "Unbekannt";
      const statusText = error?.statusText || "Unbekannter Fehler";
      dispatch({
        type: "FETCH_SIMULATION_IMAGES_FAILURE",
        error: statusText,
      });
      errorHandler(status, statusText);
    }
  }, []);
*/

  const fetchCounts = useCallback(async (date, startTime, endTime) => {
    if (!date) {
      date = new Date().toISOString().split("T")[0];
    }

    if (!startTime) {
      startTime = "00-00-00";
    }

    if (!endTime) {
      endTime = "23-59-59";
    }

    dispatch({ type: "FETCH_COUNTS_INIT" });

    try {
      const response = await fetch(
        `${baseURL}api/counts?date=${date}&startTime=${startTime}&endTime=${endTime}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        const counts = await response.json();
        dispatch({ type: "FETCH_COUNTS_SUCCESS", payload: counts });
      } else {
        dispatch({
          type: "FETCH_COUNTS_FAILURE",
          error: `${response.status} ${response.statusText}`,
        });
      }
    } catch (error) {
      const status = error?.status || "Unbekannt";
      const statusText = error?.statusText || "Unbekannter Fehler";
      dispatch({
        type: "FETCH_COUNTS_FAILURE",
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
        dispatch({
          type: "REMOVE_FROM_SESSION_STORAGE",
          deviceId: deviceIdRef.current,
        });
        return response;
      } else {
        const errorText = await response.text(); // Fehler als Text parsen
        dispatch({
          type: "UPDATE_CONFIG_FAILURE",
          error: `${response.status} ${errorText}`,
        });
        errorHandler(response.status, errorText); // Den Text anzeigen
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
        errorHandler(response.status, response.statusText);
      }
    } catch (error) {
      const status = error?.status || "Unbekannt";
      const statusText = error?.statusText || "Unbekannter Fehler";
      dispatch({ type: "FETCH_FAILURE", error: statusText });
      errorHandler(status, statusText);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Check if the data is already in the session storage
        const sessionData = getSessionStorage(`device_${deviceIdRef.current}`);
        if (sessionData) {
          // Load data from session storage if available
          dispatch({
            type: "LOAD_FROM_SESSION_STORAGE_SUCCESS",
            payload: sessionData,
          });

          // Fetch the image (and any other tasks that always need to run)
          await Promise.all([fetchImage()]);
        } else {
          // Fetch data and the image if session storage is empty
          await Promise.all([
            fetchData(),
            fetchImage(),
            fetchUserData(),
            fetchHealth(),
            fetchBenchmarks(),
            fetchSimulations("simvid"),
            fetchSimulations("simimg"),
            //fetchSimulationImages(),
            fetchCounts(),
            fetchLogs(),
          ]);
        }
      } catch (error) {
        dispatch({ type: "LOAD_FROM_SESSION_STORAGE_FAILURE", error });
        errorHandler(error.status, error.statusText);
      }
    };

    loadData();
  }, [
    fetchData,
    fetchImage,
    fetchLogs,
    fetchUserData,
    fetchHealth,
    fetchSimulations,
    //fetchSimulationImages,
    fetchBenchmarks,
    fetchCounts,
  ]);

  useEffect(() => {
    if (state.isModified && deviceIdRef.current) {
      dispatch({
        type: "SAVE_TO_SESSION_STORAGE",
        deviceId: deviceIdRef.current,
      });
    }
  }, [state.isModified, state.image]);

  useEffect(() => {
    const interval = setInterval(async () => {
      await fetchHealth();
    }, 3000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  return (
    <DeviceContext.Provider
      value={{
        ...state,
        dispatch,
        fetchData,
        fetchImage,
        fetchLogs,
        fetchHealth,
        fetchBenchmarks,
        fetchSimulations,
        //fetchSimulationImages,
        updateData,
        fetchUserData,
        fetchCounts,
      }}
    >
      {children}
    </DeviceContext.Provider>
  );
};
