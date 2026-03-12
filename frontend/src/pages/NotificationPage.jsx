import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../styles/NotificationPage.css';

const NotificationPage = () => {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) fetchNotifications();
  }, [token]);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/notifications', {
        headers: { 'x-auth-token': token }
      });
      setNotifications(res.data);
    } catch (err) {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/${id}/read`, {}, {
        headers: { 'x-auth-token': token }
      });
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
    } catch {}
  };

  if (loading) return <div className="loading">Loading notifications...</div>;

  return (
    <div className="notification-page">
      <h2>Notifications</h2>
      {notifications.length === 0 ? (
        <div className="no-notifications">No notifications yet.</div>
      ) : (
        <ul className="notification-list">
          {notifications.map(n => (
            <li key={n._id} className={`notification-item${n.read ? ' read' : ''}`}>
              <div className="notification-message">
                {n.type === 'like' && (
                  <span>{n.fromUser.name} liked your post.</span>
                )}
                {n.type === 'comment' && (
                  <span>{n.fromUser.name} commented your post.</span>
                )}
                {n.type === 'follow' && (
                  <span>User {n.fromUser.name} followed you.</span>
                )}
              </div>
              <div className="notification-meta">
                <span>{new Date(n.createdAt).toLocaleString()}</span>
                {!n.read && <button onClick={() => markAsRead(n._id)}>Mark as read</button>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationPage;
