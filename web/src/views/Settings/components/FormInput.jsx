import React from "react";
import { Form, InputNumber, Select } from "antd";

const FormInput = ({
  label,
  name,
  min,
  max,
  addonExtra,
  addonExtraOptions,
}) => {
  return (
    <Form.Item label={label} name={name}>
      <InputNumber
        min={min}
        max={max}
        style={{ width: "160px", marginBottom: "6px" }}
        addonAfter={
          addonExtra &&
          addonExtraOptions && (
            <Form.Item name={addonExtra} noStyle>
              <Select options={addonExtraOptions} style={{ width: "80px" }} />
            </Form.Item>
          )
        }
      />
    </Form.Item>
  );
};

export default FormInput;
