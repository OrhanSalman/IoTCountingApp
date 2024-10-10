import { message } from "antd";
import baseURL from "./baseUrl";

const useHandleLogout = () => {
  const handleLogout = async () => {
    try {
      const response = await fetch(`${baseURL}signout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const logoutUrl = await response.text();
        window.location.href = logoutUrl;
      } else {
        message.error("Fehler beim Abmelden: " + response.statusText);
      }
    } catch (error) {
      message.error("Network error: " + error);
    }
  };

  return handleLogout;
};

export default useHandleLogout;
