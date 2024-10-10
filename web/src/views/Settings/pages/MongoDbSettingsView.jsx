import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Checkbox,
  Button,
  Row,
  Col,
  Divider,
  Typography,
} from "antd";
import { SaveOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  postMongoDBSettings,
  deleteMongoDBSettings,
  getMongoDBSettings,
} from "../../../api/apiMongoDBSettings";
import useIsMobile from "../../../useIsMobile";

const { Title } = Typography;

const MongoDbSettingsView = () => {
  const [form] = Form.useForm();
  const [authEnabled, setAuthEnabled] = useState(false);
  const isMobile = useIsMobile();

  // Daten laden, wenn die Komponente gemountet wird
  useEffect(() => {
    const loadData = async () => {
      const data = await getMongoDBSettings();
      if (data) {
        form.setFieldsValue({
          host: data.host,
          port: data.port,
          dbname: data.dbname,
          username: data.username || "",
          password: data.password ? "*" * data.password.length : "",
        });
        setAuthEnabled(data.authEnabled);
      }
    };

    loadData();
  }, [form]);

  const handleSubmit = async (values) => {
    const port = parseInt(values.port, 10);

    if (isNaN(port)) {
      console.error("Der Port muss eine ganze Zahl sein.");
      return;
    }

    const payload = {
      host: values.host || "localhost",
      port: port,
      dbname: values.dbname || "test",
      authEnabled: authEnabled,
      username: authEnabled ? values.username : undefined,
      password: authEnabled ? values.password : undefined,
    };

    try {
      const ret = await postMongoDBSettings(payload);
      if (ret) {
        form.resetFields();
        await getMongoDBSettings();
      }
    } catch (error) {
      console.error("Fehler beim Speichern der MongoDB-Einstellungen:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMongoDBSettings();
      form.resetFields();
    } catch (error) {
      console.error("Fehler beim Löschen der MongoDB-Einstellungen:", error);
    }
  };

  const handleAuthToggle = (e) => {
    setAuthEnabled(e.target.checked);
  };

  return (
    <>
      <div style={{ padding: "20px", margin: "0 auto" }}>
        <Title level={4}>MongoDB Settings</Title>
        <Divider />
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          initialValues={{
            host: "localhost",
            port: 27017,
            dbname: "test",
            authEnabled: false,
          }}
        >
          {/* Erste Reihe mit 3 Spalten: Host, Port, Datenbankname */}
          <Row gutter={32}>
            <Col xs={24} sm={8} style={{ paddingRight: "12px" }}>
              <Form.Item
                label="Host"
                name="host"
                rules={[
                  { required: true, message: "Dieses Feld ist erforderlich" },
                ]}
              >
                <Input style={{ maxWidth: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8} style={{ paddingRight: "12px" }}>
              <Form.Item
                label="Port"
                name="port"
                rules={[
                  { required: true, message: "Dieses Feld ist erforderlich" },
                ]}
              >
                <Input
                  type="number"
                  min={0}
                  style={{ maxWidth: "100%" }}
                  placeholder="Standard: 27017"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8} style={{ paddingRight: "12px" }}>
              <Form.Item
                label="Datenbankname"
                name="dbname"
                rules={[
                  { required: true, message: "Dieses Feld ist erforderlich" },
                ]}
              >
                <Input
                  style={{ maxWidth: "100%" }}
                  placeholder="Standard: test"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Zweite Reihe mit 3 Spalten: Authentifizierung aktiv, Benutzername, Passwort */}
          <Row gutter={32}>
            <Col
              xs={24}
              sm={8}
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                paddingRight: "12px",
              }}
            >
              <Form.Item
                name="authEnabled"
                valuePropName="checked"
                initialValue={false}
              >
                <Checkbox checked={authEnabled} onChange={handleAuthToggle}>
                  Authentifizierung
                </Checkbox>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8} style={{ paddingRight: "12px" }}>
              <Form.Item label="Benutzername" name="username">
                <Input style={{ maxWidth: "100%" }} disabled={!authEnabled} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8} style={{ paddingRight: "12px" }}>
              <Form.Item label="Passwort" name="password">
                <Input.Password
                  style={{ maxWidth: "100%" }}
                  disabled={!authEnabled}
                  visibilityToggle={false}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider />
          <Form.Item>
            <Row justify="space-between">
              <Button type="primary" htmlType="submit">
                {isMobile ? <SaveOutlined /> : "Speichern"}
              </Button>
              <Button danger type="default" onClick={handleDelete}>
                {isMobile ? <DeleteOutlined /> : "Löschen"}
              </Button>
            </Row>
          </Form.Item>
        </Form>
      </div>
    </>
  );
};

export default MongoDbSettingsView;
