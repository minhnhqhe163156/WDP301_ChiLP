import React, { useEffect, useState } from "react";
import {
  getSellerOrders,
  updateOrderStatusBySeller,
} from "../../../api/orderApi";
import { useNavigate } from "react-router-dom";
import { Briefcase, BarChart2, Truck, Users, PlusCircle } from "lucide-react";
import "../../../styles/Dashboard.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [orderCodeSearch, setOrderCodeSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await getSellerOrders();
        setOrders(res.data.orders || []);
      } catch (error) {
        console.error("Lỗi khi tải đơn hàng:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Shipping":
        return "bg-blue-100 text-blue-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setOrderCodeSearch("");
    setStatusFilter("All");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  const handleShowDetail = (order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedOrder(null);
  };
  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await updateOrderStatusBySeller(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, orderStatus: newStatus } : o
        )
      );
      toast.success("Cập nhật trạng thái thành công!");
    } catch {
      toast.error("Cập nhật trạng thái thất bại!");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const nameMatch = order.shipping_address?.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const codeMatch = order._id
      .toLowerCase()
      .includes(orderCodeSearch.toLowerCase());
    const statusMatch =
      statusFilter === "All" || order.orderStatus === statusFilter;

    const orderDate = new Date(order.createdAt);
    const fromDate = startDate ? new Date(startDate) : null;
    const toDate = endDate ? new Date(endDate) : null;

    const dateMatch =
      (!fromDate || orderDate >= fromDate) && (!toDate || orderDate <= toDate);

    return nameMatch && codeMatch && statusMatch && dateMatch;
  });

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gradient-to-b from-indigo-600 to-purple-600 text-white min-h-screen p-6">
        <div className="flex items-center gap-2 mb-8">
          <Briefcase size={24} />
          <span className="font-bold text-lg">Bảng điều khiển</span>
        </div>
        <nav className="flex flex-col gap-4">
          <button
            onClick={() => navigate("/seller/analytics")}
            className="flex items-center gap-2 hover:underline"
          >
            <BarChart2 size={20} /> Phân Tích cửa hàng
          </button>
          <button
            onClick={() => navigate("/seller/order-management")}
            className="flex items-center gap-2 hover:underline"
          >
            <Truck size={20} /> Quản Lí Đơn hàng
          </button>
          <button
            onClick={() => navigate("/seller/reviews")}
            className="flex items-center gap-2 hover:underline"
          >
            <Users size={20} /> Quản Lí Feedback
          </button>
          <button
            onClick={() => navigate("/seller/products")}
            className="flex items-center gap-2 hover:underline"
          >
            <PlusCircle size={20} /> Quản Lí Sản Phẩm
          </button>
        </nav>
      </aside>

      <div className="p-6 max-w-7xl mx-auto w-full">
        <h1 className="text-2xl font-bold mb-4">Quản Lý Đơn Hàng</h1>

        <div className="flex flex-wrap gap-4 items-center mb-6">
          <input
            type="text"
            placeholder="🔍 Tên khách hàng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded px-3 py-1 w-52"
          />
          <input
            type="text"
            placeholder="🔎 Mã đơn hàng..."
            value={orderCodeSearch}
            onChange={(e) => setOrderCodeSearch(e.target.value)}
            className="border rounded px-3 py-1 w-52"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded px-3 py-1"
          >
            <option value="All">🧾 Tất cả trạng thái</option>
            <option value="Pending">Pending</option>
            <option value="Shipping">Shipping</option>
          </select>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded px-3 py-1"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded px-3 py-1"
          />
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
          >
            🔄 Reset bộ lọc
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-500">Đang tải danh sách đơn hàng...</p>
          </div>
        ) : paginatedOrders.length === 0 ? (
          <p className="text-gray-400 italic">Không có đơn hàng nào phù hợp.</p>
        ) : (
          <div className="overflow-x-auto shadow border rounded-xl">
            <table className="min-w-full bg-white text-sm">
              <thead className="bg-indigo-600 text-white text-left">
                <tr>
                  <th className="py-2 px-4">Mã Đơn</th>
                  <th className="py-2 px-4">Khách Hàng</th>
                  <th className="py-2 px-4">Số điện thoại</th>
                  <th className="py-2 px-4">Tổng Tiền</th>
                  <th className="py-2 px-4">Trạng Thái</th>
                  <th className="py-2 px-4">Ngày Tạo</th>
                  <th className="py-2 px-4">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((order) => (
                  <tr key={order._id} className="border-t hover:bg-gray-50">
                    <td className="py-2 px-4 text-indigo-600 font-semibold">
                      {order._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="py-2 px-4">
                      {order.shipping_address?.name || "Không rõ"}
                    </td>
                    <td className="py-2 px-4">
                      {order.shipping_address?.phone || "-"}
                    </td>
                    <td className="py-2 px-4">
                      {order.totalAmount?.toLocaleString()} VND
                    </td>
                    <td className="py-2 px-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full border text-xs font-semibold shadow-sm ${getStatusClass(order.orderStatus)}`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="py-2 px-4">
                      {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="py-2 px-4 flex gap-2">
                      <button
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                        onClick={() => handleShowDetail(order)}
                      >
                        Chi tiết
                      </button>
                      {order.orderStatus === "Pending" ? (
                        <select
                          value={order.orderStatus}
                          disabled={updatingOrderId === order._id}
                          onChange={async (e) => {
                            if (e.target.value === "Shipping") {
                              const confirm = window.confirm(
                                "Bạn có chắc chắn muốn chuyển đơn hàng sang trạng thái 'Shipping'? Sau khi chuyển sẽ không thể quay lại trạng thái 'Pending'."
                              );
                              if (!confirm) return;
                              await handleUpdateStatus(order._id, "Shipping");
                            }
                          }}
                          className={`text-sm px-2 py-1 rounded-md border ${getStatusClass(order.orderStatus)} ${updatingOrderId === order._id ? "opacity-60" : ""}`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Shipping">Shipping</option>
                        </select>
                      ) : (
                        <select
                          value={order.orderStatus}
                          disabled
                          className={`text-sm px-2 py-1 rounded-md border ${getStatusClass(order.orderStatus)} opacity-60`}
                        >
                          <option value="Shipping">Shipping</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-between items-center mt-4 px-4 py-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="px-4 py-2 bg-indigo-500 text-white rounded disabled:opacity-50"
              >
                ← Trang trước
              </button>
              <span>
                Trang {currentPage} /{" "}
                {Math.ceil(filteredOrders.length / pageSize)}
              </span>
              <button
                disabled={currentPage * pageSize >= filteredOrders.length}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-4 py-2 bg-indigo-500 text-white rounded disabled:opacity-50"
              >
                Trang sau →
              </button>
            </div>
          </div>
        )}

        {/* Modal chi tiết đơn hàng */}
        {modalOpen && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-lg w-full relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
                onClick={handleCloseModal}
              >
                ×
              </button>
              <h2 className="text-xl font-bold mb-4 text-indigo-700">
                Chi tiết đơn hàng
              </h2>
              <div className="mb-2">
                <span className="font-semibold">Mã đơn:</span>{" "}
                {selectedOrder._id}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Khách hàng:</span>{" "}
                {selectedOrder.shipping_address?.name}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Số điện thoại:</span>{" "}
                {selectedOrder.shipping_address?.phone}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Địa chỉ:</span>{" "}
                {selectedOrder.shipping_address?.address}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Tổng tiền:</span>{" "}
                {selectedOrder.totalAmount?.toLocaleString()} VND
              </div>
              <div className="mb-2">
                <span className="font-semibold">Trạng thái:</span>{" "}
                {selectedOrder.orderStatus}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Ngày tạo:</span>{" "}
                {new Date(selectedOrder.createdAt).toLocaleDateString("vi-VN")}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Sản phẩm:</span>
                <ul className="list-disc ml-6">
                  {selectedOrder.items?.map((item, idx) => (
                    <li key={idx}>
                      {item.productId?.product_name || item.productId} x{" "}
                      {item.quantity} - {(item.price || 0).toLocaleString()} VND
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerOrders;
