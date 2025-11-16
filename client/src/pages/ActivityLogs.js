import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiActivity, FiUser, FiClock, FiSearch } from 'react-icons/fi';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import AdvancedSearch from '../components/AdvancedSearch';
import './ActivityLogs.css';

const ActivityLogs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchLogs();
    }
  }, [user]);

  const fetchLogs = async () => {
    try {
      const response = await axios.get('/api/audit-logs', {
        params: filters
      });
      setLogs(response.data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term, activeFilters) => {
    setSearchTerm(term);
    setFilters(activeFilters);
    // Filter logs client-side
  };

  const filteredLogs = logs.filter(log => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      log.action?.toLowerCase().includes(search) ||
      log.resource?.toLowerCase().includes(search) ||
      log.user?.firstName?.toLowerCase().includes(search) ||
      log.user?.lastName?.toLowerCase().includes(search)
    );
  });

  if (user?.role !== 'admin') {
    return <div className="unauthorized">Unauthorized access</div>;
  }

  if (loading) {
    return <div className="loading">Loading activity logs...</div>;
  }

  return (
    <div className="activity-logs-page">
      <div className="page-header">
        <h2>
          <FiActivity /> Activity Logs
        </h2>
        <p>System activity and audit trail</p>
      </div>

      <AdvancedSearch
        onSearch={handleSearch}
        placeholder="Search logs..."
        filters={[
          {
            key: 'resource',
            label: 'Resource',
            type: 'select',
            options: [
              { value: 'patient', label: 'Patient' },
              { value: 'appointment', label: 'Appointment' },
              { value: 'billing', label: 'Billing' },
              { value: 'medical-record', label: 'Medical Record' }
            ]
          },
          {
            key: 'action',
            label: 'Action',
            type: 'select',
            options: [
              { value: 'create', label: 'Create' },
              { value: 'update', label: 'Update' },
              { value: 'delete', label: 'Delete' },
              { value: 'view', label: 'View' }
            ]
          }
        ]}
      />

      <div className="logs-container">
        <div className="logs-list">
          {filteredLogs.length === 0 ? (
            <div className="no-data">No activity logs found</div>
          ) : (
            filteredLogs.map(log => (
              <div key={log._id} className="log-item">
                <div className="log-icon">
                  <FiActivity />
                </div>
                <div className="log-content">
                  <div className="log-header">
                    <span className="log-user">
                      <FiUser /> {log.user?.firstName} {log.user?.lastName}
                    </span>
                    <span className="log-action">{log.action}</span>
                    <span className="log-resource">{log.resource}</span>
                  </div>
                  {log.details && (
                    <div className="log-details">
                      {JSON.stringify(log.details, null, 2)}
                    </div>
                  )}
                  <div className="log-footer">
                    <span className="log-time">
                      <FiClock /> {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                    </span>
                    {log.ipAddress && (
                      <span className="log-ip">IP: {log.ipAddress}</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLogs;

