import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Form, Input, Button, Select, message, Modal, Table, Card, Row, Col,
  Typography, Space, Avatar, Tag, Popconfirm, Tooltip, Divider, Grid,
} from "antd";
import {
  UserOutlined, MailOutlined, IdcardOutlined, BookOutlined, TrophyOutlined,
  SafetyCertificateOutlined, EditOutlined, DeleteOutlined, PlusOutlined,
  TeamOutlined, SearchOutlined, ReloadOutlined,
} from "@ant-design/icons";
import axios from "axios";

const { Title, Text } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid;

axios.defaults.withCredentials = true;

const API_BASE_URL =
  "https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX";

// ---------------------------------------------------------------------------
// Theme / shared style tokens
// ---------------------------------------------------------------------------

const COLORS = {
  navyGradient: "linear-gradient(135deg, #0b1b3d 0%, #1e3a8a 100%)",
  goldGradient: "linear-gradient(135deg, #d4af37 0%, #b8860b 100%)",
  navy: "#1e3a8a",
  gold: "#d4af37",
  goldDark: "#b8860b",
  textDark: "#0f172a",
  textMuted: "#64748b",
  textBody: "#334155",
};

const styles = {
  avatar: { background: COLORS.navyGradient, color: COLORS.gold, fontWeight: 700 },
  sectionTag: {
    background: "#fefce8",
    color: COLORS.goldDark,
    border: "1px solid rgba(212, 175, 55, 0.3)",
    borderRadius: 12,
    padding: "2px 10px",
  },
  roundedTag: { borderRadius: 12 },
  editButton: { borderRadius: 6, background: COLORS.navy },
  deleteButton: { borderRadius: 6 },
  input: { borderRadius: 8 },
};

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------

const teacherApi = {
  list: () => axios.get(`${API_BASE_URL}/teach_read.php`),
  sections: () => axios.get(`${API_BASE_URL}/Sec_Read.php`),
  create: (payload) =>
    axios.post(`${API_BASE_URL}/teach_reg.php`, payload, {
      withCredentials: true,
      headers: { "Content-Type": "application/json" },
    }),
  update: (id, payload) =>
    axios.post(`${API_BASE_URL}/teach_update.php?id=${id}`, payload),
  remove: (id) => axios.delete(`${API_BASE_URL}/teach_delete.php?id=${id}`),
};

const toTeacherPayload = (values) => ({
  teach_name: values.name,
  teach_email: values.email,
  teach_no: values.teacher_no,
  teach_pasword: values.password,
  teach_sec: String(values.section_id),
  Designation: values.designation,
  Qaulification: values.qualification,
});

// ---------------------------------------------------------------------------
// Data hook: owns teachers/sections state and CRUD operations
// ---------------------------------------------------------------------------

function useTeacherDirectory() {
  const [sections, setSections] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchSections = useCallback(async () => {
    try {
      const { status, data } = await teacherApi.sections();
      if (status === 200) setSections(data);
      else message.error("Failed to fetch sections");
    } catch {
      message.error("An error occurred while fetching sections");
    }
  }, []);

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await teacherApi.list();
      if (!data?.success) {
        message.error("Failed to fetch teachers");
        return;
      }
      const formatted = data.data.map((t) => ({
        id: t.id,
        name: t.teach_name,
        email: t.teach_email,
        teacher_no: t.teach_no,
        section_id: t.teach_sec,
        section_name:
          sections.find((s) => String(s.id) === String(t.teach_sec))?.name ??
          `Section ${t.teach_sec}`,
        designation: t.Designation,
        qualification: t.Qaulification,
      }));
      setTeachers(formatted);
    } catch {
      message.error("An error occurred while fetching teachers");
    } finally {
      setLoading(false);
    }
  }, [sections]);

  useEffect(() => { fetchSections(); }, [fetchSections]);
  useEffect(() => { if (sections.length) fetchTeachers(); }, [sections, fetchTeachers]);

  const addTeacher = useCallback(async (values) => {
    setSubmitLoading(true);
    try {
      const { data } = await teacherApi.create(toTeacherPayload(values));
      if (data?.success === true || data?.status === "success") {
        message.success(data.message || "Teacher added successfully!");
        await fetchTeachers();
        return true;
      }
      message.error(data?.error || data?.message || "Failed to add teacher");
      return false;
    } catch (error) {
      message.error(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to register teacher"
      );
      return false;
    } finally {
      setSubmitLoading(false);
    }
  }, [fetchTeachers]);

  const updateTeacher = useCallback(async (id, values) => {
    setSubmitLoading(true);
    try {
      const payload = { id, ...toTeacherPayload(values) };
      if (!values.password) delete payload.teach_pasword; // keep existing password when left blank
      const { data } = await teacherApi.update(id, payload);
      if (data.success) {
        message.success(data.message || "Teacher updated successfully!");
        await fetchTeachers();
        return true;
      }
      message.error(data.error || "Failed to update teacher");
      return false;
    } catch {
      message.error("An error occurred while updating the teacher");
      return false;
    } finally {
      setSubmitLoading(false);
    }
  }, [fetchTeachers]);

  const deleteTeacher = useCallback(async (id) => {
    try {
      const { data } = await teacherApi.remove(id);
      if (data?.success) {
        message.success("Teacher deleted successfully");
        fetchTeachers();
      } else {
        message.error(data?.message || "Failed to delete teacher");
      }
    } catch {
      message.error("An error occurred while deleting teacher");
    }
  }, [fetchTeachers]);

  return {
    sections, teachers, loading, submitLoading,
    fetchTeachers, addTeacher, updateTeacher, deleteTeacher,
  };
}

// ---------------------------------------------------------------------------
// Presentational subcomponents
// ---------------------------------------------------------------------------

const TeacherAvatar = ({ name, size }) => (
  <Avatar size={size} style={styles.avatar}>
    {name?.charAt(0)?.toUpperCase() || "T"}
  </Avatar>
);

const RowActions = ({ teacher, onEdit, onDelete, size = "small" }) => (
  <Space size={size === "small" ? "small" : 4}>
    <Tooltip title="Edit Teacher">
      <Button
        type="primary"
        icon={<EditOutlined />}
        onClick={() => onEdit(teacher)}
        size="small"
        style={styles.editButton}
      />
    </Tooltip>
    <Popconfirm
      title="Delete Teacher"
      description="Are you sure you want to delete this teacher?"
      onConfirm={() => onDelete(teacher.id)}
      okText="Yes, Delete"
      cancelText="Cancel"
      okButtonProps={{ danger: true }}
    >
      <Tooltip title="Delete Teacher">
        <Button type="primary" danger icon={<DeleteOutlined />} size="small" style={styles.deleteButton} />
      </Tooltip>
    </Popconfirm>
  </Space>
);

function getColumns({ onEdit, onDelete }) {
  return [
    {
      title: "Teacher",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name, record) => (
        <Space>
          <TeacherAvatar name={name} />
          <div>
            <Text strong style={{ color: COLORS.textDark, display: "block", lineHeight: 1.2 }}>
              {name}
            </Text>
            <Text style={{ fontSize: 11, color: COLORS.textMuted }}>#{record.teacher_no}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email) => (
        <Text style={{ color: COLORS.textBody }}>
          <MailOutlined style={{ marginRight: 6, color: COLORS.navy }} />
          {email}
        </Text>
      ),
    },
    {
      title: "Section",
      dataIndex: "section_name",
      key: "section_name",
      render: (sec) => (
        <Tag icon={<TeamOutlined />} color="gold" style={styles.sectionTag}>
          {sec}
        </Tag>
      ),
    },
    {
      title: "Designation",
      dataIndex: "designation",
      key: "designation",
      responsive: ["md"],
      render: (text) => <Tag color="blue" style={styles.roundedTag}>{text}</Tag>,
    },
    {
      title: "Qualification",
      dataIndex: "qualification",
      key: "qualification",
      responsive: ["lg"],
      render: (text) => text || "N/A",
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      width: 140,
      render: (_, record) => <RowActions teacher={record} onEdit={onEdit} onDelete={onDelete} />,
    },
  ];
}

function MobileTeacherCard({ teacher, onEdit, onDelete }) {
  return (
    <Card
      size="small"
      style={{ width: "100%", marginBottom: 12, borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(15, 23, 42, 0.05)" }}
      styles={{ body: { padding: 14 } }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
          <TeacherAvatar name={teacher.name} size={46} />
          <div style={{ minWidth: 0 }}>
            <Text strong style={{ display: "block", color: COLORS.textDark, fontSize: 15, wordBreak: "break-word" }}>
              {teacher.name}
            </Text>
            <Text style={{ display: "block", color: COLORS.textMuted, fontSize: 11 }}>
              #{teacher.teacher_no}
            </Text>
          </div>
        </div>
        <RowActions teacher={teacher} onEdit={onEdit} onDelete={onDelete} size="mobile" />
      </div>

      <Divider style={{ margin: "12px 0" }} />

      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <MailOutlined style={{ color: COLORS.navy, marginTop: 3, flexShrink: 0 }} />
          <Text style={{ color: COLORS.textBody, wordBreak: "break-word" }}>{teacher.email}</Text>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <TeamOutlined style={{ color: COLORS.goldDark, flexShrink: 0 }} />
          <Tag color="gold" style={{ margin: 0, ...styles.sectionTag }}>{teacher.section_name}</Tag>
        </div>

        {teacher.designation && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <TrophyOutlined style={{ color: COLORS.navy, flexShrink: 0 }} />
            <Tag color="blue" style={{ margin: 0, ...styles.roundedTag }}>{teacher.designation}</Tag>
          </div>
        )}

        {teacher.qualification && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <BookOutlined style={{ color: COLORS.navy, marginTop: 3, flexShrink: 0 }} />
            <Text style={{ color: COLORS.textBody }}>{teacher.qualification}</Text>
          </div>
        )}
      </div>
    </Card>
  );
}

// Shared field set for both Add and Edit modals — avoids duplicating the form markup.
function TeacherFormFields({ isMobile, sections, passwordLabel, passwordRequired, passwordPlaceholder }) {
  const size = isMobile ? "large" : "middle";
  return (
    <Row gutter={[16, 8]}>
      <Col xs={24} sm={12}>
        <Form.Item name="name" label="Full Name" rules={[{ required: true, message: "Please enter teacher name" }]}>
          <Input placeholder="Teacher Name" prefix={<UserOutlined />} size={size} style={styles.input} />
        </Form.Item>
      </Col>
      <Col xs={24} sm={12}>
        <Form.Item name="email" label="Email Address" rules={[{ required: true, type: "email", message: "Please enter valid email" }]}>
          <Input placeholder="teacher@apex.edu" prefix={<MailOutlined />} size={size} style={styles.input} />
        </Form.Item>
      </Col>
      <Col xs={24} sm={12}>
        <Form.Item name="teacher_no" label="Teacher No." rules={[{ required: true, message: "Please enter teacher number" }]}>
          <Input placeholder="T-2026-01" prefix={<IdcardOutlined />} size={size} style={styles.input} />
        </Form.Item>
      </Col>
      <Col xs={24} sm={12}>
        <Form.Item name="section_id" label="Assigned Section" rules={[{ required: true, message: "Please select section" }]}>
          <Select placeholder="Select Section" size={size} style={{ width: "100%" }}>
            {sections.map((sec) => (
              <Option key={sec.id} value={sec.id}>{sec.name}</Option>
            ))}
          </Select>
        </Form.Item>
      </Col>
      <Col xs={24} sm={12}>
        <Form.Item name="designation" label="Designation" rules={[{ required: true, message: "Please enter designation" }]}>
          <Input placeholder="Lecturer / Assistant Prof" prefix={<TrophyOutlined />} size={size} style={styles.input} />
        </Form.Item>
      </Col>
      <Col xs={24} sm={12}>
        <Form.Item name="qualification" label="Qualification" rules={[{ required: true, message: "Please enter qualification" }]}>
          <Input placeholder="M.Sc / Ph.D" prefix={<BookOutlined />} size={size} style={styles.input} />
        </Form.Item>
      </Col>
      <Col xs={24}>
        <Form.Item
          name="password"
          label={passwordLabel}
          rules={passwordRequired ? [{ required: true, message: "Please set password" }] : []}
        >
          <Input.Password placeholder={passwordPlaceholder} prefix={<SafetyCertificateOutlined />} size={size} style={styles.input} />
        </Form.Item>
      </Col>
    </Row>
  );
}

function TeacherFormModal({
  open, onCancel, onFinish, form, sections, isMobile,
  submitLoading, icon, title, submitLabel, passwordLabel,
  passwordRequired, passwordPlaceholder,
}) {
  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar style={{ background: "#0b1b3d", color: COLORS.gold }} icon={icon} />
          <span>{title}</span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={isMobile ? "calc(100vw - 20px)" : 650}
      centered={!isMobile}
      style={{ top: isMobile ? 10 : undefined, maxWidth: "calc(100vw - 20px)" }}
      styles={{ body: isMobile ? { maxHeight: "calc(100vh - 120px)", overflowY: "auto" } : undefined }}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onFinish} style={{ paddingTop: 12 }}>
        <TeacherFormFields
          isMobile={isMobile}
          sections={sections}
          passwordLabel={passwordLabel}
          passwordRequired={passwordRequired}
          passwordPlaceholder={passwordPlaceholder}
        />
        <Row>
          <Col xs={24}>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitLoading}
              block
              className="apex-btn-gold"
              size={isMobile ? "large" : "middle"}
              style={{ height: 44, marginTop: 8, borderRadius: 8 }}
            >
              {submitLabel}
            </Button>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const Teachers = () => {
  const {
    sections, teachers, loading, submitLoading,
    fetchTeachers, addTeacher, updateTeacher, deleteTeacher,
  } = useTeacherDirectory();

  const [searchText, setSearchText] = useState("");
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentTeacher, setCurrentTeacher] = useState(null);

  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const isMobile = !useBreakpoint().md;

  const filteredTeachers = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) return teachers;
    return teachers.filter((t) =>
      [t.name, t.email, t.teacher_no, t.designation]
        .some((field) => field?.toLowerCase().includes(query))
    );
  }, [teachers, searchText]);

  const openEditModal = useCallback((teacher) => {
    setCurrentTeacher(teacher);
    editForm.setFieldsValue({ ...teacher, password: "" });
    setIsEditModalVisible(true);
  }, [editForm]);

  const closeEditModal = () => {
    setIsEditModalVisible(false);
    setCurrentTeacher(null);
    editForm.resetFields();
  };

  const handleAdd = async (values) => {
    if (await addTeacher(values)) {
      setIsAddModalVisible(false);
      addForm.resetFields();
    }
  };

  const handleUpdate = async (values) => {
    await updateTeacher(currentTeacher.id, values);
    closeEditModal();
  };

  const columns = useMemo(
    () => getColumns({ onEdit: openEditModal, onDelete: deleteTeacher }),
    [openEditModal, deleteTeacher]
  );

  return (
    <div style={{ width: "100%", maxWidth: 1400, margin: "0 auto", padding: isMobile ? 8 : 16, boxSizing: "border-box", overflow: "hidden" }}>
      <Card
        className="apex-card"
        style={{ width: "100%", borderRadius: isMobile ? 10 : 12, overflow: "hidden" }}
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", minWidth: 0 }}>
            <div style={{ width: 38, height: 38, minWidth: 38, borderRadius: 10, background: COLORS.goldGradient, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
              <TeamOutlined />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <Title level={4} style={{ margin: 0, color: "#0b1b3d", fontWeight: 700, fontSize: isMobile ? 16 : 18, lineHeight: 1.3, wordBreak: "break-word" }}>
                Teacher Directory & Faculty Management
              </Title>
              <Text style={{ color: COLORS.textMuted, fontSize: 12, display: "block" }}>
                Manage faculty profiles, section assignments, and credentials
              </Text>
            </div>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 10, width: "100%", marginBottom: 16 }}>
          <Input
            placeholder="Search teacher..."
            prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            size={isMobile ? "large" : "middle"}
            style={{ width: "100%", flex: 1, borderRadius: 8 }}
          />
          <div style={{ display: "flex", gap: 8, width: isMobile ? "100%" : "auto" }}>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchTeachers}
              loading={loading}
              size={isMobile ? "large" : "middle"}
              style={{ borderRadius: 8, width: isMobile ? 52 : "auto" }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsAddModalVisible(true)}
              className="apex-btn-gold"
              size={isMobile ? "large" : "middle"}
              style={{ borderRadius: 8, flex: 1 }}
            >
              Add New Teacher
            </Button>
          </div>
        </div>

        {isMobile ? (
          <div style={{ width: "100%" }}>
            {loading ? (
              <div style={{ padding: "40px 0", textAlign: "center" }}>
                <Text>Loading teachers...</Text>
              </div>
            ) : filteredTeachers.length > 0 ? (
              <>
                {filteredTeachers.map((teacher) => (
                  <MobileTeacherCard key={teacher.id} teacher={teacher} onEdit={openEditModal} onDelete={deleteTeacher} />
                ))}
                <div style={{ textAlign: "center", padding: "8px 0 4px", color: COLORS.textMuted, fontSize: 12 }}>
                  Total {filteredTeachers.length} teachers
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "40px 10px", color: COLORS.textMuted }}>
                No teachers found
              </div>
            )}
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredTeachers}
            rowKey="id"
            loading={loading}
            scroll={{ x: "max-content" }}
            pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Total ${total} teachers` }}
          />
        )}
      </Card>

      <TeacherFormModal
        open={isAddModalVisible}
        onCancel={() => { setIsAddModalVisible(false); addForm.resetFields(); }}
        onFinish={handleAdd}
        form={addForm}
        sections={sections}
        isMobile={isMobile}
        submitLoading={submitLoading}
        icon={<PlusOutlined />}
        title="Add New Faculty Member"
        submitLabel="Register Faculty Member"
        passwordLabel="Account Password"
        passwordRequired
        passwordPlaceholder="Enter login password"
      />

      <TeacherFormModal
        open={isEditModalVisible}
        onCancel={closeEditModal}
        onFinish={handleUpdate}
        form={editForm}
        sections={sections}
        isMobile={isMobile}
        submitLoading={submitLoading}
        icon={<UserOutlined />}
        title="Update Faculty Information"
        submitLabel="Update Faculty Record"
        passwordLabel="Update Password (Optional)"
        passwordRequired={false}
        passwordPlaceholder="Leave blank to keep current password"
      />
    </div>
  );
};

export default Teachers;