// src/components/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <>
      {/* You can add header/sidebar here if needed */}
      <Outlet />
    </>
  );
};

export default Layout;
