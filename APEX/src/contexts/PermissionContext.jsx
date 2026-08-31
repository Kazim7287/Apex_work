import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const PermissionContext = createContext(null);

const API_BASE_URL =
  'https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/';

const normalizeRole = (role) => {
  const normalized = String(role || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');

  return ['teacher', 'admin', 'sub_admin', 'super_admin'].includes(normalized)
    ? normalized
    : null;
};

const normalizePermissions = (items) => {
  if (!Array.isArray(items)) return [];

  return [
    ...new Set(
      items
        .map((item) => {
          if (typeof item === 'string') return item;
          if (item?.permission_value === 0 || item?.permission_value === '0') {
            return null;
          }
          return item?.permission_key;
        })
        .filter(Boolean)
    ),
  ];
};

const emptyAccess = () => ({
  permissions: [],
  role: null,
  isSuperAdmin: false,
  adminData: null,
});

export const PermissionProvider = ({ children }) => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [adminData, setAdminData] = useState(null);

  const clearPermissions = useCallback(() => {
    const empty = emptyAccess();
    setPermissions(empty.permissions);
    setUserRole(empty.role);
    setIsSuperAdmin(empty.isSuperAdmin);
    setAdminData(empty.adminData);
  }, []);

  const fetchUserPermissions = useCallback(async () => {
    setLoading(true);
    // clearPermissions();

    try {
      let adminEmail = null;
      const storedAdminData = localStorage.getItem('adminData');

      if (storedAdminData) {
        try {
          const parsedData = JSON.parse(storedAdminData);
          adminEmail = parsedData?.email || null;
        } catch (error) {
          console.warn('Invalid adminData in localStorage:', error);
        }
      }

      // Never use a Super Admin email as a fallback.
      if (!adminEmail) {
        console.warn('No logged-in account found. Access denied.');
        return;
      }

      const adminResponse = await fetch(
        `${API_BASE_URL}Admindata.php?email=${encodeURIComponent(adminEmail)}`,
        {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        }
      );

      if (!adminResponse.ok) {
        throw new Error(`Admindata.php failed: ${adminResponse.status}`);
      }

      const adminResult = await adminResponse.json();
      const data = adminResult?.data;

      if (!adminResult?.success || !data?.id) {
        throw new Error(adminResult?.message || 'No user account returned');
      }

      const role = normalizeRole(data.role);

      if (!role) {
        throw new Error(`Unknown account role: ${data.role || 'missing'}`);
      }

      const normalizedAdminData = { ...data, role };
      setAdminData(normalizedAdminData);
      setUserRole(role);

      // Full access is possible only when the API explicitly returns this role.
      if (role === 'super_admin') {
        setIsSuperAdmin(true);
        setPermissions(['*']);
        return;
      }

      const permissionResponse = await fetch(
        `${API_BASE_URL}get_admin_permissions.php?admin_id=${encodeURIComponent(
          data.id
        )}`,
        {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        }
      );

      if (!permissionResponse.ok) {
        throw new Error(
          `get_admin_permissions.php failed: ${permissionResponse.status}`
        );
      }

      const permissionResult = await permissionResponse.json();
      const permissionItems =
        permissionResult?.data || permissionResult?.permissions || [];

      setIsSuperAdmin(false);
      setPermissions(normalizePermissions(permissionItems));
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
      // Fail closed. Never grant permissions on error.
      clearPermissions();
    } finally {
      setLoading(false);
    }
  }, [clearPermissions]);

  useEffect(() => {
    fetchUserPermissions();
  }, [fetchUserPermissions]);

  const hasPermission = useCallback(
    (permissionKey) => {
      if (!permissionKey || !userRole) return false;
      if (isSuperAdmin) return true;
      return permissions.includes(permissionKey);
    },
    [isSuperAdmin, permissions, userRole]
  );

  const hasAnyPermission = useCallback(
    (permissionKeys = []) => {
      if (!Array.isArray(permissionKeys) || permissionKeys.length === 0) {
        return false;
      }
      return permissionKeys.some((key) => hasPermission(key));
    },
    [hasPermission]
  );

  const hasAllPermissions = useCallback(
    (permissionKeys = []) => {
      if (!Array.isArray(permissionKeys) || permissionKeys.length === 0) {
        return false;
      }
      return permissionKeys.every((key) => hasPermission(key));
    },
    [hasPermission]
  );

  const value = useMemo(
    () => ({
      permissions,
      loading,
      userRole,
      isSuperAdmin,
      isAdmin: userRole === 'admin' || userRole === 'super_admin',
      isTeacher: userRole === 'teacher',
      adminData,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      refreshPermissions: fetchUserPermissions,
    }),
    [
      permissions,
      loading,
      userRole,
      isSuperAdmin,
      adminData,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      fetchUserPermissions,
    ]
  );

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionContext);

  if (!context) {
    throw new Error('usePermissions must be used inside PermissionProvider');
  }

  return context;
};

export default PermissionContext;