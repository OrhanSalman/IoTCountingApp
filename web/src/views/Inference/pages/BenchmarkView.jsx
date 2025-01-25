import React, { useEffect, useState, useContext } from "react";
import { Table } from "antd";
import { DeviceContext } from "../../../api/DeviceContext";

const BenchmarkView = () => {
  const { health, loading, benchmarks, fetchBenchmarks } =
    useContext(DeviceContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortedBenchmarks, setSortedBenchmarks] = useState([]);

  // Funktion zum Parsen des Datumsstrings
  const parseDate = (dateString) => {
    const [datePart, timePart] = dateString.split(" - ");
    const [day, month, year] = datePart.split(".");
    return new Date(`${year}-${month}-${day}T${timePart}`);
  };

  // useEffect zum Sortieren der Benchmarks nach Datum
  useEffect(() => {
    if (Array.isArray(benchmarks) && benchmarks.length) {
      const sorted = benchmarks.slice().sort((a, b) => {
        const dateA = parseDate(a.date);
        const dateB = parseDate(b.date);
        return dateB - dateA; // neuestes zuerst
      });
      setSortedBenchmarks(sorted);
    }
  }, [benchmarks]);

  const columns = [
    {
      title: "Format",
      dataIndex: "Format",
      key: "Format",
      align: "center",
      filters: [
        ...Array.from(
          new Set(
            Object.values(sortedBenchmarks[0]?.data || []).map(
              (item) => item.Format
            )
          )
        ).map((format) => ({
          text: format,
          value: format,
        })),
      ],
      onFilter: (value, record) => record.Format.includes(value),
    },
    {
      title: "Status\u2754",
      dataIndex: "Status\u2754",
      key: "Status\u2754",
      align: "center",
      sorter: (a, b) => {
        const statusOrder = {
          "✅": 1,
          "❎": 2,
          "❌": 3,
        };
        return (
          (statusOrder[a["Status\u2754"]] || 4) -
          (statusOrder[b["Status\u2754"]] || 4)
        );
      },
    },
    {
      title: "Size (MB)",
      dataIndex: "Size (MB)",
      key: "Size (MB)",
      align: "center",
      ellipsis: true,
      sorter: (a, b) => a["Size (MB)"] - b["Size (MB)"],
    },
    {
      title: "metrics/mAP50-95(B)",
      dataIndex: "metrics/mAP50-95(B)",
      key: "metrics/mAP50-95(B)",
      align: "center",
      sorter: (a, b) => {
        const valueA = parseFloat(a["metrics/mAP50-95(B)"]);
        const valueB = parseFloat(b["metrics/mAP50-95(B)"]);

        if (isNaN(valueA)) return -1;
        if (isNaN(valueB)) return 1;

        return valueA - valueB;
      },
    },
    {
      title: "Inference time (ms/im)",
      dataIndex: "Inference time (ms/im)",
      key: "Inference time (ms/im)",
      align: "center",
      sorter: (a, b) => {
        const timeA = parseFloat(a["Inference time (ms/im)"]);
        const timeB = parseFloat(b["Inference time (ms/im)"]);

        if (isNaN(timeA)) return -1;
        if (isNaN(timeB)) return 1;

        return timeA - timeB;
      },
    },
    {
      title: "FPS",
      dataIndex: "FPS",
      key: "FPS",
      align: "center",
      sorter: (a, b) => {
        const fpsA = parseFloat(a.FPS);
        const fpsB = parseFloat(b.FPS);

        if (isNaN(fpsA)) return -1;
        if (isNaN(fpsB)) return 1;

        return fpsA - fpsB;
      },
    },
  ];

  useEffect(() => {
    if (health?.benchmark?.status === false) {
      fetchBenchmarks();
    }
  }, [health?.benchmark?.status, fetchBenchmarks]);

  const currentBenchmark = sortedBenchmarks[currentPage - 1];
  const dataSource = currentBenchmark
    ? Object.values(currentBenchmark.data || {})
    : [];

  return (
    <Table
      style={{ margin: "16px auto" }}
      size="small"
      bordered
      loading={loading || health?.benchmark?.status}
      title={() => (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>{currentBenchmark?.header}</span>
          <span>{currentBenchmark?.date}</span>
        </div>
      )}
      columns={columns}
      rowKey="Format"
      dataSource={dataSource}
      pagination={{
        current: currentPage,
        pageSize: 20,
        total: sortedBenchmarks.length * 15,
        onChange: (page) => setCurrentPage(page),
        showSizeChanger: false,
        position: ["bottomLeft"],
      }}
    />
  );
};

export default BenchmarkView;
