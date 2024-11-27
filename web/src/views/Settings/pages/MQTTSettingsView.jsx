import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Checkbox,
  Button,
  Select,
  InputNumber,
  Tooltip,
  Typography,
  Row,
  Col,
  Divider,
  List,
  Collapse,
  Modal,
  Card,
} from "antd";
import {
  SaveOutlined,
  DeleteOutlined,
  DownloadOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { ReloadOutlined } from "@ant-design/icons";
import {
  postMQTTSettings,
  deleteMQTTSettings,
  getMQTTSettings,
} from "../../../api/apiMQTTSettings";
import { v4 as uuidv4 } from "uuid";
import useIsMobile from "../../../useIsMobile";

const { Option } = Select;
const { Title } = Typography;
const { Panel } = Collapse;

const MQTTSettingsView = () => {
  const [form] = Form.useForm();
  const [topics, setTopics] = useState({});
  const [mqttClientId, setMqttClientId] = useState(uuidv4());
  const [authEnabled, setAuthEnabled] = useState(false);
  const [telegrafModalVisible, setTelegrafModalVisible] = useState(false);
  const isMobile = useIsMobile();

  const panelHeaders = ["Kamera", "Inferenz", "Status", "MongoDB-Client"];

  const topicsActions = {
    topics: {
      [`action/${mqttClientId}/cam`]: {
        start: "start_stream",
        stop: "stop_stream",
        snap: "take_snapshot",
        video: "take_video",
      },
      [`action/${mqttClientId}/inference`]: {
        start: "start_counting",
        stop: "stop_counting",
        benchmark_start: "start_model_benchmark",
        benchmark_stop: "stop_model_benchmark",
      },
      [`action/${mqttClientId}/status`]: {
        status: "send_status",
      },
      [`action/${mqttClientId}/mongo`]: {
        start: "start_mongo_client",
        stop: "stop_mongo_client",
      },
    },
  };

  const dataEndpoint = "action/Counts/+/+/+/+/+";

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await getMQTTSettings();
      if (settings) {
        form.setFieldsValue({ ...settings, clientId: mqttClientId });
      }
      setTopics(topicsActions.topics);
      setAuthEnabled(settings?.authEnabled);
    };
    loadSettings();
  }, [form, mqttClientId]);

  useEffect(() => {
    form.setFieldsValue({
      willMessage: `Client ${mqttClientId} disconnected`,
    });
  }, [mqttClientId, form]);

  const handleSubmit = async (values) => {
    const payload = {
      ...values,
      topics: topics,
      dataEndpoint: values.dataEndpoint,
    };

    const ret = await postMQTTSettings(payload);
    if (ret) {
      form.resetFields();
      await getMQTTSettings();
    }
  };

  const handleDelete = async () => {
    await deleteMQTTSettings();
    form.resetFields();
  };

  const generateClientId = () => {
    const newClientId = uuidv4();
    setMqttClientId(newClientId);
    form.setFieldsValue({ clientId: newClientId });
  };

  const handleAuthToggle = (e) => {
    setAuthEnabled(e.target.checked);
    form.setFieldsValue({
      username: e.target.checked ? form.getFieldValue("username") : "",
      password: e.target.checked ? form.getFieldValue("password") : "",
    });
  };

  const handleTopicChange = (topic, newTopic) => {
    const updatedTopics = { ...topics };
    const commands = updatedTopics[topic];
    delete updatedTopics[topic];
    updatedTopics[newTopic] = commands;
    setTopics(updatedTopics);
  };

  const renderTopics = () => {
    return Object.entries(topics).map(([topic, commands], index) => (
      <Panel
        key={index}
        header={
          <div style={{ display: "flex", alignItems: "center" }}>
            <span>{panelHeaders[index]}</span>
          </div>
        }
      >
        <List
          header={
            <div style={{ display: "flex", alignItems: "center" }}>
              <Form.Item
                name={`topic_${index}`}
                initialValue={topic}
                style={{ margin: 0, width: "100%" }}
                rules={[
                  { required: true, message: "Dieses Feld ist erforderlich" },
                ]}
              >
                <Input
                  value={topic}
                  onChange={(e) => handleTopicChange(topic, e.target.value)}
                  style={{ width: "100%" }}
                  disabled
                />
              </Form.Item>
            </div>
          }
          size="small"
          bordered
          dataSource={Object.entries(commands)}
          renderItem={([commandKey, commandValue]) => (
            <List.Item
              style={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                gap: "8px",
              }}
            >
              <span
                style={{
                  width: "120px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {commandKey.charAt(0) + commandKey.slice(1)}
              </span>
              <Form.Item
                name={`${topic}_${commandKey}`}
                initialValue={commandValue}
                rules={[
                  { required: true, message: "Dieses Feld ist erforderlich" },
                ]}
                style={{ flexGrow: 1, margin: 0 }}
              >
                <Input placeholder={commandValue} disabled />
              </Form.Item>
            </List.Item>
          )}
        />
      </Panel>
    ));
  };

  return (
    <>
      <div style={{ padding: "20px", margin: "0 auto" }}>
        <Title level={4}>MQTT-Einstellungen</Title>

        <Divider />
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          initialValues={{
            host: "mqtt.example.com",
            port: 1883,
            tls: false,
            clientId: mqttClientId,
            cleanSession: true,
            keepAlive: 60,
            willMessage: `Client ${mqttClientId} disconnected`,
            qos: 1,
          }}
        >
          <Row gutter={32}>
            <Col xs={24} sm={12} style={{ paddingRight: "24px" }}>
              <Form.Item
                label="Host"
                name="host"
                rules={[
                  { required: true, message: "Dieses Feld ist erforderlich" },
                ]}
              >
                <Input style={{ maxWidth: "100%" }} />
              </Form.Item>

              <Form.Item
                label="Client-ID"
                name="clientId"
                rules={[
                  { required: true, message: "Dieses Feld ist erforderlich" },
                ]}
              >
                <Input
                  style={{ maxWidth: "100%" }}
                  addonAfter={
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={generateClientId}
                      disabled
                      style={{ height: "30px" }}
                    />
                  }
                />
              </Form.Item>

              <Form.Item label="Benutzername" name="username">
                <Input
                  style={{ maxWidth: "100%" }}
                  disabled={!authEnabled || false}
                />
              </Form.Item>

              <Form.Item label="Passwort" name="password">
                <Input.Password
                  style={{ maxWidth: "100%" }}
                  disabled={!authEnabled || false}
                  visibilityToggle={false}
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="authEnabled"
                    valuePropName="checked"
                    initialValue={false}
                  >
                    <Checkbox onChange={handleAuthToggle}>
                      Authentifizierung
                    </Checkbox>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="tls"
                    valuePropName="checked"
                    initialValue={false}
                  >
                    <Checkbox>TLS</Checkbox>
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col xs={24} sm={12} style={{ paddingLeft: "24px" }}>
              <Form.Item
                label="Port"
                name="port"
                rules={[
                  { required: true, message: "Dieses Feld ist erforderlich" },
                ]}
              >
                <InputNumber min={1} max={65535} style={{ maxWidth: "100%" }} />
              </Form.Item>

              <Tooltip title="Das Intervall (in Sekunden), in dem der Client ein Ping an den Broker senden sollte, um die Verbindung aufrechtzuerhalten.">
                <Form.Item
                  label="Keep Alive (Sekunden)"
                  name="keepAlive"
                  rules={[
                    { required: true, message: "Dieses Feld ist erforderlich" },
                  ]}
                >
                  <InputNumber min={1} style={{ maxWidth: "100%" }} />
                </Form.Item>
              </Tooltip>

              <Tooltip title="Nachricht, die vom Broker gesendet wird, wenn der Client unerwartet getrennt wird.">
                <Form.Item label="Letzter Wille" name="willMessage">
                  <Input style={{ maxWidth: "100%" }} />
                </Form.Item>
              </Tooltip>

              <Tooltip title="QoS-Stufen bestimmen, wie oft Nachrichten zwischen dem Client und Broker wiederholt werden. Stufen sind: 0 - Höchstens einmal, 1 - Mindestens einmal, 2 - Genau einmal.">
                <Form.Item
                  label="Quality of Service (QoS)"
                  name="qos"
                  rules={[
                    { required: true, message: "Dieses Feld ist erforderlich" },
                  ]}
                >
                  <Select style={{ maxWidth: "100%" }}>
                    <Option value={0}>0 - Höchstens einmal</Option>
                    <Option value={1}>1 - Mindestens einmal</Option>
                    <Option value={2}>2 - Genau einmal</Option>
                  </Select>
                </Form.Item>
              </Tooltip>
              <Tooltip title="Erhält keine gespeicherten Abonnements nach der Trennung.">
                <Form.Item name="cleanSession" valuePropName="checked">
                  <Checkbox>Clean Session</Checkbox>
                </Form.Item>
              </Tooltip>
            </Col>
          </Row>
          <div style={{ marginBottom: "48px" }} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Title level={4} style={{ margin: 0 }}>
              Datenendpunkt
            </Title>
            <Tooltip
              placement="left"
              overlayStyle={{
                fontSize: "13px",
                maxWidth: "700px",
                padding: "8px",
              }}
              title={
                <div>
                  <p>
                    Topic für die Datenveröffentlichung. Das Topic hat die
                    folgende Struktur:
                  </p>
                  <pre>
                    action/measurment/standort/geraet/region/klasse/richtung
                  </pre>
                  <ul>
                    <li>
                      <strong>action</strong>: Basisthema
                    </li>
                    <li>
                      <strong>measurment</strong>: Die Messung in dem die Daten
                      gespeichert werden.
                    </li>
                    <li>
                      <strong>standort</strong>: Gerätestandort
                    </li>
                    <li>
                      <strong>geraet</strong>: Gerätename oder ID.
                    </li>
                    <li>
                      <strong>region</strong>: Spezifizierte Region
                    </li>
                    <li>
                      <strong>richtung</strong>: Bewegungsrichtung
                    </li>
                    <li>
                      <strong>klasse</strong>: Objektklasse
                    </li>
                  </ul>
                  <p>Beispiel Payload:</p>
                  <pre>
                    {`
      {
        "IN": 1,
        "OUT": 2,
        "timestamp": 2024-10-01T22:10:54.287000Z
      }
      `}
                  </pre>
                </div>
              }
            >
              <QuestionCircleOutlined style={{ fontSize: "16px" }} />
            </Tooltip>
          </div>

          <Divider />

          <Row gutter={32}>
            <Col xs={24} sm={12} style={{ paddingRight: "24px" }}>
              <Form.Item label="Gerätename" name="deviceName">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} style={{ paddingLeft: "24px" }}>
              <Form.Item label="Standort" name="deviceLocation">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Datenendpunkt"
            name="dataEndpoint"
            initialValue={dataEndpoint}
            rules={[
              { required: true, message: "Dieses Feld ist erforderlich" },
            ]}
          >
            <Input style={{ maxWidth: "100%" }} disabled />
          </Form.Item>

          <div style={{ marginBottom: "48px" }} />
          <Title level={4}>Steuerung</Title>
          <Divider />

          <Collapse defaultActiveKey={Object.keys(topicsActions.topics)}>
            {renderTopics()}
          </Collapse>
          <Divider />
          <Form.Item>
            <Row justify="space-between">
              <Row gutter={16}>
                <Col>
                  <Button type="primary" htmlType="submit">
                    {isMobile ? <SaveOutlined /> : "Speichern"}
                  </Button>
                </Col>
                <Col>
                  <Button
                    type="default"
                    onClick={() => setTelegrafModalVisible(true)}
                  >
                    {isMobile ? <DownloadOutlined /> : "Telegraf Konfiguration"}
                  </Button>
                </Col>
              </Row>
              <Col>
                <Button danger type="default" onClick={handleDelete}>
                  {isMobile ? <DeleteOutlined /> : "Löschen"}
                </Button>
              </Col>
            </Row>
          </Form.Item>
        </Form>

        <Modal
          title="Telegraf Konfiguration"
          open={telegrafModalVisible}
          footer={null}
          onCancel={() => setTelegrafModalVisible(false)}
          width="80%"
          style={{ top: 20 }}
        >
          <Card
            style={{
              maxHeight: "80vh",
              overflowY: "auto",
              width: "100%",
            }}
          >
            <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              <code>
                {`                
[[inputs.mqtt_consumer]]
  servers = ["tcp://${form.getFieldValue("host")}:${form.getFieldValue(
                  "port"
                )}"]

  topics = [
    ${
      form.getFieldValue("dataEndpoint")
        ? form.getFieldValue("dataEndpoint").split("/")[0] + "/#"
        : ""
    }
  ]

   qos = ${form.getFieldValue("qos")}

   connection_timeout = "30s"

   client_id = "${form.getFieldValue("clientId")}"

   username = "${form.getFieldValue("username")}"
   password = <YOUR-PASSWORD>

   insecure_skip_verify = ${!form.getFieldValue("tls")}

   data_format = "json"

  [[inputs.mqtt_consumer.topic_parsing]]
      data_format = "json"
      data_type = "int"
      topic = "action/+/+/+/+/+/+"
      measurement = "_/measurement/_/_/_/_/_"
      tags = "$_/_/standort/geraet/region/klasse/richtung"
      fields = "_/_/_/_/_/_/_"
    [[processors.pivot]]
      tag_key = "richtung"
      value_key = "value"

`}
              </code>
            </pre>
          </Card>
        </Modal>
      </div>
    </>
  );
};

export default MQTTSettingsView;
