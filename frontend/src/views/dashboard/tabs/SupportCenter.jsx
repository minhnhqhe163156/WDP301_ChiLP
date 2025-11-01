import React, { useState } from "react";

const initialTickets = [
  { _id: "ticket1", subject: "Vấn đề thanh toán", content: "Tôi bị trừ tiền nhưng chưa nhận được đơn hàng.", status: "Đang xử lý", reply: "" },
];

const faqs = [
  { q: "Làm sao để đổi mật khẩu?", a: "Vào mục Bảo mật tài khoản để đổi mật khẩu." },
  { q: "Làm sao để hủy đơn hàng?", a: "Vào mục Đổi trả/Hủy đơn để gửi yêu cầu." },
];

export default function SupportCenter() {
  const [tickets, setTickets] = useState(initialTickets);
  const [form, setForm] = useState({ subject: "", content: "" });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.subject || !form.content) return alert("Điền đủ thông tin!");
    setTickets([
      ...tickets,
      { _id: Date.now().toString(), ...form, status: "Đang xử lý", reply: "" }
    ]);
    setForm({ subject: "", content: "" });
  };

  return (
    <div>
      <h4>Hỗ trợ khách hàng</h4>
      <form onSubmit={handleSubmit} style={{maxWidth: 400}}>
        <input name="subject" placeholder="Chủ đề" value={form.subject} onChange={handleChange} className="form-control mb-2" />
        <textarea name="content" placeholder="Nội dung" value={form.content} onChange={handleChange} className="form-control mb-2" />
        <button type="submit" className="btn btn-primary">Gửi ticket</button>
      </form>
      <h5 className="mt-4">Danh sách ticket đã gửi</h5>
      <table className="table">
        <thead>
          <tr>
            <th>Chủ đề</th>
            <th>Trạng thái</th>
            <th>Phản hồi</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map(t => (
            <tr key={t._id}>
              <td>{t.subject}</td>
              <td>{t.status}</td>
              <td>{t.reply || "Chưa có"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h5 className="mt-4">Câu hỏi thường gặp (FAQ)</h5>
      <ul>
        {faqs.map((f, i) => (
          <li key={i}><b>{f.q}</b><br />{f.a}</li>
        ))}
      </ul>
    </div>
  );
} 