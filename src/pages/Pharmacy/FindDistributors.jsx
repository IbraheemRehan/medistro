import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import SidebarNav from '../../components/SidebarNav';
import TopBar from '../../components/TopBar';
import Modal from '../../components/Modal';
import API from '../../config/api.config';
import { PharmacyNavItems } from '../../config/navItems';
import { FiSearch, FiMapPin, FiPhone, FiStar, FiShoppingBag, FiTruck } from 'react-icons/fi';

const FindDistributors = () => {
  const { navigate } = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistributor, setSelectedDistributor] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [distributors, setDistributors] = useState([]);

  useEffect(() => {
    const fetchDistributors = async () => {
      try {
        setLoading(true);
        const response = await API.get('/api/v1/distributors');
        // Deduplicate by company name (case-insensitive)
        const seen = new Set();
        const uniqueData = (response.data || []).filter(dist => {
          const key = (dist.companyName || '').trim().toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        const formattedData = uniqueData.map(dist => ({
          id: dist._id,
          companyName: dist.companyName,
          licenseNumber: dist.licenseNumber || 'N/A',
          address: dist.address,
          contactNumber: dist.contactNumber || 'N/A',
          rating: dist.rating ? Number(dist.rating).toFixed(1) : '0.0',
          totalPharmacies: dist.totalPharmaciesCount || 0,
          medicines: dist.medicinesCount || 0,
          hasNoStock: dist.hasNoStock || false,
          established: new Date(dist.createdAt).toLocaleDateString()
        }));
        setDistributors(formattedData);
      } catch (err) {
        console.error("Failed to fetch distributors", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDistributors();
  }, []);

  const filteredDistributors = distributors.filter((dist) =>
    dist.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dist.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="app-layout">
      <SidebarNav role="pharmacy" navItems={PharmacyNavItems} />

      <div className="main-content">
        <TopBar title="Partner Distributors" />

        <div className="page-content animate-fade" style={{ paddingTop: 40 }}>
          <div className="page-header" style={{ marginBottom: 32 }}>
            <h1>Connect with Distributors</h1>
            <p style={{ color: 'var(--gray-500)' }}>Find and order from the best medical distributors in your region</p>
          </div>

          <div className="card" style={{ marginBottom: 32 }}>
            <div className="card-body">
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search by company name, location or license..."
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
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40 }}>Loading distributors...</div>
            ) : filteredDistributors.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40 }}>No distributors match your search.</div>
            ) : (
              filteredDistributors.map((dist) => (
                <div key={dist.id} className="card animate-scale" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className="card-body" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--blue-50)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                        <FiTruck />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#fbbf24', fontWeight: 700 }}>
                        <FiStar fill="#fbbf24" /> {dist.rating}
                      </div>
                    </div>
                    
                    <h3 style={{ margin: '0 0 8px 0', fontSize: 18 }}>{dist.companyName}</h3>
                    <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FiMapPin /> {dist.address}
                    </p>

                    {dist.hasNoStock && (
                      <div style={{ background: 'var(--red-50)', color: 'var(--danger)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, textAlign: 'center', marginBottom: '16px' }}>
                        OUT OF STOCK
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                       <div style={{ background: 'var(--gray-50)', padding: 12, borderRadius: 12, textAlign: 'center' }}>
                          <div style={{ fontSize: 11, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Drugs</div>
                          <div style={{ fontSize: 18, fontWeight: 700 }}>{dist.medicines}+</div>
                       </div>
                       <div style={{ background: 'var(--gray-50)', padding: 12, borderRadius: 12, textAlign: 'center' }}>
                          <div style={{ fontSize: 11, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Partners</div>
                          <div style={{ fontSize: 18, fontWeight: 700 }}>{dist.totalPharmacies}+</div>
                       </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                       <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => window.location.href = '/pharmacy/place-order'}>
                          Order Now
                       </button>
                       <button className="btn btn-secondary btn-sm" onClick={() => { setSelectedDistributor(dist); setShowDetailsModal(true); }}>
                          Details
                       </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showDetailsModal && selectedDistributor && (
        <Modal onClose={() => setShowDetailsModal(false)} title="Distributor Profile">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
             <div style={{ textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--blue-50)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 24 }}>
                   <FiTruck />
                </div>
                <h2 style={{ margin: 0 }}>{selectedDistributor.companyName}</h2>
                <div style={{ color: '#fbbf24', fontWeight: 700, marginTop: 4 }}>★ {selectedDistributor.rating} Rating</div>
             </div>

             <div className="card" style={{ padding: 16 }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: 14 }}>Contact Information</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                      <span style={{ color: 'var(--gray-500)' }}>License</span>
                      <span style={{ fontWeight: 600 }}>{selectedDistributor.licenseNumber}</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                      <span style={{ color: 'var(--gray-500)' }}>Address</span>
                      <span style={{ fontWeight: 600 }}>{selectedDistributor.address}</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                      <span style={{ color: 'var(--gray-500)' }}>Phone</span>
                      <span style={{ fontWeight: 600 }}>{selectedDistributor.contactNumber}</span>
                   </div>
                </div>
             </div>

             <button className="btn btn-primary btn-full" onClick={() => window.location.href = '/pharmacy/place-order'}>
                <FiShoppingBag /> Start Procurement
             </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default FindDistributors;