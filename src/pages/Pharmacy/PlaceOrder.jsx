import React, { useState, useEffect, useContext } from 'react';
import axios from '../../config/api.config';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import SidebarNav from '../../components/SidebarNav';
import TopBar from '../../components/TopBar';
import Modal from '../../components/Modal';
import { PharmacyNavItems } from '../../config/navItems';
import '../../styles/PlaceOrder.css';

const PlaceOrder = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [distributors, setDistributors] = useState([]);
  const [selectedDistributor, setSelectedDistributor] = useState(null);
  
  const [catalog, setCatalog] = useState([]); // from inventory
  const [showMedicinesModal, setShowMedicinesModal] = useState(false);
  const [orderItems, setOrderItems] = useState([]);
  const [orderNote, setOrderNote] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  // Fetch Distributors on mount
  useEffect(() => {
    const fetchDistributors = async () => {
      try {
        const response = await axios.get('/api/v1/distributors');
        // Deduplicate distributors by company name (case-insensitive) to prevent duplicate card grids
        const uniqueDists = [];
        const seenNames = new Set();
        (response.data || []).forEach(dist => {
          const uniqueKey = (dist.companyName || '').trim().toLowerCase();
          if (uniqueKey && !seenNames.has(uniqueKey)) {
            seenNames.add(uniqueKey);
            uniqueDists.push(dist);
          }
        });
        setDistributors(uniqueDists);
      } catch (err) {
        console.error('Failed to fetch distributors', err);
      }
    };
    fetchDistributors();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSelectDistributor = async (distributor) => {
    setSelectedDistributor(distributor);
    
    // Fetch this distributor's inventory
    try {
      const response = await axios.get(`/api/v1/inventory?distributorId=${distributor._id}`);
      // The API returns { inventory: [...] }. Map it.
      const mappedCatalog = response.data.inventory.map(inv => ({
        inventoryId: inv._id,
        medicineId: inv.medicineId?._id,
        name: inv.medicineId?.name || 'Unknown',
        genericName: inv.medicineId?.genericName || '',
        company: inv.medicineId?.company || 'Unknown', // Fixed from manufacturer
        price: inv.latestBatch?.salePrice || 0, // Read sale price from latest batch
        batchId: inv.latestBatch?._id || null, // Preload batch ID directly from database
        availableStock: inv.availableStock || 0
      }));
      setCatalog(mappedCatalog);
      setShowMedicinesModal(true);
    } catch (err) {
      console.error('Failed to fetch inventory', err);
      alert('Could not fetch inventory for this distributor. They may not have items.');
    }
  };

  const handleAddMedicine = async (medicine) => {
    // Check if we have preloaded batch details directly from inventory
    let validBatchId = medicine.batchId;
    let salePrice = medicine.price;
    
    // Fallback async fetch only if batchId was not pre-populated
    if (!validBatchId) {
      try {
        const batchRes = await axios.get(`/api/v1/batches/medicine/${medicine.medicineId}?distributorId=${selectedDistributor._id}`);
        if (batchRes.data.batches && batchRes.data.batches.length > 0) {
          // take first active batch
          const activeBatch = batchRes.data.batches.find(b => b.isActive);
          if (activeBatch) {
            validBatchId = activeBatch._id;
            salePrice = activeBatch.salePrice || medicine.price;
          } else {
             validBatchId = batchRes.data.batches[0]._id; // fallback
          }
        } else {
          alert("No active batches found for this medicine. Cannot add to cart.");
          return;
        }
      } catch (err) {
         console.error("Failed to fetch batches", err);
         alert("Error checking medicine batches.");
         return;
      }
    }

    const existingItem = orderItems.find(item => item.medicineId === medicine.medicineId);
    
    if (existingItem) {
      if (existingItem.quantity + 1 > medicine.availableStock) {
        alert("Cannot exceed available stock!");
        return;
      }
      setOrderItems(orderItems.map(item =>
        item.medicineId === medicine.medicineId
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
          : item
      ));
    } else {
      setOrderItems([...orderItems, {
        medicineId: medicine.medicineId,
        medicineName: medicine.name,
        batchId: validBatchId,
        distributorId: selectedDistributor._id,
        price: salePrice,
        quantity: 1,
        subtotal: salePrice,
        maxStock: medicine.availableStock 
      }]);
    }
  };

  const handleRemoveItem = (medicineId) => {
    setOrderItems(orderItems.filter(item => item.medicineId !== medicineId));
  };

  const handleUpdateQuantity = (medicineId, newQuantity) => {
    const item = orderItems.find(i => i.medicineId === medicineId);
    if (!item) return;

    if (newQuantity <= 0) {
      handleRemoveItem(medicineId);
    } else if (newQuantity > item.maxStock) {
      alert("Exceeds available stock: " + item.maxStock);
    } else {
      setOrderItems(orderItems.map(i =>
        i.medicineId === medicineId
          ? { ...i, quantity: newQuantity, subtotal: newQuantity * i.price }
          : i
      ));
    }
  };

  const handlePlaceOrder = () => {
    if (orderItems.length === 0) {
      alert('Please add medicines to your order');
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmOrder = async () => {
    try {
      // payload matches { distributorId, items: [{medicineId, batchId, quantity}], note }
      const payload = {
        distributorId: selectedDistributor._id,
        note: orderNote,
        items: orderItems.map(curr => ({
          medicineId: curr.medicineId,
          batchId: curr.batchId,
          quantity: curr.quantity
        }))
      };

      const res = await axios.post('/api/v1/orders', payload);
      alert('Order placed successfully! ' + res.data.message);
      
      setOrderItems([]);
      setOrderNote('');
      setSelectedDistributor(null);
      setShowConfirm(false);
      navigate('/pharmacy/my-orders');
      
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error occurred while placing order');
      setShowConfirm(false);
    }
  };

  const totalAmount = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <div className="app-layout">
      <SidebarNav role="pharmacy" navItems={PharmacyNavItems} />

      <div className="main-content">
        <TopBar title="Place Order" />

        <div className="place-order page-content animate-fade">
          <div className="page-header">
            <h1>Place New Order</h1>
            <p className="subtitle">Select a distributor and choose medicines</p>
          </div>

          {!selectedDistributor ? (
            <>
              {/* Select Distributor */}
              <div className="section-title">
                <h2>Step 1: Select Distributor</h2>
              </div>

              <div className="distributors-grid">
                {distributors.map((dist) => (
                  <div key={dist._id} className="distributor-card">
                    <div className="card-header">
                      <h3>{dist.companyName}</h3>
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
                        <label>Contact</label>
                        <p>{dist.contactNumber}</p>
                      </div>
                    </div>

                    <div className="card-footer">
                      <button
                        className="btn btn-primary btn-full"
                        onClick={() => handleSelectDistributor(dist)}
                      >
                        Select Distributor →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Selected Distributor Info */}
              <div className="selected-distributor">
                <div className="dist-info">
                  <h2>{selectedDistributor.companyName}</h2>
                  <p>{selectedDistributor.address}</p>
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setSelectedDistributor(null);
                    setOrderItems([]);
                  }}
                >
                  Change Distributor
                </button>
              </div>

              {/* Order Items */}
              <div className="order-section">
                <div className="section-header">
                  <h2>Step 2: Add Medicines</h2>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowMedicinesModal(true)}
                  >
                    ➕ Add Medicine
                  </button>
                </div>

                {orderItems.length > 0 ? (
                  <div className="order-items">
                    <table className="items-table">
                      <thead>
                        <tr>
                          <th>Medicine</th>
                          <th>Unit Price</th>
                          <th>Quantity</th>
                          <th>Subtotal</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderItems.map((item) => (
                          <tr key={item.medicineId}>
                            <td className="medicine-cell">
                              <div>
                                <p className="medicine-name">{item.medicineName}</p>
                              </div>
                            </td>
                            <td>Rs. {item.price}</td>
                            <td>
                              <div className="quantity-control">
                                <button
                                  onClick={() => handleUpdateQuantity(item.medicineId, item.quantity - 1)}
                                  className="qty-btn"
                                >
                                  −
                                </button>
                                <input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) =>
                                    handleUpdateQuantity(item.medicineId, parseInt(e.target.value))
                                  }
                                  min="1"
                                />
                                <button
                                  onClick={() => handleUpdateQuantity(item.medicineId, item.quantity + 1)}
                                  className="qty-btn"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="bold">Rs. {item.subtotal.toLocaleString()}</td>
                            <td>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleRemoveItem(item.medicineId)}
                              >
                                🗑️
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="empty-items">
                    <p>No medicines added yet</p>
                    <button
                      className="btn btn-primary"
                      onClick={() => setShowMedicinesModal(true)}
                    >
                      Add Medicines
                    </button>
                  </div>
                )}
              </div>

              {/* Order Notes */}
              {orderItems.length > 0 && (
                <div className="order-section">
                  <h2>Step 3: Order Details</h2>
                  <div className="form-group">
                    <label className="form-label">Order Notes (Optional)</label>
                    <textarea
                      className="form-input"
                      value={orderNote}
                      onChange={(e) => setOrderNote(e.target.value)}
                      placeholder="Add any special instructions..."
                      rows="3"
                    />
                  </div>

                  {/* Order Summary */}
                  <div className="order-summary">
                    <div className="summary-item">
                      <span>Subtotal</span>
                      <span>Rs. {totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="summary-item">
                      <span>Tax (0%)</span>
                      <span>Rs. 0</span>
                    </div>
                    <div className="summary-total">
                      <span>Total Amount</span>
                      <span>Rs. {totalAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="order-actions">
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={handlePlaceOrder}
                    >
                      Place Order
                    </button>
                    <button
                      className="btn btn-secondary btn-lg"
                      onClick={() => setOrderItems([])}
                    >
                      Clear Items
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Select Medicines Modal */}
      {showMedicinesModal && selectedDistributor && (
        <Modal
          onClose={() => setShowMedicinesModal(false)}
          title={`Catalog: ${selectedDistributor.companyName}`}
        >
          <div className="medicines-catalog">
            {catalog.length === 0 && <p>No inventory found for this distributor.</p>}
            {catalog.map((medicine) => (
              <div key={medicine.medicineId} className="medicine-catalog-item">
                <div className="medicine-info">
                  <h4>{medicine.name}</h4>
                  <p className="generic">{medicine.genericName}</p>
                  <p className="company">{medicine.company}</p>
                  <p className="stock">Available Stock: {medicine.availableStock}</p>
                </div>
                <div className="medicine-price">
                  <p className="price">Rs. {medicine.price}</p>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleAddMedicine(medicine)}
                  disabled={medicine.availableStock <= 0}
                >
                  {medicine.availableStock <= 0 ? 'Out of Stock' : 'Add'}
                </button>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* Confirm Order Modal */}
      {showConfirm && (
        <Modal onClose={() => setShowConfirm(false)} title="Confirm Order">
          <div className="confirm-order">
            <p>Are you sure you want to place this order?</p>
            <div className="order-confirm-summary">
              <div className="summary-item">
                <span>Total Items:</span>
                <span>{orderItems.length}</span>
              </div>
              <div className="summary-item">
                <span>Total Amount:</span>
                <span className="amount">Rs. {totalAmount.toLocaleString()}</span>
              </div>
            </div>
            <div className="modal-buttons" style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button className="btn btn-primary" onClick={handleConfirmOrder}>
                ✓ Confirm Order
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PlaceOrder;