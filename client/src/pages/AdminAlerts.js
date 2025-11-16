import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiSend, FiUsers, FiUser, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './AdminAlerts.css';

const AdminAlerts = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    recipient: 'all',
    title: '',
    message: '',
    type: 'info',
    category: 'alert',
    priority: 'medium'
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data.filter(u => u.role !== 'admin' || u._id === user._id));
    } catch (error) {
      toast.error('Error fetching users');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.message) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/notifications', formData);
      toast.success(
        formData.recipient === 'all' 
          ? 'Alert sent to all users successfully!' 
          : 'Alert sent successfully!'
      );
      setFormData({
        recipient: 'all',
        title: '',
        message: '',
        type: 'info',
        category: 'alert',
        priority: 'medium'
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error sending alert');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'admin') {
    return <div className="unauthorized">Unauthorized access</div>;
  }

  return (
    <div className="admin-alerts-page">
      <div className="page-header">
        <h2>Send Alerts & Notifications</h2>
        <p>Send notifications to all users or specific individuals</p>
      </div>

      <div className="alerts-container">
        <div className="alert-form-card">
          <h3>Create Alert</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Send To *</label>
              <select
                required
                value={formData.recipient}
                onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
              >
                <option value="all">All Users</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.firstName} {user.lastName} ({user.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                required
                placeholder="Enter alert title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Message *</label>
              <textarea
                required
                rows="5"
                placeholder="Enter alert message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                  <option value="alert">Alert</option>
                </select>
              </div>

              <div className="form-group">
                <label>Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="alert">Alert</option>
                <option value="appointment">Appointment</option>
                <option value="billing">Billing</option>
                <option value="lab">Lab</option>
                <option value="medical">Medical</option>
                <option value="system">System</option>
                <option value="general">General</option>
              </select>
            </div>

            <button type="submit" className="btn-primary btn-send" disabled={loading}>
              <FiSend /> {loading ? 'Sending...' : 'Send Alert'}
            </button>
          </form>
        </div>

        <div className="info-card">
          <h3>
            <FiAlertCircle /> Alert Information
          </h3>
          <div className="info-content">
            <div className="info-item">
              <strong>All Users:</strong>
              <p>Send notification to all active users in the system</p>
            </div>
            <div className="info-item">
              <strong>Individual:</strong>
              <p>Send notification to a specific user</p>
            </div>
            <div className="info-item">
              <strong>Types:</strong>
              <ul>
                <li><span className="type-info">Info</span> - General information</li>
                <li><span className="type-success">Success</span> - Success messages</li>
                <li><span className="type-warning">Warning</span> - Warnings</li>
                <li><span className="type-error">Error</span> - Error messages</li>
                <li><span className="type-alert">Alert</span> - Important alerts</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAlerts;

