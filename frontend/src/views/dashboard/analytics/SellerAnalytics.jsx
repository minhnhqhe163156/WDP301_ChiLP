import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  Package,
  DollarSign,
  Target,
  Truck,
  Users,
  BarChart2,
  Briefcase,
  PlusCircle,
  User,
  TrendingUp,
  List,
  Star,
  MessageCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom"; // thêm dòng này
import { getSellerStatistics, getSellerOrders } from "../../../api/orderApi";
import { fetchProducts } from "../../../api/productApi";
import "../../../styles/Dashboard.css";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

import ChatApp from "../../chat/ChatApp";

const SellerAnalytics = () => {
  const navigate = useNavigate(); // sử dụng navigate
  const [statistics, setStatistics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    revenueByDay: { labels: [], data: [] },
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line
  const [orders, setOrders] = useState([]);
  // const [orderLoading, setOrderLoading] = useState(true); // Chưa dùng
  const [orderStatusFilter, setOrderStatusFilter] = useState("All");
  const [timeRange, setTimeRange] = useState("7"); // 7, 30, custom
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const res = await getSellerStatistics();
        const stats = res.data.statistics || res.data;
        setStatistics({
          totalRevenue: stats.totalRevenue || 0,
          totalOrders: stats.totalOrders || 0,
          revenueByDay: stats.revenueByDay || { labels: [], data: [] },
        });
        // Lấy sản phẩm
        const prodRes = await fetchProducts();
        setProducts(prodRes.data || []);
      } catch (error) {
        console.error("Lỗi khi lấy thống kê:", error);
        setStatistics({
          totalRevenue: 0,
          totalOrders: 0,
          revenueByDay: { labels: [], data: [] },
        });
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      // setOrderLoading(true); // Chưa dùng
      try {
        const res = await getSellerOrders();
        setOrders(res.data.orders || []);
      } catch {
        setOrders([]);
      } finally {
        // setOrderLoading(false); // Chưa dùng
      }
    };
    fetchOrders();
  }, []);

  // Filter orders by time
  const now = new Date();
  let startDate;
  if (timeRange === "7") {
    startDate = new Date(now);
    startDate.setDate(now.getDate() - 6);
  } else if (timeRange === "30") {
    startDate = new Date(now);
    startDate.setDate(now.getDate() - 29);
  } else if (timeRange === "custom" && customStart && customEnd) {
    startDate = new Date(customStart);
  } else {
    startDate = null;
  }
  // const filteredOrders = orders.filter((order) => { // Sẽ dùng ở bước tiếp theo
  //   const orderDate = new Date(order.createdAt);
  //   let inRange = true;
  //   if (startDate && endDate) {
  //     inRange = orderDate >= startDate && orderDate <= endDate;
  //   }
  //   let statusMatch =
  //     orderStatusFilter === "All" || order.orderStatus === orderStatusFilter;
  //   return inRange && statusMatch;
  // });

  // Chuẩn hóa dữ liệu biểu đồ 7 ngày gần nhất
  const today = new Date();
  const days = 7;
  const labels = [];
  const data = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const label = d.toISOString().slice(0, 10);
    labels.push(label);
    const idx = statistics.revenueByDay.labels.indexOf(label);
    data.push(idx !== -1 ? statistics.revenueByDay.data[idx] : 0);
  }

  const chartData = {
    labels,
    datasets: [
      {
        label: "Doanh thu (VND)",
        data,
        backgroundColor: "rgba(99, 102, 241, 0.6)",
        borderColor: "rgba(99, 102, 241, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: "Doanh thu 7 ngày gần nhất (VND)",
      },
    },
  };

  // Top 5 sản phẩm bán chạy (dựa vào quantity hoặc nếu có sold)
  const topProducts = [...products]
    .sort((a, b) => (b.quantitySold || 0) - (a.quantitySold || 0))
    .slice(0, 5);

  // Tính toán số liệu cho stat card
  // Đơn hàng 7 ngày, 30 ngày, tổng
  const orders7d = orders.filter((o) => {
    const d = new Date(o.createdAt);
    return d >= new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
  });
  const orders30d = orders.filter((o) => {
    const d = new Date(o.createdAt);
    return d >= new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
  });
  // Doanh thu 7 ngày, 30 ngày, tổng
  const revenue7d = orders7d.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const revenue30d = orders30d.reduce(
    (sum, o) => sum + (o.totalAmount || 0),
    0
  );
  const revenueTotal = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  // Số đơn hàng theo trạng thái
  const pendingCount = orders.filter((o) => o.orderStatus === "Pending").length;
  const shippingCount = orders.filter(
    (o) => o.orderStatus === "Shipping"
  ).length;
  // Số khách hàng duy nhất
  const customerCount = new Set(orders.map((o) => o.shipping_address?.phone))
    .size;
  // Đơn hàng mới nhất
  const latestOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);
  // Top khách hàng mua nhiều nhất
  const customerMap = {};
  orders.forEach((o) => {
    const phone = o.shipping_address?.phone;
    if (!phone) return;
    if (!customerMap[phone])
      customerMap[phone] = {
        name: o.shipping_address?.name,
        phone,
        total: 0,
        count: 0,
      };
    customerMap[phone].total += o.totalAmount || 0;
    customerMap[phone].count += 1;
  });
  const topCustomers = Object.values(customerMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Sau khi filter orders by time
  // Tính số lượng đơn hàng theo ngày
  let orderCountByDay = {};
  if (orders && startDate) {
    const endDate = (() => {
      if (timeRange === "7" || timeRange === "30") {
        return new Date();
      } else if (timeRange === "custom" && customEnd) {
        return new Date(customEnd);
      }
      return new Date();
    })();
    // Tạo mảng ngày
    let daysArr = [];
    let d = new Date(startDate);
    while (d <= endDate) {
      const label = d.toISOString().slice(0, 10);
      daysArr.push(label);
      d.setDate(d.getDate() + 1);
    }
    daysArr.forEach((date) => (orderCountByDay[date] = 0));
    orders.forEach((order) => {
      const orderDate = new Date(order.createdAt).toISOString().slice(0, 10);
      if (orderCountByDay[orderDate] !== undefined) {
        orderCountByDay[orderDate]++;
      }
    });
  }
  const orderChartData = {
    labels: Object.keys(orderCountByDay),
    datasets: [
      {
        label: "Số lượng đơn hàng",
        data: Object.values(orderCountByDay),
        backgroundColor: "rgba(16, 185, 129, 0.6)",
        borderColor: "rgba(16, 185, 129, 1)",
        borderWidth: 1,
      },
    ],
  };
  const orderChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: "Số lượng đơn hàng theo ngày",
      },
    },
  };

  return (
    <div className="flex min-h-screen">
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

      <main className="p-6 w-full">
        <h1 className="text-2xl font-bold mb-4">Phân Tích Bán Hàng</h1>
        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4 border-l-4 border-green-500">
            <DollarSign size={28} className="text-green-500" />
            <div>
              <p className="text-sm text-gray-500">Doanh thu 7 ngày</p>
              <p className="text-lg font-bold">
                {revenue7d.toLocaleString()} VND
              </p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4 border-l-4 border-blue-500">
            <DollarSign size={28} className="text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Doanh thu 30 ngày</p>
              <p className="text-lg font-bold">
                {revenue30d.toLocaleString()} VND
              </p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4 border-l-4 border-indigo-500">
            <DollarSign size={28} className="text-indigo-500" />
            <div>
              <p className="text-sm text-gray-500">Tổng doanh thu</p>
              <p className="text-lg font-bold">
                {revenueTotal.toLocaleString()} VND
              </p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4 border-l-4 border-yellow-500">
            <ShoppingBag size={28} className="text-yellow-500" />
            <div>
              <p className="text-sm text-gray-500">Đơn hàng 7 ngày</p>
              <p className="text-lg font-bold">{orders7d.length}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4 border-l-4 border-pink-500">
            <ShoppingBag size={28} className="text-pink-500" />
            <div>
              <p className="text-sm text-gray-500">Đơn hàng 30 ngày</p>
              <p className="text-lg font-bold">{orders30d.length}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4 border-l-4 border-purple-500">
            <ShoppingBag size={28} className="text-purple-500" />
            <div>
              <p className="text-sm text-gray-500">Tổng đơn hàng</p>
              <p className="text-lg font-bold">{orders.length}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4 border-l-4 border-orange-500">
            <List size={28} className="text-orange-500" />
            <div>
              <p className="text-sm text-gray-500">Đơn Pending</p>
              <p className="text-lg font-bold">{pendingCount}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4 border-l-4 border-cyan-500">
            <List size={28} className="text-cyan-500" />
            <div>
              <p className="text-sm text-gray-500">Đơn Shipping</p>
              <p className="text-lg font-bold">{shippingCount}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4 border-l-4 border-gray-500">
            <Package size={28} className="text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Sản phẩm</p>
              <p className="text-lg font-bold">{products.length}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4 border-l-4 border-amber-500">
            <User size={28} className="text-amber-500" />
            <div>
              <p className="text-sm text-gray-500">Khách hàng</p>
              <p className="text-lg font-bold">{customerCount}</p>
            </div>
          </div>
        </div>
        {/* Bộ lọc thời gian */}
        <div className="flex flex-wrap gap-4 items-center mb-6">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border rounded px-3 py-1"
          >
            <option value="7">7 ngày gần nhất</option>
            <option value="30">30 ngày gần nhất</option>
            <option value="custom">Tùy chọn</option>
          </select>
          {timeRange === "custom" && (
            <>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="border rounded px-3 py-1"
              />
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="border rounded px-3 py-1"
              />
            </>
          )}
          {/* Bộ lọc trạng thái chỉ còn 2 trạng thái */}
          <select
            value={orderStatusFilter}
            onChange={(e) => setOrderStatusFilter(e.target.value)}
            className="border rounded px-3 py-1"
          >
            <option value="All">Tất cả trạng thái</option>
            <option value="Pending">Pending</option>
            <option value="Shipping">Shipping</option>
          </select>
        </div>
        {loading ? (
          <p className="text-gray-500">Đang tải thống kê...</p>
        ) : (
          <>
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow mb-8">
              <Bar data={chartData} options={chartOptions} />
            </div>

            {/* Biểu đồ số lượng đơn hàng theo ngày */}
            <div className="bg-white border border-green-200 rounded-xl p-6 shadow mb-8">
              <Bar data={orderChartData} options={orderChartOptions} />
            </div>

            {/* Bảng top sản phẩm bán chạy */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow">
                <h2 className="text-lg font-bold mb-4 text-indigo-700">
                  Top 5 sản phẩm bán chạy
                </h2>
                {topProducts.length === 0 ? (
                  <p className="text-gray-500">Chưa có dữ liệu sản phẩm.</p>
                ) : (
                  <table className="min-w-full text-sm text-left border">
                    <thead className="bg-indigo-600 text-white">
                      <tr>
                        <th className="px-4 py-2">Tên sản phẩm</th>
                        <th className="px-4 py-2">Giá</th>
                        <th className="px-4 py-2">Kho</th>
                        <th className="px-4 py-2">Đã bán</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProducts.map((p) => (
                        <tr key={p._id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 font-medium text-blue-700">
                            {p.product_name}
                          </td>
                          <td className="px-4 py-2">
                            {(p.price || 0).toLocaleString("vi-VN")} ₫
                          </td>
                          <td className="px-4 py-2">{p.quantity || 0}</td>
                          <td className="px-4 py-2">{p.quantitySold || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              {/* Top khách hàng mua nhiều nhất */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow">
                <h2 className="text-lg font-bold mb-4 text-indigo-700">
                  Top 5 khách hàng mua nhiều nhất
                </h2>
                {topCustomers.length === 0 ? (
                  <p className="text-gray-500">Chưa có dữ liệu khách hàng.</p>
                ) : (
                  <table className="min-w-full text-sm text-left border">
                    <thead className="bg-indigo-600 text-white">
                      <tr>
                        <th className="px-4 py-2">Tên khách</th>
                        <th className="px-4 py-2">SĐT</th>
                        <th className="px-4 py-2">Số đơn</th>
                        <th className="px-4 py-2">Tổng chi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topCustomers.map((c) => (
                        <tr key={c.phone} className="hover:bg-gray-50">
                          <td className="px-4 py-2 font-medium text-blue-700">
                            {c.name}
                          </td>
                          <td className="px-4 py-2">{c.phone}</td>
                          <td className="px-4 py-2">{c.count}</td>
                          <td className="px-4 py-2">
                            {c.total.toLocaleString()} ₫
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
            {/* Đơn hàng mới nhất */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow mb-8">
              <h2 className="text-lg font-bold mb-4 text-indigo-700">
                Đơn hàng mới nhất
              </h2>
              {latestOrders.length === 0 ? (
                <p className="text-gray-500">Chưa có đơn hàng.</p>
              ) : (
                <table className="min-w-full text-sm text-left border">
                  <thead className="bg-indigo-600 text-white">
                    <tr>
                      <th className="px-4 py-2">Mã đơn</th>
                      <th className="px-4 py-2">Khách</th>
                      <th className="px-4 py-2">SĐT</th>
                      <th className="px-4 py-2">Tổng tiền</th>
                      <th className="px-4 py-2">Trạng thái</th>
                      <th className="px-4 py-2">Ngày tạo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latestOrders.map((o) => (
                      <tr key={o._id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-blue-700 font-semibold">
                          {o._id.slice(-6).toUpperCase()}
                        </td>
                        <td className="px-4 py-2">
                          {o.shipping_address?.name}
                        </td>
                        <td className="px-4 py-2">
                          {o.shipping_address?.phone}
                        </td>
                        <td className="px-4 py-2">
                          {(o.totalAmount || 0).toLocaleString()} ₫
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`inline-block px-3 py-1 rounded-full border text-xs font-semibold shadow-sm ${o.orderStatus === "Pending" ? "bg-yellow-100 text-yellow-800 border-yellow-300" : "bg-blue-100 text-blue-800 border-blue-300"}`}
                          >
                            {o.orderStatus}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          {new Date(o.createdAt).toLocaleDateString("vi-VN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Floating chat messenger style */}
            <div>
              {!showChat && (
                <button
                  className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-all"
                  onClick={() => setShowChat(true)}
                  title="Chat với khách hàng"
                >
                  <MessageCircle size={32} />
                </button>
              )}
              {showChat && (
                <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
                  <div className="bg-white rounded-2xl shadow-2xl border border-blue-200 w-[400px] max-w-full h-[550px] flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 border-b bg-blue-600 text-white">
                      <span className="font-semibold">Chat với khách hàng</span>
                      <button
                        className="text-white text-2xl font-bold hover:text-gray-200"
                        onClick={() => setShowChat(false)}
                      >
                        ×
                      </button>
                    </div>
                    <div className="flex-1 min-h-0">
                      <ChatApp />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default SellerAnalytics;
