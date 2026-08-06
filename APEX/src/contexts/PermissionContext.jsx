// src/contexts/PermissionContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const PermissionContext = createContext(null);

const API_BASE_URL = 'https://white-trout-460511.hostingersite.com/APEXCOLLEGE_HARICHAND/APC/APEX/';

export const PermissionProvider = ({ children }) => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('admin');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [adminData, setAdminData] = useState(null);

  useEffect(() => {
    fetchUserPermissions();
  }, []);

  const fetchUserPermissions = async () => {
    setLoading(true);
    console.log('🔍 Fetching user permissions...');
    
    try {
      // Get admin email from localStorage adminData
      let adminEmail = 'superadmin@apex.com'; // Default fallback
      
      try {
        const storedAdminData = localStorage.getItem('adminData');
        if (storedAdminData) {
          const parsedData = JSON.parse(storedAdminData);
          if (parsedData && parsedData.email) {
            adminEmail = parsedData.email;
            console.log('📧 Found admin email from localStorage:', adminEmail);
          }
        }
      } catch (e) {
        console.warn('⚠️ Could not parse adminData from localStorage:', e);
      }
      
      console.log('📡 Calling Admindata.php for email:', adminEmail);
      const adminResponse = await fetch(`${API_BASE_URL}Admindata.php?email=${encodeURIComponent(adminEmail)}`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });

      console.log('📡 Admindata.php response status:', adminResponse.status);

      if (!adminResponse.ok) {
        console.error('❌ Admindata.php failed with status:', adminResponse.status);
        setDefaultPermissions();
        setLoading(false);
        return;
      }

      const adminResult = await adminResponse.json();
      console.log('📋 Admindata.php response:', adminResult);

      if (adminResult.success && adminResult.data) {
        setAdminData(adminResult.data);
        
        const adminId = adminResult.data.id;
        const adminRole = adminResult.data.role;
        const isSuperAdminFromApi = adminRole === 'super_admin';
        
        console.log('✅ Admin found:', adminResult.data.name, 'ID:', adminId, 'Role:', adminRole);
        console.log('👑 Is Super Admin:', isSuperAdminFromApi);
        
        setIsSuperAdmin(isSuperAdminFromApi);
        
        if (isSuperAdminFromApi) {
          console.log('👑 Super Admin detected - granting all permissions');
          setUserRole('super_admin');
          const allPerms = [
            // Dashboard & Core
            'dashboard_view', 'students_view', 'teachers_view', 'classes_view',
            
            // Announcements
            'teacher-list', 'teacher-list',
            
            // Exams
            'exams_view', 'exams_manage',
            
            // Books
            'books_view', 'books_manage', 'books_delete',
            
            // Students Management
            'students_manage', 'students_delete',
            
            // Other Features
            'assignments_view', 'performance_view', 'attendance_view',
            'evaluations_view', 'dues_view', 'timetable_view', 'events_view',
            'applications_view', 'feedback_view', 'about_view',
            
            // Admin & Settings
            'admins_manage', 'permissions_manage', 'settings_view'
          ];
          setPermissions(allPerms);
          setLoading(false);
          return;
        }

        // For regular admin, fetch permissions
        // console.log('📡 Calling get_admin_permissions.php for admin ID:', adminId);
        const permResponse = await fetch(`${API_BASE_URL}get_admin_permissions.php?admin_id=${adminId}`, {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
          }
        });

        // console.log('📡 get_admin_permissions.php response status:', permResponse.status);

        if (permResponse.ok) {
          const permData = await permResponse.json();
         // console.log('📋 get_admin_permissions.php response:', permData);
          
          if (permData.success) {
            const permKeys = permData.data
              .filter(p => p.permission_value === 1)
              .map(p => p.permission_key);
            setPermissions(permKeys);
            setUserRole('admin');
            // console.log('✅ Permissions loaded:', permKeys.length, 'permissions:', permKeys);
          } else {
            console.warn('⚠️ No permissions found in response');
            setPermissions([]);
          }
        } else {
          console.error('❌ get_admin_permissions.php failed with status:', permResponse.status);
          setPermissions([]);
        }
      } else {
        console.warn('⚠️ No admin data found, using default permissions');
        setDefaultPermissions();
      }
    } catch (error) {
      console.error('❌ Failed to fetch permissions:', error);
      setDefaultPermissions();
    } finally {
      setLoading(false);
    }
  };

  const setDefaultPermissions = () => {
    // console.log('📌 Setting default permissions for testing');
    const defaultPerms = [
      // Dashboard & Core
      'dashboard_view', 'students_view', 'teachers_view', 'classes_view',
      
      // Announcements
      'announcements_view', 'announcements_manage',
      
      // Exams
      'exams_view', 'exams_manage',
      
      // Books
      'books_view', 'books_manage', 'books_delete',
      
      // Students Management
      'students_manage', 'students_delete',
      
      // Other Features
      'assignments_view', 'performance_view', 'attendance_view',
      'evaluations_view', 'dues_view', 'timetable_view', 'events_view',
      'applications_view', 'feedback_view', 'about_view',
      
      // Admin & Settings
      'admins_manage', 'permissions_manage', 'settings_view'
    ];
    setPermissions(defaultPerms);
    setIsSuperAdmin(true);
    setUserRole('super_admin');
    setAdminData({
      id: 1,
      name: 'Test Admin',
      email: 'test@apex.com',
      designation: 'System Administrator',
      role: 'super_admin'
    });
  };

  const hasPermission = (permissionKey) => {
    // console.log(`🔑 Checking permission: ${permissionKey}, isSuperAdmin: ${isSuperAdmin}`);
    if (isSuperAdmin) {
      console.log(`✅ Super Admin - ${permissionKey} granted`);
      return true;
    }
    const result = permissions.includes(permissionKey);
    console.log(`🔑 ${permissionKey}: ${result}`);
    return result;
  };

  const hasAnyPermission = (permissionKeys) => {
    if (isSuperAdmin) return true;
    if (!permissionKeys || permissionKeys.length === 0) return true;
    return permissionKeys.some(key => permissions.includes(key));
  };

  const hasAllPermissions = (permissionKeys) => {
    if (isSuperAdmin) return true;
    if (!permissionKeys || permissionKeys.length === 0) return true;
    return permissionKeys.every(key => permissions.includes(key));
  };

  const value = {
    permissions,
    loading,
    userRole,
    isSuperAdmin,
    adminData,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    refreshPermissions: fetchUserPermissions
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    console.error('❌ usePermissions must be used within PermissionProvider');
    // Return a default context with all permissions for development
    return {
      permissions: [],
      loading: false,
      isSuperAdmin: true,
      adminData: null,
      hasPermission: () => true,
      hasAnyPermission: () => true,
      hasAllPermissions: () => true,
    };
  }
  return context;
};

export default PermissionContext;