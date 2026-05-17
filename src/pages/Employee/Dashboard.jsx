import React, { useState, useEffect, useContext } from 'react';
import axios from '../../config/api.config';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import SidebarNav from '../../components/SidebarNav';
import TopBar from '../../components/TopBar';
import { EmployeeNavItems } from '../../config/navItems';
import { FiClipboard, FiClock, FiCheckCircle, FiTrendingUp } from 'react-icons/fi';

const EmployeeDashboard = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [employeeData, setEmployeeData] = useState(null);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/v1/employees/me');
      setEmployeeData(response.data);
    } catch (err) {
      console.error('Failed to fetch employee profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await axios.put(`/api/v1/employees/${employeeData._id}/tasks/${taskId}`, { status: newStatus });
      fetchProfile();
    } catch (err) {
      alert('Failed to update task status');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#F0F4FF' }}>
        <div className="spinner spinner-blue" style={{ width: 40, height: 40 }}></div>
      </div>
    );
  }

  const tasks = employeeData?.tasks || [];
  const compTasks = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status !== 'completed').length;

  const statCards = [
    { title: 'Total Tasks', value: tasks.length, icon: <FiClipboard />, color: 'blue' },
    { title: 'Active Tasks', value: pendingTasks, icon: <FiClock />, color: 'amber' },
    { title: 'Completed', value: compTasks, icon: <FiCheckCircle />, color: 'green' },
    { title: 'Efficiency', value: `${tasks.length > 0 ? Math.round((compTasks/tasks.length)*100) : 0}%`, icon: <FiTrendingUp />, color: 'info' },
  ];

  return (
    <div className="app-layout">
      <SidebarNav role="employee" navItems={EmployeeNavItems} />

      <div className="main-content">
        <TopBar title="My Task Center" />

        <div className="page-content animate-fade">
          <div className="page-header">
            <h1>Workspace: {employeeData?.name}</h1>
            <p style={{ color: 'var(--gray-500)' }}>Working at {employeeData?.distributorId?.companyName} · {employeeData?.position}</p>
          </div>

          <div className="grid-4" style={{ marginBottom: 32 }}>
            {statCards.map((card, idx) => (
              <div key={idx} className="stat-card">
                <div className={`stat-icon ${card.color}`}>{card.icon}</div>
                <div>
                  <div className="stat-value">{card.value}</div>
                  <div className="stat-label">{card.title}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
            {/* Task List */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Assigned Tasks</span>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Task Title</th>
                      <th>Due Date</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.length === 0 ? (
                      <tr><td colSpan="4" style={{ textAlign: 'center', padding: 32 }}>No tasks assigned.</td></tr>
                    ) : (
                      tasks.map((task) => (
                        <tr key={task._id}>
                          <td style={{ fontWeight: 600 }}>{task.title}</td>
                          <td>{new Date(task.dueDate).toLocaleDateString()}</td>
                          <td>
                            <span className={`badge badge-${task.status === 'completed' ? 'green' : task.status === 'in-progress' ? 'blue' : 'gray'}`}>
                              {task.status.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <select
                              className="form-input"
                              style={{ padding: '6px 12px', fontSize: '12px', width: 'auto' }}
                              value={task.status}
                              onChange={(e) => handleUpdateStatus(task._id, e.target.value)}
                            >
                              <option value="pending">Pending</option>
                              <option value="in-progress">In Progress</option>
                              <option value="completed">Completed</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Workplace Info */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Workplace Info</span>
              </div>
              <div className="card-body">
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                   <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--blue-50)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 24 }}>🏢</div>
                   <h3 style={{ margin: 0, fontSize: 18 }}>{employeeData?.distributorId?.companyName}</h3>
                   <p style={{ color: 'var(--gray-500)', fontSize: 13 }}>Official Partner</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--gray-500)' }}>Address</span>
                    <span style={{ fontWeight: 500, textAlign: 'right' }}>{employeeData?.distributorId?.address || 'Pakistan'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--gray-500)' }}>Contact</span>
                    <span style={{ fontWeight: 500 }}>{employeeData?.distributorId?.contactNumber || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--gray-500)' }}>Role</span>
                    <span className="badge badge-blue">{employeeData?.position}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
