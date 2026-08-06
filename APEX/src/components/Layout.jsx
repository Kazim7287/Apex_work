// src/components/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Layout as AntLayout } from 'antd';
import Sidebar from '../pages/Admin/Sidebar';
import { PermissionProvider } from '../contexts/PermissionContext';

const { Content } = AntLayout;

const Layout = () => {
  return (
    <PermissionProvider>
      <AntLayout >
      
        <AntLayout >
          <Content 
          >
            <Outlet />
          </Content>
        </AntLayout>
      </AntLayout>
    </PermissionProvider>
  );
};

export default Layout;