import { lazy } from 'react';
import ProtectedRoute from './ProtectRoute';

const AdminDashboard = lazy(() => import('../../views/dashboard/AdminDashboard'));
const StaffDashboard = lazy(() => import('../../views/dashboard/StaffDashboard'));
const SellerDashboard = lazy(() => import('../../views/dashboard/SellerDashboard'));
const CustomerDashboard = lazy(() => import('../../views/dashboard/CustomerDashboard'));

const privateRoutes = [
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/staff/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['staff']}>
        <StaffDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/seller/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['seller']}>
        <SellerDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/customer/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['customer']}>
        <CustomerDashboard />
      </ProtectedRoute>
    ),
  },
];

export default privateRoutes;
