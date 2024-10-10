import React from "react";
import { Form, Switch } from "antd";

const FormSwitch = ({ label, name, disabled }) => {
  return (
    <Form.Item label={label} name={name} valuePropName="checked">
      <Switch style={{ marginBottom: "6px" }} disabled={disabled} />
    </Form.Item>
  );
};

export default FormSwitch;
