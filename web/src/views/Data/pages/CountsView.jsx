import React, { useState, useContext, useEffect } from "react";
import {
  Table,
  Select,
  DatePicker,
  TimePicker,
  Button,
  Divider,
  Tooltip,
  message,
} from "antd";
import {
  ExportOutlined,
  QrcodeOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { DeviceContext } from "../../../api/DeviceContext";
import { processCounts, getExpandedRowData } from "./staticFunctions";
import dayjs from "dayjs";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import * as XLSX from "xlsx";

const { Option } = Select;

const CountsView = () => {
  const { counts, fetchCounts } = useContext(DeviceContext);

  // Set default values using dayjs
  const [date, setDate] = useState(dayjs());
  const [startTime, setStartTime] = useState(dayjs("00:00:00", "HH:mm:ss"));
  const [endTime, setEndTime] = useState(dayjs("23:59:59", "HH:mm:ss"));

  const [exportFormat, setExportFormat] = useState("csv");
  const [dataSource, setDataSource] = useState([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [startTimeError, setStartTimeError] = useState(false);
  const [endTimeError, setEndTimeError] = useState(false);

  useEffect(() => {
    if (counts) {
      const processedData = processCounts(counts);
      setDataSource(processedData);
    }
  }, [counts]);

  useEffect(() => {
    // Validierung der Zeit
    setStartTimeError(startTime.isAfter(endTime));
    setEndTimeError(endTime.isBefore(startTime));
  }, [startTime, endTime]);

  const handleExport = () => {
    if (dataSource.length === 0) {
      message.warning("Keine Daten zum Exportieren.");
      return;
    }

    // Erweitertes Datenformat vorbereiten
    const expandedData = dataSource.flatMap((record) => {
      const directionData = getExpandedRowData(record.region, counts);
      return directionData.length > 0
        ? directionData.map((direction) => ({
            ...record,
            ...direction,
          }))
        : [record];
    });

    const fileName = `data_export.${exportFormat}`;

    switch (exportFormat) {
      case "csv":
        const csv = Papa.unparse(expandedData);
        const blobCsv = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        saveAs(blobCsv, fileName);
        break;

      case "excel":
        const worksheet = XLSX.utils.json_to_sheet(expandedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
        XLSX.writeFile(
          workbook,
          fileName.endsWith(".xlsx") ? fileName : `${fileName}.xlsx`
        );
        break;

      case "json":
        const json = JSON.stringify(expandedData, null, 2);
        const blobJson = new Blob([json], {
          type: "application/json;charset=utf-8;",
        });
        saveAs(blobJson, fileName);
        break;

      case "yaml":
        const yaml = require("js-yaml").dump(expandedData);
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

  const handleQRCode = () => {
    console.log("QR-Code generieren");
  };

  const handleFetchCounts = async () => {
    try {
      const dateStr = date.format("YYYY-MM-DD");
      const startTimeStr = startTime.format("HH-mm-ss");
      const endTimeStr = endTime.format("HH-mm-ss");

      await fetchCounts(dateStr, startTimeStr, endTimeStr);
      //message.success("Daten erfolgreich abgerufen!");
    } catch (error) {
      message.error("Fehler beim Abrufen der Daten.");
    }
  };

  const columns = [
    {
      title: "Region",
      dataIndex: "region",
      key: "region",
    },
    {
      title: "Anzahl Klassen",
      dataIndex: "classesCount",
      key: "classesCount",
    },
    {
      title: "IN",
      dataIndex: "inCount",
      key: "inCount",
    },
    {
      title: "OUT",
      dataIndex: "outCount",
      key: "outCount",
    },
    {
      title: "Action",
      key: "operation",
      render: () => <a onClick={handleExport}>Export</a>,
    },
  ];

  const expandedRowRender = (record) => {
    const directionData = getExpandedRowData(record.region, counts);
    return (
      <Table
        columns={[
          { title: "Richtung", dataIndex: "direction", key: "direction" },
          { title: "Klasse", dataIndex: "class", key: "class" },
          { title: "IN", dataIndex: "inCount", key: "inCount" },
          { title: "OUT", dataIndex: "outCount", key: "outCount" },
        ]}
        dataSource={directionData}
        pagination={false}
        rowKey="key"
      />
    );
  };

  return (
    <>
      <Divider />
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <DatePicker
          allowClear={false}
          style={{ marginRight: 16 }}
          placeholder="Datum"
          onChange={(date) => setDate(date)}
          value={date}
        />
        <TimePicker
          allowClear={false}
          needConfirm={false}
          style={{ marginRight: 16 }}
          placeholder="Startzeit"
          onChange={(time) => setStartTime(time)}
          value={startTime}
          status={startTimeError ? "error" : undefined}
          format="HH:mm:ss"
        />
        <TimePicker
          allowClear={false}
          needConfirm={false}
          placeholder="Endzeit"
          onChange={(time) => setEndTime(time)}
          value={endTime}
          status={endTimeError ? "error" : undefined}
          format="HH:mm:ss"
        />
        <Select
          placeholder="Exportformat"
          style={{ width: 200, marginRight: 16 }}
          onChange={(value) => setExportFormat(value)}
          defaultValue={exportFormat}
        >
          <Option value="csv">CSV</Option>
          <Option value="excel">Excel</Option>
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
        <Tooltip title="QR-Code">
          <Button
            type="primary"
            icon={<QrcodeOutlined />}
            onClick={handleQRCode}
            style={{ marginRight: 16 }}
          />
        </Tooltip>
        <Tooltip title="Aktualisieren">
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={handleFetchCounts}
            disabled={startTimeError || endTimeError}
          />
        </Tooltip>
      </div>
      <Table
        columns={columns}
        dataSource={dataSource}
        expandable={{
          expandedRowRender,
          onExpand: (expanded, record) => {
            setExpandedRowKeys((prev) => {
              if (expanded) {
                return [...prev, record.key];
              } else {
                return prev.filter((key) => key !== record.key);
              }
            });
          },
          expandedRowKeys,
          rowExpandable: () => true,
        }}
        size="small"
      />
    </>
  );
};

export default CountsView;
