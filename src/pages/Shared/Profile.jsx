import React, { useState, useEffect, useContext } from 'react';
import axios from '../../config/api.config';
import AuthContext from '../../context/AuthContext';
import SidebarNav from '../../components/SidebarNav';
import TopBar from '../../components/TopBar';
import { AdminNavItems, PharmacyNavItems, DistributorNavItems, EmployeeNavItems } from '../../config/navItems';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('/api/v1/users/profile');
        setProfileData(res.data.profile);
      } catch (err) {
        setError('Failed to fetch profile details');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const getNavItems = () => {
    switch(user?.role) {
      case 'admin': return AdminNavItems;
      case 'pharmacy': return PharmacyNavItems;
      case 'distributor': return DistributorNavItems;
      case 'employee': return EmployeeNavItems;
      default: return [];
    }
  };

  return (
    <div className="app-layout">
      <SidebarNav role={user?.role} navItems={getNavItems()} />
      
      <div className="main-content">
        <TopBar title="My Profile" />
        
        <div className="page-content animate-fade">
          <div className="dashboard-header">
            <h1>My Profile</h1>
            <p className="subtitle">View and manage your account details</p>
          </div>

          <div className="dashboard-card" style={{ maxWidth: '600px' }}>
            <div className="card-header">
              <h2>Account Information</h2>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '15px' }}>
                <strong style={{ display: 'inline-block', width: '150px' }}>Username:</strong> {user?.username}
              </div>
              <div style={{ marginBottom: '15px' }}>
                <strong style={{ display: 'inline-block', width: '150px' }}>Email:</strong> {user?.email}
              </div>
              <div style={{ marginBottom: '15px' }}>
                <strong style={{ display: 'inline-block', width: '150px' }}>Role:</strong> {user?.role}
              </div>
              
              {loading && <p>Loading additional profile details...</p>}
              {error && <p style={{ color: 'red' }}>{error}</p>}
              
              {!loading && profileData && user.role === 'distributor' && (
                <>
                  <hr style={{ margin: '20px 0' }} />
                  <h3 style={{ marginBottom: '15px' }}>Distributor Details</h3>
                  <div style={{ marginBottom: '15px' }}>
                    <strong style={{ display: 'inline-block', width: '150px' }}>Company:</strong> {profileData.companyName}
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <strong style={{ display: 'inline-block', width: '150px' }}>License:</strong> {profileData.licenseNumber}
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <strong style={{ display: 'inline-block', width: '150px' }}>NTN:</strong> {profileData.NTN}
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <strong style={{ display: 'inline-block', width: '150px' }}>Address:</strong> {profileData.address}
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <strong style={{ display: 'inline-block', width: '150px' }}>Contact:</strong> {profileData.contactNumber}
                  </div>
                </>
              )}

              {!loading && profileData && user.role === 'pharmacy' && (
                <>
                  <hr style={{ margin: '20px 0' }} />
                  <h3 style={{ marginBottom: '15px' }}>Pharmacy Details</h3>
                  <div style={{ marginBottom: '15px' }}>
                    <strong style={{ display: 'inline-block', width: '150px' }}>Pharmacy:</strong> {profileData.pharmacyName}
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <strong style={{ display: 'inline-block', width: '150px' }}>Owner:</strong> {profileData.ownerName}
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <strong style={{ display: 'inline-block', width: '150px' }}>License:</strong> {profileData.drugLicenseNumber}
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <strong style={{ display: 'inline-block', width: '150px' }}>Address:</strong> {profileData.address}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
