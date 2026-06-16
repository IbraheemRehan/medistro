import React, { useContext, useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import '../styles/TopBar.css';
import { FiMenu, FiUser, FiLock, FiLogOut, FiBell } from 'react-icons/fi';
import API from '../config/api.config';
import { useSocket } from '../context/SocketContext';

export default function TopBar({ title }) {
  const { user, logout } = useContext(AuthContext);
  const { profileData } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropRef = useRef(null);

  const { notifications, unreadCount, markAsRead, markAllRead } = useSocket();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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
  const displayName = profileData?.username || user?.username || 'User';
  const avatarSrc = profileData?.logo || profileData?.avatar || user?.avatar;

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
          Hello, <strong className="topbar-username">{displayName}</strong> <span className="topbar-role">({user?.role})</span>
        </span>

        {/* Notifications Bell */}
        {user && (
          <div className="topbar-notifications-wrapper" ref={notifRef}>
            <button 
              className="topbar-notif-btn" 
              onClick={() => setNotifOpen(v => !v)}
              aria-label="Notifications"
            >
              <FiBell />
              {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
            </button>

            {notifOpen && (
              <div className="topbar-notif-dropdown">
                <div className="topbar-notif-header">
                  <h3>Notifications</h3>
                  {notifications.length > 0 && (
                    <button className="btn-text btn-sm" style={{ padding: 0, textDecoration: 'none', color: 'black', fontSize: 11 }} onClick={markAllRead}>
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="topbar-notif-divider"/>
                <div className="topbar-notif-list">
                  {notifications.length === 0 ? (
                    <div className="no-notifs">No notifications.</div>
                  ) : (
                    notifications.map(n => (
                      <div 
                        key={n._id} 
                        className={`notif-item ${n.isRead ? 'read' : 'unread'}`}
                        onClick={() => markAsRead(n._id)}
                      >
                        <p>{n.message}</p>
                        <span className="notif-time">{new Date(n.createdAt).toLocaleString()}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Avatar + Dropdown */}
        <div className="topbar-avatar-wrapper" ref={dropRef}>
          <button
            className="topbar-avatar"
            style={{ background: avatarColor }}
            onClick={() => setDropdownOpen(v => !v)}
            aria-label="User menu"
          >
            {avatarSrc
              ? <img src={avatarSrc} alt="avatar" style={{ width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover' }} onError={(e) => { e.target.style.display='none'; e.target.parentNode.textContent = (displayName?.charAt(0).toUpperCase() || '?'); }} />
              : (displayName?.charAt(0).toUpperCase() || '?')
            }
          </button>

          {dropdownOpen && (
            <div className="topbar-dropdown">
              <div className="topbar-dropdown-header">
                <div style={{ fontWeight: 700, color: '#111827' }}>{displayName}</div>
                <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{profileData?.email || user?.email}</div>
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