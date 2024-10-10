import { message } from "antd";
import baseURL from "./baseUrl";

const runCommand = async (action, target, params = {}) => {
  try {
    const response = await fetch(`${baseURL}api/action`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        action,
        target,
        params,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      if (result.message[0] === true || result.message === true) {
        message.success(result.message[1] || "Befehl ausgeführt.");
        return true;
      } else if (result.message[0] === false) {
        message.warning(
          result.message[1] || "Warnung: Aktion nicht erfolgreich."
        );
      } else {
        message.error("Unbekannter Fehler aufgetreten.");
      }
    } else {
      message.error(
        result.error || "An error occurred while executing the command."
      );
    }
  } catch (error) {
    console.error(error);
    message.error("Netzwerkfehler: Bitte versuchen Sie es später erneut.");
  }
};

export default runCommand;
