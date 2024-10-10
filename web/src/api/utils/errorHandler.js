import React from "react";
import { message } from "antd";

const errorHandler = (error, detail = "") => {
  const response = error;
  switch (error) {
    case 400:
      message.error(
        `400: ${detail || "Bad Request: Die Anfrage war fehlerhaft."}`
      );
      break;
    case 401:
      message.error(
        `401: ${
          detail ||
          "Unauthorized: Nicht autorisiert, um die angeforderte Aktion auszuführen."
        }`
      );
      break;
    case 403:
      message.error(
        `403: ${
          detail ||
          "Forbidden: Der Zugriff auf die angeforderten Ressourcen ist untersagt."
        }`
      );
      break;
    case 404:
      message.error(
        `404: ${
          detail ||
          "Not Found: Die angeforderte Ressource wurde nicht gefunden."
        }`
      );
      break;
    case 500:
      message.error(
        `500: ${
          detail ||
          "Internal Server Error: Ein interner Serverfehler ist aufgetreten."
        }`
      );
      break;
    case 502:
      message.error(
        `502: ${
          detail ||
          "Bad Gateway: Der Server hat eine ungültige Antwort von einem anderen Server oder Proxy erhalten."
        }`
      );
      break;
    case 503:
      message.error(
        `503: ${
          detail ||
          "Service Unavailable: Der Server ist vorübergehend nicht verfügbar."
        }`
      );
      break;
    default:
      message.error(
        response?.statusText || response?.message || "Unbekannter Fehler"
      );
  }
};

export default errorHandler;
