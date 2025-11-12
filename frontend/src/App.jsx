import React from "react";
import "./App.css";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoadingScreen from "./components/LoadingScreen";
import Home from "./views/Home";
import LoginAndRegister from "./views/auth/LoginAndRegister";
import CustomerDashboard from "./views/dashboard/CustomerDashboard";
import SellerDashboard from "./views/dashboard/SellerDashboard";
import AdminDashboard from "./views/dashboard/AdminDashboard";
// import StaffDashboard from "./views/dashboard/StaffDashboard";
import MarketingDashboard from "./views/dashboard/MarketingDashboard";
import Header from "./components/Header";
import ChatApp from "./views/chat/ChatApp";
import ProfilePage from "./views/auth/ProfilePage";
import ProductDetail from "./components/ProductDetail";
import CollectionProducts from "./views/collections/CollectionProducts";
import CartPage from "./views/cart/CartPage";
import ShippingInfoPage from "./views/checkout/ShippingInfoPage";
import PaymentPage from "./views/checkout/PaymentPage";
import CheckoutSuccessPage from "./views/checkout/CheckoutSuccessPage";
import CustomerOrderHistory from "./views/order/CustomerOrderHistory";
import SellerOrderManagement from "./views/order/SellerOrderManagement";
import OrderDetail from "./views/order/OrderDetail";
import BlogList from "./views/blog/BlogList";
import BlogDetail from "./views/blog/BlogDetail";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SellerProductReviews from "./views/dashboard/analytics/SellerProductReviews";
import SellerAnalytics from "./views/dashboard/analytics/SellerAnalytics";
import SellerOrders from "./views/dashboard/analytics/SellerOrders";
import SellerProducts from "./views/dashboard/analytics/SellerProducts";
import AboutPage from "./components/AboutPage";
import ServicesPage from "./components/ServicesPage";
// import NewsPage from "./components/NewsPage";
import GuidePage from "./components/GuidePage";
// import AddProduct from "./views/dashboard/analytics/AddProduct";
import ProductDetailSeller from "./views/dashboard/analytics/ProductDetailSeller";
import ProductEdit from "./views/dashboard/analytics/ProductEdit";
import ProductCreate from "./views/dashboard/analytics/ProductCreate";
import ProductCategory from "./views/dashboard/analytics/ProductCategory";
// import SellerCategoryManager from "./views/dashboard/analytics/SellerCategoryManager";

const AppRoutes = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Don't show header on login/register page
  const showHeader = !location.pathname.includes("loginandregister");

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      {showHeader && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        {/* <Route path="/news" element={<NewsPage />} /> */}
        <Route path="/guide" element={<GuidePage />} />
        <Route path="/blogs" element={<BlogList />} />
        <Route path="/blog/:id" element={<BlogDetail />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route
          path="/collections/:type/:value"
          element={<CollectionProducts />}
        />
        <Route
          path="/loginandregister"
          element={
            user ? (
              <Navigate to={`/${user.role}/dashboard`} replace />
            ) : (
              <LoginAndRegister />
            )
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/dashboard"
          element={
            <ProtectedRoute allowedRoles={["seller"]}>
              <SellerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/dashboard"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/marketing_staff/dashboard"
          element={
            <ProtectedRoute allowedRoles={["marketing_staff"]}>
              <MarketingDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/conversations"
          element={
            <ProtectedRoute allowedRoles={["customer", "seller"]}>
              <ChatApp />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute
              allowedRoles={["customer", "seller", "admin", "marketing_staff"]}
            >
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout/shipping" element={<ShippingInfoPage />} />
        <Route path="/checkout/payment" element={<PaymentPage />} />
        <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
        <Route
          path="/orders/history"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <CustomerOrderHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:orderId"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <OrderDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="seller/dashboard/seller/order-management"
          element={
            <ProtectedRoute allowedRoles={["seller"]}>
              <SellerOrderManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/reviews"
          element={
            <ProtectedRoute allowedRoles={["seller"]}>
              <SellerProductReviews />
            </ProtectedRoute>
          }
        />

        <Route
          path="/seller/analytics"
          element={
            <ProtectedRoute allowedRoles={["seller"]}>
              <SellerAnalytics />
            </ProtectedRoute>
          }
        />

        <Route
          path="/seller/order-management"
          element={
            <ProtectedRoute allowedRoles={["seller"]}>
              <SellerOrders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/seller/products"
          element={
            <ProtectedRoute allowedRoles={["seller"]}>
              <SellerProducts />
            </ProtectedRoute>
          }
        />

        <Route
          path="/seller/categories"
          element={
            <ProtectedRoute allowedRoles={["seller"]}>
              <ProductCategory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/seller/products/new"
          element={
            <ProtectedRoute allowedRoles={["seller"]}>
              <ProductCreate />
            </ProtectedRoute>
          }
        />

        <Route
          path="/seller/products/view/:id"
          element={<ProductDetailSeller />}
        />

        <Route
          path="/seller/products/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["seller"]}>
              <ProductEdit />
            </ProtectedRoute>
          }
        />
        {/* 
        <Route
          path="/seller/categories"
          element={
            <ProtectedRoute allowedRoles={["seller"]}>
              <SellerCategoryManager />
            </ProtectedRoute>
          }
        /> */}
      </Routes>

      <ToastContainer />
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;
