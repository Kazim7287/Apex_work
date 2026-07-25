import { useState } from "react";
import { Button, message, Modal, Typography } from "antd";

const { Title, Paragraph } = Typography;

// eslint-disable-next-line react/prop-types
const DeleteApplication = ({ application, visible, onCancel, onSuccess }) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      
      const response = await fetch(
        `https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/delete_std_application.php?id=${application.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            'Accept': 'application/json'
          }
        }
      );
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const result = await response.json();
  
      if (!result.success) {
        throw new Error(result.message || "Failed to delete application");
      }
  
      message.success("Application withdrawn successfully!");
      onSuccess();
    } catch (error) {
      console.error("Delete error:", error);
      message.error(error.message || "Failed to withdraw application");
    } finally {
      setDeleting(false);
    }
  };
  return (
    <Modal
      title={<Title level={4}>Confirm Withdrawal</Title>}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel} disabled={deleting}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          danger
          loading={deleting}
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? "Withdrawing..." : "Withdraw"}
        </Button>,
      ]}
    >
      <Paragraph>
        Are you sure you want to withdraw the application titled:{" "}
        <strong>{application?.title}</strong>?
      </Paragraph>
      <Paragraph>This action cannot be undone.</Paragraph>
    </Modal>
  );
};

export default DeleteApplication;