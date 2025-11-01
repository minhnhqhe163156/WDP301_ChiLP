import React from "react";

const vouchers = [
  { _id: "v1", code: "SALE50", value: 50000, expiredAt: "2024-07-01", status: "Còn hiệu lực" },
  { _id: "v2", code: "FREESHIP", value: 0, expiredAt: "2024-06-15", status: "Đã dùng" },
];

export default function VoucherManager() {
  return (
    <div>
      <h4>Voucher/Mã giảm giá</h4>
      <table className="table">
        <thead>
          <tr>
            <th>Mã</th>
            <th>Giá trị</th>
            <th>Hạn dùng</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {vouchers.map(v => (
            <tr key={v._id}>
              <td>{v.code}</td>
              <td>{v.value ? v.value.toLocaleString() + "₫" : "Miễn phí vận chuyển"}</td>
              <td>{v.expiredAt}</td>
              <td>{v.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 