import { useState, useEffect } from "react";
import { Form, Input, Select, Button, message, Modal, Typography } from "antd";

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// eslint-disable-next-line react/prop-types
const EditApplication = ({ application, visible, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (application) {
      form.setFieldsValue({
        // eslint-disable-next-line react/prop-types
        title: application.title,
        // eslint-disable-next-line react/prop-types
        description: application.description,
        // eslint-disable-next-line react/prop-types
        type: application.type,
        // Include any other fields that need to be edited
      });
    }
  }, [application, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      // Create the complete request payload including the application ID
      const payload = {
        // eslint-disable-next-line react/prop-types
        id: application.id,  // Make sure this is included
        ...values
      };

      console.log("Submitting update:", payload);  // Debug log

      const response = await fetch(
        "https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/update_std_application.php",
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
      title={<Title level={4}>Edit Application</Title>}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={submitting}
          onClick={handleSubmit}
        >
          {submitting ? "Updating..." : "Update"}
        </Button>,
      ]}
      maskClosable={false}  // Prevent closing by clicking outside
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Application Type"
          name="type"
          rules={[{ required: true, message: "Please select application type" }]}
        >
          <Select disabled>
            <Option value="general">General Inquiry</Option>
            <Option value="leave">Leave Application</Option>
            <Option value="academic">Academic Concern</Option>
            <Option value="technical">Technical Issue</Option>
            <Option value="other">Other</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Application Title"
          name="title"
          rules={[{ required: true, message: "Please enter application title" }]}
        >
          <Input placeholder="Enter application title" />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: "Please enter description" }]}
        >
          <TextArea rows={4} placeholder="Enter detailed description" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditApplication;