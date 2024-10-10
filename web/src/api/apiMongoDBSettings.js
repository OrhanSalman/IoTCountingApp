import { message } from "antd";
import baseURL from "./baseUrl";
import errorHandler from "./utils/errorHandler";

const postMongoDBSettings = async (data) => {
  try {
    const response = await fetch(`${baseURL}api/mongo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (response.ok) {
      message.success(result.message || "Gespeichert.");
    } else {
      errorHandler(response.status, result.error);
    }
  } catch (error) {
    // Hier wird der Fehler im Fetch-Aufruf behandelt
    const status = error?.status || "Unbekannt";
    const statusText = error?.message || "Unbekannter Fehler";
    errorHandler(status, statusText);
  }
};

const deleteMongoDBSettings = async () => {
  try {
    const response = await fetch(`${baseURL}api/mongo`, {
      method: "DELETE",
      credentials: "include",
    });

    const result = await response.json();

    if (response.ok) {
      message.success(result.message || "Gelöscht.");
    } else {
      errorHandler(response.status, result.error);
    }
  } catch (error) {
    message.error("An error occurred while deleting the settings.");
    errorHandler(error.status, error.message);
  }
};

const getMongoDBSettings = async () => {
  try {
    const response = await fetch(`${baseURL}api/mongo`, {
      method: "GET",
      credentials: "include",
    });

    const result = await response.json();

    if (response.ok) {
      return result;
    } else {
      //errorHandler(response.status, result.error);
      return null;
    }
  } catch (error) {
    message.error("Fehler beim laden der MQTT-Einstellungen: " + error.message);
  }
};

export { postMongoDBSettings, deleteMongoDBSettings, getMongoDBSettings };
