import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  Truck,
  LogOut,
  Package,
  Star,
  TrendingUp,
  Bell,
  DollarSign,
  BarChart2,
  PlusCircle,
  Edit3,
  Target,
  Users,
  ChevronRight,
  Briefcase,
  Plus,
} from "lucide-react";
import { fetchProducts } from "../../api/productApi";
import { getSellerStatistics } from "../../api/orderApi";
import { useNavigate } from "react-router-dom";
import "../../styles/Dashboard.css";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

const ProductCard = ({ product }) => {
  const imageUrl =
    (Array.isArray(product.imageUrls) && product.imageUrls[0]) ||
    (Array.isArray(product.imageurl) && product.imageurl[0]) ||
    (typeof product.imageurl === "string" && product.imageurl) ||
    "https://via.placeholder.com/300x300?text=No+Image";

  return (
    <div className="product-card">
      <div className="product-content">
        <div className="stock-badge">{product.quantity || 0} left</div>
        <div className="product-image-container">
          <img
            src={imageUrl}
            alt={product.product_name}
            className="product-image"
          />
        </div>
        <div className="product-info">
          <h4 className="product-name">{product.product_name}</h4>
          <p className="product-category">{product.category || "-"}</p>
          <div className="product-rating">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`star ${i < Math.floor(product.averageRating || 0) ? "filled" : "empty"}`}
              />
            ))}
            <span className="rating-value">{product.averageRating || 0}</span>
            <span className="rating-count">({product.totalReviews || 0})</span>
          </div>
          <div className="product-price">
            {(product.price || 0).toLocaleString("vi-VN")} vnđ
          </div>
          <div className="product-size">
            {Array.isArray(product.size)
              ? product.size.join(", ")
              : product.size}
          </div>
          <div className="product-actions">
            <button className="edit-btn">
              <Edit3 size={16} />
              Edit
            </button>
            <button className="stock-btn">
              <Plus size={16} />
              Stock
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, color, change, subtitle, icon: Icon }) => (
  <div className={`stat-card ${color}`}>
    <div className="stat-header">
      <div className={`stat-icon ${color}`}>{Icon && <Icon size={28} />}</div>
      {change !== undefined && (
        <div
          className={`change-badge ${change >= 0 ? "positive" : "negative"}`}
        >
          <TrendingUp size={12} className={change < 0 ? "rotate-180" : ""} />
          {Math.abs(change)}%
        </div>
      )}
    </div>
    <div className="stat-body">
      <p className="stat-title">{title}</p>
      <p className="stat-value">{value}</p>
      {subtitle && <p className="stat-subtitle">{subtitle}</p>}
      {change !== undefined && (
        <p className="stat-change">
          <span className={change >= 0 ? "text-green-600" : "text-red-600"}>
            {change >= 0 ? "+" : ""}
            {change}%
          </span>
          from last month
        </p>
      )}
    </div>
  </div>
);

const QuickAction = ({ title, description, color, onClick, icon: Icon }) => (
  <button onClick={onClick} className={`action-card ${color}`}>
    <div className="action-content">
      {Icon && (
        <div className="action-icon">
          <Icon size={24} />
        </div>
      )}
      <div className="action-text">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <ChevronRight size={16} className="action-arrow" />
    </div>
  </button>
);

const SellerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [statistics, setStatistics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    revenueByDay: { labels: [], data: [] },
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = { name: "John Seller", role: "seller" };

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetchProducts();
        setProducts(response.data || []);
      } catch (err) {
        console.error("Lỗi khi tải sản phẩm:", err);
      } finally {
        setLoading(false);
      }
    };

    const loadStatistics = async () => {
      try {
        const response = await getSellerStatistics();
        const stats = response.data.statistics || response.data;
        setStatistics({
          totalRevenue: stats.totalRevenue || 0,
          totalOrders: stats.totalOrders || 0,
          revenueByDay: stats.revenueByDay || { labels: [], data: [] },
        });
      } catch (err) {
        console.error("Lỗi khi tải thống kê:", err);
      }
    };

    loadProducts();
    loadStatistics();
  }, []);

  const metrics = [
    {
      title: "Total Revenue",
      value: `${statistics.totalRevenue.toLocaleString()} VND`,
      icon: DollarSign,
      color: "green",
      change: 15,
      subtitle: "Last 30 days",
    },
    {
      title: "Total Orders",
      value: statistics.totalOrders,
      icon: ShoppingBag,
      color: "blue",
      change: 8,
      subtitle: "Active orders: 23",
    },
    {
      title: "Conversion Rate",
      value: "4.2%",
      icon: Target,
      color: "purple",
      change: 12,
      subtitle: "Above average",
    },
    {
      title: "Total Products",
      value: products.length,
      icon: Package,
      color: "orange",
      change: 5,
      subtitle: "12 low stock",
    },
  ];

  const quickActions = [
    {
      icon: PlusCircle,
      title: "Add New Product",
      description: "Create and list a new product",
      color: "blue",
    },
    {
      icon: BarChart2,
      title: "View Analytics",
      description: "Check detailed sales reports",
      color: "emerald",
      onClick: () => navigate("/seller/analytics"),
    },
    {
      icon: Users,
      title: "Customer Reviews",
      description: "Manage customer feedback",
      color: "amber",
      onClick: () => navigate("/seller/reviews"),
    },
    {
      icon: Truck,
      title: "Manage Orders",
      description: "View and manage your orders",
      color: "rose",
      onClick: () => navigate("seller/order-management"),
    },
  ];

  // Sản phẩm mới nhất (5 sản phẩm đầu tiên)
  const latestProducts = products.slice(0, 5);

  // Dữ liệu biểu đồ doanh thu (nếu có)
  const revenueChartData = {
    labels: statistics.revenueByDay.labels || [],
    datasets: [
      {
        label: "Doanh thu",
        data: statistics.revenueByDay.data || [],
        fill: false,
        borderColor: "#6366f1",
        backgroundColor: "#6366f1",
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar giữ nguyên */}
      <aside className="w-64 bg-gradient-to-b from-indigo-600 to-purple-600 text-white min-h-screen p-6">
        <div className="flex items-center gap-2 mb-8">
          <Briefcase size={24} />
          <span className="font-bold text-lg">Bảng điều khiển</span>
        </div>
        <nav className="flex flex-col gap-4">
          <button
            className="flex items-center gap-2 hover:underline"
            onClick={() => navigate("/seller/analytics")}
          >
            <BarChart2 size={20} /> Phân Tích cửa hàng
          </button>
          <button
            className="flex items-center gap-2 hover:underline"
            onClick={() => navigate("/seller/order-management")}
          >
            <Truck size={20} /> Quản Lí Đơn hàng
          </button>

          <button
            className="flex items-center gap-2 hover:underline"
            onClick={() => navigate("/seller/reviews")}
          >
            <Users size={20} /> Quản Lí Feedback
          </button>
          <button
            onClick={() => navigate("/seller/categories")}
            className="flex items-center gap-2 hover:underline"
          >
            <PlusCircle size={20} /> Quản Lý Danh Mục
          </button>
          <button
            className="flex items-center gap-2 hover:underline"
            onClick={() => navigate("/seller/products")}
          >
            <PlusCircle size={20} /> Quản Lí Sản Phẩm
          </button>
          <button
            className="flex items-center gap-2 hover:underline"
            onClick={() => navigate("/seller/categories")}
          >
            <Package size={20} /> Quản Lí Danh Mục
          </button>
        </nav>
      </aside>

      <div className="seller-dashboard min-h-screen bg-gradient-to-br from-slate-50 to-white flex-1">
        {/* Header */}
        <div className="header-container flex justify-between items-center px-6 py-4 rounded-b-xl mb-6 relative bg-transparent">
          <div className="flex items-center gap-4 z-10">
            <Briefcase size={32} className="text-white" />
            <div>
              <h1 className="text-2xl font-extrabold text-white">
                Chào mừng, {user.name}!
              </h1>
              <p className="text-white/90">
                Hãy cùng phát triển doanh nghiệp của bạn ngay hôm nay 🚀
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 z-10">
            <button className="notification-btn relative">
              <Bell size={20} />
            </button>
            <button
              className="logout-btn flex items-center gap-1"
              onClick={() => console.log("Logout clicked")}
            >
              {" "}
              <LogOut size={18} /> <span>Đăng xuất</span>
            </button>
          </div>
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -z-0" />
        </div>

        <div className="max-w-7xl mx-auto px-4">
          {loading ? (
            <p className="text-center text-gray-600">Đang tải...</p>
          ) : (
            <>
              {/* Thống kê nhanh */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Tổng Quản Kinh Doanh
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {metrics.map((metric, index) => (
                    <StatCard key={index} {...metric} />
                  ))}
                </div>
              </section>

              {/* Biểu đồ doanh thu */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Biểu đồ doanh thu gần đây
                </h2>
                {revenueChartData.labels.length > 0 ? (
                  <div className="bg-white rounded-lg shadow p-4">
                    <Line
                      data={revenueChartData}
                      options={{
                        responsive: true,
                        plugins: { legend: { display: false } },
                      }}
                      height={80}
                    />
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow p-4 text-gray-500 text-center">
                    Chưa có dữ liệu doanh thu để hiển thị biểu đồ.
                  </div>
                )}
              </section>

              {/* Thao tác nhanh */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Thao Tác Nhanh
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {quickActions.map((action, index) => (
                    <QuickAction key={index} {...action} />
                  ))}
                </div>
              </section>

              {/* Sản phẩm mới nhất */}
              <section className="mb-12">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Sản phẩm mới nhất
                  </h2>
                  <button
                    className="text-blue-600 hover:underline font-medium"
                    onClick={() => navigate("/seller/products")}
                  >
                    Xem tất cả
                  </button>
                </div>
                {latestProducts.length === 0 ? (
                  <div className="bg-white rounded-lg shadow p-4 text-gray-500 text-center">
                    Chưa có sản phẩm nào.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {latestProducts.map((product) => (
                      <div
                        key={product._id}
                        className="bg-white rounded-lg shadow p-4 flex flex-col items-center"
                      >
                        <img
                          src={
                            (Array.isArray(product.imageUrls) &&
                              product.imageUrls[0]) ||
                            (Array.isArray(product.imageurl) &&
                              product.imageurl[0]) ||
                            (typeof product.imageurl === "string" &&
                              product.imageurl) ||
                            "https://via.placeholder.com/120"
                          }
                          alt={product.product_name}
                          className="w-24 h-24 object-cover rounded mb-2"
                        />
                        <div className="font-semibold text-blue-700 text-center mb-1 truncate w-full">
                          {product.product_name}
                        </div>
                        <div className="text-gray-500 text-xs mb-1">
                          Giá: {(product.price || 0).toLocaleString("vi-VN")} ₫
                        </div>
                        <div className="text-gray-500 text-xs mb-1">
                          Kho: {product.quantity || 0}
                        </div>
                        <button
                          className="mt-2 px-3 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700"
                          onClick={() =>
                            navigate(`/seller/products/edit/${product._id}`)
                          }
                        >
                          Quản lý
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
