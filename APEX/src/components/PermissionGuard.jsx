// components/PermissionGuard.jsx
import React from 'react';
import { Result, Button, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../contexts/PermissionContext';

const PermissionGuard = ({ 
  children, 
  requiredPermission, 
  requiredPermissions = [],
  requireAll = false,
  fallback = null,
  redirectTo = '/admin/dashboard' // Changed from '/dashboard' to '/admin/dashboard'
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = usePermissions();
  const navigate = useNavigate();

  // Show loading state
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <Spin size="large" />
        <div style={{ color: '#666', fontSize: '14px' }}>Loading permissions...</div>
      </div>
    );
  }

  // Check if user has access
  let hasAccess = false;

  if (requiredPermission) {
    hasAccess = hasPermission(requiredPermission);
  } else if (requiredPermissions.length > 0) {
    hasAccess = requireAll 
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);
  } else {
    hasAccess = true;
  }

  // If no access, show 403 or fallback
  if (!hasAccess) {
    if (fallback) {
      return fallback;
    }

    return (
      <Result
        status="403"
        title="Access Denied"
        subTitle="You don't have permission to access this page. Please contact your administrator."
        extra={
          <Button type="primary" onClick={() => navigate(redirectTo)}>
            Go to Dashboard
          </Button>
        }
      />
    );
  }

  // If has access, render children
  return children;
};

export default PermissionGuard;