import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiUsers, FiCalendar, FiFileText, FiTrash2, FiCheck } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './BulkOperations.css';

const BulkOperations = () => {
  const { user } = useAuth();
  const [selectedItems, setSelectedItems] = useState([]);
  const [operation, setOperation] = useState('');
  const [targetModule, setTargetModule] = useState('patients');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchItems();
    }
  }, [targetModule, user]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      let response;
      switch (targetModule) {
        case 'patients':
          response = await axios.get('/api/patients');
          break;
        case 'appointments':
          response = await axios.get('/api/appointments');
          break;
        case 'bills':
          response = await axios.get('/api/billing');
          break;
        default:
          response = { data: [] };
      }
      setItems(response.data);
    } catch (error) {
      toast.error('Error fetching items');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(items.map(item => item._id || item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const handleBulkOperation = async () => {
    if (selectedItems.length === 0) {
      toast.error('Please select items');
      return;
    }

    if (!operation) {
      toast.error('Please select an operation');
      return;
    }

    try {
      let endpoint = '';
      switch (targetModule) {
        case 'patients':
          endpoint = '/api/patients';
          break;
        case 'appointments':
          endpoint = '/api/appointments';
          break;
        case 'bills':
          endpoint = '/api/billing';
          break;
      }

      if (operation === 'delete') {
        const confirmMessage = `Are you sure you want to delete ${selectedItems.length} item(s)?`;
        if (!window.confirm(confirmMessage)) return;

        await Promise.all(
          selectedItems.map(id => axios.delete(`${endpoint}/${id}`))
        );
        toast.success(`${selectedItems.length} item(s) deleted successfully`);
      } else if (operation === 'export') {
        // Export selected items
        toast.info('Export functionality coming soon');
      }

      setSelectedItems([]);
      fetchItems();
    } catch (error) {
      toast.error('Error performing bulk operation');
    }
  };

  if (user?.role !== 'admin') {
    return <div className="unauthorized">Unauthorized access</div>;
  }

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="bulk-operations-page">
      <div className="page-header">
        <h2>Bulk Operations</h2>
        <p>Perform operations on multiple items at once</p>
      </div>

      <div className="bulk-controls">
        <div className="control-group">
          <label>Select Module</label>
          <select value={targetModule} onChange={(e) => {
            setTargetModule(e.target.value);
            setSelectedItems([]);
          }}>
            <option value="patients">Patients</option>
            <option value="appointments">Appointments</option>
            <option value="bills">Bills</option>
          </select>
        </div>

        <div className="control-group">
          <label>Operation</label>
          <select value={operation} onChange={(e) => setOperation(e.target.value)}>
            <option value="">Select Operation</option>
            <option value="delete">Delete Selected</option>
            <option value="export">Export Selected</option>
            <option value="update">Update Status</option>
          </select>
        </div>

        <button
          className="btn-primary"
          onClick={handleBulkOperation}
          disabled={selectedItems.length === 0 || !operation}
        >
          <FiCheck /> Execute ({selectedItems.length} selected)
        </button>
      </div>

      <div className="items-list">
        <div className="list-header">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={selectedItems.length === items.length && items.length > 0}
              onChange={handleSelectAll}
            />
            Select All
          </label>
          <span className="selected-count">
            {selectedItems.length} of {items.length} selected
          </span>
        </div>

        <div className="items-grid">
          {items.map(item => {
            const id = item._id || item.id;
            const isSelected = selectedItems.includes(id);
            
            return (
              <div
                key={id}
                className={`item-card ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelectItem(id)}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleSelectItem(id)}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="item-content">
                  {targetModule === 'patients' && (
                    <>
                      <h4>{item.user?.firstName} {item.user?.lastName}</h4>
                      <p>ID: {item.patientId}</p>
                      <p>Email: {item.user?.email}</p>
                    </>
                  )}
                  {targetModule === 'appointments' && (
                    <>
                      <h4>{item.patient?.user?.firstName} {item.patient?.user?.lastName}</h4>
                      <p>Dr. {item.doctor?.firstName} {item.doctor?.lastName}</p>
                      <p>Date: {new Date(item.appointmentDate).toLocaleDateString()}</p>
                      <p>Time: {item.appointmentTime}</p>
                    </>
                  )}
                  {targetModule === 'bills' && (
                    <>
                      <h4>Invoice #{item.invoiceNumber}</h4>
                      <p>{item.patient?.user?.firstName} {item.patient?.user?.lastName}</p>
                      <p>Amount: ${item.total}</p>
                      <p>Status: {item.status}</p>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BulkOperations;

