import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { orderAPI, userAPI, cartAPI, reviewAPI, wishlistAPI } from "../../api/api";
import toast from "react-hot-toast";
import {
  FaUser,
  FaBox,
  FaComments,
  FaStar,
  FaSearch,
  FaShoppingCart,
  FaHeart,
  FaBell,
  FaSignOutAlt,
  FaFilter,
  FaCamera,
  FaPaperPlane,
  FaEye,
  FaTrash,
  FaTachometerAlt,
  FaCog,
  FaBars,
  FaTimes,
  FaPlus,
  FaEdit,
  FaCheck,
  FaExclamationTriangle,
  FaCreditCard,
  FaMapMarkerAlt,
  FaClock,
  FaChevronRight,
  FaGift,
  FaCheckCircle,
} from "react-icons/fa";
import { FiTrendingUp } from "react-icons/fi";
import { fetchNotifications, markAsRead } from "../../api/notification";
import AddressManager from "./tabs/AddressManager";
import TransactionHistory from "./tabs/TransactionHistory";
import ReturnRequestManager from "./tabs/ReturnRequestManager";
import SupportCenter from "./tabs/SupportCenter";
import VoucherManager from "./tabs/VoucherManager";
import SecurityManager from "./tabs/SecurityManager";
import ReviewManager from "./tabs/ReviewManager";
import NotificationCenter from "./tabs/NotificationCenter";
import RecentlyViewed from "./tabs/RecentlyViewed";

const CustomerDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const lastScrollY = useRef(window.scrollY);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Thêm state cho chỉnh sửa profile
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [newAvatar, setNewAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef();
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  // Fetch orders from API
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderAPI.getMyOrders();
      if (res.data.success) {
        setOrders(res.data.orders);
      } else {
        toast.error("Không thể tải danh sách đơn hàng!");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Lỗi khi tải danh sách đơn hàng: " + error.message);
    }
    setLoading(false);
  };

  const fetchCart = async () => {
    try {
      const res = await cartAPI.getCart();
      if (res.data && res.data.items) {
        setCartCount(res.data.items.length);
      } else {
        setCartCount(0);
      }
    } catch {
      setCartCount(0);
    }
  };

  const fetchReviews = async () => {
    try {
      if (!user || !user.email) return setReviewCount(0);
      const res = await reviewAPI.getReviewByUserEmail(user.email);
      if (Array.isArray(res.data)) {
        setReviewCount(res.data.length);
      } else {
        setReviewCount(0);
      }
    } catch {
      setReviewCount(0);
    }
  };

  const fetchWishlist = async () => {
    try {
      if (!user || !user.email) return setWishlistCount(0);
      const res = await wishlistAPI.getWishlistByUserEmail(user.email);
      if (Array.isArray(res.data)) {
        setWishlistCount(res.data.length);
        // Phát event cập nhật wishlist cho Header
        window.dispatchEvent(new CustomEvent("wishlist-updated", { detail: { count: res.data.length } }));
      } else {
        setWishlistCount(0);
        window.dispatchEvent(new CustomEvent("wishlist-updated", { detail: { count: 0 } }));
      }
    } catch {
      setWishlistCount(0);
      window.dispatchEvent(new CustomEvent("wishlist-updated", { detail: { count: 0 } }));
    }
  };

  const fetchWishlistProducts = async () => {
    try {
      if (!user || !user.email) return setWishlistProducts([]);
      const res = await wishlistAPI.getWishlistByUserEmail(user.email);
      if (Array.isArray(res.data)) {
        setWishlistProducts(res.data);
        // Phát event cập nhật wishlist cho Header (nếu muốn đồng bộ số lượng khi tab wishlist được load)
        window.dispatchEvent(new CustomEvent("wishlist-updated", { detail: { count: res.data.length } }));
      } else {
        setWishlistProducts([]);
        window.dispatchEvent(new CustomEvent("wishlist-updated", { detail: { count: 0 } }));
      }
    } catch {
      setWishlistProducts([]);
      window.dispatchEvent(new CustomEvent("wishlist-updated", { detail: { count: 0 } }));
    }
  };

  useEffect(() => {
    if (user && user.role === "customer") {
      fetchOrders();
      fetchCart();
      fetchReviews();
      fetchWishlist();
      setEditName(user.name); // Khởi tạo tên khi user đã có
    } else {
      toast.error("Bạn cần đăng nhập với vai trò khách hàng!");
      navigate("/loginandregister");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (activeTab === "wishlist") {
      fetchWishlistProducts();
    }
  }, [activeTab, user]);

  useEffect(() => {
    if (!user || user.role !== "customer") return;
    const getNotifications = async () => {
      try {
        const data = await fetchNotifications({ role: "customer" });
        setNotifications(data);
        setUnread(data.filter(n => !n.is_read).length);
      } catch {
        // ignore error
      }
    };
    getNotifications();
    const interval = setInterval(getNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
    // eslint-disable-next-line
  }, [location.search]);

  const handleRead = async (id) => {
    await markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, is_read: true } : n))
    );
    setUnread((prev) => prev - 1);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY.current) {
        // setShowHeader(false); // scroll down
      } else {
        // setShowHeader(true); // scroll up
      }
      lastScrollY.current = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Stats calculation
  const stats = [
    {
      label: "Tổng số đơn hàng",
      value: orders.length,
      icon: <FaBox />,
      color: "primary",
      change: orders.length > 0 ? "+1" : "",
      trend: orders.length > 0 ? "up" : "neutral",
    },
    {
      label: "Sản phẩm yêu thích",
      value: wishlistCount,
      icon: <FaHeart />,
      color: "danger",
      change: "+3",
      trend: "up",
    },
    {
      label: "Sản phẩm trong giỏ",
      value: cartCount,
      icon: <FaShoppingCart />,
      color: "success",
      change: "",
      trend: "neutral",
    },
    {
      label: "Đánh giá đã gửi",
      value: reviewCount,
      icon: <FaStar />,
      color: "warning",
      change: "+2",
      trend: "up",
    },
  ];

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
    { id: "profile", label: "Profile", icon: <FaUser /> },
    { id: "orders", label: "Orders", icon: <FaBox /> },
    { id: "wishlist", label: "Wishlist", icon: <FaHeart /> },
    { id: "reviews", label: "Đánh giá", icon: <FaStar /> },
    // { id: "vouchers", label: "Voucher", icon: <FaGift /> },
    { id: "notifications", label: "Thông báo", icon: <FaBell /> },
    { id: "security", label: "Bảo mật", icon: <FaCog /> },
    // { id: "settings", label: "Settings", icon: <FaCog /> },
  ];

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      let avatarUrl = user.picture_avatar || "https://via.placeholder.com/120";
      if (newAvatar) {
        // Upload lên server (Cloudinary)
        const formData = new FormData();
        formData.append("file", newAvatar);
        formData.append("upload_preset", "upload_preset"); // Thay bằng preset của bạn nếu khác
        const res = await fetch("https://api.cloudinary.com/v1_1/dqanjlzvj/image/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        console.log("Cloudinary upload result:", data);
        if (data.secure_url) {
          avatarUrl = data.secure_url;
        } else {
          toast.error("Upload ảnh thất bại. Vui lòng thử lại.");
          setSaving(false);
          return;
        }
      }
      // Nếu vẫn không có avatarUrl, dùng placeholder
      if (!avatarUrl) avatarUrl = "https://via.placeholder.com/120";
      const payload = {
        name: editName,
        email: user.email,
        picture_avatar: avatarUrl,
      };
      console.log("Payload update profile:", payload);
      if (!payload.name || !payload.email || !payload.picture_avatar) {
        toast.error("Thiếu thông tin bắt buộc (name, email, avatar)");
        setSaving(false);
        return;
      }
      await userAPI.updateProfile(payload);
      const updatedUser = { ...user, name: editName, picture_avatar: avatarUrl };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      toast.success("Cập nhật hồ sơ thành công!");
      setNewAvatar(null);
      setAvatarPreview(null);
    } catch (error) {
      toast.error("Cập nhật hồ sơ thất bại: " + (error.response?.data?.message || error.message));
    }
    setSaving(false);
  };

  const renderDashboard = () => (
    <div className="container-fluid">
      {/* Welcome Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div
            className="card border-0 shadow-lg"
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              backdropFilter: "blur(10px)",
              borderRadius: "20px",
            }}
          >
            <div className="card-body p-4">
              <div className="row align-items-center">
                <div className="col-md-8">
                  <h2 className="fw-bold mb-2">Chào mừng, {user.name}! 👋</h2>
                  <p className="mb-0 opacity-75">
                    Đây là thông tin tài khoản của bạn hôm nay.
                  </p>
                </div>
                <div className="col-md-4 text-end">
                  <div className="d-flex align-items-center justify-content-end">
                    <FaGift className="me-2" size={24} />
                    <span className="fw-semibold">Ưu đãi đặc biệt có sẵn</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="row g-4 mb-4">
        {stats.map((stat, index) => (
          <div key={index} className="col-12 col-sm-6 col-md-3 mb-3">
            <div
              className="card border-0 shadow-sm h-100"
              style={{
                borderRadius: "16px",
                transition: "all 0.3s ease",
                background: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(10px)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow =
                  "0 10px 30px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 0.125rem 0.25rem rgba(0,0,0,0.075)";
              }}
            >
              <div className="card-body p-4">
                <div className="d-flex align-items-center">
                  <div
                    className={`rounded-circle d-flex align-items-center justify-content-center me-3`}
                    style={{
                      width: "60px",
                      height: "60px",
                      background: `linear-gradient(135deg, var(--bs-${
                        stat.color
                      }) 0%, var(--bs-${
                        stat.color === "primary"
                          ? "info"
                          : stat.color === "danger"
                          ? "pink"
                          : stat.color === "success"
                          ? "teal"
                          : "orange"
                      }) 100%)`,
                      color: "white",
                      fontSize: "1.5rem",
                    }}
                  >
                    {stat.icon}
                  </div>
                  <div className="flex-grow-1">
                    <h3 className="fw-bold mb-1" style={{ fontSize: "2rem" }}>
                      {stat.value}
                    </h3>
                    <p className="text-muted mb-1 small">{stat.label}</p>
                    {stat.change && (
                      <div className="d-flex align-items-center">
                        <FiTrendingUp className="text-success me-1" size={12} />
                        <span className="text-success fw-semibold small">
                          {stat.change}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="row">
        <div className="col-12">
          <div
            className="card border-0 shadow-sm"
            style={{
              borderRadius: "16px",
              background: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div className="card-header bg-transparent border-0 p-4">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="fw-bold mb-0">Đơn hàng gần đây</h4>
                <button
                  className="btn btn-outline-primary btn-sm rounded-pill px-3"
                  onClick={() => navigate("/orders/history")}
                >
                  Xem tất cả <FaChevronRight className="ms-1" size={12} />
                </button>
              </div>
            </div>
            <div className="card-body p-0">
              {loading ? (
                <div className="p-4 text-center">
                  <div
                    className="spinner-border text-primary mb-3"
                    role="status"
                    style={{ width: "3rem", height: "3rem" }}
                  >
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="text-muted">Đang tải đơn hàng...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="p-4 text-center">
                  <FaBox size={48} className="text-muted mb-3" />
                  <h4>Chưa có đơn hàng</h4>
                  <p className="text-muted">Hãy bắt đầu mua sắm ngay!</p>
                </div>
              ) : (
                <div className="row">
                  {orders.slice(0, 3).map((order, index) => (
                    <div key={index} className="col-12 col-md-4 mb-3">
                      <div
                        className="d-flex align-items-center p-4 border-bottom border-light recent-order-item"
                        style={{ transition: "all 0.2s ease" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "rgba(102, 126, 234, 0.05)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = "transparent")
                        }
                      >
                        <img
                          src={
                            Array.isArray(order.items[0]?.productId?.imageurl) &&
                            order.items[0].productId.imageurl.length > 0
                              ? order.items[0].productId.imageurl[0]
                              : "https://via.placeholder.com/60"
                          }
                          alt={
                            order.items[0]?.productId?.product_name ||
                            "Product Image"
                          }
                          className="rounded-3 me-3"
                          width={60}
                          height={60}
                          style={{ objectFit: "cover" }}
                          onError={(e) =>
                            (e.target.src = "https://via.placeholder.com/60")
                          }
                        />
                        <div className="flex-grow-1">
                          <h6 className="fw-semibold mb-1">
                            {order.items[0]?.productId?.product_name ||
                              "Tên sản phẩm không rõ"}
                          </h6>
                          <p className="text-muted small mb-1">
                            Đơn hàng {order._id}
                          </p>
                          <small className="text-muted">
                            {formatDate(order.createdAt)}
                          </small>
                        </div>
                        <div className="text-end">
                          <span
                            className={`badge rounded-pill mb-2 ${
                              order.orderStatus === "Delivered"
                                ? "bg-success"
                                : order.orderStatus === "Shipped"
                                ? "bg-primary"
                                : order.orderStatus === "Cancelled"
                                ? "bg-danger"
                                : "bg-warning"
                            }`}
                            style={{ fontSize: "0.75rem" }}
                          >
                            {order.orderStatus}
                          </span>
                          <div className="fw-bold">
                            {order.totalAmount.toLocaleString("vi-VN")} ₫
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => {
    return (
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div
              className="card border-0 shadow-sm"
              style={{
                borderRadius: "20px",
                background: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(10px)",
              }}
            >
              <div className="card-header bg-transparent border-0 p-4">
                <h4 className="fw-bold mb-1">Cài đặt hồ sơ</h4>
                <p className="text-muted mb-0">
                  Quản lý thông tin và sở thích tài khoản.
                </p>
              </div>
              <div className="card-body p-4">
                <div className="row">
                  <div className="col-md-4 text-center mb-4">
                    <div className="position-relative d-inline-block">
                      <img
                        src={avatarPreview || user.picture_avatar}
                        alt="Profile"
                        className="rounded-circle border border-3 border-light shadow"
                        width={120}
                        height={120}
                        style={{ objectFit: "cover" }}
                      />
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        ref={fileInputRef}
                        onChange={handleAvatarChange}
                      />
                      <button
                        className="avatar-camera-btn"
                        onClick={() => fileInputRef.current.click()}
                        type="button"
                        title="Đổi ảnh đại diện"
                        style={{
                          position: "absolute",
                          bottom: 8,
                          right: 8,
                          width: 38,
                          height: 38,
                          borderRadius: "50%",
                          background: "#2196f3",
                          color: "#fff",
                          border: "3px solid #fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 2px 8px rgba(33,150,243,0.15)",
                          transition: "background 0.2s, box-shadow 0.2s",
                          zIndex: 2,
                          cursor: "pointer",
                          fontSize: "1.2rem",
                          padding: 0,
                        }}
                        onMouseOver={e => {
                          e.currentTarget.style.background = "#1769aa";
                          e.currentTarget.style.boxShadow = "0 4px 16px rgba(33,150,243,0.25)";
                        }}
                        onMouseOut={e => {
                          e.currentTarget.style.background = "#2196f3";
                          e.currentTarget.style.boxShadow = "0 2px 8px rgba(33,150,243,0.15)";
                        }}
                      >
                        <FaCamera />
                      </button>
                    </div>
                  </div>
                  <div className="col-md-8">
                    <div>
                      <div className="mb-3">
                        <label className="form-label fw-semibold">
                          Họ và tên
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-lg rounded-pill border-0 shadow-sm"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          style={{ backgroundColor: "rgba(248, 249, 250, 0.8)" }}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-semibold">
                          Email
                        </label>
                        <input
                          type="email"
                          className="form-control form-control-lg rounded-pill border-0 shadow-sm"
                          value={user.email}
                          readOnly
                          style={{ backgroundColor: "rgba(248, 249, 250, 0.8)", color: '#888' }}
                        />
                      </div>
                      <button
                        className="btn btn-success rounded-pill px-4"
                        onClick={handleSaveProfile}
                        disabled={saving}
                      >
                        {saving ? "Đang lưu..." : "Lưu thay đổi"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderNotifications = () => (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div
            className="card border-0 shadow-sm"
            style={{
              borderRadius: "16px",
              background: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div className="card-header bg-transparent border-0 p-4">
              <h4 className="fw-bold mb-0">Thông báo</h4>
            </div>
            <div className="card-body p-0">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`d-flex align-items-start p-4 border-bottom border-light ${
                    !notification.is_read ? "bg-light bg-opacity-50" : ""
                  }`}
                  style={{ transition: "all 0.2s ease", cursor: "pointer" }}
                  onClick={() => handleRead(notification._id)}
                >
                  <div
                    className={`rounded-circle me-3 d-flex align-items-center justify-content-center`}
                    style={{
                      width: "40px",
                      height: "40px",
                      background: `var(--bs-${notification.type})`,
                      color: "white",
                    }}
                  >
                    <FaBell size={16} />
                  </div>
                  <div className="flex-grow-1">
                    <div className="mb-1 fw-semibold" style={{ display: "flex", alignItems: "center" }}>
                      <FaCheckCircle style={{ color: "#4caf50", marginRight: 8, flexShrink: 0 }} />
                      <span>{notification.message}</span>
                    </div>
                    <small className="text-muted">{notification.time}</small>
                  </div>
                  {!notification.is_read && (
                    <div
                      className="rounded-circle bg-primary"
                      style={{ width: "8px", height: "8px" }}
                    ></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "400px" }}
        >
          <div className="text-center">
            <div
              className="spinner-border text-primary mb-3"
              role="status"
              style={{ width: "3rem", height: "3rem" }}
            >
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted">Đang tải dữ liệu...</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case "dashboard":
        return renderDashboard();
      case "profile":
        return renderProfile();
      case "notifications":
        return <NotificationCenter />;
      case "orders":
        return (
          <div className="text-center py-5">
            <FaBox size={48} className="text-muted mb-3" />
            <h4>Orders</h4>
            <p className="text-muted">
              Your order history will appear here (redirect to /orders/history).
            </p>
            <button
              className="btn btn-primary rounded-pill px-4"
              onClick={() => navigate("/orders/history")}
            >
              Xem lịch sử đơn hàng
            </button>
          </div>
        );
      case "wishlist":
        return (
          <div className="py-5">
            <h4 className="mb-4">Sản phẩm yêu thích</h4>
            {wishlistProducts.length === 0 ? (
              <div className="text-muted">Bạn chưa có sản phẩm yêu thích nào.</div>
            ) : (
              <div className="row">
                {wishlistProducts.map((item) => (
                  <div className="col-12 col-sm-6 col-md-4 mb-3" key={item._id}>
                    <div
                      className="card h-100"
                      style={{ cursor: "pointer" }}
                      onClick={() => navigate(`/product/${item.product_id?._id}`)}
                    >
                      <img
                        src={
                          item.product_id?.imageurl?.[0] ||
                          item.product_id?.imageurl ||
                          "https://via.placeholder.com/120"
                        }
                        alt={item.product_id?.product_name || "Sản phẩm"}
                        className="card-img-top"
                        style={{ objectFit: "cover", height: 180 }}
                      />
                      <div className="card-body">
                        <h5 className="card-title text-truncate">
                          {item.product_id?.product_name || "Sản phẩm"}
                        </h5>
                        <p className="card-text text-muted">
                          {item.product_id?.brand}
                        </p>
                        <div className="fw-bold text-primary">
                          {(item.product_id?.discount_price || item.product_id?.price || 0).toLocaleString()}₫
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case "reviews":
        return <ReviewManager />;
      case "vouchers":
        return <VoucherManager />;
      case "security":
        return <SecurityManager />;
      case "settings":
        return (
          <div className="text-center py-5">
            <FaCog size={48} className="text-muted mb-3" />
            <h4>Settings</h4>
            <p className="text-muted">Account settings and preferences.</p>
          </div>
        );
      default:
        return renderDashboard();
    }
  };

  return (
    <div
      className="min-vh-100"
      style={{
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div className="d-flex min-vh-100">
        {/* Sidebar */}
        <div
          style={{
            width: sidebarCollapsed ? "80px" : "280px",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            borderRight: "1px solid rgba(255, 255, 255, 0.2)",
            transition: "all 0.3s ease",
            boxShadow: "4px 0 20px rgba(0, 0, 0, 0.1)",
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
          }}
        >
          {/* Brand Header */}
          <div className="p-4 border-bottom border-light">
            <div className="d-flex justify-content-end mb-2">
              <button
                className="btn btn-link p-1"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                <FaBars />
              </button>
            </div>
            <div className="d-flex align-items-center">
              <img
                src={user.picture_avatar}
                alt="User"
                className="rounded-circle me-3"
                width={50}
                height={50}
                style={{ objectFit: "cover" }}
              />
              {!sidebarCollapsed && (
                <div style={{ minWidth: 0 }}>
                  <h6
                    className="fw-bold mb-0 text-truncate"
                    style={{ maxWidth: 140 }}
                    title={user.name}
                  >
                    {user.name}
                  </h6>
                  <small
                    className="text-muted text-truncate d-block"
                    style={{ maxWidth: 140 }}
                    title={user.email}
                  >
                    {user.email}
                  </small>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-grow-1 p-3">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                className={`btn w-100 text-start mb-2 d-flex align-items-center ${
                  activeTab === item.id
                    ? "btn-primary shadow-sm"
                    : "btn-light border-0"
                }`}
                onClick={() => setActiveTab(item.id)}
                style={{
                  borderRadius: "12px",
                  padding: "12px 16px",
                  transition: "all 0.2s ease",
                  justifyContent: sidebarCollapsed ? "center" : "flex-start",
                }}
              >
                <span className="me-3">{item.icon}</span>
                {!sidebarCollapsed && (
                  <>
                    <span className="fw-medium">{item.label}</span>
                    {item.id === "notifications" &&
                      unread > 0 && (
                        <span className="badge bg-danger rounded-pill ms-auto">
                          {unread}
                        </span>
                      )}
                  </>
                )}
              </button>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-3 border-top border-light">
            <button
              className="btn btn-outline-danger w-100 d-flex align-items-center"
              style={{
                borderRadius: "12px",
                padding: "12px 16px",
                justifyContent: sidebarCollapsed ? "center" : "flex-start",
              }}
              onClick={() => {
                // Thêm logic logout
                navigate("/loginandregister");
              }}
            >
              <FaSignOutAlt className="me-3" />
              {!sidebarCollapsed && <span>Đăng xuất</span>}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow-1 d-flex flex-column">
        {/* {showHeader && (
            <nav
              className="navbar navbar-expand-lg navbar-light sticky-top mb-4"
              style={{
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(20px)",
                borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
                zIndex: 100,
              }}
            >
              <div className="container-fluid px-4">
                <div className="d-flex align-items-center flex-grow-1">
                  <div
                    className="input-group me-4"
                    style={{ maxWidth: "400px", minWidth: 0 }}
                  >
                    <input
                      type="text"
                      className="form-control border-0 rounded-pill ps-4"
                      placeholder="Tìm kiếm..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        backgroundColor: "rgba(248, 249, 250, 0.8)",
                        paddingLeft: "3rem",
                        minWidth: 0,
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                      }}
                    />
                    <FaSearch
                      className="position-absolute text-muted"
                      style={{
                        left: "1rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        zIndex: 10,
                      }}
                    />
                    <button
                      className="btn btn-primary rounded-pill ms-2"
                      type="button"
                    >
                      <FaSearch />
                    </button>
                  </div>

                  <div className="d-flex align-items-center">
                    <button className="btn btn-link position-relative me-3 p-2">
                      <FaBell size={20} />
                      {notifications.filter((n) => !n.is_read).length > 0 && (
                        <span
                          className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                          style={{ fontSize: "0.7rem" }}
                        >
                          {notifications.filter((n) => !n.is_read).length}
                        </span>
                      )}
                    </button>
                    <img
                      src={user.picture_avatar}
                      alt="User"
                      className="rounded-circle"
                      width={40}
                      height={40}
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                </div>
              </div>
            </nav>
          )} */}

          {/* Page Content */}
          <main className="flex-grow-1 px-4 pb-4" style={{ marginTop: "20px" }}>
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
