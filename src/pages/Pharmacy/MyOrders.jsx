import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import SidebarNav from '../../components/SidebarNav';
import TopBar from '../../components/TopBar';
import Modal from '../../components/Modal';
import Invoice from '../../components/Invoice';
import API from '../../config/api.config';
import { PharmacyNavItems } from '../../config/navItems';
import { FiBox, FiClock, FiCheckCircle, FiXCircle, FiFileText, FiPlus } from 'react-icons/fi';

const MyOrders = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await API.get('/api/v1/orders');
      const mappedOrders = response.data.orders.map(o => ({
        id: o._id,
        displayId: `ORD-${o._id.substring(0,8).toUpperCase()}`,
        distributorName: o.distributorId?.companyName || 'Unknown Distributor',
        status: o.status || 'pending',
        createdAt: new Date(o.createdAt).toLocaleDateString(),
        totalAmount: o.totalAmount,
        distributorId: o.distributorId || {},
        pharmacyId: {
          ...o.pharmacyId,
          licenseNumber: o.pharmacyId?.drugLicenseNumber || 'N/A'
        },
        items: o.items.map(item => ({
          medicineId: item.medicineId?._id,
          medicineName: item.medicineId?.name || 'Unknown Item',
          batchId: item.batchId,
          quantity: item.quantity,
          salePrice: item.salePrice,
          subtotal: item.subtotal
        }))
      }));
      setOrders(mappedOrders);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.displayId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.distributorName.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && order.status === filterStatus;
  });

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'amber',
      approved: 'blue',
      dispatched: 'info',
      delivered: 'green',
      rejected: 'red'
    };
    return `badge badge-${variants[status] || 'gray'}`;
  };

  return (
    <div className="app-layout">
      <SidebarNav role="pharmacy" navItems={PharmacyNavItems} />

      <div className="main-content">
        <TopBar title="My Orders" />

        <div className="page-content animate-fade">
          <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <div>
              <h1>My Orders</h1>
              <p style={{ color: 'var(--gray-500)' }}>Track and manage your procurement orders</p>
            </div>
            <button className="btn btn-primary" onClick={() => window.location.href = '/pharmacy/place-order'}>
              <FiPlus /> New Order
            </button>
          </div>

          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-body" style={{ display: 'flex', gap: 16 }}>
              <input
                type="text"
                placeholder="Search order ID or distributor..."
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
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="dispatched">Dispatched</option>
                <option value="delivered">Delivered</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Distributor</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40 }}>Loading your orders...</td></tr>
                ) : filteredOrders.length === 0 ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40 }}>No orders found.</td></tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td style={{ fontWeight: 700, color: 'var(--brand)' }}>{order.displayId}</td>
                      <td style={{ fontWeight: 600 }}>{order.distributorName}</td>
                      <td>{order.createdAt}</td>
                      <td style={{ fontWeight: 700 }}>Rs. {order.totalAmount?.toLocaleString()}</td>
                      <td>
                        <span className={getStatusBadge(order.status)}>
                          {order.status.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => { setSelectedOrder(order); setShowDetailsModal(true); }}>Details</button>
                          <button className="btn btn-secondary btn-sm" onClick={() => { setSelectedOrder(order); setShowInvoice(true); }}><FiFileText /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showDetailsModal && selectedOrder && (
        <Modal onClose={() => setShowDetailsModal(false)} title={`Order: ${selectedOrder.displayId}`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
               <div className="card" style={{ padding: 16 }}>
                  <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 4 }}>DISTRIBUTOR</div>
                  <div style={{ fontWeight: 700 }}>{selectedOrder.distributorName}</div>
               </div>
               <div className="card" style={{ padding: 16 }}>
                  <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 4 }}>STATUS</div>
                  <span className={getStatusBadge(selectedOrder.status)}>{selectedOrder.status.toUpperCase()}</span>
               </div>
            </div>

            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Qty</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.medicineName}</td>
                      <td>{item.quantity}</td>
                      <td style={{ fontWeight: 600 }}>Rs. {item.subtotal?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div style={{ textAlign: 'right', fontSize: 18, fontWeight: 700 }}>
              Grand Total: <span style={{ color: 'var(--brand)' }}>Rs. {selectedOrder.totalAmount?.toLocaleString()}</span>
            </div>
          </div>
        </Modal>
      )}

      {showInvoice && selectedOrder && (
        <Modal onClose={() => setShowInvoice(false)} title="Order Invoice">
          <Invoice order={selectedOrder} />
        </Modal>
      )}
    </div>
  );
};

export default MyOrders;