import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import SidebarNav from '../../components/SidebarNav';
import TopBar from '../../components/TopBar';
import Modal from '../../components/Modal';
import '../../styles/PlaceOrder.css';

const PlaceOrder = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [selectedDistributor, setSelectedDistributor] = useState(null);
  const [showMedicinesModal, setShowMedicinesModal] = useState(false);
  const [orderItems, setOrderItems] = useState([]);
  const [orderNote, setOrderNote] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  // Dummy distributors data
  const [distributors] = useState([
    {
      id: 'DIST-001',
      companyName: 'Prime Distributor',
      licenseNumber: 'LIC-2021-001',
      address: '100 Industrial Area, Okara',
      contactNumber: '03001111111',
      medicines: [
        { id: 1, name: 'Aspirin', genericName: 'Acetylsalicylic Acid', company: 'Bayer', price: 25 },
        { id: 2, name: 'Paracetamol', genericName: 'Acetaminophen', company: 'GSK', price: 25 },
        { id: 3, name: 'Ibuprofen', genericName: 'Ibuprofen', company: 'Pfizer', price: 30 },
      ]
    },
    {
      id: 'DIST-002',
      companyName: 'Health Supplies Co',
      licenseNumber: 'LIC-2022-005',
      address: '200 Business Park, Okara',
      contactNumber: '03002222222',
      medicines: [
        { id: 4, name: 'Amoxicillin', genericName: 'Amoxicillin', company: 'AstraZeneca', price: 40 },
        { id: 5, name: 'Metformin', genericName: 'Metformin HCl', company: 'Merck', price: 20 },
        { id: 1, name: 'Aspirin', genericName: 'Acetylsalicylic Acid', company: 'Bayer', price: 25 },
      ]
    },
    {
      id: 'DIST-003',
      companyName: 'MediPro Distribution',
      licenseNumber: 'LIC-2023-010',
      address: '300 Trade Center, Okara',
      contactNumber: '03003333333',
      medicines: [
        { id: 6, name: 'Cetirizine', genericName: 'Cetirizine HCl', company: 'Abbott', price: 35 },
        { id: 7, name: 'Omeprazole', genericName: 'Omeprazole', company: 'Cipla', price: 45 },
        { id: 2, name: 'Paracetamol', genericName: 'Acetaminophen', company: 'GSK', price: 25 },
      ]
    },
  ]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSelectDistributor = (distributor) => {
    setSelectedDistributor(distributor);
    setShowMedicinesModal(true);
  };

  const handleAddMedicine = (medicine) => {
    const existingItem = orderItems.find(item => item.medicineId === medicine.id);
    
    if (existingItem) {
      setOrderItems(orderItems.map(item =>
        item.medicineId === medicine.id
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
          : item
      ));
    } else {
      setOrderItems([...orderItems, {
        medicineId: medicine.id,
        medicineName: medicine.name,
        distributorId: selectedDistributor.id,
        price: medicine.price,
        quantity: 1,
        subtotal: medicine.price
      }]);
    }
  };

  const handleRemoveItem = (medicineId) => {
    setOrderItems(orderItems.filter(item => item.medicineId !== medicineId));
  };

  const handleUpdateQuantity = (medicineId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(medicineId);
    } else {
      setOrderItems(orderItems.map(item =>
        item.medicineId === medicineId
          ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.price }
          : item
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

  const handleConfirmOrder = () => {
    const order = {
      id: `ORD-${Date.now()}`,
      pharmacyId: user._id,
      distributorId: selectedDistributor.id,
      items: orderItems,
      totalAmount: totalAmount,
      status: 'pending',
      note: orderNote,
      createdAt: new Date().toISOString().split('T')[0]
    };

    console.log('Order placed:', order);
    alert('Order placed successfully! Order ID: ' + order.id);
    
    // Reset form
    setOrderItems([]);
    setOrderNote('');
    setSelectedDistributor(null);
    setShowConfirm(false);
    navigate('/pharmacy/my-orders');
  };

  const totalAmount = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <div className="dashboard-container">
      <SidebarNav userRole="pharmacy" onLogout={handleLogout} />

      <div className="dashboard-content">
        <TopBar userName={user?.username} userRole="Pharmacy" />

        <div className="place-order">
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
                  <div key={dist.id} className="distributor-card">
                    <div className="card-header">
                      <h3>{dist.companyName}</h3>
                      <span className="medicine-count">
                        {dist.medicines.length} medicines
                      </span>
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

                    <button
                      className="btn-primary"
                      onClick={() => handleSelectDistributor(dist)}
                    >
                      Select Distributor →
                    </button>
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
                  className="btn-text"
                  onClick={() => setSelectedDistributor(null)}
                >
                  Change Distributor
                </button>
              </div>

              {/* Order Items */}
              <div className="order-section">
                <div className="section-header">
                  <h2>Step 2: Add Medicines</h2>
                  <button
                    className="btn-secondary"
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
                                className="btn-danger btn-sm"
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
                      className="btn-primary"
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
                    <label>Order Notes (Optional)</label>
                    <textarea
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
                      className="btn-primary btn-lg"
                      onClick={handlePlaceOrder}
                    >
                      Place Order
                    </button>
                    <button
                      className="btn-secondary btn-lg"
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
          title="Select Medicines from Catalog"
        >
          <div className="medicines-catalog">
            {selectedDistributor.medicines.map((medicine) => (
              <div key={medicine.id} className="medicine-catalog-item">
                <div className="medicine-info">
                  <h4>{medicine.name}</h4>
                  <p className="generic">{medicine.genericName}</p>
                  <p className="company">{medicine.company}</p>
                </div>
                <div className="medicine-price">
                  <p className="price">Rs. {medicine.price}</p>
                </div>
                <button
                  className="btn-primary"
                  onClick={() => handleAddMedicine(medicine)}
                >
                  Add
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
            <div className="modal-buttons">
              <button className="btn-primary" onClick={handleConfirmOrder}>
                ✓ Confirm Order
              </button>
              <button
                className="btn-secondary"
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