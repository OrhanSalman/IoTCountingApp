import React, { useState, useContext, useEffect } from "react";
import {
  Table,
  InputNumber,
  Input,
  Timeline,
  Pagination,
  message,
  Collapse,
  Divider,
} from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { DeviceContext } from "../../../api/DeviceContext";

const { Panel } = Collapse;

const LogsView = ({ filter }) => {
  const { logs, loadingLogs, fetchLogs } = useContext(DeviceContext);

  const [limit, setLimit] = useState(50);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [pagination, setPagination] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const statusColors = {
    info: "green",
    warning: "orange",
    error: "red",
  };

  const formatDate = (dateStr) => {
    if (!dateStr) {
      return "Invalid Date";
    }

    const parts = dateStr.split(" ");
    if (parts.length < 2) {
      return dateStr;
    }

    const [datePart, timePart] = parts;
    const [year, month, day] = datePart.split("-");
    const timeParts = timePart.split(":");

    const hour = timeParts[0] || "00";
    const minute = timeParts[1] || "00";

    return `${day}.${month}.${year} - ${hour}:${minute}`;
  };

  const handleFetchLogs = async () => {
    try {
      await fetchLogs(limit);
    } catch (error) {
      message.error(`Fehler beim Aktualisieren der Logs: ${error}`);
    }
  };

  const parseLogEntries = (logEntries) => {
    return logEntries
      .map((entry, index) => {
        const [date, , level, ...messageParts] = entry.split(" - ");
        const message = messageParts.join(" - ").trim();
        const logLevel = level ? level.toLowerCase() : "info";
        return {
          date,
          level: logLevel,
          message,
          id: `${index}-${date}-${message}`,
        };
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  useEffect(() => {
    const filterLogEntries = (logEntries) => {
      if (!Array.isArray(logEntries)) {
        return [];
      }

      const entries = parseLogEntries(logEntries);
      if (!filter && !searchTerm) return entries;

      return entries.filter((entry) => {
        const matchesFilter = filter ? entry.level === filter : true;
        const matchesSearch = searchTerm
          ? entry.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
            formatDate(entry.date)
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
          : true;
        return matchesFilter && matchesSearch;
      });
    };

    if (logs) {
      const filtered = logs
        .map((logItem, index) => {
          const logFileName = Object.keys(logItem)[0];
          const logEntries = logItem[logFileName];

          const filteredEntries = filterLogEntries(logEntries);

          // Only include logs with entries
          if (filteredEntries.length === 0) return null;

          setPagination((prev) => ({
            ...prev,
            [logFileName]: { currentPage: 1, pageSize: 10 },
          }));

          return {
            key: index,
            logFileName,
            logEntries: filteredEntries,
          };
        })
        .filter(Boolean); // Remove null entries from the array

      // Sortiere die Log-Dateinamen alphabetisch
      const sortedFilteredLogs = filtered.sort((a, b) =>
        a.logFileName.localeCompare(b.logFileName)
      );

      setFilteredLogs(sortedFilteredLogs);
    }
  }, [logs, filter, searchTerm]);

  const onPageChange = (logFileName, page) => {
    setPagination((prev) => ({
      ...prev,
      [logFileName]: { ...prev[logFileName], currentPage: page },
    }));
  };

  const columns = [
    {
      title: "Timeline",
      key: "timeline",
      render: (_, { logFileName, logEntries }) => {
        const { currentPage = 1, pageSize = 10 } =
          pagination[logFileName] || {};
        const entries = logEntries || [];

        const timelineItems = entries
          .slice((currentPage - 1) * pageSize, currentPage * pageSize)
          .map((entry) => ({
            color: statusColors[entry.level] || "gray",
            children: (
              <div>
                <p style={{ margin: 0, fontWeight: "bold" }}>
                  {formatDate(entry.date)}
                </p>
                <p style={{ margin: 0 }}>{entry.message}</p>
              </div>
            ),
            key: entry.id, // Use a unique ID here
          }));

        return (
          <div>
            <Timeline mode="left" size="small" items={timelineItems} />
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={entries.length}
              onChange={(page) => onPageChange(logFileName, page)}
              style={{ marginTop: 16 }}
            />
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div style={{ padding: 24, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 18,
            gap: 12,
          }}
        >
          <Input
            placeholder="Logs durchsuchen"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 300 }}
          />
          <InputNumber
            value={limit}
            step={25}
            min={25}
            max={5000}
            style={{ width: 130 }}
            onChange={(value) => setLimit(value)}
            addonAfter={
              <ReloadOutlined
                style={{ cursor: "pointer" }}
                onClick={() => handleFetchLogs()}
                loading={loadingLogs}
              />
            }
          />
        </div>

        <Collapse accordion style={{ margin: "0 auto" }}>
          {filteredLogs.map((data) => (
            <Panel
              header={
                <div style={{ fontWeight: "bold", fontSize: 16 }}>
                  {data?.logFileName.split(".")[0].toUpperCase()}
                </div>
              }
              key={data.key}
              style={{ borderRadius: 4 }}
            >
              <Table
                columns={columns}
                dataSource={[data]}
                pagination={false}
                style={{ width: "100%" }}
                loading={loadingLogs}
              />
              <Divider />
            </Panel>
          ))}
        </Collapse>
      </div>
    </>
  );
};

export default LogsView;
