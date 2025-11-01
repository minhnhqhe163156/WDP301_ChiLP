import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  FaHome,
  FaShoppingBag,
  FaUsers,
  FaCog,
  FaSignOutAlt,
  FaBox,
  FaChartLine,
  FaTicketAlt,
  FaUserCircle,
  FaHeart,
  FaShoppingCart,
  FaClipboardList,
  FaComments
} from 'react-icons/fa';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { icon: <FaHome />, label: 'Dashboard', path: '/admin/dashboard' },
          { icon: <FaUsers />, label: 'Users', path: '/admin/users' },
          { icon: <FaBox />, label: 'Products', path: '/admin/products' },
          { icon: <FaChartLine />, label: 'Analytics', path: '/admin/analytics' },
          { icon: <FaComments />, label: 'Chat', path: '/admin/chat' },
          { icon: <FaCog />, label: 'Settings', path: '/admin/settings' }
        ];
      case 'seller':
        return [
          { icon: <FaHome />, label: 'Dashboard', path: '/seller/dashboard' },
          { icon: <FaBox />, label: 'Products', path: '/seller/products' },
          { icon: <FaShoppingBag />, label: 'Orders', path: '/seller/orders' },
          { icon: <FaComments />, label: 'Chat', path: '/seller/chat' },
          { icon: <FaChartLine />, label: 'Analytics', path: '/seller/analytics' }
        ];
      case 'marketing_staff':
        return [
          { icon: <FaHome />, label: 'Dashboard', path: '/marketing_staff/dashboard' },
          { icon: <FaChartLine />, label: 'View Analytics', path: '/marketing_staff/analytics' },
          { icon: <FaBox />, label: 'Banners', path: '/marketing_staff/banners' },
          { icon: <FaClipboardList />, label: 'Blogs', path: '/marketing_staff/blogs' },
          { icon: <FaTicketAlt />, label: 'Promotions', path: '/marketing_staff/promotions' },
          { icon: <FaComments />, label: 'Chat', path: '/marketing_staff/chat' }
        ];
      case 'customer':
        return [
          { icon: <FaHome />, label: 'Dashboard', path: '/customer/dashboard' },
          { icon: <FaShoppingCart />, label: 'Orders', path: '/customer/orders' },
          { icon: <FaShoppingBag />, label: 'Cart', path: '/customer/cart' },
          { icon: <FaHeart />, label: 'Wishlist', path: '/customer/wishlist' },
          { icon: <FaComments />, label: 'Chat', path: '/customer/chat' },
          { icon: <FaUserCircle />, label: 'Profile', path: '/customer/profile' }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-400/10 to-teal-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200/60 shadow-lg shadow-slate-900/5 z-40">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-6">Ecommerce</h1>
          <nav className="space-y-1">
            {getNavItems().map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className="flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-300"
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
        
        {/* User Profile Section */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-200/60">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
              {user?.name?.[0]?.toUpperCase() || <FaUserCircle />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-300"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content - Fixed positioning to avoid header overlap */}
      <div className="pl-64 pt-0"> {/* Removed top padding to avoid header overlap */}
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout; 