// src/pages/Students/EditApplication.jsx
import React, { useEffect, useState } from "react";
import { Form, Input, Select, Button, message, Modal, Typography } from "antd";
import { EditOutlined, SaveOutlined, CloseOutlined } from "@ant-design/icons";

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const EditApplication = ({ application, visible, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const API_BASE_URL = "https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX";

  useEffect(() => {
    if (application) {
      form.setFieldsValue({
        title: application.title,
        description: application.description,
        type: application.type,
      });
    }
  }, [application, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const payload = {
        id: application.id,
        ...values
      };

      const response = await fetch(
        `${API_BASE_URL}/update_std_application.php`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to update application");
      }

      message.success("Application updated successfully!");
      onSuccess();
    } catch (error) {
      console.error("Update error:", error);
      message.error(error.message || "Failed to update application");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "#0b1b3d", color: "#d4af37", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <EditOutlined />
          </div>
          <span style={{ color: "#0b1b3d", fontWeight: 700 }}>Edit Application #{application?.id}</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      centered
      destroyOnClose
      footer={[
        <Button key="back" onClick={onCancel} disabled={submitting} style={{ borderRadius: 8 }} icon={<CloseOutlined />}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={submitting}
          onClick={handleSubmit}
          className="apex-btn-gold"
          style={{ borderRadius: 8 }}
          icon={<SaveOutlined />}
        >
          Update Application
        </Button>,
      ]}
      maskClosable={false}
    >
      <Form form={form} layout="vertical" style={{ paddingTop: 8 }}>
        <Form.Item
          label={<Text strong style={{ color: "#0b1b3d" }}>Application Type</Text>}
          name="type"
          rules={[{ required: true, message: "Please select application type" }]}
        >
          <Select disabled size="large" style={{ borderRadius: 8 }}>
            <Option value="general">General Inquiry</Option>
            <Option value="leave">Leave Application</Option>
            <Option value="academic">Academic Concern</Option>
            <Option value="technical">Technical Issue</Option>
            <Option value="other">Other</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label={<Text strong style={{ color: "#0b1b3d" }}>Application Title</Text>}
          name="title"
          rules={[{ required: true, message: "Please enter application title" }]}
        >
          <Input placeholder="Enter application title" size="large" style={{ borderRadius: 8 }} />
        </Form.Item>

        <Form.Item
          label={<Text strong style={{ color: "#0b1b3d" }}>Description</Text>}
          name="description"
          rules={[{ required: true, message: "Please enter description" }]}
        >
          <TextArea rows={4} placeholder="Enter detailed description" style={{ borderRadius: 8 }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditApplication;