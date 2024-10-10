import { message } from "antd";
import baseURL from "./baseUrl";
import errorHandler from "./utils/errorHandler";

const postMQTTSettings = async (data) => {
  try {
    const response = await fetch(`${baseURL}api/mqtt`, {
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
    message.error(
      "Beim Speichern der MQTT-Einstellungen ist ein Fehler aufgetreten."
    );
  }
};

const deleteMQTTSettings = async () => {
  try {
    const response = await fetch(`${baseURL}api/mqtt`, {
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
    message.error(
      "Beim Löschen der MQTT-Einstellungen ist ein Fehler aufgetreten."
    );
  }
};

const getMQTTSettings = async () => {
  try {
    const response = await fetch(`${baseURL}api/mqtt`, {
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

export { postMQTTSettings, deleteMQTTSettings, getMQTTSettings };
