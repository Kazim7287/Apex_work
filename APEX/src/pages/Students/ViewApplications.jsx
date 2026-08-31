// src/pages/Students/ViewApplications.jsx
import React, { useState, useEffect } from "react";
import { Table, Tag, Button, message, Typography, Space, Modal, Card, Input } from "antd";
import { EditOutlined, DeleteOutlined, ExclamationCircleOutlined, SearchOutlined, ReloadOutlined, FileTextOutlined } from "@ant-design/icons";
import EditApplication from "./EditApplication";

const { Title, Text } = Typography;
const { confirm } = Modal;

const ViewApplications = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [searchText, setSearchText] = useState("");

  const studentId = localStorage.getItem("student_id");
  const API_BASE_URL = "https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX";

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      if (!studentId) {
        throw new Error("Student data not found. Please log in again.");
      }

      const response = await fetch(
        `${API_BASE_URL}/read_std_application.php?student_id=${studentId}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || "Failed to fetch applications");
      }

      const formattedApplications = (data.data || []).map(app => ({
        ...app,
        key: app.id,
        section_name: app.section?.name || 'N/A',
        teacher_name: app.teacher?.name || 'N/A',
        canEdit: app.status !== "approved" && app.status !== "rejected"
      }));

      setApplications(formattedApplications);
      setFilteredApplications(formattedApplications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      setApplications([]);
      setFilteredApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
    if (!value.trim()) {
      setFilteredApplications(applications);
    } else {
      const q = value.toLowerCase();
      setFilteredApplications(
        applications.filter(
          (app) =>
            (app.title && app.title.toLowerCase().includes(q)) ||
            (app.type && app.type.toLowerCase().includes(q)) ||
            (app.status && app.status.toLowerCase().includes(q))
        )
      );
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
      okText: "Yes, Withdraw",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const response = await fetch(
            `${API_BASE_URL}/delete_std_application.php?id=${record.id}`,
            {
              method: "DELETE",
              headers: { "Content-Type": "application/json" }
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
      title: "Title & Subject",
      dataIndex: "title",
      key: "title",
      render: (title) => <Text strong style={{ color: "#0b1b3d", fontSize: 14 }}>{title}</Text>
    },
    {
      title: "Request Type",
      dataIndex: "type",
      key: "type",
      render: (type) => {
        let color = "cyan";
        if (type === "leave") color = "gold";
        if (type === "academic") color = "blue";
        return (
          <Tag color={color} style={{ borderRadius: 6, fontWeight: 600 }}>
            {String(type || "GENERAL").toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Section",
      dataIndex: "section_name",
      key: "section",
      responsive: ['md']
    },
    {
      title: "Assigned Instructor",
      dataIndex: "teacher_name",
      key: "teacher",
      responsive: ['md']
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: 'center',
      render: (status) => {
        let color = "warning";
        if (status === "approved") color = "success";
        if (status === "rejected") color = "error";
        return (
          <Tag color={color} style={{ borderRadius: 12, padding: '2px 10px', fontWeight: 600 }}>
            {String(status || "PENDING").toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Submission Date",
      dataIndex: "submission_date",
      key: "submission_date",
      render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A'
    },
    {
      title: "Actions",
      key: "actions",
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
            disabled={!record.canEdit}
            style={{ borderRadius: 6, background: '#1e3a8a' }}
          >
            Edit
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDelete(record)}
            disabled={!record.canEdit}
            style={{ borderRadius: 6 }}
          >
            Withdraw
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto" }}>
      <Card
        className="apex-card"
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 0" }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(212, 175, 55, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#d4af37", fontSize: 16 }}>
              <FileTextOutlined />
            </div>
            <div>
              <Title level={5} style={{ margin: 0, color: "#0b1b3d", fontWeight: 700 }}>
                My Applications Directory
              </Title>
              <Text style={{ color: "#64748b", fontSize: 11 }}>Review submitted student notices</Text>
            </div>
          </div>
        }
        extra={
          <Space wrap>
            <Input
              placeholder="Search applications..."
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
              style={{ width: 220, borderRadius: 8 }}
            />
            <Button
              type="text"
              icon={<ReloadOutlined />}
              onClick={fetchApplications}
              loading={loading}
              style={{ borderRadius: 8 }}
            />
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredApplications}
          rowKey="id"
          loading={loading}
          scroll={{ x: true }}
          pagination={{ pageSize: 8 }}
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
      </Card>
    </div>
  );
};

export default ViewApplications;