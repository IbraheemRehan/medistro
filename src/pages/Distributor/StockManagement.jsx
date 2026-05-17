import React, { useState, useEffect, useContext } from 'react';
import axios from '../../config/api.config';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import SidebarNav from '../../components/SidebarNav';
import TopBar from '../../components/TopBar';
import Modal from '../../components/Modal';
import API from '../../config/api.config';
import { DistributorNavItems, EmployeeNavItems } from '../../config/navItems';
import { FiPlus, FiEdit2, FiBox, FiAlertCircle, FiDatabase, FiDollarSign, FiSearch } from 'react-icons/fi';

const StockManagement = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  const [inventory, setInventory] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await API.get('/api/v1/inventory');
      const formatted = response.data.inventory.map(item => ({
        id: item._id,
        medicineName: item.medicineId?.name || 'Unknown',
        genericName: item.medicineId?.genericName || 'Unknown',
        company: item.medicineId?.company || 'Unknown',
        category: item.medicineId?.category || 'Unknown',
        totalStock: item.totalStock,
        availableStock: item.availableStock,
        reservedStock: item.reservedStock,
        threshold: item.lowStockThreshold || 10,
        expiryDate: item.latestBatch?.expiryDate ? new Date(item.latestBatch.expiryDate).toLocaleDateString() : 'N/A',
        salePrice: item.latestBatch?.salePrice || 0,
        purchasePrice: item.latestBatch?.purchasePrice || 0
      }));
      setInventory(formatted);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const [newMedicine, setNewMedicine] = useState({
    medicineName: '',
    genericName: '',
    company: '',
    category: '',
    unitType: 'Tablet',
    quantity: '',
    purchasePrice: '',
    salePrice: '',
    expiryDate: ''
  });

  const handleLookup = async (query) => {
    // Update the medicine name field as user types
    setNewMedicine(prev => ({ ...prev, medicineName: query }));
    
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      // USE API INSTANCE INSTEAD OF AXIOS DIRECTLY
      const { data } = await API.get(`/api/v1/medicines/search?query=${query}`);
      setSearchResults(data.results || []);
    } catch (err) {
      console.error('Lookup failed', err);
    } finally {
      setIsSearching(false);
    }
  };

  const selectMedicine = (med) => {
    console.log("Selecting medicine:", med);
    // Auto-fill all technical fields
    setNewMedicine({
      ...newMedicine,
      medicineName: med.name,
      genericName: med.genericName,
      company: med.company,
      category: med.category,
      unitType: med.unitType
    });
    // Clear search results to hide dropdown
    setSearchResults([]);
  };

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    try {
      // 1. Create Medicine
      const medRes = await API.post('/api/v1/medicines', {
        name: newMedicine.medicineName,
        genericName: newMedicine.genericName,
        company: newMedicine.company,
        category: newMedicine.category,
        unitType: newMedicine.unitType
      });

      const medicineId = medRes.data.medicine._id;

      // 2. Create Batch (auto-creates/updates Inventory)
      await API.post('/api/v1/batches', {
        medicineId,
        batchNumber: `BATCH-${Date.now()}`,
        purchasePrice: Number(newMedicine.purchasePrice),
        salePrice: Number(newMedicine.salePrice),
        expiryDate: newMedicine.expiryDate,
        quantity: Number(newMedicine.quantity)
      });

      setShowAddModal(false);
      
      // Reset form
      setNewMedicine({
        medicineName: '', genericName: '', company: '', category: '',
        unitType: 'Tablet', quantity: '', purchasePrice: '', salePrice: '', expiryDate: ''
      });

      // Refresh table
      fetchInventory();

    } catch (err) {
      console.error('Failed to add medicine', err);
      alert(err.response?.data?.message || 'Error occurred while saving');
    }
  };

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.company.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === 'low') {
      return matchesSearch && item.availableStock <= item.threshold;
    }

    return matchesSearch;
  });

  const getStockStatus = (available, threshold) => {
    if (available <= threshold * 0.3) return 'critical';
    if (available <= threshold) return 'low';
    return 'normal';
  };

  const totalStockWorth = inventory.reduce((sum, item) => sum + (item.availableStock * item.purchasePrice), 0);
  const navItems = user?.role === 'distributor' ? DistributorNavItems : EmployeeNavItems;

  return (
    <div className="app-layout">
      <SidebarNav role={user?.role} navItems={navItems} />

      <div className="main-content">
        <TopBar title="Inventory Management" />

        <div className="page-content animate-fade">
          <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <div>
              <h1>Inventory Management</h1>
              <p style={{ color: 'var(--gray-500)' }}>Track and manage your medicine stock levels</p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => setShowAddModal(true)}
            >
              <FiPlus /> Add New Medicine
            </button>
          </div>

          <div className="grid-4" style={{ marginBottom: 32 }}>
            <div className="stat-card">
              <div className="stat-icon blue"><FiDatabase /></div>
              <div>
                <div className="stat-value">{inventory.length}</div>
                <div className="stat-label">Unique Items</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green"><FiDollarSign /></div>
              <div>
                <div className="stat-value">Rs. {totalStockWorth.toLocaleString()}</div>
                <div className="stat-label">Total Inventory Worth</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon amber"><FiAlertCircle /></div>
              <div>
                <div className="stat-value">{inventory.filter((item) => item.availableStock <= item.threshold).length}</div>
                <div className="stat-label">Low Stock Items</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon red"><FiBox /></div>
              <div>
                <div className="stat-value">{inventory.filter((item) => item.availableStock <= item.threshold * 0.3).length}</div>
                <div className="stat-label">Critical Stock Items</div>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-header">
              <span className="card-title">Stock Controls</span>
            </div>
            <div className="card-body" style={{ display: 'flex', gap: 16 }}>
              <input
                type="text"
                placeholder="Search by name, generic or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
                style={{ flex: 1 }}
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="form-input"
                style={{ width: '200px' }}
              >
                <option value="all">All Items</option>
                <option value="low">Low Stock Only</option>
              </select>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Medicine Details</th>
                  <th>Total Stock</th>
                  <th>Available</th>
                  <th>Expiry Date</th>
                  <th>Purchase Price</th>
                  <th>Sale Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="8" style={{ textAlign: 'center', padding: 40 }}>Loading inventory...</td></tr>
                ) : filteredInventory.length === 0 ? (
                  <tr><td colSpan="8" style={{ textAlign: 'center', padding: 40 }}>No inventory found</td></tr>
                ) : filteredInventory.map((item) => {
                  const status = getStockStatus(item.availableStock, item.threshold);
                  return (
                    <tr key={item.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--gray-900)' }}>{item.medicineName}</div>
                        <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{item.genericName}</div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{item.totalStock}</td>
                      <td style={{ fontWeight: 700, color: status === 'critical' ? 'var(--danger)' : status === 'low' ? 'var(--warning)' : 'var(--brand)' }}>
                        {item.availableStock}
                      </td>
                      <td>{item.expiryDate}</td>
                      <td>Rs. {item.purchasePrice.toLocaleString()}</td>
                      <td>Rs. {item.salePrice.toLocaleString()}</td>
                      <td>
                        <span className={`badge badge-${status === 'critical' ? 'red' : status === 'low' ? 'amber' : 'green'}`}>
                          {status.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-secondary btn-sm" title="Edit Item">
                          <FiEdit2 />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showAddModal && (
        <Modal onClose={() => setShowAddModal(false)} title="Add New Medicine to Stock">
          <form onSubmit={handleAddMedicine}>
            <div className="form-group" style={{ position: 'relative' }}>
              <label className="form-label">Medicine Name * (Lookup common brands)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Type name (e.g. Panadol, Augmentin...)"
                  value={newMedicine.medicineName}
                  onChange={(e) => handleLookup(e.target.value)}
                  onFocus={() => { if(newMedicine.medicineName.length >= 2) handleLookup(newMedicine.medicineName); }}
                  required
                  autoComplete="off"
                />
                <FiSearch style={{ position: 'absolute', right: 12, top: 14, color: 'var(--gray-400)' }} />
              </div>
              
              {/* Autocomplete Results - Improved visibility and interaction */}
              {searchResults.length > 0 && (
                <div style={{ 
                  position: 'absolute', 
                  top: '100%', 
                  left: 0, 
                  right: 0, 
                  background: 'white', 
                  zIndex: 2000, // Very high z-index to stay above modal
                  boxShadow: '0 10px 25px rgba(0,0,0,0.15)', 
                  borderRadius: '0 0 12px 12px', 
                  border: '1px solid var(--gray-200)', 
                  borderTop: 'none', 
                  maxHeight: '220px', 
                  overflowY: 'auto' 
                }}>
                  {searchResults.map((med, i) => (
                    <div 
                      key={i} 
                      onClick={() => selectMedicine(med)}
                      style={{ 
                        padding: '12px 16px', 
                        cursor: 'pointer', 
                        borderBottom: '1px solid var(--gray-50)', 
                        fontSize: '14px',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'var(--blue-50)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                    >
                      <div style={{ fontWeight: 700, color: 'var(--gray-900)' }}>{med.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '2px' }}>
                        {med.genericName} <span style={{ color: 'var(--gray-300)', margin: '0 4px' }}>|</span> {med.company}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {isSearching && <div style={{ position: 'absolute', top: '100%', right: 10, fontSize: '11px', color: 'var(--brand)', fontWeight: 600 }}>Searching...</div>}
            </div>

            <div className="grid-2" style={{ marginTop: 16 }}>
              <div className="form-group">
                <label className="form-label">Generic Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Auto-filled"
                  value={newMedicine.genericName}
                  onChange={(e) => setNewMedicine({ ...newMedicine, genericName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Company *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Auto-filled"
                  value={newMedicine.company}
                  onChange={(e) => setNewMedicine({ ...newMedicine, company: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Category *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Auto-filled"
                  value={newMedicine.category}
                  onChange={(e) => setNewMedicine({ ...newMedicine, category: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Unit Type *</label>
                <select
                  className="form-input"
                  value={newMedicine.unitType}
                  onChange={(e) => setNewMedicine({ ...newMedicine, unitType: e.target.value })}
                >
                  <option value="Tablet">Tablet</option>
                  <option value="Capsule">Capsule</option>
                  <option value="Syrup">Syrup</option>
                  <option value="Injection">Injection</option>
                  <option value="Cream">Cream</option>
                  <option value="Inhaler">Inhaler</option>
                  <option value="Sachet">Sachet</option>
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Initial Quantity *</label>
                <input
                  type="number"
                  className="form-input"
                  value={newMedicine.quantity}
                  onChange={(e) => setNewMedicine({ ...newMedicine, quantity: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Batch Expiry Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={newMedicine.expiryDate}
                  onChange={(e) => setNewMedicine({ ...newMedicine, expiryDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Purchase Price (per unit) *</label>
                <input
                  type="number"
                  className="form-input"
                  value={newMedicine.purchasePrice}
                  onChange={(e) => setNewMedicine({ ...newMedicine, purchasePrice: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Sale Price (per unit) *</label>
                <input
                  type="number"
                  className="form-input"
                  value={newMedicine.salePrice}
                  onChange={(e) => setNewMedicine({ ...newMedicine, salePrice: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button type="submit" className="btn btn-primary btn-full">
                Add Medicine & Stock
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default StockManagement;