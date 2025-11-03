import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  RefreshCw,
  Search,
  Filter,
  Edit3,
  X,
  Package,
  Calendar,
  DollarSign,
  Eye,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getSellerOrders, updateOrderStatusBySeller } from "../../api/orderApi";
import { orderAPI } from "../../api/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/OrderSearchBar.css";

const STATUS_COLORS = {
  // Processing: "bg-yellow-100 text-yellow-800 border-yellow-300",
  Shipping: "bg-blue-100 text-blue-800 border-blue-300",
  Delivered: "bg-green-100 text-green-800 border-green-300",
  Cancelled: "bg-red-100 text-red-800 border-red-300",
};

const STATUS_OPTIONS = ["Pending", "Shipping", "Delivered", "Cancelled"];

const StatusBadge = ({ status }) => (
  <span
    className={`inline-block px-3 py-1 rounded-full border text-xs font-semibold shadow-sm ${
      STATUS_COLORS[status] || "bg-gray-100 text-gray-700 border-gray-300"
    }`}
  >
    {status}
  </span>
);

const UpdateStatusModal = ({
  open,
  onClose,
  onSubmit,
  currentStatus,
  loading,
}) => {
  const [selected, setSelected] = useState(currentStatus);
  useEffect(() => {
    setSelected(currentStatus);
  }, [currentStatus, open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow p-6 w-[380px] max-w-[95vw] max-h-[90vh] overflow-y-auto relative m-2 border border-gray-200">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
          onClick={onClose}
          disabled={loading}
        >
          <X size={18} />
        </button>
        <h3 className="text-lg font-bold mb-5 text-gray-900 pr-8">
          Cập nhật trạng thái đơn hàng
        </h3>
        <div className="space-y-2 mb-5">
          {STATUS_OPTIONS.map((status) => (
            <label
              key={status}
              className={`flex items-center gap-2 cursor-pointer p-2 rounded-lg border transition-all ${
                selected === status
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name="order-status"
                value={status}
                checked={selected === status}
                onChange={() => setSelected(status)}
                disabled={loading}
                className="w-4 h-4 text-blue-600"
              />
              <StatusBadge status={status} />
            </label>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-200 border border-gray-200"
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </button>
          <button
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-60 border border-blue-600"
            onClick={() => onSubmit(selected)}
            disabled={loading || selected === currentStatus}
          >
            {loading ? "Đang cập nhật..." : "Cập nhật"}
          </button>
        </div>
      </div>
    </div>
  );
};

const OrderCard = ({ order, onUpdateStatus, updating, error, onConfirmPayment }) => {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <div className="bg-white rounded-xl shadow border border-gray-100 p-5 hover:shadow-lg transition-all duration-200 relative overflow-hidden">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-bold text-base text-gray-800 truncate">
            #{order._id.slice(-6)}
          </h4>
          <StatusBadge status={order.orderStatus} />
        </div>
        <div className="flex items-center gap-2 text-gray-600 text-sm">
          <span>
            {new Date(order.createdAt).toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-green-700 font-semibold text-lg">
            {Number(order.totalAmount || 0).toLocaleString()} {} vnđ
          </span>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-2 mt-1">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}
        <div className="flex gap-2 pt-2">
          <button className="flex-1 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium transition-colors">
            Chi tiết
          </button>
          <button
            className="flex-1 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={() => setModalOpen(true)}
            disabled={updating}
          >
            {updating ? "Đang cập nhật..." : "Cập nhật"}
          </button>
          {/* Nút xác nhận thanh toán */}
          {order.orderStatus === "Delivered" && order.paymentStatus === "Pending" && (
            <button
              className="flex-1 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors"
              onClick={() => onConfirmPayment(order._id)}
            >
              Xác nhận đã thu tiền
            </button>
          )}
        </div>
      </div>
      <UpdateStatusModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={(newStatus) => {
          setModalOpen(false);
          if (newStatus !== order.orderStatus)
            onUpdateStatus(order._id, newStatus);
        }}
        currentStatus={order.orderStatus}
        loading={updating}
      />
    </div>
  );
};

const ManageOrders = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocus, setSearchFocus] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [orderErrors, setOrderErrors] = useState({});
  const navigate = useNavigate();

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await getSellerOrders();
      setOrders(
        Array.isArray(response.data)
          ? response.data
          : response.data.orders || []
      );
      setError(null);
    } catch {
      setError("Không thể tải danh sách đơn hàng.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = Array.isArray(orders)
    ? orders.filter(
        (order) =>
          order._id.toString().includes(searchQuery) ||
          new Date(order.createdAt)
            .toLocaleDateString()
            .includes(searchQuery) ||
          order.orderStatus.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    setOrderErrors((prev) => ({ ...prev, [orderId]: null }));
    try {
      const { data: updatedOrder } = await updateOrderStatusBySeller(
        orderId,
        newStatus
      );
      setOrders((prev) =>
        prev.map((order) => (order._id === orderId ? updatedOrder : order))
      );
      toast.success("Cập nhật trạng thái thành công!");
    } catch {
      setOrderErrors((prev) => ({
        ...prev,
        [orderId]: "Cập nhật trạng thái thất bại hoặc lỗi hệ thống.",
      }));
      toast.error("Cập nhật trạng thái thất bại!");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleConfirmPayment = async (orderId) => {
    console.log("[DEBUG] Xác nhận thanh toán cho orderId:", orderId);
    try {
      await orderAPI.confirmPayment(orderId);
      toast.success("Đã xác nhận thanh toán thành công!");
      loadOrders();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Lỗi xác nhận thanh toán!");
    }
  };

  const handleRefresh = () => {
    loadOrders();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/seller/dashboard")}
              className="flex items-center gap-2 bg-white hover:bg-gray-50 px-4 py-2.5 rounded-xl shadow-md border border-gray-200 transition-all hover:shadow-lg"
            >
              <ChevronLeft size={18} />
              <span className="font-medium">Quay lại</span>
            </button>
            <div className="flex items-center gap-2">
              <TrendingUp className="text-blue-600" size={24} />
              <h1 className="text-2xl font-bold text-gray-800">
                Quản lý đơn hàng
              </h1>
            </div>
          </div>

          <div className="order-search-bar-group">
            <div className="order-search-bar-input-wrap">
              {!searchFocus && (
                <span className="order-search-bar-icon">
                  <Search size={18} />
                </span>
              )}
              <input
                type="text"
                placeholder="Tìm kiếm đơn hàng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocus(true)}
                onBlur={() => setSearchFocus(false)}
                className="order-search-bar-input"
              />
            </div>
            <button className="order-search-bar-btn">
              <Filter size={16} />
              Lọc
            </button>
            <button
              onClick={handleRefresh}
              className="order-search-bar-btn refresh"
            >
              <RefreshCw size={16} />
              Làm mới
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Tổng đơn hàng
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.length}
                </p>
              </div>
              <Package className="text-blue-600" size={32} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đang xử lý</p>
                <p className="text-2xl font-bold text-amber-600">
                  {orders.filter((o) => o.orderStatus === "Processing").length}
                </p>
              </div>
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-amber-600 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đã giao</p>
                <p className="text-2xl font-bold text-green-600">
                  {orders.filter((o) => o.orderStatus === "Delivered").length}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Tổng doanh thu
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  
                  {orders
                    .reduce(
                      (sum, order) => sum + (Number(order.totalAmount) || 0),
                      0
                    )
                    .toLocaleString()} {}
                    vnđ
                </p>
              </div>
              <DollarSign className="text-blue-600" size={32} />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="ml-4 text-gray-600 font-medium">
              Đang tải dữ liệu...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* Orders Grid */}
        {!loading && !error && (
          <>
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto text-gray-400 mb-4" size={64} />
                <p className="text-xl text-gray-600 mb-2">
                  Không có đơn hàng nào
                </p>
                <p className="text-gray-400">
                  Đơn hàng của bạn sẽ xuất hiện tại đây
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredOrders.map((order) => (
                  <OrderCard
                    key={order._id}
                    order={order}
                    onUpdateStatus={handleUpdateOrderStatus}
                    updating={updatingOrderId === order._id}
                    error={orderErrors[order._id]}
                    onConfirmPayment={handleConfirmPayment}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ManageOrders;
