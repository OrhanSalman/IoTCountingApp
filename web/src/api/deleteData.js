import { message } from "antd";
import baseURL from "./baseUrl";

const deleteData = async (type) => {
  try {
    const response = await fetch(`${baseURL}api/simulations?type=${type}`, {
      method: "DELETE",
      credentials: "include",
    });

    const result = await response.json();

    if (response.ok) {
      message.success(result.message || "Gelöscht.");
    } else {
      message.warning(
        result.message || "Fehler beim löschen der Simulationen."
      );
    }
  } catch (error) {
    message.error(String(error));
  }
};

export { deleteData };

const deleteBenchmarkData = async () => {
  try {
    const response = await fetch(`${baseURL}api/benchmarks`, {
      method: "DELETE",
      credentials: "include",
    });

    const result = await response.json();

    if (response.ok) {
      message.success(result.message || "Gelöscht.");
    } else {
      message.warning(result.message || "Fehler beim löschen der Benchmarks.");
    }
  } catch (error) {
    message.error(String(error));
  }
};

export { deleteBenchmarkData };
