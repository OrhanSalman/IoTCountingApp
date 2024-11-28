import React, { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  DatePicker,
  TimePicker,
  Select,
  Button,
  Tooltip,
  Divider,
  message,
  Alert,
} from "antd";
import { ExportOutlined, ReloadOutlined } from "@ant-design/icons";
import { DeviceContext } from "../../../api/DeviceContext";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import dayjs from "dayjs";

const { Option } = Select;

const DataControls = () => {
  const { health, sessions, counts, tracking, times, loading, fetchData } =
    useContext(DeviceContext);
  const location = useLocation();
  const type = location.pathname.split("/").pop();
  const [startDate, setStartDate] = useState(dayjs());
  const [endDate, setEndDate] = useState(dayjs());
  const [startTime, setStartTime] = useState(dayjs("00:00:00", "HH:mm:ss"));
  const [endTime, setEndTime] = useState(dayjs("23:59:59", "HH:mm:ss"));
  const [exportFormat, setExportFormat] = useState("csv");
  const [dataSource, setDataSource] = useState([]);
  const [startTimeError, setStartTimeError] = useState(false);
  const [endTimeError, setEndTimeError] = useState(false);
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    if (sessions && sessions.sessions && sessions.sessions.length > 0) {
      const maxSession = sessions.sessions.reduce(
        (max, session) =>
          parseInt(session.no, 10) > parseInt(max.no, 10) ? session : max,
        sessions.sessions[0]
      );

      setSessionId(maxSession.id);
    } else {
      setSessionId("");
    }
  }, [sessions]);

  useEffect(() => {
    setStartTimeError(startTime.isAfter(endTime));
    setEndTimeError(endTime.isBefore(startTime));
  }, [startTime, endTime]);

  useEffect(() => {
    const dataMap = { counts, tracking, times };
    setDataSource(dataMap[type]);
  }, [type, counts, tracking, times]);

  const handleExport = () => {
    const fileName = `data_export.${exportFormat}`;

    switch (exportFormat) {
      case "csv":
        const csv = Papa.unparse(dataSource);
        const blobCsv = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        saveAs(blobCsv, fileName);
        break;
      case "json":
        const json = JSON.stringify(dataSource, null, 2);
        const blobJson = new Blob([json], {
          type: "application/json;charset=utf-8;",
        });
        saveAs(blobJson, fileName);
        break;
      case "yaml":
        const yaml = require("js-yaml").dump(dataSource);
        const blobYaml = new Blob([yaml], {
          type: "application/x-yaml;charset=utf-8;",
        });
        saveAs(
          blobYaml,
          fileName.endsWith(".yaml") ? fileName : `${fileName}.yaml`
        );
        break;
      default:
        message.error("Unbekanntes Exportformat.");
        break;
    }
  };

  useEffect(() => {
    handleFetchCounts();
  }, [sessionId]);

  const handleFetchCounts = async () => {
    try {
      const types = ["counts", "tracking", "times"];

      const fetchPromises = types.map((type) => fetchData(type, sessionId));

      await Promise.all(fetchPromises);
    } catch (error) {
      message.error("Fehler beim Abrufen der Daten: " + error);
    }
  };

  return (
    <>
      {!health?.mongo?.connected ? (
        <>
          <Alert
            message="Fehlende MongoDB-Verbindung"
            description="Die Datenbank ist nicht verbunden. Die Daten können nicht abgerufen werden."
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Divider />
        </>
      ) : (
        <>
          <Divider />
          <div
            style={{ display: "flex", alignItems: "center", marginBottom: 16 }}
          >
            <Select
              placeholder="Session"
              style={{ width: "100%", marginRight: 16 }}
              onChange={(value) => {
                setSessionId(value);
              }}
              value={sessionId}
            >
              {sessions?.sessions?.map((session) => {
                // Berechne die Gesamtzahl der Dokumente
                const totalDocuments =
                  session.collections.counts.documents +
                  session.collections.times.documents +
                  session.collections.tracking.documents;

                return (
                  <Option key={session.id}>
                    {`${session.no}.`} &nbsp;&nbsp;&nbsp;&nbsp;
                    {`Gestartet: ${session.start}`} &nbsp;&nbsp;&nbsp;&nbsp;
                    {session.end ? (
                      `Beendet: ${session.end}`
                    ) : (
                      <span style={{ color: "green" }}>Aktiv</span>
                    )}{" "}
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    {`Routen: `}
                    <span
                      style={{
                        color: session.types.tracking ? "green" : "red",
                      }}
                    >
                      {session.types.tracking ? "Ja" : "Nein"}
                    </span>
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    {`Zeiten: `}
                    <span
                      style={{ color: session.types.times ? "green" : "red" }}
                    >
                      {session.types.times ? "Ja" : "Nein"}
                    </span>
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    {`Dokumente: ${totalDocuments}`}
                  </Option>
                );
              })}
            </Select>
          </div>
          <div
            style={{ display: "flex", alignItems: "center", marginBottom: 16 }}
          >
            <DatePicker
              allowClear={false}
              style={{ marginRight: 16 }}
              placeholder="Startdatum"
              onChange={(date) => setStartDate(date)}
              value={startDate}
              minDate={dayjs("2024-10-10")} // TODO:
              maxDate={dayjs()} // TODO:
              disabled
            />
            <DatePicker
              allowClear={false}
              style={{ marginRight: 16 }}
              placeholder="Enddatum"
              onChange={(date) => setEndDate(date)}
              value={endDate}
              minDate={dayjs("2024-10-12")} // TODO:
              maxDate={dayjs()} // TODO
              disabled
            />
            <TimePicker
              allowClear={false}
              style={{ marginRight: 16 }}
              placeholder="Startzeit"
              onChange={(time) => setStartTime(time)}
              value={startTime}
              status={startTimeError ? "error" : undefined}
              format="HH:mm:ss"
              disabled
            />
            <TimePicker
              allowClear={false}
              style={{ marginRight: 16 }}
              placeholder="Endzeit"
              onChange={(time) => setEndTime(time)}
              value={endTime}
              status={endTimeError ? "error" : undefined}
              format="HH:mm:ss"
              disabled
            />
            <Select
              placeholder="Exportformat"
              style={{ width: 80, marginRight: 16 }}
              onChange={(value) => setExportFormat(value)}
              defaultValue={exportFormat}
            >
              <Option value="csv">CSV</Option>
              <Option value="json">JSON</Option>
              <Option value="yaml">YAML</Option>
            </Select>
            <Tooltip title="Exportieren">
              <Button
                type="primary"
                icon={<ExportOutlined />}
                onClick={handleExport}
                style={{ marginRight: 16 }}
              />
            </Tooltip>
            <Tooltip title="Aktualisieren">
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={handleFetchCounts}
                disabled={startTimeError || endTimeError}
                loading={loading}
              />
            </Tooltip>
          </div>
          <Divider />
        </>
      )}
    </>
  );
};

export default DataControls;
