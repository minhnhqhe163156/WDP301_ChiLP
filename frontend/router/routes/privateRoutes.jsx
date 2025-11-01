import { lazy } from 'react';
import ProtectedRoute from './ProtectRoute';

const AdminDashboard = lazy(() => import('../../views/dashboard/AdminDashboard'));
// const StaffDashboard = lazy(() => import('../../views/dashboard/StaffDashboard'));
const SellerDashboard = lazy(() => import('../../views/dashboard/SellerDashboard'));
const CustomerDashboard = lazy(() => import('../../views/dashboard/CustomerDashboard'));
const MarketingDashboard = lazy(() => import('../../views/dashboard/MarketingDashboard'));
const MarketingAnalytics = lazy(() => import('../../views/dashboard/MarketingAnalytics'));

const privateRoutes = [
  {
    path: '/admin/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminDashboard />
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
  // Marketing staff routes
  {
    path: '/marketing_staff/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['marketing_staff']}>
        <MarketingDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/marketing_staff/analytics',
    element: (
      <ProtectedRoute allowedRoles={['marketing_staff']}>
        <MarketingAnalytics />
      </ProtectedRoute>
    ),
  },
  {
    path: '/marketing_staff/banners',
    element: (
      <ProtectedRoute allowedRoles={['marketing_staff']}>
        <MarketingDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/marketing_staff/blogs',
    element: (
      <ProtectedRoute allowedRoles={['marketing_staff']}>
        <MarketingDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/marketing_staff/promotions',
    element: (
      <ProtectedRoute allowedRoles={['marketing_staff']}>
        <MarketingDashboard />
      </ProtectedRoute>
    ),
  },
];

export default privateRoutes; 