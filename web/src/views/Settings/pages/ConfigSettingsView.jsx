import React, { useEffect, useState, useContext } from "react";
import { Button, Divider, message, Form, Typography } from "antd";
import {
  getSystemSettings,
  postSystemSettings,
} from "../../../api/apiSystemSettings";
import { DeviceContext } from "../../../api/DeviceContext";
import useIsMobile from "../../../useIsMobile";
import FormSwitch from "../components/FormSwitch";
import FormInput from "../components/FormInput";
import FormTimePicker from "../components/FormTimePicker";
import dayjs from "dayjs";

const { Title } = Typography;

const ConfigSettingsView = () => {
  const { health } = useContext(DeviceContext);
  const isMobile = useIsMobile();
  const [form] = Form.useForm();
  const [componentSize, setComponentSize] = useState("default");

  const onFormLayoutChange = ({ size }) => {
    setComponentSize(size);
  };

  const timeFormats = [
    { value: "s", label: "Sek." },
    { value: "min", label: "Min." },
    { value: "h", label: "Std." },
  ];

  const formItemLayout = isMobile
    ? {}
    : {
        labelCol: { span: 8 },
        wrapperCol: { offset: 8, span: 4 },
        style: { marginBottom: 0 },
      };

  useEffect(() => {
    const loadSettings = async () => {
      const systemSettings = await getSystemSettings();

      if (systemSettings) {
        if (systemSettings.daily_cleanup_time) {
          systemSettings.daily_cleanup_time = dayjs(
            systemSettings.daily_cleanup_time,
            "HH:mm"
          );
        }
        form.setFieldsValue(systemSettings);
      }
    };
    loadSettings();
  }, [form]);

  const handleSubmit = async (fieldsValue) => {
    const dailyCleanupTime = fieldsValue["daily_cleanup_time"];

    if (!dailyCleanupTime || !dailyCleanupTime.isValid()) {
      message.error(
        "Bitte geben Sie eine gültige Zeit für die tägliche Bereinigung ein."
      );
      return;
    }

    const values = {
      ...fieldsValue,
      daily_cleanup_time: dailyCleanupTime.format("HH:mm"),
    };

    await postSystemSettings(values);
    if (health?.inference?.status) {
      message.warning(
        "Änderungen werden erst nach Neustart der Inferenz aktiv"
      );
    }
  };

  const formSwitchItems = [
    {
      label: "Aktiviere Inferenz bei Systemstart",
      name: "auto_start_inference",
    },
    { label: "Aktiviere MQTT bei Systemstart", name: "auto_start_mqtt_client" },
    {
      label: "Aktiviere MongoDB bei Systemstart",
      name: "auto_start_mongo_client",
    },
    { label: "Personen in Simulationen verwischen", name: "blur_humans" },
  ];

  const formSwitchItemsMongo = [
    {
      label: "Erfassen von Ein- und Austrittszeiten",
      name: "detect_count_timespan",
    },
    { label: "Tracking der Objekt Routen", name: "detect_count_routes" },
    {
      label: "Speichern der Zählungen in MongoDB",
      name: "save_counts_to_mongo",
    },
  ];

  const formInputItems = [
    {
      label: "Speichern der Messdaten Intervall",
      name: "counts_save_intervall",
      min: 1,
      max: 60,
      addonExtra: "counts_save_intervall_format",
      addonExtraOptions: timeFormats,
    },
    {
      label: "MQTT Publish Intervall",
      name: "counts_publish_intervall",
      min: 1,
      max: 60,
      addonExtra: "counts_publish_intervall_format",
      addonExtraOptions: timeFormats,
    },
    {
      label: "Maximale Anzahl an Tracking Punkten",
      name: "max_tracking_points_length",
      min: 5,
      max: 50,
    },
  ];

  const formTimePickerItems = [
    {
      label: "Tägliche Bereinigungszeit",
      name: "daily_cleanup_time",
      type: "time",
    },
  ];

  return (
    <>
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
        <Title level={4}>Gerätekonfiguration</Title>
        <Divider />

        <Form
          form={form}
          onFinish={handleSubmit}
          layout="horizontal"
          gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}
          size={componentSize}
          onValuesChange={onFormLayoutChange}
          {...formItemLayout}
        >
          {formTimePickerItems.map((item) => (
            <FormTimePicker {...item} />
          ))}
          {formSwitchItems.map((item) => (
            <FormSwitch {...item} />
          ))}

          <Divider />

          {formSwitchItemsMongo.map((item) => (
            <FormSwitch {...item} />
          ))}
          <Divider />

          {formInputItems.map((item) => (
            <FormInput key={item.name} {...item} />
          ))}

          <Divider />

          <Form.Item style={{ display: "flex", justifyContent: "flex-start" }}>
            <Button type="primary" htmlType="submit">
              Speichern
            </Button>
          </Form.Item>
        </Form>
      </div>
    </>
  );
};

export default ConfigSettingsView;
