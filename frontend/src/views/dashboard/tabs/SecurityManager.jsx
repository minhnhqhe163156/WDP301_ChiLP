import React, { useState } from "react";
import { userAPI } from "../../../api/api";

export default function SecurityManager() {
  const [form, setForm] = useState({ old: "", new1: "", new2: "" });
  const [twoFA, setTwoFA] = useState(false);
  const [loading, setLoading] = useState(false);
  // Đã xóa loginHistory và useEffect liên quan

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleChangePassword = async e => {
    e.preventDefault();
    if (!form.old || !form.new1 || !form.new2) return alert("Điền đủ thông tin!");
    if (form.new1 !== form.new2) return alert("Mật khẩu mới không khớp!");
    setLoading(true);
    try { 
      await userAPI.changePassword({ oldPassword: form.old, newPassword: form.new1 });
      alert("Đổi mật khẩu thành công!");
      setForm({ old: "", new1: "", new2: "" });
    } catch (err) {
      alert("Đổi mật khẩu thất bại: " + (err.response?.data?.message || err.message));
    }
    setLoading(false);
  };

  return (
    <div>
      <h4>Bảo mật tài khoản</h4>
      <form onSubmit={handleChangePassword} style={{maxWidth: 400}}>
        <input name="old" type="password" placeholder="Mật khẩu cũ" value={form.old} onChange={handleChange} className="form-control mb-2" />
        <input name="new1" type="password" placeholder="Mật khẩu mới" value={form.new1} onChange={handleChange} className="form-control mb-2" />
        <input name="new2" type="password" placeholder="Nhập lại mật khẩu mới" value={form.new2} onChange={handleChange} className="form-control mb-2" />
        <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Đang đổi..." : "Đổi mật khẩu"}</button>
      </form>
      {/* <div className="form-check form-switch mt-3">
        <input className="form-check-input" type="checkbox" checked={twoFA} onChange={() => setTwoFA(v => !v)} id="2faSwitch" />
        <label className="form-check-label" htmlFor="2faSwitch">Bật xác thực 2 bước (2FA)</label>
      </div> */}
      {/* Xóa phần lịch sử đăng nhập */}
    </div>
  );
} 