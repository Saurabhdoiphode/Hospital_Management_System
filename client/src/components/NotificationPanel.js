import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiBell, FiX, FiCheck, FiAlertCircle, FiInfo, FiCheckCircle, FiAlertTriangle, FiSend } from 'react-icons/fi';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import './NotificationPanel.css';

const NotificationPanel = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [groupByCategory, setGroupByCategory] = useState(true);
  const [composeOpen, setComposeOpen] = useState(false);
  const [compose, setCompose] = useState({ recipient: '', recipientRole: 'admin', recipientName: '', title: '', message: '', notes: '', type: 'info', category: 'general', priority: 'medium' });
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchUnreadCount();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(() => {
        fetchUnreadCount();
        if (isOpen) {
          fetchNotifications();
        }
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user, isOpen, groupByCategory]);

  const fetchNotifications = async () => {
    try {
      if (groupByCategory) {
        const res = await axios.get('/api/notifications/grouped/by-category');
        setNotifications(res.data); // array of {category, items, count, unread}
      } else {
        const response = await axios.get('/api/notifications?limit=50');
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get('/api/notifications/unread-count');
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`/api/notifications/${id}/read`);
      await fetchUnreadCount();
      await fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('/api/notifications/read-all');
      await fetchUnreadCount();
      await fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`/api/notifications/${id}`);
      await fetchUnreadCount();
      await fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <FiCheckCircle className="icon-success" />;
      case 'warning':
        return <FiAlertTriangle className="icon-warning" />;
      case 'error':
        return <FiAlertCircle className="icon-error" />;
      case 'alert':
        return <FiAlertCircle className="icon-alert" />;
      default:
        return <FiInfo className="icon-info" />;
    }
  };

  const fetchUsers = async (role = '') => {
    try {
      const res = await axios.get('/api/users');
      let filtered = res.data;
      if (role && role !== 'admin') {
        filtered = res.data.filter(u => u.role === role);
      }
      setUsers(filtered);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const submitCompose = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...compose };
      if (!payload.recipient && !payload.recipientRole) payload.recipientRole = 'admin';
      await axios.post('/api/notifications', payload);
      setCompose({ recipient: '', recipientRole: 'admin', recipientName: '', title: '', message: '', notes: '', type: 'info', category: 'general', priority: 'medium' });
      setSearchQuery('');
      setUsers([]);
      setComposeOpen(false);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRoleChange = (role) => {
    setCompose({...compose, recipientRole: role, recipient: '', recipientName: ''});
    setSearchQuery('');
    if (role && role !== 'admin') {
      fetchUsers(role);
    } else {
      setUsers([]);
    }
  };

  const selectUser = (userId, userName) => {
    setCompose({...compose, recipient: userId, recipientName: userName});
    setSearchQuery('');
  };

  return (
    <div className="notification-panel">
      <button 
        className="notification-bell" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <FiBell />
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            <div className="notification-actions">
              <button className="btn-mark-all" onClick={() => { setGroupByCategory(!groupByCategory); }}>
                {groupByCategory ? '📋 Flat View' : '📁 By Section'}
              </button>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="btn-mark-all">
                  <FiCheck /> Mark All
                </button>
              )}
              <button onClick={() => setComposeOpen(true)} className="btn-mark-all">
                <FiSend /> New
              </button>
              <button onClick={() => setIsOpen(false)} className="btn-close">
                <FiX />
              </button>
            </div>
          </div>
          <div className="notification-list">
            {(!notifications || notifications.length === 0) ? (
              <div className="no-notifications">
                <FiBell />
                <p>No notifications</p>
              </div>
            ) : (
              (groupByCategory
                ? notifications.map(group => (
                    <div key={group.category} className="notification-group">
                      <div className="group-title">
                        📌 {group.category.charAt(0).toUpperCase() + group.category.slice(1)} 
                        <span style={{marginLeft: '0.5rem', color: '#718096', fontWeight: 'normal'}}>({group.unread} unread / {group.count} total)</span>
                      </div>
                      {group.items.map(notification => (
                        <div key={notification._id} className={`notification-item ${!notification.read ? 'unread' : ''}`} onClick={() => !notification.read && markAsRead(notification._id)}>
                          <div className="notification-icon">{getIcon(notification.type)}</div>
                          <div className="notification-content">
                            <div className="notification-title">{notification.title}</div>
                            <div className="notification-message">{notification.message}</div>
                            {notification.notes && <div className="notification-notes">📝 {notification.notes}</div>}
                            <div className="notification-time">{format(new Date(notification.createdAt), 'MMM dd, yyyy HH:mm')}</div>
                          </div>
                          <div className="notification-actions-item">
                            {!notification.read && (<button onClick={(e)=>{e.stopPropagation(); markAsRead(notification._id);}} className="btn-mark-read" title="Mark as read"><FiCheck /></button>)}
                            <button onClick={(e)=>{e.stopPropagation(); deleteNotification(notification._id);}} className="btn-delete" title="Delete"><FiX /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))
                : notifications.map(notification => (
                    <div key={notification._id} className={`notification-item ${!notification.read ? 'unread' : ''}`} onClick={() => !notification.read && markAsRead(notification._id)}>
                      <div className="notification-icon">{getIcon(notification.type)}</div>
                      <div className="notification-content">
                        <div className="notification-title">{notification.title}</div>
                        <div className="notification-message">{notification.message}</div>
                        {notification.notes && <div className="notification-notes">📝 {notification.notes}</div>}
                        <div className="notification-time">{format(new Date(notification.createdAt), 'MMM dd, yyyy HH:mm')}</div>
                      </div>
                      <div className="notification-actions-item">
                        {!notification.read && (<button onClick={(e)=>{e.stopPropagation(); markAsRead(notification._id);}} className="btn-mark-read" title="Mark as read"><FiCheck /></button>)}
                        <button onClick={(e)=>{e.stopPropagation(); deleteNotification(notification._id);}} className="btn-delete" title="Delete"><FiX /></button>
                      </div>
                    </div>
                  ))
              )
            )}
          </div>

          {composeOpen && (
            <div className="compose-modal" onClick={()=>setComposeOpen(false)}>
              <div className="compose-card" onClick={(e)=>e.stopPropagation()}>
                <h4>Compose Notification</h4>
                <form onSubmit={submitCompose} className="compose-form">
                  <div className="row">
                    <label>Send To</label>
                    <select value={compose.recipientRole} onChange={(e)=>handleRoleChange(e.target.value)} required>
                      <option value="admin">All Admins</option>
                      <option value="doctor">Specific Doctor</option>
                      <option value="nurse">Specific Nurse</option>
                      <option value="receptionist">Specific Receptionist</option>
                      <option value="lab">Specific Lab Staff</option>
                      <option value="patient">Specific Patient</option>
                    </select>
                  </div>

                  {compose.recipientRole && compose.recipientRole !== 'admin' && (
                    <div className="row">
                      <label>Select {compose.recipientRole.charAt(0).toUpperCase() + compose.recipientRole.slice(1)} by Name</label>
                      {compose.recipientName ? (
                        <div className="selected-user">
                          <span>{compose.recipientName}</span>
                          <button type="button" onClick={()=>setCompose({...compose, recipient: '', recipientName: ''})} className="btn-clear">✕</button>
                        </div>
                      ) : (
                        <>
                          <input 
                            type="text" 
                            placeholder={`Search ${compose.recipientRole} by name...`}
                            value={searchQuery}
                            onChange={(e)=>setSearchQuery(e.target.value)}
                          />
                          {searchQuery && users.filter(u => 
                            (u.firstName + ' ' + u.lastName).toLowerCase().includes(searchQuery.toLowerCase())
                          ).length > 0 && (
                            <div className="user-dropdown">
                              {users.filter(u => 
                                (u.firstName + ' ' + u.lastName).toLowerCase().includes(searchQuery.toLowerCase())
                              ).slice(0, 5).map(u => (
                                <div key={u._id} className="user-option" onClick={()=>selectUser(u._id, `${u.firstName} ${u.lastName}`)}>
                                  {u.firstName} {u.lastName} ({u.email})
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  <div className="row">
                    <label>Title</label>
                    <input value={compose.title} onChange={(e)=>setCompose({...compose, title:e.target.value})} required placeholder="Notification title" />
                  </div>
                  <div className="row">
                    <label>Message</label>
                    <textarea rows={3} value={compose.message} onChange={(e)=>setCompose({...compose, message:e.target.value})} required placeholder="Main notification message" />
                  </div>
                  <div className="row">
                    <label>Additional Notes (Optional)</label>
                    <textarea rows={2} value={compose.notes} onChange={(e)=>setCompose({...compose, notes:e.target.value})} placeholder="Any additional details or instructions" />
                  </div>
                  <div className="row two">
                    <div>
                      <label>Type</label>
                      <select value={compose.type} onChange={(e)=>setCompose({...compose, type:e.target.value})}>
                        <option value="info">Info</option>
                        <option value="success">Success</option>
                        <option value="warning">Warning</option>
                        <option value="error">Error</option>
                        <option value="alert">Alert</option>
                      </select>
                    </div>
                    <div>
                      <label>Section</label>
                      <select value={compose.category} onChange={(e)=>setCompose({...compose, category:e.target.value})}>
                        <option value="general">General</option>
                        <option value="appointment">Appointment</option>
                        <option value="billing">Billing</option>
                        <option value="lab">Lab</option>
                        <option value="medical">Medical</option>
                        <option value="system">System</option>
                        <option value="alert">Alert</option>
                      </select>
                    </div>
                  </div>
                  <div className="actions">
                    <button type="button" onClick={()=>setComposeOpen(false)}>Cancel</button>
                    <button type="submit" className="btn-send"><FiSend /> Send</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;

