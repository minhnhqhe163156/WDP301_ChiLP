import React, { useEffect, useState } from "react";
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../api/notification";

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetchNotifications({ limit: 10, page: 1 });
      if (res.success) {
        setNotifications(res.notifications);
        setUnread(res.notifications.filter((n) => !n.is_read).length);
      }
    } catch {
      // handle error
    }
    setLoading(false);
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    await markAsRead(id);
    loadNotifications();
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    loadNotifications();
  };

  const handleDelete = async (id) => {
    await deleteNotification(id);
    loadNotifications();
  };

  return (
    <div className="notification-dropdown" style={{ minWidth: 320, background: '#fff', border: '1px solid #eee', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: 12 }}>
      <div className="dropdown-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontWeight: 600 }}>Notifications {unread > 0 && <span style={{ color: 'red' }}>({unread})</span>}</span>
        <button onClick={handleMarkAllAsRead} style={{ fontSize: 12 }}>Mark all as read</button>
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: 300, overflowY: 'auto' }}>
        {notifications.map((n) => (
          <li
            key={n._id}
            style={{
              fontWeight: n.is_read ? "normal" : "bold",
              background: n.is_read ? '#fff' : '#f6f6fa',
              borderBottom: '1px solid #eee',
              padding: 8,
              marginBottom: 2,
              borderRadius: 4,
            }}
          >
            <div>
              <span>{n.title ? n.title + ": " : ""}{n.message}</span>
              {n.link && (
                <a href={n.link} style={{ marginLeft: 8 }}>
                  View
                </a>
              )}
            </div>
            <div style={{ marginTop: 4 }}>
              {!n.is_read && (
                <button onClick={() => handleMarkAsRead(n._id)} style={{ fontSize: 12, marginRight: 8 }}>
                  Mark as read
                </button>
              )}
              <button onClick={() => handleDelete(n._id)} style={{ fontSize: 12, color: 'red' }}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
      {loading && <div>Loading...</div>}
      {!loading && notifications.length === 0 && <div>No notifications.</div>}
    </div>
  );
};

export default NotificationDropdown; 