import React, { useContext, useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import '../styles/SidebarNav.css';
import { MdOutlineLocalPharmacy } from 'react-icons/md';
import { FiChevronLeft, FiChevronRight, FiLogOut } from 'react-icons/fi';

export default function SidebarNav({ navItems = [], role }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setMobileOpen(prev => !prev);
    window.addEventListener('toggleSidebar', handleToggle);
    return () => window.removeEventListener('toggleSidebar', handleToggle);
  }, []);

  useEffect(() => {
    // Sync sidebar width with global CSS variable for layout shifting
    document.documentElement.style.setProperty('--sidebar-w', collapsed ? '64px' : '250px');
  }, [collapsed]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleLabel = role
    ? role.charAt(0).toUpperCase() + role.slice(1)
    : user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1);

  const roleColors = {
    admin:       { bg: '#EEF2FF', color: '#3730A3' },
    distributor: { bg: '#FFF7ED', color: '#C2410C' },
    pharmacy:    { bg: '#F0FDF4', color: '#15803D' },
    employee:    { bg: '#F0F4FF', color: '#1565C0' },
  };
  const roleStyle = roleColors[user?.role] || roleColors.employee;

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`sidebar-overlay ${mobileOpen ? 'active' : ''}`} 
        onClick={() => setMobileOpen(false)}
      />
      
      <aside className={`sidebar${collapsed ? ' collapsed' : ''}${mobileOpen ? ' mobile-open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          {!collapsed && <div className="sidebar-logo-icon"><MdOutlineLocalPharmacy /></div>}
          {!collapsed && <span className="sidebar-logo-text">Medistro</span>}
          <button className="sidebar-collapse-btn" onClick={() => setCollapsed(v => !v)} aria-label="Toggle sidebar">
            {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
          </button>
        </div>

        {/* User Badge */}
        {!collapsed && (
          <div className="sidebar-user-badge" style={{ background: roleStyle.bg }}>
            <div className="sidebar-avatar" style={{ background: roleStyle.color }}>
              {user?.username?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-username">{user?.username || 'User'}</div>
              <div className="sidebar-role-tag" style={{ color: roleStyle.color }}>{roleLabel}</div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="sidebar-nav">
          {!collapsed && <div className="sidebar-section-label">Navigation</div>}
          <ul className="sidebar-nav-list">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}
                  title={collapsed ? item.label : undefined}
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="sidebar-nav-icon">{item.icon}</span>
                  {!collapsed && <span className="sidebar-nav-label">{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="sidebar-footer">
          <button className="sidebar-logout-btn" onClick={handleLogout} title={collapsed ? 'Logout' : undefined}>
            <span><FiLogOut /></span>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}