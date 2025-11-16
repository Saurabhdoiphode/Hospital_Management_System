import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import './Staff.css';

const Staff = () => {
  const { user } = useAuth();
  const [staff, setStaff] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [staffFormData, setStaffFormData] = useState({
    user: '',
    designation: '',
    department: '',
    joiningDate: '',
    shift: 'flexible',
    leaveBalance: 0
  });
  const [leaveFormData, setLeaveFormData] = useState({
    leaveType: 'casual',
    startDate: '',
    endDate: '',
    reason: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [staffRes, leavesRes, usersRes] = await Promise.all([
        axios.get('/api/staff'),
        axios.get('/api/staff/leave'),
        axios.get('/api/users')
      ]);
      setStaff(staffRes.data);
      setLeaves(leavesRes.data);
      setUsers(usersRes.data.filter(u => u.role !== 'patient'));
    } catch (error) {
      toast.error('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/staff', staffFormData);
      toast.success('Staff record created successfully');
      setShowStaffModal(false);
      fetchData();
    } catch (error) {
      toast.error('Error creating staff record');
    }
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/staff/leave', leaveFormData);
      toast.success('Leave request submitted successfully');
      setShowLeaveModal(false);
      fetchData();
    } catch (error) {
      toast.error('Error submitting leave request');
    }
  };

  const handleLeaveAction = async (id, status) => {
    try {
      await axios.put(`/api/staff/leave/${id}`, { status });
      toast.success(`Leave ${status} successfully`);
      fetchData();
    } catch (error) {
      toast.error('Error updating leave');
    }
  };

  const canManage = user?.role === 'admin';

  if (loading) {
    return <div className="loading">Loading staff data...</div>;
  }

  return (
    <div className="staff-page">
      <div className="page-header">
        <h2>Staff Management</h2>
        <div className="header-actions">
          {user?.role !== 'admin' && (
            <button className="btn-secondary" onClick={() => setShowLeaveModal(true)}>
              <FiCalendar /> Apply for Leave
            </button>
          )}
          {canManage && (
            <button className="btn-primary" onClick={() => setShowStaffModal(true)}>
              <FiPlus /> Add Staff
            </button>
          )}
        </div>
      </div>

      <div className="staff-sections">
        <div className="staff-list-section">
          <h3>Staff Members</h3>
          <div className="staff-grid">
            {staff.map(member => (
              <div key={member._id} className="staff-card">
                <div className="staff-header">
                  <h4>{member.user?.firstName} {member.user?.lastName}</h4>
                  <span className="employee-id">{member.employeeId}</span>
                </div>
                <div className="staff-details">
                  <p><strong>Designation:</strong> {member.designation}</p>
                  <p><strong>Department:</strong> {member.department}</p>
                  <p><strong>Shift:</strong> {member.shift}</p>
                  <p><strong>Leave Balance:</strong> {member.leaveBalance} days</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="leaves-section">
          <h3>Leave Requests</h3>
          <div className="leaves-list">
            {leaves.length === 0 ? (
              <div className="no-data">No leave requests</div>
            ) : (
              leaves.map(leave => (
                <div key={leave._id} className="leave-card">
                  <div className="leave-info">
                    <h4>{leave.staff?.user?.firstName} {leave.staff?.user?.lastName}</h4>
                    <p><strong>Type:</strong> {leave.leaveType}</p>
                    <p><strong>Duration:</strong> {format(new Date(leave.startDate), 'MMM dd')} - {format(new Date(leave.endDate), 'MMM dd, yyyy')}</p>
                    <p><strong>Days:</strong> {leave.days}</p>
                    <p><strong>Reason:</strong> {leave.reason}</p>
                  </div>
                  <div className="leave-actions">
                    <span className={`status-badge status-${leave.status}`}>
                      {leave.status}
                    </span>
                    {canManage && leave.status === 'pending' && (
                      <div className="action-buttons">
                        <button className="btn-approve" onClick={() => handleLeaveAction(leave._id, 'approved')}>
                          Approve
                        </button>
                        <button className="btn-reject" onClick={() => handleLeaveAction(leave._id, 'rejected')}>
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showStaffModal && canManage && (
        <div className="modal-overlay" onClick={() => setShowStaffModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add Staff Member</h2>
            <form onSubmit={handleStaffSubmit}>
              <div className="form-group">
                <label>User *</label>
                <select
                  required
                  value={staffFormData.user}
                  onChange={(e) => setStaffFormData({ ...staffFormData, user: e.target.value })}
                >
                  <option value="">Select User</option>
                  {users.map(u => (
                    <option key={u._id} value={u._id}>
                      {u.firstName} {u.lastName} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Designation *</label>
                  <input
                    type="text"
                    required
                    value={staffFormData.designation}
                    onChange={(e) => setStaffFormData({ ...staffFormData, designation: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Department *</label>
                  <input
                    type="text"
                    required
                    value={staffFormData.department}
                    onChange={(e) => setStaffFormData({ ...staffFormData, department: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Joining Date *</label>
                  <input
                    type="date"
                    required
                    value={staffFormData.joiningDate}
                    onChange={(e) => setStaffFormData({ ...staffFormData, joiningDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Shift</label>
                  <select
                    value={staffFormData.shift}
                    onChange={(e) => setStaffFormData({ ...staffFormData, shift: e.target.value })}
                  >
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="night">Night</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Leave Balance</label>
                <input
                  type="number"
                  min="0"
                  value={staffFormData.leaveBalance}
                  onChange={(e) => setStaffFormData({ ...staffFormData, leaveBalance: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowStaffModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">Add Staff</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showLeaveModal && (
        <div className="modal-overlay" onClick={() => setShowLeaveModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Apply for Leave</h2>
            <form onSubmit={handleLeaveSubmit}>
              <div className="form-group">
                <label>Leave Type *</label>
                <select
                  required
                  value={leaveFormData.leaveType}
                  onChange={(e) => setLeaveFormData({ ...leaveFormData, leaveType: e.target.value })}
                >
                  <option value="sick">Sick Leave</option>
                  <option value="casual">Casual Leave</option>
                  <option value="emergency">Emergency</option>
                  <option value="vacation">Vacation</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    required
                    value={leaveFormData.startDate}
                    onChange={(e) => setLeaveFormData({ ...leaveFormData, startDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>End Date *</label>
                  <input
                    type="date"
                    required
                    value={leaveFormData.endDate}
                    onChange={(e) => setLeaveFormData({ ...leaveFormData, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Reason *</label>
                <textarea
                  required
                  rows="4"
                  value={leaveFormData.reason}
                  onChange={(e) => setLeaveFormData({ ...leaveFormData, reason: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowLeaveModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Staff;

