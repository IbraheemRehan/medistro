import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import SidebarNav from '../../components/SidebarNav';
import TopBar from '../../components/TopBar';
import Modal from '../../components/Modal';
import '../../styles/EmployeeManagement.css';

const EmployeeManagement = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [employees, setEmployees] = useState([
    {
      id: 1,
      name: 'Ahmed Khan',
      email: 'ahmed@medistro.com',
      phone: '03001234567',
      position: 'Stock Manager',
      joinDate: '2023-01-15',
      status: 'active',
      tasks: [
        { id: 1, title: 'Organize Warehouse', status: 'completed', dueDate: '2024-03-24' },
        { id: 2, title: 'Check Expiry Dates', status: 'in-progress', dueDate: '2024-03-25' },
      ]
    },
    {
      id: 2,
      name: 'Fatima Ahmad',
      email: 'fatima@medistro.com',
      phone: '03009876543',
      position: 'Delivery Executive',
      joinDate: '2023-03-20',
      status: 'active',
      tasks: [
        { id: 3, title: 'Deliver Order ORD-001', status: 'completed', dueDate: '2024-03-24' },
        { id: 4, title: 'Collect Payment', status: 'pending', dueDate: '2024-03-26' },
      ]
    },
    {
      id: 3,
      name: 'Hassan Ali',
      email: 'hassan@medistro.com',
      phone: '03115555666',
      position: 'Order Processor',
      joinDate: '2023-06-10',
      status: 'active',
      tasks: [
        { id: 5, title: 'Process New Orders', status: 'in-progress', dueDate: '2024-03-25' },
      ]
    },
    {
      id: 4,
      name: 'Zainab Malik',
      email: 'zainab@medistro.com',
      phone: '03219999888',
      position: 'Quality Checker',
      joinDate: '2023-09-05',
      status: 'active',
      tasks: [
        { id: 6, title: 'Quality Inspection Batch-001', status: 'pending', dueDate: '2024-03-27' },
      ]
    },
  ]);

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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAddEmployee = (e) => {
    e.preventDefault();
    const employee = {
      id: employees.length + 1,
      ...newEmployee,
      joinDate: new Date().toISOString().split('T')[0],
      status: 'active',
      tasks: []
    };

    setEmployees([...employees, employee]);
    setShowAddModal(false);
    setNewEmployee({ name: '', email: '', phone: '', position: '' });
  };

  const handleAssignTask = (e) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    const task = {
      id: Math.max(...selectedEmployee.tasks.map(t => t.id), 0) + 1,
      ...newTask,
      status: 'pending'
    };

    setEmployees(employees.map(emp =>
      emp.id === selectedEmployee.id
        ? { ...emp, tasks: [...emp.tasks, task] }
        : emp
    ));

    setSelectedEmployee({
      ...selectedEmployee,
      tasks: [...selectedEmployee.tasks, task]
    });

    setNewTask({ title: '', dueDate: '' });
    setShowTaskModal(false);
  };

  const handleUpdateTaskStatus = (employeeId, taskId, newStatus) => {
    setEmployees(employees.map(emp => {
      if (emp.id === employeeId) {
        return {
          ...emp,
          tasks: emp.tasks.map(task =>
            task.id === taskId ? { ...task, status: newStatus } : task
          )
        };
      }
      return emp;
    }));

    if (selectedEmployee && selectedEmployee.id === employeeId) {
      setSelectedEmployee({
        ...selectedEmployee,
        tasks: selectedEmployee.tasks.map(task =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      });
    }
  };

  const handleRemoveEmployee = (employeeId) => {
    setEmployees(employees.filter(emp => emp.id !== employeeId));
    setSelectedEmployee(null);
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTotalTasks = (tasks) => tasks.length;
  const getCompletedTasks = (tasks) => tasks.filter(t => t.status === 'completed').length;
  const getInProgressTasks = (tasks) => tasks.filter(t => t.status === 'in-progress').length;

  return (
    <div className="dashboard-container">
      <SidebarNav userRole="distributor" onLogout={handleLogout} />

      <div className="dashboard-content">
        <TopBar userName={user?.username} userRole="Distributor" />

        <div className="employee-management">
          <div className="page-header">
            <h1>Employee Management</h1>
            <button
              className="btn-primary"
              onClick={() => setShowAddModal(true)}
            >
              ➕ Add Employee
            </button>
          </div>

          {/* Search */}
          <div className="employee-controls">
            <input
              type="text"
              placeholder="Search by name, email or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Employees Grid */}
          <div className="employees-grid">
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee) => (
                <div key={employee.id} className="employee-card">
                  <div className="employee-header">
                    <div className="employee-avatar">
                      {employee.name.charAt(0)}
                    </div>
                    <div className="employee-basic">
                      <h3>{employee.name}</h3>
                      <p className="position">{employee.position}</p>
                    </div>
                    <span className="status-badge active">Active</span>
                  </div>

                  <div className="employee-details">
                    <div className="detail-item">
                      <label>Email</label>
                      <p>{employee.email}</p>
                    </div>
                    <div className="detail-item">
                      <label>Phone</label>
                      <p>{employee.phone}</p>
                    </div>
                    <div className="detail-item">
                      <label>Joined</label>
                      <p>{employee.joinDate}</p>
                    </div>
                  </div>

                  {/* Task Stats */}
                  <div className="task-stats">
                    <div className="stat">
                      <p className="stat-value">{getTotalTasks(employee.tasks)}</p>
                      <p className="stat-label">Total Tasks</p>
                    </div>
                    <div className="stat">
                      <p className="stat-value" style={{ color: '#4CAF50' }}>
                        {getCompletedTasks(employee.tasks)}
                      </p>
                      <p className="stat-label">Completed</p>
                    </div>
                    <div className="stat">
                      <p className="stat-value" style={{ color: '#FF9800' }}>
                        {getInProgressTasks(employee.tasks)}
                      </p>
                      <p className="stat-label">In Progress</p>
                    </div>
                  </div>

                  <div className="employee-actions">
                    <button
                      className="btn-primary btn-sm"
                      onClick={() => {
                        setSelectedEmployee(employee);
                        setShowTaskModal(true);
                      }}
                    >
                      ➕ Assign Task
                    </button>
                    <button
                      className="btn-secondary btn-sm"
                      onClick={() => setSelectedEmployee(employee)}
                    >
                      📋 View Tasks
                    </button>
                    <button
                      className="btn-danger btn-sm"
                      onClick={() => handleRemoveEmployee(employee.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">
                <p>No employees found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <Modal onClose={() => setShowAddModal(false)} title="Add New Employee">
          <form onSubmit={handleAddEmployee} className="employee-form">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                value={newEmployee.name}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, name: e.target.value })
                }
                placeholder="Enter full name"
                required
              />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                value={newEmployee.email}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, email: e.target.value })
                }
                placeholder="Enter email"
                required
              />
            </div>

            <div className="form-group">
              <label>Phone *</label>
              <input
                type="tel"
                value={newEmployee.phone}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, phone: e.target.value })
                }
                placeholder="Enter phone number"
                required
              />
            </div>

            <div className="form-group">
              <label>Position *</label>
              <select
                value={newEmployee.position}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, position: e.target.value })
                }
                required
              >
                <option value="">Select a position</option>
                <option value="Stock Manager">Stock Manager</option>
                <option value="Delivery Executive">Delivery Executive</option>
                <option value="Order Processor">Order Processor</option>
                <option value="Quality Checker">Quality Checker</option>
              </select>
            </div>

            <div className="modal-buttons">
              <button type="submit" className="btn-primary">
                Add Employee
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Assign Task Modal */}
      {showTaskModal && selectedEmployee && (
        <Modal onClose={() => setShowTaskModal(false)} title={`Assign Task to ${selectedEmployee.name}`}>
          <form onSubmit={handleAssignTask} className="task-form">
            <div className="form-group">
              <label>Task Title *</label>
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Enter task description"
                required
              />
            </div>

            <div className="form-group">
              <label>Due Date *</label>
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                required
              />
            </div>

            <div className="modal-buttons">
              <button type="submit" className="btn-primary">
                Assign Task
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowTaskModal(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* View Tasks Modal */}
      {selectedEmployee && !showTaskModal && (
        <Modal onClose={() => setSelectedEmployee(null)} title={`Tasks for ${selectedEmployee.name}`}>
          <div className="tasks-list">
            {selectedEmployee.tasks.length > 0 ? (
              selectedEmployee.tasks.map((task) => (
                <div key={task.id} className="task-item">
                  <div className="task-content">
                    <h4>{task.title}</h4>
                    <p className="task-date">Due: {task.dueDate}</p>
                  </div>
                  <div className="task-controls">
                    <select
                      value={task.status}
                      onChange={(e) =>
                        handleUpdateTaskStatus(selectedEmployee.id, task.id, e.target.value)
                      }
                      className={`task-status status-${task.status}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-tasks">No tasks assigned</p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default EmployeeManagement;