import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import SidebarNav from '../../components/SidebarNav';
import TopBar from '../../components/TopBar';
import Modal from '../../components/Modal';
import '../../styles/PlaceOrder.css';

const FindDistributors = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistributor, setSelectedDistributor] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [distributors] = useState([
    {
      id: 'DIST-001',
      companyName: 'Prime Distributor',
      licenseNumber: 'LIC-2021-001',
      address: '100 Industrial Area, Okara',
      contactNumber: '03001111111',
      contactPerson: 'Mr. Ahmed Khan',
      rating: 4.8,
      totalOrders: 156,
      totalPharmacies: 32,
      medicines: 45,
      established: '2021-03-15'
    },
    {
      id: 'DIST-002',
      companyName: 'Health Supplies Co',
      licenseNumber: 'LIC-2022-005',
      address: '200 Business Park, Okara',
      contactNumber: '03002222222',
      contactPerson: 'Ms. Fatima Ahmad',
      rating: 4.6,
      totalOrders: 98,
      totalPharmacies: 24,
      medicines: 38,
      established: '2022-06-20'
    },
    {
      id: 'DIST-003',
      companyName: 'MediPro Distribution',
      licenseNumber: 'LIC-2023-010',
      address: '300 Trade Center, Okara',
      contactNumber: '03003333333',
      contactPerson: 'Mr. Hassan Ali',
      rating: 4.5,
      totalOrders: 145,
      totalPharmacies: 28,
      medicines: 52,
      established: '2023-01-10'
    },
    {
      id: 'DIST-004',
      companyName: 'Global Medical Supplies',
      licenseNumber: 'LIC-2020-015',
      address: '400 Commerce Street, Okara',
      contactNumber: '03004444444',
      contactPerson: 'Dr. Zainab Malik',
      rating: 4.9,
      totalOrders: 203,
      totalPharmacies: 42,
      medicines: 65,
      established: '2020-02-28'
    },
    {
      id: 'DIST-005',
      companyName: 'QuickMed Distributors',
      licenseNumber: 'LIC-2023-008',
      address: '500 Market Road, Okara',
      contactNumber: '03005555555',
      contactPerson: 'Mr. Ali Khan',
      rating: 4.4,
      totalOrders: 87,
      totalPharmacies: 19,
      medicines: 31,
      established: '2023-05-12'
    },
    {
      id: 'DIST-006',
      companyName: 'Wellness Distribution Network',
      licenseNumber: 'LIC-2021-012',
      address: '600 Enterprise Plaza, Okara',
      contactNumber: '03006666666',
      contactPerson: 'Ms. Sara Ahmed',
      rating: 4.7,
      totalOrders: 172,
      totalPharmacies: 35,
      medicines: 48,
      established: '2021-08-05'
    }
  ]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredDistributors = distributors.filter((dist) =>
    dist.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dist.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dist.contactNumber.includes(searchTerm)
  );

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span key={i} style={{ color: i < Math.floor(rating) ? '#fbbf24' : '#d1d5db' }}>
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="dashboard-container">
      <SidebarNav userRole="pharmacy" onLogout={handleLogout} />

      <div className="dashboard-content">
        <TopBar userName={user?.username} userRole="Pharmacy" />

        <div className="place-order">
          <div className="page-header">
            <h1>Find Distributors</h1>
            <p className="subtitle">Browse all available distributors in your area</p>
          </div>

          {/* Search and Filter */}
          <div className="stock-controls" style={{ marginBottom: '32px' }}>
            <input
              type="text"
              placeholder="Search by company name, address or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Results Count */}
          <div style={{
            marginBottom: '24px',
            padding: '16px',
            backgroundColor: '#f0fdf4',
            borderRadius: '8px',
            borderLeft: '4px solid #22c55e'
          }}>
            <p style={{ margin: 0, color: '#065f46', fontWeight: 500 }}>
              Found {filteredDistributors.length} distributors
            </p>
          </div>

          {/* Distributors Grid */}
          <div className="distributors-grid">
            {filteredDistributors.map((dist) => (
              <div key={dist.id} className="distributor-card" style={{ position: 'relative' }}>
                {/* Rating Badge */}
                <div style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  backgroundColor: '#fff3cd',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  zIndex: 10
                }}>
                  <span style={{ fontSize: '0.9rem' }}>★ {dist.rating}</span>
                </div>

                <div className="card-header">
                  <div>
                    <h3>{dist.companyName}</h3>
                    <p style={{ margin: '8px 0 0 0', color: '#6b7280', fontSize: '0.85rem' }}>
                      {dist.contactPerson}
                    </p>
                  </div>
                </div>

                <div className="card-details">
                  <div className="detail-item">
                    <label>License Number</label>
                    <p>{dist.licenseNumber}</p>
                  </div>
                  <div className="detail-item">
                    <label>Address</label>
                    <p>{dist.address}</p>
                  </div>
                  <div className="detail-item">
                    <label>Contact Number</label>
                    <p>{dist.contactNumber}</p>
                  </div>

                  {/* Stats */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    marginTop: '16px',
                    paddingTop: '16px',
                    borderTop: '1px solid #e5e7eb'
                  }}>
                    <div>
                      <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: 0 }}>
                        Medicines
                      </p>
                      <p style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                        {dist.medicines}
                      </p>
                    </div>
                    <div>
                      <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: 0 }}>
                        Pharmacies
                      </p>
                      <p style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                        {dist.totalPharmacies}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="action-buttons" style={{
                  display: 'flex',
                  gap: '8px',
                  padding: '16px 20px',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  <button
                    className="btn-primary"
                    onClick={() => {
                      setSelectedDistributor(dist);
                      setShowDetailsModal(true);
                    }}
                    style={{ flex: 1 }}
                  >
                    View Details
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => navigate('/pharmacy/place-order')}
                    style={{ flex: 1 }}
                  >
                    Order
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredDistributors.length === 0 && (
            <div className="no-results">
              <p>No distributors found matching your search.</p>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedDistributor && (
        <Modal onClose={() => setShowDetailsModal(false)} title={selectedDistributor.companyName}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ paddingBottom: '20px', borderBottom: '1px solid #e5e7eb' }}>
              <h4 style={{ marginBottom: '16px' }}>Company Information</h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px'
              }}>
                <div>
                  <label style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: 500 }}>
                    License Number
                  </label>
                  <p style={{ margin: '4px 0 0 0', fontWeight: 600 }}>
                    {selectedDistributor.licenseNumber}
                  </p>
                </div>
                <div>
                  <label style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: 500 }}>
                    Established
                  </label>
                  <p style={{ margin: '4px 0 0 0', fontWeight: 600 }}>
                    {selectedDistributor.established}
                  </p>
                </div>
                <div>
                  <label style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: 500 }}>
                    Address
                  </label>
                  <p style={{ margin: '4px 0 0 0', fontWeight: 600 }}>
                    {selectedDistributor.address}
                  </p>
                </div>
                <div>
                  <label style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: 500 }}>
                    Contact
                  </label>
                  <p style={{ margin: '4px 0 0 0', fontWeight: 600 }}>
                    {selectedDistributor.contactNumber}
                  </p>
                </div>
              </div>
            </div>

            <div style={{ paddingBottom: '20px', borderBottom: '1px solid #e5e7eb' }}>
              <h4 style={{ marginBottom: '16px' }}>Performance Metrics</h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px',
                textAlign: 'center'
              }}>
                <div style={{ backgroundColor: '#f3f4f6', padding: '16px', borderRadius: '8px' }}>
                  <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: 0 }}>Rating</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '8px 0 0 0' }}>
                    {selectedDistributor.rating}/5.0
                  </p>
                </div>
                <div style={{ backgroundColor: '#f3f4f6', padding: '16px', borderRadius: '8px' }}>
                  <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: 0 }}>
                    Total Orders
                  </p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '8px 0 0 0' }}>
                    {selectedDistributor.totalOrders}
                  </p>
                </div>
                <div style={{ backgroundColor: '#f3f4f6', padding: '16px', borderRadius: '8px' }}>
                  <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: 0 }}>
                    Medicines
                  </p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '8px 0 0 0' }}>
                    {selectedDistributor.medicines}
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                className="btn-primary"
                onClick={() => {
                  setShowDetailsModal(false);
                  navigate('/pharmacy/place-order');
                }}
                style={{ flex: 1 }}
              >
                Place Order
              </button>
              <button
                className="btn-secondary"
                onClick={() => setShowDetailsModal(false)}
                style={{ flex: 1 }}
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default FindDistributors;