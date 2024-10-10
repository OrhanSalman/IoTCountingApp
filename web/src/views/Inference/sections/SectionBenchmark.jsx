import React, { useEffect, useState, useContext } from "react";
import {
  Card,
  Select,
  Tooltip,
  Row,
  Col,
  Divider,
  message,
  Table,
  List,
} from "antd";
import { DeviceContext } from "../../../api/DeviceContext";

const columns = [
  {
    title: "Format",
    dataIndex: "Format",
    key: "Format",
    align: "center",
  },
  {
    title: "Status\u2754",
    dataIndex: "Status\u2754",
    key: "Status\u2754",
    align: "center",
  },
  {
    title: "Size (MB)",
    dataIndex: "Size (MB)",
    key: "Size (MB)",
    align: "center",
  },
  {
    title: "metrics/mAP50-95(B)",
    dataIndex: "metrics/mAP50-95(B)",
    key: "metrics/mAP50-95(B)",
    align: "center",
  },
  {
    title: "Inference time (ms/im)",
    dataIndex: "Inference time (ms/im)",
    key: "Inference time (ms/im)",
    align: "center",
  },
  {
    title: "FPS",
    dataIndex: "FPS",
    key: "FPS",
    align: "center",
  },
];

const SectionBenchmark = () => {
  const { data, health, benchmarks, fetchBenchmarks } =
    useContext(DeviceContext);
  const [prevBenchmarkStatus, setPrevBenchmarkStatus] = useState(
    health?.benchmark?.status
  );

  useEffect(() => {
    if (prevBenchmarkStatus === true && health?.benchmark?.status === false) {
      fetchBenchmarks();
      //message.success("Benchmark abgeschlossen");
    }
    setPrevBenchmarkStatus(health?.benchmark?.status);
  }, [health?.benchmark?.status, fetchBenchmarks, prevBenchmarkStatus]);

  return (
    <>
      <Table
        key={data?.deviceConfigs?.id}
        style={{ marginBottom: "20px" }}
        size="small"
        bordered
        pagination={false}
        loading={health?.benchmark?.status}
        title={() => benchmarks[0]?.header}
        footer={() => (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            <span>{benchmarks[0]?.date || ""}</span>
          </div>
        )}
        columns={columns}
        rowKey="Format"
        dataSource={
          benchmarks[0]?.data ? Object.values(benchmarks[0].data) : []
        }
      />
    </>
  );
};
export default SectionBenchmark;
