import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import SidebarNav from '../../components/SidebarNav';
import TopBar from '../../components/TopBar';
import Modal from '../../components/Modal';
import API from '../../config/api.config';
import { DistributorNavItems } from '../../config/navItems';
import { FiPlus, FiTrash2, FiClipboard, FiUsers, FiUserCheck, FiSmartphone, FiCalendar, FiSearch } from 'react-icons/fi';

const EmployeeManagement = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [lastCreatedCredentials, setLastCreatedCredentials] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  const [employees, setEmployees] = useState([]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await API.get('/api/v1/employees');
      const mapped = response.data.map(emp => ({
        id: emp._id,
        name: emp.name,
        email: emp.userId?.email || 'N/A',
        username: emp.userId?.username || 'N/A',
        phone: emp.phone,
        position: emp.position,
        joinDate: new Date(emp.createdAt).toLocaleDateString(),
        status: emp.userId?.status || 'active',
        tasks: (emp.tasks || []).map(t => ({
          id: t._id,
          title: t.title,
          status: t.status,
          dueDate: new Date(t.dueDate).toLocaleDateString()
        }))
      }));
      setEmployees(mapped);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    phone: '',
    position: ''
  });

  const [newTask, setNewTask] = useState({
    title: '',
    dueDate: ''
  });

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/api/v1/employees', {
        name: newEmployee.name,
        email: newEmployee.email,
        phone: newEmployee.phone,
        position: newEmployee.position
      });
      
      setLastCreatedCredentials({
        username: res.data.user.username,
        password: "password123"
      });
      
      setShowAddModal(false);
      setShowCredentialsModal(true);
      setNewEmployee({ name: '', email: '', phone: '', position: '' });
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add employee');
    }
  };

  const handleAssignTask = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    try {
      await API.post(`/api/v1/employees/${selectedEmployee.id}/tasks`, {
        title: newTask.title,
        dueDate: newTask.dueDate
      });
      setNewTask({ title: '', dueDate: '' });
      setShowTaskModal(false);
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign task');
    }
  };

  const handleUpdateTaskStatus = async (employeeId, taskId, newStatus) => {
    try {
      await API.put(`/api/v1/employees/${employeeId}/tasks/${taskId}`, { status: newStatus });
      fetchEmployees();
    } catch (err) {
      alert('Failed to update task status');
    }
  };

  const handleRemoveEmployee = async (employeeId) => {
    if (!window.confirm("Are you sure you want to completely remove this employee?")) return;
    try {
      await API.delete(`/api/v1/employees/${employeeId}`);
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete employee');
    }
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="app-layout">
      <SidebarNav role="distributor" navItems={DistributorNavItems} />

      <div className="main-content">
        <TopBar title="Employee Management" />

        <div className="page-content animate-fade">
          <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <div>
              <h1>Employee Management</h1>
              <p style={{ color: 'var(--gray-500)' }}>Manage team members and assign operational tasks</p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => setShowAddModal(true)}
            >
              <FiPlus /> Provision New Employee
            </button>
          </div>

          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-body">
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search by name, email or position..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: 40 }}
                />
                <FiSearch style={{ position: 'absolute', left: 14, top: 14, color: 'var(--gray-400)' }} />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
            {loading ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40 }}>Loading team data...</div>
            ) : filteredEmployees.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40 }}>No employees found.</div>
            ) : (
              filteredEmployees.map((employee) => (
                <div key={employee.id} className="card animate-scale" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className="card-body" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                        <div style={{ width: 56, height: 56, borderRadius: '16px', background: 'var(--blue-50)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700 }}>
                          {employee.name.charAt(0)}
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: 18 }}>{employee.name}</h3>
                          <span className="badge badge-blue">{employee.position}</span>
                        </div>
                      </div>
                      <span className={`badge badge-${employee.status === 'active' ? 'green' : 'gray'}`}>{employee.status}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--gray-600)' }}>
                        <FiUsers size={16} /> <span style={{ fontWeight: 600, color: 'var(--brand)' }}>{employee.username}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--gray-600)' }}>
                        <FiSmartphone size={16} /> {employee.phone}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--gray-600)' }}>
                        <FiCalendar size={16} /> Joined: {employee.joinDate}
                      </div>
                    </div>

                    <div style={{ background: 'var(--gray-50)', borderRadius: '12px', padding: 16, marginBottom: 24 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                        <span style={{ color: 'var(--gray-500)' }}>Active Tasks</span>
                        <span style={{ fontWeight: 700 }}>{employee.tasks.filter(t => t.status !== 'completed').length}</span>
                      </div>
                      <div style={{ height: 6, background: 'var(--gray-200)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ 
                          height: '100%', 
                          background: 'var(--brand)', 
                          width: `${employee.tasks.length > 0 ? (employee.tasks.filter(t => t.status === 'completed').length / employee.tasks.length) * 100 : 0}%`,
                          transition: 'width 0.5s'
                        }}></div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => { setSelectedEmployee(employee); setShowTaskModal(true); }}>
                        <FiPlus /> Task
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => setSelectedEmployee(employee)}>
                        <FiClipboard />
                      </button>
                      <button className="btn btn-secondary btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleRemoveEmployee(employee.id)}>
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showAddModal && (
        <Modal onClose={() => setShowAddModal(false)} title="Provision New Employee">
          <form onSubmit={handleAddEmployee}>
             <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input type="text" className="form-input" value={newEmployee.name} onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })} required />
             </div>
             <div className="form-group">
                <label className="form-label">Official Email *</label>
                <input type="email" className="form-input" value={newEmployee.email} onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })} required />
             </div>
             <div className="form-group">
                <label className="form-label">Phone *</label>
                <input type="tel" className="form-input" value={newEmployee.phone} onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })} required />
             </div>
             <div className="form-group">
                <label className="form-label">Department / Position *</label>
                <select className="form-input" value={newEmployee.position} onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })} required>
                  <option value="">Select Position</option>
                  <option value="Stock Manager">Stock Manager</option>
                  <option value="Delivery Executive">Delivery Executive</option>
                  <option value="Order Processor">Order Processor</option>
                </select>
             </div>
             <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                <button type="submit" className="btn btn-primary btn-full">Create Account</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
             </div>
          </form>
        </Modal>
      )}

      {showCredentialsModal && lastCreatedCredentials && (
        <Modal onClose={() => setShowCredentialsModal(false)} title="Account Created!">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <p style={{ color: 'var(--gray-500)', marginBottom: 24 }}>Employee login details generated successfully.</p>
            <div style={{ background: 'var(--blue-50)', padding: 24, borderRadius: 16, border: '1px dashed var(--brand)', textAlign: 'left' }}>
               <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--brand)', fontWeight: 700 }}>Username</label>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{lastCreatedCredentials.username}</div>
               </div>
               <div>
                  <label style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--brand)', fontWeight: 700 }}>Password</label>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{lastCreatedCredentials.password}</div>
               </div>
            </div>
            <button className="btn btn-primary btn-full" style={{ marginTop: 24 }} onClick={() => setShowCredentialsModal(false)}>Got it</button>
          </div>
        </Modal>
      )}

      {showTaskModal && selectedEmployee && (
        <Modal onClose={() => setShowTaskModal(false)} title={`Assign Task: ${selectedEmployee.name}`}>
          <form onSubmit={handleAssignTask}>
             <div className="form-group">
                <label className="form-label">Task Title *</label>
                <input type="text" className="form-input" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} required />
             </div>
             <div className="form-group">
                <label className="form-label">Due Date *</label>
                <input type="date" className="form-input" value={newTask.dueDate} onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })} required />
             </div>
             <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                <button type="submit" className="btn btn-primary btn-full">Assign Now</button>
             </div>
          </form>
        </Modal>
      )}

      {selectedEmployee && !showTaskModal && (
        <Modal onClose={() => setSelectedEmployee(null)} title={`Tasks: ${selectedEmployee.name}`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {selectedEmployee.tasks.length === 0 ? (
              <p style={{ textAlign: 'center', padding: 24, color: 'var(--gray-400)' }}>No tasks assigned yet.</p>
            ) : (
              selectedEmployee.tasks.map((task) => (
                <div key={task.id} className="card" style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{task.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>Due: {task.dueDate}</div>
                  </div>
                  <select
                    className="form-input"
                    style={{ width: 'auto', padding: '4px 12px', fontSize: 12 }}
                    value={task.status}
                    onChange={(e) => handleUpdateTaskStatus(selectedEmployee.id, task.id, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              ))
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default EmployeeManagement;