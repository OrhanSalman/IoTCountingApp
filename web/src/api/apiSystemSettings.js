import { message } from "antd";
//import { useCookies } from "react-cookie";
import baseURL from "./baseUrl";
import errorHandler from "./utils/errorHandler";

const postSystemSettings = async (data) => {
  try {
    const response = await fetch(`${baseURL}api/systemsettings`, {
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
      "Beim Speichern der Systemeinstellungen ist ein Fehler aufgetreten."
    );
  }
};

const getSystemSettings = async () => {
  try {
    const response = await fetch(`${baseURL}api/systemsettings`, {
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
    message.error(
      "Beim Laden der Systemeinstellungen ist ein Fehler aufgetreten."
    );
  }
};

export { postSystemSettings, getSystemSettings };
