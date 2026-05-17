import React, { useContext, useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import '../styles/TopBar.css';
import { FiMenu, FiUser, FiLock, FiLogOut } from 'react-icons/fi';

export default function TopBar({ title }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleMobileMenu = () => {
    window.dispatchEvent(new Event('toggleSidebar'));
  };

  // Derive page title from location if not passed
  const pageTitle = title || location.pathname
    .split('/')
    .filter(Boolean)
    .map(s => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' '))
    .join(' › ');

  const roleColors = {
    admin:       '#3730A3',
    distributor: '#C2410C',
    pharmacy:    '#15803D',
    employee:    '#1565C0',
  };
  const avatarColor = roleColors[user?.role] || '#1565C0';

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="topbar-mobile-menu" onClick={handleMobileMenu} aria-label="Open menu">
          <FiMenu />
        </button>
        <h2 className="topbar-title">{pageTitle}</h2>
      </div>

      <div className="topbar-right">
        {/* Greeting */}
        <span className="topbar-greeting">
          Hello, <strong>{user?.username || 'User'}</strong>
        </span>

        {/* Role badge */}
        <span className={`badge badge-${user?.role === 'admin' ? 'blue' : user?.role === 'pharmacy' ? 'green' : user?.role === 'distributor' ? 'amber' : 'blue'}`}>
          {user?.role}
        </span>

        {/* Avatar + Dropdown */}
        <div className="topbar-avatar-wrapper" ref={dropRef}>
          <button
            className="topbar-avatar"
            style={{ background: avatarColor }}
            onClick={() => setDropdownOpen(v => !v)}
            aria-label="User menu"
          >
            {user?.avatar
              ? <img src={user.avatar} alt="avatar" style={{ width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover' }}/>
              : (user?.username?.charAt(0).toUpperCase() || '?')
            }
          </button>

          {dropdownOpen && (
            <div className="topbar-dropdown">
              <div className="topbar-dropdown-header">
                <div style={{ fontWeight: 700, color: '#111827' }}>{user?.username}</div>
                <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{user?.email}</div>
              </div>
              <div className="topbar-dropdown-divider"/>
              <button className="topbar-dropdown-item" onClick={() => { navigate('/profile'); setDropdownOpen(false); }}>
                <span style={{marginRight:8}}><FiUser /></span> Profile Settings
              </button>
              <button className="topbar-dropdown-item" onClick={() => { navigate('/profile'); setDropdownOpen(false); }}>
                <span style={{marginRight:8}}><FiLock /></span> Change Password
              </button>
              <div className="topbar-dropdown-divider"/>
              <button className="topbar-dropdown-item danger" onClick={handleLogout}>
                <span style={{marginRight:8}}><FiLogOut /></span> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}