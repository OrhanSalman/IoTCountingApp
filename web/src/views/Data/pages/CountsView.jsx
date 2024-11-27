import React, { useState, useContext, useEffect } from "react";
import { Table } from "antd";
import { DeviceContext } from "../../../api/DeviceContext";

const CountsView = () => {
  const { counts } = useContext(DeviceContext);
  const [dataSource, setDataSource] = useState([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);

  useEffect(() => {
    if (counts) {
      processCounts();
    }
  }, [counts]);

  // TODO: _id, published, timestamp auch bei den anderen entfernen
  const processCounts = () => {
    const filteredData = Object.keys(counts)
      .filter(
        (key) => key !== "_id" && key !== "published" && key !== "timestamp"
      )
      .map((roiKey, index) => {
        const roiData = counts[roiKey];
        let totalIn = 0;
        let totalOut = 0;
        const totalClasses = new Set();

        const directions = Object.keys(roiData).map((direction) => {
          const { IN = {}, OUT = {} } = roiData[direction];

          // Alle Klassen aus IN und OUT kombinieren
          const allClasses = new Set([...Object.keys(IN), ...Object.keys(OUT)]);

          // Summiere die in- und out-Werte
          const inCount = Object.values(IN).reduce((acc, val) => acc + val, 0);
          const outCount = Object.values(OUT).reduce(
            (acc, val) => acc + val,
            0
          );

          totalIn += inCount;
          totalOut += outCount;

          return {
            direction,
            classes: Array.from(allClasses).map((classType) => ({
              classType,
              in: IN[classType] || 0,
              out: OUT[classType] || 0,
            })),
          };
        });

        directions.forEach((dir) => {
          dir.classes.forEach((cls) => {
            totalClasses.add(cls.classType);
          });
        });

        return {
          key: index,
          region: roiKey,
          classesCount: totalClasses.size,
          inCount: totalIn,
          outCount: totalOut,
          directions,
        };
      });

    setDataSource(filteredData);
  };

  const expandedRowRender = (record) => {
    const { directions } = record;

    const expandedData = directions.flatMap((dir) =>
      dir.classes.map((cls) => ({
        key: `${record.key}-${dir.direction}-${cls.classType}`,
        direction: dir.direction,
        classType: cls.classType,
        in: cls.in,
        out: cls.out,
      }))
    );

    return (
      <Table
        columns={[
          { title: "Richtung", dataIndex: "direction", key: "direction" },
          { title: "Klasse", dataIndex: "classType", key: "classType" },
          { title: "IN", dataIndex: "in", key: "in" },
          { title: "OUT", dataIndex: "out", key: "out" },
        ]}
        dataSource={expandedData}
        pagination={false}
      />
    );
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
  ];

  return (
    <>
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
