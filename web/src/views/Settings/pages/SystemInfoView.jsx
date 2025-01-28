import React, { useEffect, useState } from "react";
import useIsMobile from "../../../useIsMobile";
import { getSolutions } from "../../../api/apiSolutions";

import { Divider, List, Typography } from "antd";

const SystemInfoView = () => {
  const isMobile = useIsMobile();
  const [solutions, setSolutions] = useState([]);

  useEffect(() => {
    const loadSolutions = async () => {
      const solutions = await getSolutions();

      const solutionsArr = Object.keys(solutions).map((key) => ({
        solution: key,
        value: solutions[key],
      }));
      setSolutions(solutionsArr);
    };
    loadSolutions();
  }, []);

  return (
    <div
      style={{
        padding: "20px",
        margin: "0 auto",
        display: isMobile ? "flex" : undefined,
        flexDirection: isMobile ? "column" : undefined,
        alignItems: isMobile ? "center" : undefined,
        overflow: "hidden",
      }}
    >
      <Divider orientation="left">System</Divider>
      <List
        header={<div>Kamera</div>}
        bordered
        dataSource={solutions}
        renderItem={(item) => (
          <List.Item>
            <Typography.Text mark>{item.solution}</Typography.Text>{" "}
            {item.value.toString()}
          </List.Item>
        )}
      />
    </div>
  );
};

export default SystemInfoView;
