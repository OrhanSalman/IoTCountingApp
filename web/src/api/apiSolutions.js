import { message } from "antd";
//import { useCookies } from "react-cookie";
import baseURL from "./baseUrl";
import errorHandler from "./utils/errorHandler";

const getSolutions = async () => {
  try {
    const response = await fetch(`${baseURL}api/solutions`, {
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
    message.error(`Fehler beim laden der Solutions: ${error}`);
  }
};

export { getSolutions };
