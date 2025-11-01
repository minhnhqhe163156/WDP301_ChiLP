import React, { useState } from "react";

const initialOrders = [
  { _id: "order1", product: "Áo thun nam", status: "Đã giao", canReturn: true },
  { _id: "order2", product: "Giày sneaker", status: "Đang giao", canReturn: false },
];

const initialRequests = [
  { _id: "req1", orderId: "order1", type: "Đổi trả", reason: "Sản phẩm lỗi", status: "Đang xử lý" },
];

export default function ReturnRequestManager() {
  const [orders] = useState(initialOrders);
  const [requests, setRequests] = useState(initialRequests);
  const [form, setForm] = useState({ orderId: "", type: "Đổi trả", reason: "" });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.orderId || !form.reason) return alert("Điền đủ thông tin!");
    setRequests([
      ...requests,
      { _id: Date.now().toString(), ...form, status: "Đang xử lý" }
    ]);
    setForm({ orderId: "", type: "Đổi trả", reason: "" });
  };

  return (
    <div>
      <h4>Yêu cầu đổi trả/hủy đơn</h4>
      <form onSubmit={handleSubmit} style={{maxWidth: 400}}>
        <select name="orderId" value={form.orderId} onChange={handleChange} className="form-control mb-2">
          <option value="">Chọn đơn hàng</option>
          {orders.filter(o => o.canReturn).map(o => (
            <option key={o._id} value={o._id}>{o.product} ({o._id})</option>
          ))}
        </select>
        <select name="type" value={form.type} onChange={handleChange} className="form-control mb-2">
          <option value="Đổi trả">Đổi trả</option>
          <option value="Hủy đơn">Hủy đơn</option>
        </select>
        <input name="reason" placeholder="Lý do" value={form.reason} onChange={handleChange} className="form-control mb-2" />
        <button type="submit" className="btn btn-primary">Gửi yêu cầu</button>
      </form>
      <h5 className="mt-4">Danh sách yêu cầu đã gửi</h5>
      <table className="table">
        <thead>
          <tr>
            <th>Đơn hàng</th>
            <th>Loại</th>
            <th>Lý do</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {requests.map(req => (
            <tr key={req._id}>
              <td>{req.orderId}</td>
              <td>{req.type}</td>
              <td>{req.reason}</td>
              <td>{req.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 