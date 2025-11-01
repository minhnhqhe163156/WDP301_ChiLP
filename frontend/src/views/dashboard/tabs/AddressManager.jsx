import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AddressManager() {
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState({ name: "", phone: "", address: "", isDefault: false });
  const [editingId, setEditingId] = useState(null);

  // Lấy danh sách địa chỉ
  const fetchAddresses = async () => {
    try {
      const res = await axios.get("/api/auth/addresses", { withCredentials: true });
      // Đảm bảo luôn là mảng
      let data = res.data;
      if (Array.isArray(data)) {
        setAddresses(data);
      } else if (data && Array.isArray(data.addresses)) {
        setAddresses(data.addresses);
      } else {
        setAddresses([]);
      }
    } catch (err) {
      alert("Không thể tải địa chỉ!");
      setAddresses([]);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // Thêm hoặc sửa địa chỉ
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/api/auth/addresses/${editingId}`, form, { withCredentials: true });
      } else {
        await axios.post("/api/auth/addresses", form, { withCredentials: true });
      }
      setForm({ name: "", phone: "", address: "", isDefault: false });
      setEditingId(null);
      fetchAddresses();
    } catch (err) {
      alert("Lỗi khi lưu địa chỉ!");
    }
  };

  // Xóa địa chỉ
  const handleDelete = async (id) => {
    if (!window.confirm("Xóa địa chỉ này?")) return;
    try {
      await axios.delete(`/api/auth/addresses/${id}`, { withCredentials: true });
      fetchAddresses();
    } catch {
      alert("Lỗi khi xóa địa chỉ!");
    }
  };

  // Đặt mặc định
  const setDefault = async (id) => {
    try {
      await axios.patch(`/api/auth/addresses/${id}/default`, {}, { withCredentials: true });
      fetchAddresses();
    } catch {
      alert("Lỗi khi đặt mặc định!");
    }
  };

  // Sửa địa chỉ
  const handleEdit = (addr) => {
    setForm({ name: addr.name, phone: addr.phone, address: addr.address, isDefault: addr.isDefault });
    setEditingId(addr._id);
  };

  return (
    <div>
      <h4>Địa chỉ giao hàng</h4>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {addresses.map(addr => (
          <li key={addr._id} style={{marginBottom: 10, border: "1px solid #eee", borderRadius: 8, padding: 10}}>
            <input
              type="radio"
              checked={addr.isDefault}
              onChange={() => setDefault(addr._id)}
              style={{marginRight: 8}}
            />
            <b>{addr.name}</b> - {addr.phone} <br />
            {addr.address}
            {addr.isDefault && <span style={{color: "green"}}> (Mặc định)</span>}
            <div>
              <button onClick={() => handleEdit(addr)} style={{marginRight: 8}}>Sửa</button>
              <button onClick={() => handleDelete(addr._id)}>Xóa</button>
            </div>
          </li>
        ))}
      </ul>
      <h5>{editingId ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}</h5>
      <form onSubmit={handleSubmit} style={{maxWidth: 400}}>
        <input
          name="name"
          placeholder="Họ tên"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          className="form-control mb-2"
        />
        <input
          name="phone"
          placeholder="Số điện thoại"
          value={form.phone}
          onChange={e => setForm({ ...form, phone: e.target.value })}
          className="form-control mb-2"
        />
        <input
          name="address"
          placeholder="Địa chỉ"
          value={form.address}
          onChange={e => setForm({ ...form, address: e.target.value })}
          className="form-control mb-2"
        />
        <label>
          <input
            type="checkbox"
            checked={form.isDefault}
            onChange={e => setForm({ ...form, isDefault: e.target.checked })}
          /> Đặt làm mặc định
        </label>
        <br />
        <button type="submit" className="btn btn-primary mt-2">
          {editingId ? "Lưu thay đổi" : "Thêm mới"}
        </button>
        {editingId && (
          <button type="button" className="btn btn-secondary ms-2 mt-2" onClick={() => { setEditingId(null); setForm({ name: "", phone: "", address: "", isDefault: false }); }}>
            Hủy
          </button>
        )}
      </form>
    </div>
  );
} 