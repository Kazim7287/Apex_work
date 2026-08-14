// src/pages/Admin/PermissionManagement.jsx

import React, { useEffect, useMemo, useState } from 'react';
import {
  App as AntApp,
  Alert,
  Badge,
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Form,
  Grid,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from 'antd';

import {
  ApiOutlined,
  BookOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  CrownOutlined,
  DeleteOutlined,
  EditOutlined,
  FileTextOutlined,
  KeyOutlined,
  NotificationOutlined,
  ReloadOutlined,
  SaveOutlined,
  SearchOutlined,
  TeamOutlined,
  UserAddOutlined,
  UserOutlined,
} from '@ant-design/icons';

import { usePermissions } from '../../contexts/PermissionContext';
import PermissionGuard from '../../components/PermissionGuard';

const { Title, Text } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid;

const API_BASE_URL =
  'https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/';

/* =========================================================
   PERMISSIONS
========================================================= */

const PERMISSION_OPTIONS = [
  // Dashboard & Core
  {
    label: 'Dashboard View',
    value: 'dashboard_view',
    icon: <KeyOutlined />,
    category: 'Dashboard & Core',
  },
  {
    label: 'Students View',
    value: 'students_view',
    icon: <TeamOutlined />,
    category: 'Dashboard & Core',
  },
  {
    label: 'Teachers View',
    value: 'teachers_view',
    icon: <UserOutlined />,
    category: 'Dashboard & Core',
  },
  {
    label: 'Classes View',
    value: 'classes_view',
    icon: <BookOutlined />,
    category: 'Dashboard & Core',
  },

  // Announcements
  {
    label: 'Announcements View',
    value: 'announcements_view',
    icon: <NotificationOutlined />,
    category: 'Announcements',
  },
  {
    label: 'Announcements Manage',
    value: 'announcements_manage',
    icon: <NotificationOutlined />,
    category: 'Announcements',
  },

  // Exams
  {
    label: 'Exams View',
    value: 'exams_view',
    icon: <FileTextOutlined />,
    category: 'Exams',
  },
  {
    label: 'Exams Manage',
    value: 'exams_manage',
    icon: <FileTextOutlined />,
    category: 'Exams',
  },

  // Books
  {
    label: 'Books View',
    value: 'books_view',
    icon: <BookOutlined />,
    category: 'Books',
  },
  {
    label: 'Books Manage',
    value: 'books_manage',
    icon: <BookOutlined />,
    category: 'Books',
  },
  {
    label: 'Books Delete',
    value: 'books_delete',
    icon: <DeleteOutlined />,
    category: 'Books',
  },

  // Students
  {
    label: 'Students Manage',
    value: 'students_manage',
    icon: <TeamOutlined />,
    category: 'Students Management',
  },
  {
    label: 'Students Delete',
    value: 'students_delete',
    icon: <DeleteOutlined />,
    category: 'Students Management',
  },

  // Other Features
  {
    label: 'Assignments View',
    value: 'assignments_view',
    icon: <KeyOutlined />,
    category: 'Other Features',
  },
  {
    label: 'Performance View',
    value: 'performance_view',
    icon: <KeyOutlined />,
    category: 'Other Features',
  },
  {
    label: 'Attendance View',
    value: 'attendance_view',
    icon: <KeyOutlined />,
    category: 'Other Features',
  },
  {
    label: 'Teacher Evaluations View',
    value: 'evaluations_view',
    icon: <KeyOutlined />,
    category: 'Other Features',
  },
  {
    label: 'Dues View',
    value: 'dues_view',
    icon: <KeyOutlined />,
    category: 'Other Features',
  },
  {
    label: 'Time Table View',
    value: 'timetable_view',
    icon: <KeyOutlined />,
    category: 'Other Features',
  },
  {
    label: 'Events & Calendar View',
    value: 'events_view',
    icon: <KeyOutlined />,
    category: 'Other Features',
  },
  {
    label: 'Student Applications View',
    value: 'applications_view',
    icon: <KeyOutlined />,
    category: 'Other Features',
  },
  {
    label: 'Feedback Management View',
    value: 'feedback_view',
    icon: <KeyOutlined />,
    category: 'Other Features',
  },
  {
    label: 'About Management View',
    value: 'about_view',
    icon: <KeyOutlined />,
    category: 'Other Features',
  },

  // Admin & Settings
  {
    label: 'Admin Management',
    value: 'admins_manage',
    icon: <KeyOutlined />,
    category: 'Admin & Settings',
  },
  {
    label: 'Permission Management',
    value: 'permissions_manage',
    icon: <KeyOutlined />,
    category: 'Admin & Settings',
  },
  {
    label: 'Settings & Profile View',
    value: 'settings_view',
    icon: <KeyOutlined />,
    category: 'Admin & Settings',
  },
];

/* =========================================================
   HELPERS
========================================================= */

const isSuperAdmin = (admin) =>
  admin?.is_super_admin === 1 ||
  admin?.is_super_admin === '1' ||
  admin?.role === 'super_admin';

const getAdminRole = (admin) => {
  if (isSuperAdmin(admin)) {
    return {
      label: 'Super Admin',
      color: 'gold',
      icon: <CrownOutlined />,
    };
  }

  if (admin?.role === 'sub_admin') {
    return {
      label: 'Sub Admin',
      color: 'cyan',
      icon: <UserAddOutlined />,
    };
  }

  return {
    label: admin?.role || 'Administrator',
    color: 'blue',
    icon: <TeamOutlined />,
  };
};

const getPermissionLabel = (permission) =>
  PERMISSION_OPTIONS.find((item) => item.value === permission)?.label ||
  permission;

const getPermissionIcon = (permission) =>
  PERMISSION_OPTIONS.find((item) => item.value === permission)?.icon || (
    <KeyOutlined />
  );

/* =========================================================
   API HELPERS
========================================================= */

const apiRequest = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    credentials: 'include',
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const errorMessage =
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}`;

    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

/* =========================================================
   MAIN CONTENT
========================================================= */

const PermissionManagementContent = () => {
  const screens = useBreakpoint();
  const { message: messageApi } = AntApp.useApp();

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchText, setSearchText] = useState('');

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const [assignLoading, setAssignLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  const [assignForm] = Form.useForm();

  const { isSuperAdmin: currentUserIsSuperAdmin } = usePermissions();

  /* =======================================================
     GROUP PERMISSIONS
  ======================================================= */

  const permissionGroups = useMemo(() => {
    const groups = {};

    PERMISSION_OPTIONS.forEach((permission) => {
      if (!groups[permission.category]) {
        groups[permission.category] = [];
      }

      groups[permission.category].push(permission);
    });

    return groups;
  }, []);

  /* =======================================================
     FETCH ADMINS + PERMISSIONS
  ======================================================= */

  const fetchAdmins = async (showMessage = false) => {
    setLoading(true);

    try {
      const data = await apiRequest('read_admin.php');

      const adminList = Array.isArray(data?.data) ? data.data : [];

      const adminsWithPermissions = await Promise.all(
        adminList.map(async (admin) => {
          try {
            const permissionData = await apiRequest(
              `get_admin_permissions.php?admin_id=${encodeURIComponent(
                admin.id
              )}`
            );

            let permissions = [];

            /*
             Supports both response structures:

             {
               success: true,
               data: [
                 { permission_key: "students_view" }
               ]
             }

             AND

             {
               success: true,
               permissions: [...]
             }
            */

            if (Array.isArray(permissionData?.data)) {
              permissions = permissionData.data
                .map((item) =>
                  typeof item === 'string'
                    ? item
                    : item?.permission_key
                )
                .filter(Boolean);
            } else if (Array.isArray(permissionData?.permissions)) {
              permissions = permissionData.permissions
                .map((item) =>
                  typeof item === 'string'
                    ? item
                    : item?.permission_key
                )
                .filter(Boolean);
            }

            return {
              ...admin,
              permissions: [...new Set(permissions)],
            };
          } catch (error) {
            console.error(
              `Permission fetch failed for admin ${admin.id}:`,
              error
            );

            return {
              ...admin,
              permissions: [],
            };
          }
        })
      );

      setAdmins(adminsWithPermissions);

      if (showMessage) {
        messageApi.success('Administrators refreshed successfully');
      }
    } catch (error) {
      console.error('Failed to fetch administrators:', error);

      messageApi.error(
        error?.message || 'Failed to fetch administrators'
      );

      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  /* =======================================================
     SEARCH
  ======================================================= */

  const filteredAdmins = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    if (!search) {
      return admins;
    }

    return admins.filter((admin) => {
      return (
        admin?.name?.toLowerCase().includes(search) ||
        admin?.email?.toLowerCase().includes(search) ||
        admin?.role?.toLowerCase().includes(search) ||
        admin?.designation?.toLowerCase().includes(search)
      );
    });
  }, [admins, searchText]);

  /* =======================================================
     OPEN EDIT
  ======================================================= */

  const openEditModal = (admin) => {
    if (isSuperAdmin(admin)) {
      messageApi.warning(
        'Super Admin already has full access and cannot be modified.'
      );
      return;
    }

    const permissions = Array.isArray(admin.permissions)
      ? admin.permissions
      : [];

    setSelectedAdmin(admin);
    setSelectedPermissions([...permissions]);
    setEditModalOpen(true);
  };

  /* =======================================================
     CLOSE EDIT
  ======================================================= */

  const closeEditModal = () => {
    if (editLoading) return;

    setEditModalOpen(false);
    setSelectedAdmin(null);
    setSelectedPermissions([]);
  };

  /* =======================================================
     TOGGLE PERMISSION
  ======================================================= */

  const togglePermission = (permission, checked) => {
    setSelectedPermissions((current) => {
      if (checked) {
        if (current.includes(permission)) {
          return current;
        }

        return [...current, permission];
      }

      return current.filter((item) => item !== permission);
    });
  };

  /* =======================================================
     SELECT ALL CATEGORY
  ======================================================= */

  const toggleCategory = (category, checked) => {
    const categoryPermissions = permissionGroups[category] || [];

    const categoryValues = categoryPermissions.map(
      (permission) => permission.value
    );

    setSelectedPermissions((current) => {
      if (checked) {
        return [
          ...new Set([
            ...current,
            ...categoryValues,
          ]),
        ];
      }

      return current.filter(
        (permission) => !categoryValues.includes(permission)
      );
    });
  };

  /* =======================================================
     SELECT ALL
  ======================================================= */

  const selectAllPermissions = () => {
    setSelectedPermissions(
      PERMISSION_OPTIONS.map((permission) => permission.value)
    );
  };

  const clearAllPermissions = () => {
    setSelectedPermissions([]);
  };

  /* =======================================================
     CATEGORY STATUS
  ======================================================= */

  const categoryState = (category) => {
    const categoryPermissions = permissionGroups[category] || [];

    const values = categoryPermissions.map(
      (permission) => permission.value
    );

    const selectedCount = values.filter((value) =>
      selectedPermissions.includes(value)
    ).length;

    return {
      all: selectedCount === values.length && values.length > 0,
      some:
        selectedCount > 0 &&
        selectedCount < values.length,
      count: selectedCount,
      total: values.length,
    };
  };

  /* =======================================================
     ASSIGN SINGLE PERMISSION
  ======================================================= */

  const handleAssignPermission = async (values) => {
    const admin = admins.find(
      (item) => String(item.id) === String(values.admin_id)
    );

    if (!admin) {
      messageApi.error('Administrator not found.');
      return;
    }

    if (isSuperAdmin(admin)) {
      messageApi.warning(
        'Super Admin already has full access.'
      );
      return;
    }

    setAssignLoading(true);

    try {
      const data = await apiRequest(
        'insert_admin_permission.php',
        {
          method: 'POST',
          body: JSON.stringify({
            admin_id: values.admin_id,
            permission_key: values.permission_key,
            permission_value: 1,
          }),
        }
      );

      if (
        data?.success === true ||
        data?.status === 'success'
      ) {
        messageApi.success(
          `"${getPermissionLabel(
            values.permission_key
          )}" assigned to ${admin.name}`
        );

        setAssignModalOpen(false);
        assignForm.resetFields();

        await fetchAdmins();
      } else {
        throw new Error(
          data?.message || 'Failed to assign permission'
        );
      }
    } catch (error) {
      console.error('Assign permission error:', error);

      messageApi.error(
        error?.message || 'Failed to assign permission'
      );
    } finally {
      setAssignLoading(false);
    }
  };

  /* =======================================================
     REMOVE ONE PERMISSION
  ======================================================= */

  const removePermission = async (
    adminId,
    permissionKey,
    refresh = true
  ) => {
    try {
      const data = await apiRequest(
        'delete_admin_permission.php',
        {
          method: 'DELETE',
          body: JSON.stringify({
            admin_id: adminId,
            permission_key: permissionKey,
          }),
        }
      );

      if (
        data?.success === true ||
        data?.status === 'success'
      ) {
        if (refresh) {
          await fetchAdmins();
        }

        return true;
      }

      throw new Error(
        data?.message || 'Failed to remove permission'
      );
    } catch (error) {
      console.error(
        `Failed removing ${permissionKey}:`,
        error
      );

      throw error;
    }
  };

  /* =======================================================
     SAVE ALL PERMISSIONS

     IMPORTANT:
     We deliberately DO NOT call:

       update_admin_permissions.php

     because that endpoint is returning HTTP 500.

     Instead we use the previously working:
       delete_admin_permission.php
       insert_admin_permission.php
  ======================================================= */

  const handleSavePermissions = async () => {
    if (!selectedAdmin) {
      return;
    }

    if (isSuperAdmin(selectedAdmin)) {
      messageApi.warning(
        'Super Admin permissions cannot be changed.'
      );
      return;
    }

    setEditLoading(true);

    try {
      const adminId = selectedAdmin.id;

      const existingPermissions = Array.isArray(
        selectedAdmin.permissions
      )
        ? selectedAdmin.permissions
        : [];

      const newPermissions = [
        ...new Set(selectedPermissions),
      ];

      const permissionsToDelete =
        existingPermissions.filter(
          (permission) =>
            !newPermissions.includes(permission)
        );

      const permissionsToAdd =
        newPermissions.filter(
          (permission) =>
            !existingPermissions.includes(permission)
        );

      /*
       * DELETE removed permissions
       */
      for (const permission of permissionsToDelete) {
        await removePermission(
          adminId,
          permission,
          false
        );
      }

      /*
       * INSERT new permissions
       */
      for (const permission of permissionsToAdd) {
        const data = await apiRequest(
          'insert_admin_permission.php',
          {
            method: 'POST',
            body: JSON.stringify({
              admin_id: adminId,
              permission_key: permission,
              permission_value: 1,
            }),
          }
        );

        if (
          data?.success !== true &&
          data?.status !== 'success'
        ) {
          throw new Error(
            data?.message ||
              `Failed to assign ${getPermissionLabel(
                permission
              )}`
          );
        }
      }

      messageApi.success(
        `Permissions updated successfully for ${selectedAdmin.name}`
      );

      closeEditModal();

      await fetchAdmins();
    } catch (error) {
      console.error(
        'Permission update error:',
        error
      );

      messageApi.error(
        error?.message ||
          'Failed to update permissions'
      );
    } finally {
      setEditLoading(false);
    }
  };

  /* =======================================================
     CLEAR ALL
  ======================================================= */

  const clearAdminPermissions = async (admin) => {
    if (isSuperAdmin(admin)) {
      messageApi.warning(
        'Super Admin permissions cannot be removed.'
      );
      return;
    }

    const permissions = Array.isArray(admin.permissions)
      ? admin.permissions
      : [];

    if (permissions.length === 0) {
      messageApi.info(
        `${admin.name} has no permissions assigned.`
      );
      return;
    }

    setLoading(true);

    try {
      for (const permission of permissions) {
        await removePermission(
          admin.id,
          permission,
          false
        );
      }

      messageApi.success(
        `All permissions removed from ${admin.name}`
      );

      await fetchAdmins();
    } catch (error) {
      console.error(
        'Clear permissions error:',
        error
      );

      messageApi.error(
        error?.message ||
          'Failed to clear permissions'
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     TABLE COLUMNS
  ======================================================= */

  const columns = [
    {
      title: 'Administrator',
      dataIndex: 'name',
      key: 'name',
      width: 230,
      render: (name, record) => (
        <Space align="start">
          <UserOutlined
            style={{
              color: '#d4af37',
              fontSize: 18,
              marginTop: 3,
            }}
          />

          <div>
            <Text
              strong
              style={{
                display: 'block',
                color: '#0f172a',
              }}
            >
              {name || 'Unknown Admin'}

              {isSuperAdmin(record) && (
                <CrownOutlined
                  style={{
                    color: '#d4af37',
                    marginLeft: 6,
                  }}
                />
              )}
            </Text>

            <Text
              type="secondary"
              style={{ fontSize: 12 }}
            >
              {record.email || '-'}
            </Text>
          </div>
        </Space>
      ),
    },

    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: 150,
      render: (_, record) => {
        const role = getAdminRole(record);

        return (
          <Tag
            color={role.color}
            icon={role.icon}
            style={{ borderRadius: 12 }}
          >
            {role.label}
          </Tag>
        );
      },
    },

    {
      title: 'Designation',
      dataIndex: 'designation',
      key: 'designation',
      width: 150,
      render: (value) => value || '-',
    },

    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const active =
          String(status || '').toLowerCase() ===
          'active';

        return (
          <Badge
            status={active ? 'success' : 'error'}
            text={active ? 'Active' : 'Inactive'}
          />
        );
      },
    },

    {
      title: 'Assigned Permissions',
      key: 'permissions',
      width: 350,
      render: (_, record) => {
        if (isSuperAdmin(record)) {
          return (
            <Tag
              color="gold"
              icon={<CrownOutlined />}
              style={{ borderRadius: 12 }}
            >
              All Permissions
            </Tag>
          );
        }

        const permissions = Array.isArray(
          record.permissions
        )
          ? record.permissions
          : [];

        if (permissions.length === 0) {
          return (
            <Text type="secondary">
              No permissions assigned
            </Text>
          );
        }

        return (
          <Space wrap size={[4, 4]}>
            {permissions
              .slice(0, 5)
              .map((permission) => (
                <Tag
                  key={permission}
                  color="blue"
                  icon={getPermissionIcon(
                    permission
                  )}
                >
                  {getPermissionLabel(permission)}
                </Tag>
              ))}

            {permissions.length > 5 && (
              <Tag color="default">
                +{permissions.length - 5} more
              </Tag>
            )}
          </Space>
        );
      },
    },

    {
      title: 'Actions',
      key: 'actions',
      width: 220,
      render: (_, record) => {
        if (isSuperAdmin(record)) {
          return (
            <Tag
              color="gold"
              icon={<CrownOutlined />}
            >
              Full Access
            </Tag>
          );
        }

        return (
          <Space wrap>
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() =>
                openEditModal(record)
              }
            >
              Manage
            </Button>

            <Popconfirm
              title="Remove all permissions?"
              description={`Remove all permissions from ${record.name}?`}
              onConfirm={() =>
                clearAdminPermissions(record)
              }
              okText="Yes"
              cancelText="No"
              okButtonProps={{
                danger: true,
              }}
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                size="small"
              >
                Clear All
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  /* =======================================================
     STATS
  ======================================================= */

  const totalAdmins = admins.length;

  const adminsWithPermissions = admins.filter(
    (admin) =>
      !isSuperAdmin(admin) &&
      Array.isArray(admin.permissions) &&
      admin.permissions.length > 0
  ).length;

  const superAdmins = admins.filter(
    (admin) => isSuperAdmin(admin)
  ).length;

  const allAssignedPermissions = new Set();

  admins.forEach((admin) => {
    if (isSuperAdmin(admin)) {
      PERMISSION_OPTIONS.forEach((permission) =>
        allAssignedPermissions.add(permission.value)
      );
      return;
    }

    if (Array.isArray(admin.permissions)) {
      admin.permissions.forEach((permission) =>
        allAssignedPermissions.add(permission)
      );
    }
  });

  /* =======================================================
     RENDER PERMISSION GROUPS
  ======================================================= */

  const renderPermissionGroups = () => {
    return Object.entries(permissionGroups).map(
      ([category, permissions]) => {
        const state = categoryState(category);

        return (
          <div
            key={category}
            style={{
              marginBottom: 16,
              border: '1px solid #e5e7eb',
              borderRadius: 10,
              padding: '14px 16px',
              background: '#fff',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems: 'center',
                gap: 12,
                marginBottom: 12,
                flexWrap: 'wrap',
              }}
            >
              <Space>
                <Checkbox
                  checked={state.all}
                  indeterminate={state.some}
                  onChange={(event) =>
                    toggleCategory(
                      category,
                      event.target.checked
                    )
                  }
                />

                <Text strong>{category}</Text>

                <Text
                  type="secondary"
                  style={{ fontSize: 12 }}
                >
                  ({state.count}/{state.total})
                </Text>
              </Space>
            </div>

            <Row gutter={[12, 12]}>
              {permissions.map((permission) => (
                <Col
                  xs={24}
                  sm={12}
                  md={12}
                  lg={8}
                  key={permission.value}
                >
                  <Checkbox
                    checked={selectedPermissions.includes(
                      permission.value
                    )}
                    onChange={(event) =>
                      togglePermission(
                        permission.value,
                        event.target.checked
                      )
                    }
                  >
                    <Space size={6}>
                      <span
                        style={{
                          color: selectedPermissions.includes(
                            permission.value
                          )
                            ? '#1677ff'
                            : '#94a3b8',
                        }}
                      >
                        {permission.icon}
                      </span>

                      <Text
                        style={{
                          fontSize: 13,
                        }}
                      >
                        {permission.label}
                      </Text>
                    </Space>
                  </Checkbox>
                </Col>
              ))}
            </Row>
          </div>
        );
      }
    );
  };

  /* =======================================================
     RETURN
  ======================================================= */

  return (
    <div
      style={{
        padding: screens.xs ? 12 : 24,
        background: '#f5f7fa',
        minHeight: '100vh',
      }}
    >
      {/* STATS */}
      <Row
        gutter={[12, 12]}
        style={{ marginBottom: 20 }}
      >
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title="Total Admins"
              value={totalAdmins}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title="Admins with Permissions"
              value={adminsWithPermissions}
              prefix={
                <CheckCircleOutlined
                  style={{ color: '#52c41a' }}
                />
              }
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title="Super Admins"
              value={superAdmins}
              prefix={
                <CrownOutlined
                  style={{ color: '#faad14' }}
                />
              }
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title="Permissions Assigned"
              value={allAssignedPermissions.size}
              prefix={
                <KeyOutlined
                  style={{ color: '#7265e6' }}
                />
              }
            />
          </Card>
        </Col>
      </Row>

      {/* MAIN CARD */}
      <Card
        bordered={false}
        style={{
          boxShadow:
            '0 2px 8px rgba(0,0,0,0.08)',
          borderRadius: 10,
        }}
        title={
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 9,
                background:
                  'linear-gradient(135deg,#0b1b3d,#1e3a8a)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#d4af37',
              }}
            >
              <KeyOutlined />
            </div>

            <div>
              <Title
                level={4}
                style={{
                  margin: 0,
                  color: '#0b1b3d',
                }}
              >
                Role & Feature Access Permissions
              </Title>

              <Text
                type="secondary"
                style={{ fontSize: 12 }}
              >
                Manage access rights for
                administrators
              </Text>
            </div>
          </div>
        }
        extra={
          <Space wrap>
            <Input
              placeholder="Search admins..."
              prefix={<SearchOutlined />}
              allowClear
              value={searchText}
              onChange={(event) =>
                setSearchText(
                  event.target.value
                )
              }
              style={{
                width: screens.xs ? 160 : 220,
              }}
            />

            <Button
              type="primary"
              icon={<ApiOutlined />}
              onClick={() => {
                assignForm.resetFields();
                setAssignModalOpen(true);
              }}
              disabled={!currentUserIsSuperAdmin}
              style={{
                background: '#d4af37',
                borderColor: '#d4af37',
              }}
            >
              Assign Permission
            </Button>

            <Button
              icon={<ReloadOutlined />}
              onClick={() => fetchAdmins(true)}
              loading={loading}
            >
              {!screens.xs && 'Refresh'}
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredAdmins}
          rowKey={(record) => record.id}
          loading={loading}
          scroll={{ x: 1100 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} admins`,
          }}
        />
      </Card>

      {/* =====================================================
          ASSIGN PERMISSION MODAL
      ===================================================== */}

      <Modal
        title={
          <Space>
            <ApiOutlined
              style={{ color: '#52c41a' }}
            />
            <Text strong>
              Assign Permission to Admin
            </Text>
          </Space>
        }
        open={assignModalOpen}
        onCancel={() => {
          if (!assignLoading) {
            setAssignModalOpen(false);
            assignForm.resetFields();
          }
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setAssignModalOpen(false);
              assignForm.resetFields();
            }}
            disabled={assignLoading}
          >
            Cancel
          </Button>,

          <Button
            key="submit"
            type="primary"
            icon={<ApiOutlined />}
            loading={assignLoading}
            onClick={() =>
              assignForm.submit()
            }
            style={{
              background: '#52c41a',
              borderColor: '#52c41a',
            }}
          >
            Assign Permission
          </Button>,
        ]}
        width={600}
        centered
        destroyOnClose
      >
        <Alert
          message="Assign Access to Admin"
          description="Select an administrator and choose the permission you want to assign."
          type="info"
          showIcon
          style={{ marginBottom: 18 }}
        />

        <Form
          form={assignForm}
          layout="vertical"
          onFinish={handleAssignPermission}
        >
          <Form.Item
            name="admin_id"
            label="Select Admin"
            rules={[
              {
                required: true,
                message:
                  'Please select an admin.',
              },
            ]}
          >
            <Select
              placeholder="Select an admin"
              size="large"
              showSearch
              optionFilterProp="label"
              options={admins
                .filter(
                  (admin) =>
                    !isSuperAdmin(admin)
                )
                .map((admin) => ({
                  value: admin.id,
                  label: `${admin.name} (${admin.email})`,
                }))}
            />
          </Form.Item>

          <Form.Item
            name="permission_key"
            label="Select Permission"
            rules={[
              {
                required: true,
                message:
                  'Please select a permission.',
              },
            ]}
          >
            <Select
              placeholder="Select permission"
              size="large"
              showSearch
              optionFilterProp="label"
              options={PERMISSION_OPTIONS.map(
                (permission) => ({
                  value: permission.value,
                  label: permission.label,
                })
              )}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* =====================================================
          EDIT PERMISSIONS MODAL
      ===================================================== */}

      <Modal
        title={
          <Space>
            <EditOutlined
              style={{ color: '#1677ff' }}
            />

            <Text strong>
              Manage Permissions
              {selectedAdmin
                ? `: ${selectedAdmin.name}`
                : ''}
            </Text>
          </Space>
        }
        open={editModalOpen}
        onCancel={closeEditModal}
        width={820}
        centered
        destroyOnClose
        footer={[
          <Button
            key="cancel"
            icon={<CloseOutlined />}
            onClick={closeEditModal}
            disabled={editLoading}
          >
            Cancel
          </Button>,

          <Button
            key="save"
            type="primary"
            icon={<SaveOutlined />}
            loading={editLoading}
            onClick={handleSavePermissions}
          >
            Save Changes
          </Button>,
        ]}
        styles={{
          body: {
            padding: 24,
            maxHeight: '70vh',
            overflowY: 'auto',
          },
        }}
      >
        {selectedAdmin && (
          <>
            <Alert
              message={`Managing permissions for ${selectedAdmin.name}`}
              description="Select the permissions this administrator should have. Permissions that are unchecked will be removed."
              type="info"
              showIcon
              style={{
                marginBottom: 18,
              }}
            />

            {/* SELECTION CONTROLS */}
            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems: 'center',
                gap: 12,
                flexWrap: 'wrap',
                padding: '10px 14px',
                background: '#f8fafc',
                borderRadius: 8,
                marginBottom: 18,
              }}
            >
              <Text strong>
                Selected:{' '}
                {selectedPermissions.length}{' '}
                / {PERMISSION_OPTIONS.length}
              </Text>

              <Space>
                <Button
                  size="small"
                  onClick={selectAllPermissions}
                >
                  Select All
                </Button>

                <Button
                  size="small"
                  onClick={clearAllPermissions}
                >
                  Clear All
                </Button>
              </Space>
            </div>

            {/* GROUPS */}
            {renderPermissionGroups()}

            <Divider />

            {/* WARNING */}
            <Alert
              type="warning"
              showIcon
              message="Permission changes"
              description="Changes will be applied immediately when you click Save Changes."
              style={{
                marginBottom: 14,
              }}
            />

            {/* CURRENT PERMISSIONS */}
            <Card
              size="small"
              style={{
                background: '#f8fafc',
              }}
            >
              <Text strong>
                Current Permissions
              </Text>

              <div style={{ marginTop: 10 }}>
                {selectedAdmin.permissions?.length >
                0 ? (
                  <Space wrap>
                    {selectedAdmin.permissions.map(
                      (permission) => (
                        <Tag
                          key={permission}
                          color="blue"
                        >
                          {getPermissionLabel(
                            permission
                          )}
                        </Tag>
                      )
                    )}
                  </Space>
                ) : (
                  <Text type="secondary">
                    No permissions currently
                    assigned.
                  </Text>
                )}
              </div>
            </Card>
          </>
        )}
      </Modal>
    </div>
  );
};

/* =========================================================
   WRAPPER

   Ant Design App is used here so messageApi does not
   generate the "Static function can not consume context"
   warning.
========================================================= */

const PermissionManagement = () => {
  return (
    <AntApp>
      <PermissionGuard requiredPermission="permissions_manage">
        <PermissionManagementContent />
      </PermissionGuard>
    </AntApp>
  );
};

export default PermissionManagement;