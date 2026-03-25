import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/SidebarNav.css';

const SidebarNav = ({ userRole, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getMenuItems = () => {
    const menus = {
      distributor: [
        { icon: '📊', label: 'Dashboard', path: '/distributor/dashboard' },
        { icon: '📦', label: 'Stock Management', path: '/distributor/stock' },
        { icon: '📋', label: 'Orders', path: '/distributor/orders' },
        { icon: '👥', label: 'Employees', path: '/distributor/employees' },
        { icon: '📄', label: 'Invoices', path: '/distributor/invoices' },
      ],
      pharmacy: [
        { icon: '📊', label: 'Dashboard', path: '/pharmacy/dashboard' },
        { icon: '🛒', label: 'Place Order', path: '/pharmacy/place-order' },
        { icon: '📋', label: 'My Orders', path: '/pharmacy/my-orders' },
        { icon: '🏢', label: 'Find Distributors', path: '/pharmacy/distributors' },
        { icon: '📄', label: 'Invoices', path: '/pharmacy/invoices' },
      ],
      admin: [
        { icon: '📊', label: 'Dashboard', path: '/admin/dashboard' },
      ],
      employee: [
        { icon: '✓', label: 'My Tasks', path: '/employee/tasks' },
      ],
    };

    return menus[userRole] || menus.pharmacy;
  };

  const menuItems = getMenuItems();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">💊</div>
          <div className="logo-text">
            <h2>MedDistro</h2>
            <p>Distribution</p>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.path}
            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={onLogout}>
          🚪 Logout
        </button>
      </div>
    </div>
  );
};

export default SidebarNav;