import React, { useState, useEffect } from "react";
import { fetchNotifications, markAsRead } from "../../../api/notification";

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetchNotifications();
        // Chuẩn hóa lấy notifications từ res.success/res.notifications
        if (res.success && Array.isArray(res.notifications)) {
          setNotifications(res.notifications);
        } else if (Array.isArray(res.data)) {
          setNotifications(res.data);
        } else if (res.data && Array.isArray(res.data.notifications)) {
          setNotifications(res.data.notifications);
        } else {
          setNotifications([]);
        }
      } catch {
        setNotifications([]);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleRead = async id => {
    try {
      await markAsRead(id);
      setNotifications(notifications.map(n =>
        n._id === id ? { ...n, is_read: true } : n
      ));
    } catch {
      // ignore error
    }
  };

  const filtered = filter ? notifications.filter(n => n.type === filter) : notifications;
  const types = Array.from(new Set(notifications.map(n => n.type)));

  if (loading) return <div>Đang tải thông báo...</div>;

  return (
    <div>
      <h4>Thông báo</h4>
      <div className="mb-2">
        <button className="btn btn-sm btn-secondary me-2" onClick={() => setFilter("")}>Tất cả</button>
        {types.map(t => (
          <button key={t} className="btn btn-sm btn-outline-primary me-2" onClick={() => setFilter(t)}>{t}</button>
        ))}
      </div>
      <ul style={{listStyle: "none", padding: 0}}>
        {filtered.map(n => (
          <li key={n._id} style={{marginBottom: 10, background: n.is_read ? "#f8f9fa" : "#e3f2fd", padding: 10, borderRadius: 6}}>
            <b>{n.type}</b>: {n.title ? n.title + ": " : ""}{n.message || n.content || n.text || "Không có nội dung"} <span style={{color: "#888"}}>({n.created_at ? new Date(n.created_at).toLocaleString() : ""})</span>
            {!n.is_read && <button className="btn btn-sm btn-link" onClick={() => handleRead(n._id)}>Đánh dấu đã đọc</button>}
          </li>
        ))}
      </ul>
    </div>
  );
} 