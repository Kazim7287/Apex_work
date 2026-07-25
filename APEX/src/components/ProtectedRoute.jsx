/* eslint-disable react/prop-types */
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const { token, userType } = useSelector((state) => state.auth || {}); // ✅ Fallback added

  console.log('ProtectedRoute check:', { 
    hasToken: !!token, 
    userType, 
    allowedRoles,
    hasAccess: token && allowedRoles.includes(userType) 
  });

  if (!token) {
    console.log('Redirecting to home - no token');
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(userType)) {
    console.log('Redirecting to unauthorized - invalid role');
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
