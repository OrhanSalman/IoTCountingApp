import React from "react";
import { FrownOutlined } from "@ant-design/icons";
import { Button, Result } from "antd";

const NotImplemented = () => {
  return (
    <div>
      <Result
        status="404"
        title="Nicht implementiert"
        subTitle="Sorry, die Seite ist noch nicht implementiert."
        //extra={<Button type="primary">Back Home</Button>}
      />
    </div>
  );
};

export default NotImplemented;
