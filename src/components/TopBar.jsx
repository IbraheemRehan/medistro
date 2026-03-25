import React from 'react';
import '../styles/TopBar.css';

const TopBar = ({ userName, userRole }) => {
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRoleIcon = (role) => {
    const icons = {
      'Distributor': '🏢',
      'Pharmacy': '🏥',
      'Admin': '⚙️',
      'Employee': '👤'
    };
    return icons[role] || '👤';
  };

  return (
    <div className="topbar">
      <div className="topbar-content">
        <h2 className="page-title">Welcome</h2>
        <div className="topbar-user">
          <div className="user-avatar">
            {getInitials(userName)}
          </div>
          <div className="user-info">
            <p className="user-name">{userName || 'User'}</p>
            <p className="user-role">{getRoleIcon(userRole)} {userRole}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;