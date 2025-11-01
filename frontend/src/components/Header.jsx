import React, { useState, useEffect } from "react";
import "../styles/Header.css";
import {
  FaUser,
  FaShoppingCart,
  FaSignOutAlt,
  FaAngleDown,
  FaSearch,
  FaHeart,
  FaBell,
  FaHome,
  FaInfoCircle,
  FaComments,
  FaBlog,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { productAPI, cartAPI } from "../api/api";
import ProductsDropdown from "./ProductsDropdown";
import { fetchNotifications } from "../api/notification";
import NotificationDropdown from "./NotificationDropdown";
// import ProductMegaDropdown from "./ProductMegaDropdown";

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showProductsMenu, setShowProductsMenu] = useState(false);
  const [showInfoMenu, setShowInfoMenu] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [keywordSuggestions, setKeywordSuggestions] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [unread, setUnread] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

  useEffect(() => {
    const controlHeader = () => {
      const currentScrollY = window.scrollY;

      // Hiện header khi cuộn lên, ẩn khi cuộn xuống
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      // Luôn hiện header khi ở đầu trang
      if (currentScrollY === 0) {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", controlHeader);

    return () => {
      window.removeEventListener("scroll", controlHeader);
    };
  }, [lastScrollY]);

  useEffect(() => {
    const fetchCartCount = () => {
      // Chỉ fetch nếu user là customer
      if (user && user.role === "customer") {
        cartAPI
          .getCartCount()
          .then((res) => setCartCount(res.data?.count || 0))
          .catch(() => setCartCount(0));
      }
    };
    fetchCartCount();
    window.addEventListener("cart-updated", fetchCartCount);
    // Lắng nghe sự kiện cập nhật đơn hàng (COD payment)
    const handleOrderPaymentUpdated = () => {
      // Gọi lại các API cần thiết để cập nhật badge/trạng thái
      // Ví dụ: fetch lại số lượng đơn hàng chờ xử lý, hoặc gọi lại getNotifications nếu cần
      // Nếu bạn có hàm fetchOrderCount hoặc fetchNotifications, gọi lại ở đây
      // Ví dụ:
      // fetchOrderCount();
      // getNotifications();
      // Ở đây demo gọi lại getNotifications nếu user là seller
      if (user && user.role === "seller") {
        fetchNotifications().then((data) => setUnread(data.filter(n => !n.is_read).length));
      }
    };
    window.addEventListener("order-payment-updated", handleOrderPaymentUpdated);
    return () => {
      window.removeEventListener("cart-updated", fetchCartCount);
      window.removeEventListener("order-payment-updated", handleOrderPaymentUpdated);
    };
  }, [user]);

  useEffect(() => {
    const handleWishlistUpdated = (e) => {
      setWishlistCount(e.detail?.count || 0);
    };
    window.addEventListener("wishlist-updated", handleWishlistUpdated);
    return () => window.removeEventListener("wishlist-updated", handleWishlistUpdated);
  }, []);

  // Fetch suggestions when search bar is focused or input changes
  useEffect(() => {
    if (showSuggestions && searchQuery.length >= 0) {
      setLoadingSuggestions(true);
      productAPI
        .getProducts?.()
        ?.then((res) => {
          // Nếu có searchQuery, lọc phía client (hoặc backend nếu có endpoint search)
          let products = res.data || [];
          if (searchQuery.trim()) {
            products = products.filter((p) =>
              p.product_name?.toLowerCase().includes(searchQuery.toLowerCase())
            );
          }
          setSuggestions(products.slice(0, 8));
        })
        .catch(() => setSuggestions([]))
        .finally(() => setLoadingSuggestions(false));
    } else {
      setSuggestions([]);
    }
  }, [showSuggestions, searchQuery]);

  // Lấy keyword suggestion khi searchQuery thay đổi
  useEffect(() => {
    if (searchQuery.trim()) {
      productAPI
        .getKeywordSuggestions?.(searchQuery)
        .then((res) => setKeywordSuggestions(res.data || []))
        .catch(() => setKeywordSuggestions([]));
    } else {
      setKeywordSuggestions([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (!user) return;
    const getNotifications = async () => {
      try {
        const data = await fetchNotifications();
        setUnread(data.filter(n => !n.is_read).length);
      } catch {
        // ignore error
      }
    };
    getNotifications();
    const interval = setInterval(getNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Xử lý tìm kiếm ở đây
      console.log("Searching for:", searchQuery);
    }
  };

  const renderAuthButtons = () => {
    if (isAuthenticated && user) {
      return (
        <div className="user-actions">
          <div className="action-icons">
            {/* Notification icon with dropdown */}
            <div style={{ position: "relative", display: "inline-block" }}>
              <button
                className="icon-button"
                title="Thông báo"
                onClick={() => setShowNotificationDropdown((v) => !v)}
                onBlur={() => setTimeout(() => setShowNotificationDropdown(false), 200)}
                style={{ position: "relative" }}
              >
                <FaBell />
                {unread > 0 && <span className="notification-badge">{unread}</span>}
              </button>
              {showNotificationDropdown && (
                <div style={{ position: "absolute", right: 0, top: 40, zIndex: 1000 }}>
                  <NotificationDropdown />
                </div>
              )}
            </div>
            <button
              className="icon-button wishlist-button"
              title="Yêu thích"
              style={{ position: 'relative' }}
              onClick={() => navigate("/customer/dashboard?tab=wishlist")}
            >
              <FaHeart />
              {wishlistCount > 0 && (
                <span className="wishlist-badge">{wishlistCount}</span>
              )}
            </button>
            {(user.role === "customer" || user.role === "seller") && (
              <button
                className="icon-button chat-modern"
                title="Chat real-time"
                onClick={() => navigate("/conversations")}
                style={{
                  background: "#1e293b",
                  borderRadius: "50%",
                  boxShadow: "0 2px 8px rgba(30,41,59,0.12)",
                  margin: "0 8px",
                  transition: "transform 0.15s, box-shadow 0.15s",
                  color: "#38bdf8",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "scale(1.12)";
                  e.currentTarget.style.boxShadow = "0 4px 16px #38bdf855";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow =
                    "0 2px 8px rgba(30,41,59,0.12)";
                }}
              >
                <FaComments size={22} />
              </button>
            )}
            {user &&
              !(
                user.role === "admin" ||
                user.role === "staff" ||
                user.role === "seller"
              ) && (
                <button
                  className="icon-button cart-button"
                  title="Giỏ hàng"
                  onClick={() => navigate("/cart")}
                >
                  <FaShoppingCart />
                  <span className="cart-count">{cartCount}</span>
                </button>
              )}
          </div>

          <div className="user-profile">
            <div className="user-avatar">
              {user.picture_avatar ? (
                <img
                  src={user.picture_avatar}
                  alt="avatar"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid #eee"
                  }}
                />
              ) : (
                <FaUser />
              )}
            </div>
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-role">{user.role}</span>
            </div>
            <div className="dropdown">
              <button className="dropdown-toggle"></button>
              <div className="dropdown-menu">
                {user.role === "admin" && (
                  <Link to="/admin/dashboard" className="dropdown-item">
                    <FaUser /> Admin Dashboard
                  </Link>
                )}
                {user.role === "seller" && (
                  <Link to="/seller/dashboard" className="dropdown-item">
                    <FaUser /> Seller Dashboard
                  </Link>
                )}
                {user.role === "customer" && (
                  <Link to="/customer/dashboard" className="dropdown-item">
                    <FaUser /> My Account
                  </Link>
                )}
                {user.role === "marketing_staff" && (
                  <Link
                    to="/marketing_staff/dashboard"
                    className="dropdown-item"
                  >
                    <FaUser /> Marketing Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="dropdown-item logout-button"
                >
                  <FaSignOutAlt /> Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="user-actions">
        <div className="action-icons">
          <button className="icon-button" title="Yêu thích">
            <FaHeart />
          </button>
          {/* Giỏ hàng luôn hiển thị cho người dùng chưa đăng nhập */}
          <button className="icon-button cart-button" title="Giỏ hàng">
            <FaShoppingCart />
            <span className="cart-count">0</span>
          </button>
        </div>
        <Link to="/loginandregister" className="login-button">
          <FaUser />
          <div>Đăng nhập/Đăng Ký</div>
        </Link>
      </div>
    );
  };

  return (
    <header className={`header ${!isVisible ? "hide" : ""}`}>
      {/* Top Bar */}
      <div className="top-bar">
        <div className="top-bar-content">
          <div className="top-bar-left">
            <span>🔥 Khuyến mãi lớn - Giảm đến 50%</span>
          </div>
          <div className="top-bar-right">
            <span>📞 Hotline: 1900-1234</span>
            <span>🚚 Miễn phí vận chuyển từ 500k</span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="main-nav">
        <div className="nav-container">
          <div className="logo">
            <a href="/">
              <div className="logo-content">
                <h1>PACEUPSHOP</h1>
              </div>
            </a>
          </div>

          <div style={{ position: "relative", flex: 1, maxWidth: 420 }}>
            <form
              className="search-bar"
              onSubmit={handleSearch}
              autoComplete="off"
            >
              <input
                type="text"
                placeholder="Tìm kiếm giày, thương hiệu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                style={{ zIndex: 2 }}
              />
              <button type="submit">
                <FaSearch />
              </button>
            </form>
            {showSuggestions && (
              <div
                className="bg-white border border-gray-200 rounded-lg shadow-lg absolute left-0 right-0 mt-1 z-30 flex"
                style={{ maxHeight: 400, minWidth: 600, overflow: "hidden" }}
              >
                {/* Cột trái: Tìm kiếm phổ biến */}
                <div className="w-1/3 border-r border-gray-100 p-4">
                  <div className="font-semibold text-gray-500 mb-2 text-sm">
                    TÌM KIẾM PHỔ BIẾN
                  </div>
                  <ul className="space-y-2 text-gray-600 text-base">
                    {keywordSuggestions.length === 0 ? (
                      <li className="text-gray-400">Không có gợi ý</li>
                    ) : (
                      keywordSuggestions.map((kw) => (
                        <li
                          key={kw}
                          className="cursor-pointer hover:text-blue-600"
                          onMouseDown={() => setSearchQuery(kw)}
                        >
                          {kw}
                        </li>
                      ))
                    )}
                  </ul>
                </div>
                {/* Cột phải: Sản phẩm nổi bật */}
                <div className="flex-1 p-4 overflow-y-auto">
                  {suggestions.length > 0 && !loadingSuggestions && (
                    <div className="font-semibold text-gray-700 text-base mb-3">
                      SẢN PHẨM NỔI BẬT
                    </div>
                  )}
                  {loadingSuggestions ? (
                    <div className="p-4 text-center text-gray-500">
                      Đang tải...
                    </div>
                  ) : suggestions.length === 0 ? (
                    <div className="p-4 text-center text-gray-400">
                      Không có sản phẩm phù hợp
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {suggestions.map((product) => (
                        <Link
                          to={`/product/${product._id}`}
                          key={product._id}
                          className="flex items-center gap-3 hover:bg-gray-100 rounded p-2 transition"
                          onClick={() => setShowSuggestions(false)}
                        >
                          <img
                            src={
                              // Ưu tiên imageUrls array
                              (Array.isArray(product.imageUrls) &&
                                product.imageUrls.length > 0 &&
                                product.imageUrls[0]) ||
                              // Fallback cho imageurl array
                              (Array.isArray(product.imageurl) &&
                                product.imageurl.length > 0 &&
                                product.imageurl[0]) ||
                              // Fallback cho imageurl string
                              (typeof product.imageurl === "string" &&
                                product.imageurl) ||
                              // Fallback cho image string
                              (typeof product.image === "string" &&
                                product.image) ||
                              // Default placeholder
                              "https://via.placeholder.com/300x300?text=No+Image"
                            }
                            alt={product.product_name}
                            className="w-14 h-14 object-cover rounded"
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/300x300?text=No+Image";
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="truncate font-medium text-gray-900">
                              {product.product_name}
                            </div>
                            <div className="text-sm text-red-600 font-bold">
                              {product.price?.toLocaleString()}₫
                              {product.discount_price && (
                                <span className="text-gray-400 font-normal line-through ml-2">
                                  {product.discount_price?.toLocaleString()}₫
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="nav-right-section">
            <ul className="nav-links">
              <li className="nav-item">
                <Link to="/" className="nav-link">
                  <FaHome />
                  <span>Trang Chủ</span>
                </Link>
              </li>

              <li
                className="nav-item dropdown-trigger"
                onMouseEnter={() => setShowProductsMenu(true)}
                onMouseLeave={() => setShowProductsMenu(false)}
              >
                <span className="nav-link">
                  <span>Sản Phẩm</span>
                  <FaAngleDown className="dropdown-icon" />
                </span>
                {showProductsMenu && <ProductsDropdown />}
              </li>

              <li className="nav-item">
                <Link to="/blogs" className="nav-link">
                  <FaBlog />
                  <span>Tin Tức</span>
                </Link>
              </li>

              <li
                className="nav-item dropdown-trigger"
                onMouseEnter={() => setShowInfoMenu(true)}
                onMouseLeave={() => setShowInfoMenu(false)}
              >
                <span className="nav-link">
                  <FaInfoCircle />
                  <span>Thông Tin</span>
                  <FaAngleDown className="dropdown-icon" />
                </span>
                {showInfoMenu && (
                  <div className="dropdown-content info-dropdown">
                    <Link to="/about" className="dropdown-item">
                      Về PaceUpShop
                    </Link>
                    <Link to="/services" className="dropdown-item">
                      Dịch Vụ
                    </Link>
                    <Link to="/guide" className="dropdown-item">
                      Hướng Dẫn
                    </Link>
                    {/* <Link to="/news" className="dropdown-item">
                      Tin Tức Đồ Thao Mới
                    </Link> */}
                  </div>
                )}
              </li>
            </ul>

            {renderAuthButtons()}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
