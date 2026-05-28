import React, { useState, useEffect, useMemo } from 'react';
import API, { getApiErrorMessage } from '../../config/api.config';
import { useNavigate } from 'react-router-dom';
import SidebarNav from '../../components/SidebarNav';
import TopBar from '../../components/TopBar';
import Modal from '../../components/Modal';
import PriceDisplay from '../../components/PriceDisplay';
import { calcDiscountedPrice } from '../../utils/pricing';
import { PharmacyNavItems } from '../../config/navItems';
import { Toaster, toast } from 'react-hot-toast';
import '../../styles/PlaceOrder.css';

const distId = (item) => item.distributorId?._id || item.distributorId;

const PlaceOrder = () => {
  const navigate = useNavigate();
  const [distributors, setDistributors] = useState([]);
  const [selectedDistributor, setSelectedDistributor] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [showMedicinesModal, setShowMedicinesModal] = useState(false);
  const [orderItems, setOrderItems] = useState(() => {
    try {
      const saved = localStorage.getItem('placeOrderCart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [orderNote, setOrderNote] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [placing, setPlacing] = useState(false);

  const selectedDistId = selectedDistributor?._id;

  const distributorOrderItems = useMemo(
    () => (selectedDistId ? orderItems.filter((i) => distId(i) === selectedDistId) : []),
    [orderItems, selectedDistId]
  );

  useEffect(() => {
    localStorage.setItem('placeOrderCart', JSON.stringify(orderItems));
  }, [orderItems]);

  // Reprice in-progress order items when distributor updates inventory/discount.
  useEffect(() => {
    const refreshFromInventoryUpdate = async () => {
      try {
        if (!selectedDistributor?._id) return;
        const response = await API.get(`/api/v1/inventory?distributorId=${selectedDistributor._id}`);
        const mappedCatalog = (response.data.inventory || []).map((inv) => ({
          inventoryId: inv._id,
          medicineId: inv.medicineId?._id,
          name: inv.medicineId?.name || 'Unknown',
          genericName: inv.medicineId?.genericName || '',
          company: inv.medicineId?.company || 'Unknown',
          price: inv.latestBatch?.salePrice || 0, // original unit price
          discountPercent: inv.latestBatch?.discountPercent || 0,
          batchId: inv.latestBatch?._id || null,
          availableStock: inv.availableStock || 0,
        }));

        setCatalog(mappedCatalog);

        const byBatchId = mappedCatalog.reduce((acc, c) => {
          if (c.batchId) acc[c.batchId] = c;
          return acc;
        }, {});

        setOrderItems((prev) =>
          prev.map((it) => {
            const info = it.batchId ? byBatchId[it.batchId] : null;
            if (!info) return it;

            const originalPrice = info.price;
            const discountPercent = info.discountPercent || 0;
            const finalPrice = calcDiscountedPrice(originalPrice, discountPercent);

            return {
              ...it,
              originalPrice,
              discountPercent,
              price: finalPrice,
              subtotal: Number((finalPrice * it.quantity).toFixed(2)),
              maxStock: info.availableStock || it.maxStock,
            };
          })
        );
      } catch {
        // Non-blocking: keep current UI if refresh fails.
      }
    };

    const onStorage = (e) => {
      if (e.key === 'inventoryUpdated') refreshFromInventoryUpdate();
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [selectedDistributor, setCatalog, setOrderItems]);

  useEffect(() => {
    const fetchDistributors = async () => {
      try {
        const response = await API.get('/api/v1/distributors');
        const uniqueDists = [];
        const seenNames = new Set();
        (response.data || []).forEach((dist) => {
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

  const handleSelectDistributor = async (distributor) => {
    setSelectedDistributor(distributor);
    try {
      const response = await API.get(`/api/v1/inventory?distributorId=${distributor._id}`);
      const mappedCatalog = (response.data.inventory || []).map((inv) => ({
        inventoryId: inv._id,
        medicineId: inv.medicineId?._id,
        name: inv.medicineId?.name || 'Unknown',
        genericName: inv.medicineId?.genericName || '',
        company: inv.medicineId?.company || 'Unknown',
        price: inv.latestBatch?.salePrice || 0,
        discountPercent: inv.latestBatch?.discountPercent || 0,
        batchId: inv.latestBatch?._id || null,
        availableStock: inv.availableStock || 0,
      }));
      setCatalog(mappedCatalog);
    } catch {
      toast.error('Could not load inventory for this distributor.');
      setCatalog([]);
    }
  };

  const handleAddMedicine = async (medicine) => {
    if (!selectedDistributor) return;

    const existingItem = distributorOrderItems.find(
      (item) => item.medicineId === medicine.medicineId
    );

    if (existingItem && existingItem.quantity + 1 > medicine.availableStock) {
      toast.error('Sorry, this medicine is out of stock or available quantity is not enough.');
      return;
    }
    if (!existingItem && medicine.availableStock <= 0) {
      toast.error('Sorry, this medicine is out of stock or available quantity is not enough.');
      return;
    }

    const newQty = existingItem ? existingItem.quantity + 1 : 1;
    const originalPrice = medicine.price;
    const discountPercent = medicine.discountPercent || 0;
    const finalPrice = calcDiscountedPrice(originalPrice, discountPercent);
    let newOrderItems;

    if (existingItem) {
      newOrderItems = orderItems.map((item) =>
        item.medicineId === medicine.medicineId && distId(item) === selectedDistId
          ? { ...item, quantity: newQty, subtotal: newQty * finalPrice }
          : item
      );
    } else {
      newOrderItems = [
        ...orderItems,
        {
          medicineId: medicine.medicineId,
          medicineName: medicine.name,
          batchId: medicine.batchId,
          distributorId: selectedDistributor._id,
          price: finalPrice,
          originalPrice,
          discountPercent,
          quantity: 1,
          subtotal: finalPrice,
          maxStock: medicine.availableStock,
        },
      ];
    }
    setOrderItems(newOrderItems);

    try {
      await API.post('/api/v1/cart/add', {
        medicineId: medicine.medicineId,
        batchId: medicine.batchId,
        medicineName: medicine.name,
        quantity: newQty,
        unitPrice: finalPrice,
        originalUnitPrice: originalPrice,
        discountPercent,
        distributorId: selectedDistributor._id,
      });
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update cart.'));
    }
  };

  const handleRemoveItem = (medicineId) => {
    setOrderItems(
      orderItems.filter(
        (item) => !(item.medicineId === medicineId && distId(item) === selectedDistId)
      )
    );
  };

  const handleUpdateQuantity = (medicineId, newQuantity) => {
    const item = distributorOrderItems.find((i) => i.medicineId === medicineId);
    if (!item) return;

    if (newQuantity <= 0) {
      handleRemoveItem(medicineId);
    } else if (newQuantity > item.maxStock) {
      toast.error('Sorry, this medicine is out of stock or available quantity is not enough.');
    } else {
      setOrderItems(
        orderItems.map((i) =>
          i.medicineId === medicineId && distId(i) === selectedDistId
            ? { ...i, quantity: newQuantity, subtotal: Number((newQuantity * i.price).toFixed(2)) }
            : i
        )
      );
    }
  };

  const handlePlaceOrder = () => {
    if (!distributorOrderItems.length) {
      toast.error('Please add medicines to your order');
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmOrder = async () => {
    if (!selectedDistributor || !distributorOrderItems.length) return;

    const itemsPayload = distributorOrderItems
      .filter((curr) => curr.batchId)
      .map((curr) => ({
        medicineId: curr.medicineId,
        batchId: curr.batchId,
        quantity: curr.quantity,
      }));

    if (!itemsPayload.length) {
      toast.error('Some items are missing batch information. Please re-add them.');
      return;
    }

    setPlacing(true);
    try {
      await API.post('/api/v1/orders', {
        distributorId: selectedDistributor._id,
        note: orderNote,
        items: itemsPayload,
      });

      await API.delete(`/api/v1/cart/distributor/${selectedDistributor._id}`);

      setOrderItems((prev) => prev.filter((i) => distId(i) !== selectedDistId));
      setOrderNote('');
      setShowConfirm(false);
      toast.success('Order placed successfully! You can rate this order from My Orders.');
      setSelectedDistributor(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to place order.'));
      setShowConfirm(false);
    } finally {
      setPlacing(false);
    }
  };

  const clearDistributorItems = () => {
    setOrderItems((prev) => prev.filter((i) => distId(i) !== selectedDistId));
  };

  const totalAmount = distributorOrderItems.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <div className="app-layout">
      <Toaster position="top-right" />
      <SidebarNav role="pharmacy" navItems={PharmacyNavItems} />

      <div className="main-content">
        <TopBar title="Place Order" />

        <div className="place-order page-content animate-fade" style={{ paddingTop: 40 }}>
          <div className="page-header">
            <h1>Place New Order</h1>
            <p className="subtitle">Select a distributor and choose medicines</p>
          </div>

          {!selectedDistributor ? (
            <>
              <div className="section-title">
                <h2>Step 1: Select Distributor</h2>
              </div>

              <div className="distributors-grid">
                {distributors.map((dist) => (
                  <div key={dist._id} className="distributor-card">
                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3>{dist.companyName}</h3>
                      {dist.hasNoStock && (
                        <span className="badge badge-red" style={{ fontSize: '11px', margin: 0 }}>No Stock</span>
                      )}
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
              <div className="selected-distributor">
                <div className="dist-info">
                  <h2>{selectedDistributor.companyName}</h2>
                  <p>{selectedDistributor.address}</p>
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSelectedDistributor(null)}
                >
                  Change Distributor
                </button>
              </div>

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

                {distributorOrderItems.length > 0 ? (
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
                        {distributorOrderItems.map((item) => (
                          <tr key={`${item.medicineId}_${selectedDistId}`}>
                            <td className="medicine-cell">
                              <p className="medicine-name">{item.medicineName}</p>
                            </td>
                            <td>
                              <PriceDisplay
                                originalPrice={item.originalPrice ?? item.price}
                                discountPercent={item.discountPercent}
                                finalPrice={item.price}
                                size="sm"
                              />
                            </td>
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
                                    handleUpdateQuantity(item.medicineId, parseInt(e.target.value, 10) || 0)
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
                    <p>No medicines added yet for this distributor</p>
                    <button
                      className="btn btn-primary"
                      onClick={() => setShowMedicinesModal(true)}
                    >
                      Add Medicines
                    </button>
                  </div>
                )}
              </div>

              {distributorOrderItems.length > 0 && (
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
                      disabled={placing}
                    >
                      {placing ? 'Placing…' : 'Place Order'}
                    </button>
                    <button
                      className="btn btn-secondary btn-lg"
                      onClick={clearDistributorItems}
                      disabled={placing}
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

      {showMedicinesModal && selectedDistributor && (
        <div className="card medicines-modal">
          <div className="card-header">
            <div className="catalog-header-row">
              <h4 className="catalog-header">Catalog: {selectedDistributor.companyName}</h4>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowMedicinesModal(false)}
              >
                ✕ Close
              </button>
            </div>
          </div>
          <div className="card-body">
            {catalog.length === 0 ? (
              <p style={{ color: 'var(--gray-400)', textAlign: 'center', padding: '40px 0' }}>
                This distributor currently has no medicines available.
              </p>
            ) : (
              <div className="medicines-catalog">
                {catalog.map((med) => (
                  <div key={med.medicineId} className="medicine-catalog-item">
                    <h4>{med.name}</h4>
                    <p className="generic">{med.genericName}</p>
                    <p className="company">{med.company}</p>
                    <p className="stock">✓ Stock: {med.availableStock}</p>
                    <p className="price">
                      <PriceDisplay
                        originalPrice={med.price}
                        discountPercent={med.discountPercent}
                        size="sm"
                      />
                    </p>
                    <button
                      className="btn btn-primary btn-sm"
                      disabled={med.availableStock <= 0}
                      onClick={() => handleAddMedicine(med)}
                    >
                      {med.availableStock <= 0 ? 'Out of Stock' : '+ Add to Cart'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showConfirm && (
        <Modal onClose={() => !placing && setShowConfirm(false)} title="Confirm Order">
          <div className="confirm-order">
            <p>Place order with <strong>{selectedDistributor?.companyName}</strong>?</p>
            <div className="order-confirm-summary">
              <div className="summary-item">
                <span>Total Items:</span>
                <span>{distributorOrderItems.length}</span>
              </div>
              <div className="summary-item">
                <span>Total Amount:</span>
                <span className="amount">Rs. {totalAmount.toLocaleString()}</span>
              </div>
            </div>
            <div className="modal-buttons" style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button className="btn btn-primary" onClick={handleConfirmOrder} disabled={placing}>
                {placing ? 'Placing…' : '✓ Confirm Order'}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowConfirm(false)}
                disabled={placing}
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
