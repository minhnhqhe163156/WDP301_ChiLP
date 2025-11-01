import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    // Có thể thay bằng spinner hoặc component loading riêng
    return <div>Đang kiểm tra đăng nhập...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/loginandregister" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'seller':
        return <Navigate to="/seller/dashboard" replace />;
      case 'marketing_staff':
        return <Navigate to="/marketing/dashboard" replace />;
      case 'customer':
        return <Navigate to="/customer/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute; 