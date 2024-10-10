import React from "react";

import { Form, TimePicker } from "antd";

const FormTimePicker = ({ label, name }) => {
  return (
    <Form.Item label={label} name={name}>
      <TimePicker
        style={{ marginBottom: "6px" }}
        allowClear={false}
        showNow={false}
        format={"HH:mm"}
        needConfirm={false}
      />
    </Form.Item>
  );
};

export default FormTimePicker;
