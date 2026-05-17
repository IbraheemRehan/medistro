import React from 'react';
import { Link } from 'react-router-dom';
import { MdOutlineLocalPharmacy } from 'react-icons/md';
import '../styles/PublicTopBar.css';

export default function PublicTopBar() {
  return (
    <nav className="public-topbar">
      <div className="public-topbar-container">
        <Link to="/login" className="public-topbar-brand">
          <div className="public-topbar-logo">
            <MdOutlineLocalPharmacy />
          </div>
          <span className="public-topbar-name">Medistro</span>
        </Link>
        
        <div className="public-topbar-links">
          <Link to="/about" className="public-topbar-link">About Medistro</Link>
        </div>
      </div>
    </nav>
  );
}
