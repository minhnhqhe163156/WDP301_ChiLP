import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getOrderDetail } from "../../api/orderApi";
import {
  FaBoxOpen,
  FaCheckCircle,
  FaTimesCircle,
  FaShippingFast,
  FaRegFilePdf,
  FaHeadset,
} from "react-icons/fa";
import jsPDF from "jspdf";
import "jspdf-autotable";
// import "../../assets/fonts/NotoSans-Regular.js";

const statusSteps = [
  { key: "Pending", label: "Đã đặt hàng", icon: <FaBoxOpen /> },
  { key: "Shipping", label: "Đang giao hàng", icon: <FaShippingFast /> },
  { key: "Delivered", label: "Đã giao thành công", icon: <FaCheckCircle /> },
  { key: "Cancelled", label: "Đã hủy", icon: <FaTimesCircle /> },
];

const statusColor = {
  Pending: "#f59e42",
  Shipping: "#2196f3",
  Delivered: "#4caf50",
  Cancelled: "#f44336",
};

export default function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const res = await getOrderDetail(orderId);
        setOrder(res.data);
        setError("");
      } catch {
        setError("Không thể tải chi tiết đơn hàng!");
      }
      setLoading(false);
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải chi tiết đơn hàng...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
          <FaTimesCircle size={48} className="mx-auto mb-4 text-red-500" />
          <p className="text-red-600 font-semibold">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }
  if (!order) return null;

  const currentStep = statusSteps.findIndex((s) => s.key === order.orderStatus);

  const generateInvoice = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("INVOICE", 105, 20, null, null, "center");
    doc.setFontSize(12);
    doc.text(`Order ID: ${order._id}`, 20, 40);
    doc.text(
      `Order date: ${new Date(order.createdAt).toLocaleString("en-GB")}`,
      20,
      50
    );
    doc.text(
      `Total amount: ${order.totalAmount.toLocaleString("en-GB")} ₫`,
      20,
      60
    );
    doc.text(`Payment method: ${order.paymentMethod}`, 20, 70);
    doc.text(`Status: ${order.orderStatus}`, 20, 80);

    doc.autoTable({
      startY: 90,
      head: [["Product Name", "Quantity", "Price", "Subtotal"]],
      body: order.items.map((item) => [
        item.productId?.product_name || "Unknown",
        item.quantity,
        `${item.price.toLocaleString("en-GB")} ₫`,
        `${(item.price * item.quantity).toLocaleString("en-GB")} ₫`,
      ]),
    });

    // Shipping address
    let y = doc.autoTable.previous.finalY + 10;
    doc.setFontSize(13);
    doc.text("Shipping Address:", 20, y);
    doc.setFontSize(12);
    y += 8;
    doc.text(
      `Name: ${order.shipping_address.name}`,
      20,
      y
    );
    y += 8;
    doc.text(
      `Phone: ${order.shipping_address.phone}`,
      20,
      y
    );
    y += 8;
    doc.text(
      `Address: ${order.shipping_address.address}, ${order.shipping_address.ward}, ${order.shipping_address.district}, ${order.shipping_address.province}` +
        (order.shipping_address.postalCode ? ", " + order.shipping_address.postalCode : ""),
      20,
      y
    );

    doc.save(`invoice_${order._id}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-10">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header Section */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Mã đơn hàng: <span className="break-all">{order._id}</span>
              </h2>
              <p className="text-sm text-gray-600">
                Ngày đặt: {new Date(order.createdAt).toLocaleString("vi-VN")}
              </p>
              <span
                className="inline-flex items-center mt-2 px-3 py-1 rounded-full text-white"
                style={{ background: statusColor[order.orderStatus] }}
              >
                {statusSteps.find((s) => s.key === order.orderStatus)?.icon}
                {order.orderStatus}
              </span>
            </div>
            <div className="text-right">
              <div>
                <div>
                  Tổng cộng: {(order.totalAmount + (order.discount || 0)).toLocaleString("vi-VN")} ₫
                </div>
                {order.discount > 0 && (
                  <div style={{ color: "green" }}>
                    Đã giảm giá: -{order.discount.toLocaleString("vi-VN")} ₫
                  </div>
                )}
                <div>
                  <b>Thành tiền: {order.totalAmount.toLocaleString("vi-VN")} ₫</b>
                </div>
              </div>
              {order.voucher && order.voucher.voucher_code && (
                <p className="text-gray-500 text-sm">
                  Mã voucher: <span className="font-semibold">{order.voucher.voucher_code}</span>
                </p>
              )}
              <p className="text-sm text-gray-600">
                Phương thức:{" "}
                <span className="font-semibold">{order.paymentMethod}</span>
              </p>
              <p className="text-sm text-gray-600">
                Trạng Thái Thanh Toán:{" "}
                <span className="font-semibold">{order.paymentStatus}</span>
              </p>
              {order.transactionId && (
                <p className="text-sm text-gray-600">
                  Mã giao dịch:{" "}
                  <span className="font-semibold">{order.transactionId}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {statusSteps.map((step, idx) => (
              <div
                key={step.key}
                className="flex flex-col items-center relative"
              >
                <div
                  className={`rounded-full p-3 mb-2 text-white ${
                    idx <= currentStep ? "bg-blue-500" : "bg-gray-300"
                  }`}
                  style={{ fontSize: 20 }}
                >
                  {step.icon}
                </div>
                <span
                  className={`text-xs font-medium ${
                    idx === currentStep
                      ? "text-blue-600"
                      : idx < currentStep
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
                {idx < statusSteps.length - 1 && (
                  <div
                    className={`absolute top-6 left-1/2 w-full h-1 ${
                      idx < currentStep ? "bg-green-400" : "bg-gray-200"
                    }`}
                    style={{ transform: "translateX(50%)", width: "100%" }}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Products Section */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 mb-6">
          <h3 className="font-semibold text-xl text-gray-800 mb-4">Sản phẩm</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {order.items.map((item, idx) => {
              const product = item.productId;
              const imageUrl =
                Array.isArray(product?.imageurl) && product.imageurl.length > 0
                  ? product.imageurl[0]
                  : product?.images?.[0] || "https://via.placeholder.com/200";
              return (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:shadow-md transition"
                >
                  <Link to={`/product/${product?._id}`} target="_blank">
                    <img
                      src={imageUrl}
                      alt={product?.product_name || "Sản phẩm"}
                      className="w-24 h-24 object-cover rounded-lg"
                      onError={(e) =>
                        (e.target.src = "https://via.placeholder.com/200")
                      }
                    />
                  </Link>
                  <div className="flex-1">
                    <Link
                      to={`/product/${product?._id}`}
                      target="_blank"
                      className="font-semibold text-blue-700 hover:underline"
                    >
                      {product?.product_name || "Tên sản phẩm không rõ"}
                    </Link>
                    <p className="text-sm text-gray-600">
                      Số lượng:{" "}
                      <span className="font-semibold">{item.quantity}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Giá:{" "}
                      <span className="font-semibold">
                        {item.price.toLocaleString("vi-VN")} ₫
                      </span>
                    </p>
                    <p className="font-semibold text-gray-800">
                      Thành tiền:{" "}
                      <span className="text-blue-600">
                        {(item.price * item.quantity).toLocaleString("vi-VN")} ₫
                      </span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 mb-6">
          <h3 className="font-semibold text-xl text-gray-800 mb-2">
            Địa chỉ giao hàng
          </h3>
          <p className="text-base text-gray-700 mb-1">
            Tên: <span className="font-semibold">{order.shipping_address.name}</span>
          </p>
          <p className="text-base text-gray-700 mb-1">
            Số điện thoại: <span className="font-semibold">{order.shipping_address.phone}</span>
          </p>
          <p className="text-base text-gray-700 mb-1">
            Địa chỉ: <span className="font-semibold">{order.shipping_address.address}</span>
          </p>
          <p className="text-base text-gray-700 mb-1">
            Phường/Xã: <span className="font-semibold">{order.shipping_address.ward}</span>
          </p>
          <p className="text-base text-gray-700 mb-1">
            Quận/Huyện: <span className="font-semibold">{order.shipping_address.district}</span>
          </p>
          <p className="text-base text-gray-700 mb-1">
            Tỉnh/Thành phố: <span className="font-semibold">{order.shipping_address.province}</span>
          </p>
          {order.shipping_address.postalCode && (
            <p className="text-base text-gray-700 mb-1">
              Mã bưu điện: <span className="font-semibold">{order.shipping_address.postalCode}</span>
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 flex flex-col md:flex-row gap-4">
          <button
            onClick={generateInvoice}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition"
          >
            <FaRegFilePdf /> In hóa đơn
          </button>
          <button className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition">
            <FaHeadset /> Liên hệ hỗ trợ
          </button>
          <button
            onClick={() => navigate(-1)}
            className="flex-1 px-6 py-3 bg-gray-200 text-blue-700 rounded-xl hover:bg-blue-100 transition"
          >
            Quay lại
          </button>
        </div>
      </div>
    </div>
  );
}
