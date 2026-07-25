import { useState, useEffect } from "react";
import { Table, Tag, Button, message, Typography, Layout, Space, Modal } from "antd";
import { EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import EditApplication from "./EditApplication";

const { Title } = Typography;
const { Content } = Layout;
const { confirm } = Modal;

const ViewApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingApp, setEditingApp] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const student_id = localStorage.getItem("student_id");
      if (!student_id) {
        throw new Error("Student data not found. Please log in again.");
      }

      const response = await fetch(
        `https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/read_std_application.php?student_id=${student_id}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || "Failed to fetch applications");
      }

      const formattedApplications = data.data.map(app => ({
        ...app,
        key: app.id,
        section_name: app.section?.name || 'N/A',
        teacher_name: app.teacher?.name || 'N/A',
        canEdit: app.status !== "approved" && app.status !== "rejected"
      }));

      setApplications(formattedApplications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      message.error(error.message || "Failed to fetch applications.");
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record) => {
    if (record.canEdit) {
      setEditingApp(record);
    } else {
      message.warning("This application has already been processed and cannot be edited");
    }
  };

  const handleDelete = (record) => {
    if (!record.canEdit) {
      message.warning("This application has already been processed and cannot be withdrawn");
      return;
    }

    confirm({
      title: "Withdraw Application",
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>Are you sure you want to withdraw this application?</p>
          <p>You can submit a new application after withdrawal.</p>
        </div>
      ),
      okText: "Yes, withdraw",
      okType: "danger",
      cancelText: "No, keep it",
      onOk: async () => {
        try {
          const response = await fetch(
            `https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/delete_std_application.php?id=${record.id}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              }
            }
          );

          const result = await response.json();

          if (!response.ok || !result.success) {
            throw new Error(result.message || "Failed to withdraw application");
          }

          message.success("Application withdrawn successfully!");
          fetchApplications();
        } catch (error) {
          console.error("Withdrawal error:", error);
          message.error(error.message || "Failed to withdraw application");
        }
      }
    });
  };

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type) => {
        let color = "geekblue";
        if (type === "leave") color = "volcano";
        if (type === "academic") color = "green";
        return (
          <Tag color={color} key={type}>
            {type.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Section",
      dataIndex: "section_name",
      key: "section",
    },
    {
      title: "Teacher",
      dataIndex: "teacher_name",
      key: "teacher",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "orange";
        if (status === "approved") color = "green";
        if (status === "rejected") color = "red";
        return (
          <Tag color={color} key={status}>
            {status.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Submission Date",
      dataIndex: "submission_date",
      key: "submission_date",
      render: (date) => new Date(date).toLocaleString()
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            disabled={!record.canEdit}
          >
            Edit
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            disabled={!record.canEdit}
          >
            Withdraw
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Content style={{ padding: "24px", background: "#fff" }}>
      <Title level={3}>My Applications</Title>
      <Table
        columns={columns}
        dataSource={applications}
        rowKey="id"
        loading={loading}
        scroll={{ x: true }}
      />

      {editingApp && (
        <EditApplication
          application={editingApp}
          visible={!!editingApp}
          onCancel={() => setEditingApp(null)}
          onSuccess={() => {
            setEditingApp(null);
            fetchApplications();
          }}
        />
      )}
    </Content>
  );
};

export default ViewApplications;