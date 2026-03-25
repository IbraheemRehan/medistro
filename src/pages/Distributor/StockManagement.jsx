import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import SidebarNav from '../../components/SidebarNav';
import TopBar from '../../components/TopBar';
import Modal from '../../components/Modal';
import '../../styles/StockManagement.css';

const StockManagement = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  // Dummy stock data
  const [inventory, setInventory] = useState([
    {
      id: 1,
      medicineName: 'Aspirin',
      genericName: 'Acetylsalicylic Acid',
      company: 'Bayer',
      category: 'Analgesic',
      unitType: 'Tablet',
      batch: 'BATCH-001',
      totalStock: 500,
      availableStock: 420,
      reservedStock: 80,
      threshold: 100,
      lastRestocked: '2024-03-20',
      expiryDate: '2025-06-15'
    },
    {
      id: 2,
      medicineName: 'Paracetamol',
      genericName: 'Acetaminophen',
      company: 'GSK',
      category: 'Analgesic',
      unitType: 'Tablet',
      batch: 'BATCH-002',
      totalStock: 200,
      availableStock: 85,
      reservedStock: 115,
      threshold: 100,
      lastRestocked: '2024-03-18',
      expiryDate: '2025-08-20'
    },
    {
      id: 3,
      medicineName: 'Ibuprofen',
      genericName: 'Ibuprofen',
      company: 'Pfizer',
      category: 'NSAID',
      unitType: 'Tablet',
      batch: 'BATCH-003',
      totalStock: 350,
      availableStock: 320,
      reservedStock: 30,
      threshold: 100,
      lastRestocked: '2024-03-22',
      expiryDate: '2025-04-10'
    },
    {
      id: 4,
      medicineName: 'Amoxicillin',
      genericName: 'Amoxicillin',
      company: 'AstraZeneca',
      category: 'Antibiotic',
      unitType: 'Capsule',
      batch: 'BATCH-004',
      totalStock: 150,
      availableStock: 45,
      reservedStock: 105,
      threshold: 100,
      lastRestocked: '2024-03-19',
      expiryDate: '2025-05-30'
    },
    {
      id: 5,
      medicineName: 'Metformin',
      genericName: 'Metformin HCl',
      company: 'Merck',
      category: 'Antidiabetic',
      unitType: 'Tablet',
      batch: 'BATCH-005',
      totalStock: 600,
      availableStock: 550,
      reservedStock: 50,
      threshold: 150,
      lastRestocked: '2024-03-21',
      expiryDate: '2025-12-25'
    },
  ]);

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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAddMedicine = (e) => {
    e.preventDefault();
    const medicine = {
      id: inventory.length + 1,
      ...newMedicine,
      totalStock: parseInt(newMedicine.quantity),
      availableStock: parseInt(newMedicine.quantity),
      reservedStock: 0,
      threshold: 100,
      lastRestocked: new Date().toISOString().split('T')[0],
      batch: `BATCH-${Date.now()}`
    };

    setInventory([...inventory, medicine]);
    setShowAddModal(false);
    setNewMedicine({
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
  };

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.company.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === 'low') {
      return matchesSearch && item.availableStock <= item.threshold;
    }
    if (filterStatus === 'expiring') {
      const expiryDate = new Date(item.expiryDate);
      const today = new Date();
      const daysUntilExpiry = (expiryDate - today) / (1000 * 60 * 60 * 24);
      return matchesSearch && daysUntilExpiry < 90;
    }

    return matchesSearch;
  });

  const getStockStatus = (available, threshold) => {
    if (available <= threshold * 0.3) return 'critical';
    if (available <= threshold) return 'low';
    return 'normal';
  };

  return (
    <div className="dashboard-container">
      <SidebarNav userRole="distributor" onLogout={handleLogout} />

      <div className="dashboard-content">
        <TopBar userName={user?.username} userRole="Distributor" />

        <div className="stock-management">
          <div className="page-header">
            <h1>Stock Management</h1>
            <button
              className="btn-primary"
              onClick={() => setShowAddModal(true)}
            >
              ➕ Add New Medicine
            </button>
          </div>

          {/* Stats */}
          <div className="stock-stats">
            <div className="stat-card">
              <p className="stat-label">Total Items</p>
              <p className="stat-number">{inventory.length}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Total Stock Value</p>
              <p className="stat-number">
                Rs. {inventory.reduce((sum, item) => sum + item.totalStock * 500, 0).toLocaleString()}
              </p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Low Stock Items</p>
              <p className="stat-number warning">
                {inventory.filter((item) => item.availableStock <= item.threshold).length}
              </p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Critical Stock</p>
              <p className="stat-number danger">
                {inventory.filter((item) => item.availableStock <= item.threshold * 0.3).length}
              </p>
            </div>
          </div>

          {/* Filter and Search */}
          <div className="stock-controls">
            <input
              type="text"
              placeholder="Search medicines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Items</option>
              <option value="low">Low Stock</option>
              <option value="expiring">Expiring Soon</option>
            </select>
          </div>

          {/* Stock Table */}
          <div className="stock-table-wrapper">
            <table className="stock-table">
              <thead>
                <tr>
                  <th>Medicine Name</th>
                  <th>Generic Name</th>
                  <th>Company</th>
                  <th>Category</th>
                  <th>Total Stock</th>
                  <th>Available</th>
                  <th>Reserved</th>
                  <th>Status</th>
                  <th>Expiry Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => {
                  const status = getStockStatus(item.availableStock, item.threshold);
                  return (
                    <tr key={item.id} className={`stock-row status-${status}`}>
                      <td className="bold">{item.medicineName}</td>
                      <td>{item.genericName}</td>
                      <td>{item.company}</td>
                      <td>{item.category}</td>
                      <td>{item.totalStock}</td>
                      <td className="highlight">{item.availableStock}</td>
                      <td>{item.reservedStock}</td>
                      <td>
                        <span className={`status-badge status-${status}`}>
                          {status}
                        </span>
                      </td>
                      <td>{item.expiryDate}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-sm btn-edit">✏️</button>
                          <button className="btn-sm btn-delete">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Medicine Modal */}
      {showAddModal && (
        <Modal onClose={() => setShowAddModal(false)} title="Add New Medicine">
          <form onSubmit={handleAddMedicine} className="add-medicine-form">
            <div className="form-row">
              <div className="form-group">
                <label>Medicine Name *</label>
                <input
                  type="text"
                  value={newMedicine.medicineName}
                  onChange={(e) =>
                    setNewMedicine({
                      ...newMedicine,
                      medicineName: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Generic Name *</label>
                <input
                  type="text"
                  value={newMedicine.genericName}
                  onChange={(e) =>
                    setNewMedicine({
                      ...newMedicine,
                      genericName: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Company *</label>
                <input
                  type="text"
                  value={newMedicine.company}
                  onChange={(e) =>
                    setNewMedicine({ ...newMedicine, company: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <input
                  type="text"
                  value={newMedicine.category}
                  onChange={(e) =>
                    setNewMedicine({
                      ...newMedicine,
                      category: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Unit Type *</label>
                <select
                  value={newMedicine.unitType}
                  onChange={(e) =>
                    setNewMedicine({
                      ...newMedicine,
                      unitType: e.target.value,
                    })
                  }
                >
                  <option>Tablet</option>
                  <option>Capsule</option>
                  <option>Syrup</option>
                  <option>Injection</option>
                  <option>Cream</option>
                </select>
              </div>
              <div className="form-group">
                <label>Quantity *</label>
                <input
                  type="number"
                  value={newMedicine.quantity}
                  onChange={(e) =>
                    setNewMedicine({
                      ...newMedicine,
                      quantity: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Purchase Price *</label>
                <input
                  type="number"
                  value={newMedicine.purchasePrice}
                  onChange={(e) =>
                    setNewMedicine({
                      ...newMedicine,
                      purchasePrice: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Sale Price *</label>
                <input
                  type="number"
                  value={newMedicine.salePrice}
                  onChange={(e) =>
                    setNewMedicine({
                      ...newMedicine,
                      salePrice: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Expiry Date *</label>
              <input
                type="date"
                value={newMedicine.expiryDate}
                onChange={(e) =>
                  setNewMedicine({
                    ...newMedicine,
                    expiryDate: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="modal-buttons">
              <button type="submit" className="btn-primary">
                Add Medicine
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowAddModal(false)}
              >
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