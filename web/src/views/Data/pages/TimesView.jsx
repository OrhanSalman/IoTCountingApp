import React from "react";
import NotImplemented from "../../NotImplemented";
import { Table } from "antd";

const TimesView = () => {
  const columns = [
    {
      title: "Region",
      dataIndex: "region",
      key: "region",
    },
    {
      title: "Eintritt",
      dataIndex: "entry",
      key: "entry",
    },
    {
      title: "Austritt",
      dataIndex: "exit",
      key: "exit",
    },
    {
      title: "Klassen",
      dataIndex: "classes",
      key: "classes",
    },
  ];

  return (
    <div>
      <NotImplemented />
      {/*<Table columns={columns} dataSource={[]} pagination={false} />*/}
    </div>
  );
};

export default TimesView;
