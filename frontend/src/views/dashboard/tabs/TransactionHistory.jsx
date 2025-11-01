import React from "react";

const transactions = [
  {
    _id: "txn1",
    orderId: "order1",
    date: "2024-06-01T10:00:00Z",
    amount: 1500000,
    status: "Đã thanh toán",
    method: "VNPay",
    invoiceUrl: "https://example.com/invoice/order1.pdf"
  },
  {
    _id: "txn2",
    orderId: "order2",
    date: "2024-06-02T12:00:00Z",
    amount: 500000,
    status: "Chờ xử lý",
    method: "COD",
    invoiceUrl: ""
  }
];

export default function TransactionHistory() {
  return (
    <div>
      <h4>Lịch sử giao dịch</h4>
      <table className="table">
        <thead>
          <tr>
            <th>Mã đơn</th>
            <th>Ngày</th>
            <th>Số tiền</th>
            <th>Trạng thái</th>
            <th>Phương thức</th>
            <th>Hóa đơn</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(txn => (
            <tr key={txn._id}>
              <td>{txn.orderId}</td>
              <td>{new Date(txn.date).toLocaleString("vi-VN")}</td>
              <td>{txn.amount.toLocaleString()}₫</td>
              <td>{txn.status}</td>
              <td>{txn.method}</td>
              <td>
                {txn.invoiceUrl ? (
                  <a href={txn.invoiceUrl} target="_blank" rel="noopener noreferrer">
                    Xem hóa đơn
                  </a>
                ) : (
                  "Chưa có"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 