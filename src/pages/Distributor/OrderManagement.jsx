import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import SidebarNav from '../../components/SidebarNav';
import TopBar from '../../components/TopBar';
import Modal from '../../components/Modal';
import Invoice from '../../components/Invoice';
import API from '../../config/api.config';
import { DistributorNavItems } from '../../config/navItems';
import { FiShoppingCart, FiClock, FiCheckCircle, FiXCircle, FiTruck, FiFileText } from 'react-icons/fi';

const OrderManagement = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [loading, setLoading] = useState(true);

  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await API.get('/api/v1/orders');
      const mappedOrders = response.data.orders.map(o => ({
        id: o._id,
        displayId: `ORD-${o._id.substring(0,8).toUpperCase()}`,
        pharmacyId: o.pharmacyId?._id,
        pharmacyName: o.pharmacyId?.pharmacyName || 'Unknown',
        pharmacyOwner: o.pharmacyId?.ownerName || '',
        status: o.status,
        createdAt: new Date(o.createdAt).toLocaleDateString(),
        totalAmount: o.totalAmount,
        note: o.note || '',
        rejectionReason: o.rejectionReason || '',
        items: o.items.map(item => ({
          medicineName: item.medicineId?.name || 'Unknown',
          genericName: item.medicineId?.genericName || '',
          batchId: item.batchId,
          quantity: item.quantity,
          salePrice: item.salePrice,
          subtotal: item.subtotal
        }))
      }));
      setOrders(mappedOrders);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleApprove = async (orderId) => {
    try {
      await API.put(`/api/v1/orders/${orderId}/approve`);
      fetchOrders();
      setShowDetailsModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async (orderId) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;
    try {
      await API.put(`/api/v1/orders/${orderId}/reject`, { rejectionReason: reason });
      fetchOrders();
      setShowDetailsModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject');
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await API.put(`/api/v1/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
      setShowDetailsModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.displayId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.pharmacyName.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && order.status === filterStatus;
  });

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'amber',
      approved: 'blue',
      rejected: 'red',
      dispatched: 'info',
      delivered: 'green'
    };
    return `badge badge-${variants[status] || 'gray'}`;
  };

  const stats = [
    { label: 'Total Orders', value: orders.length, icon: <FiShoppingCart />, color: 'blue' },
    { label: 'Pending', value: orders.filter(o => o.status === 'pending').length, icon: <FiClock />, color: 'amber' },
    { label: 'Dispatched', value: orders.filter(o => o.status === 'dispatched').length, icon: <FiTruck />, color: 'info' },
    { label: 'Delivered', value: orders.filter(o => o.status === 'delivered').length, icon: <FiCheckCircle />, color: 'green' },
  ];

  return (
    <div className="app-layout">
      <SidebarNav role="distributor" navItems={DistributorNavItems} />

      <div className="main-content">
        <TopBar title="Order Management" />

        <div className="page-content animate-fade">
          <div className="page-header" style={{ marginBottom: 32 }}>
            <h1>Order Management</h1>
            <p style={{ color: 'var(--gray-500)' }}>Process and track pharmacy orders</p>
          </div>

          <div className="grid-4" style={{ marginBottom: 32 }}>
            {stats.map((stat, idx) => (
              <div key={idx} className="stat-card">
                <div className={`stat-icon ${stat.color}`}>{stat.icon}</div>
                <div>
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-header">
              <span className="card-title">Order Filters</span>
            </div>
            <div className="card-body" style={{ display: 'flex', gap: 16 }}>
              <input
                type="text"
                placeholder="Search order ID or pharmacy..."
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
                  <th>Pharmacy</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40 }}>Loading orders...</td></tr>
                ) : filteredOrders.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40 }}>No orders found</td></tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td style={{ fontWeight: 700, color: 'var(--brand)' }}>{order.displayId}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{order.pharmacyName}</div>
                        <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{order.pharmacyOwner}</div>
                      </td>
                      <td>{order.createdAt}</td>
                      <td>{order.items.length} items</td>
                      <td style={{ fontWeight: 700 }}>Rs. {order.totalAmount.toLocaleString()}</td>
                      <td>
                        <span className={getStatusBadge(order.status)}>
                          {order.status.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowDetailsModal(true);
                            }}
                          >
                            Details
                          </button>
                          {(order.status !== 'pending' && order.status !== 'rejected') && (
                            <button
                              className="btn btn-secondary btn-sm"
                              title="Generate Invoice"
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowInvoice(true);
                              }}
                            >
                              <FiFileText />
                            </button>
                          )}
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
        <Modal onClose={() => setShowDetailsModal(false)} title={`Order Details: ${selectedOrder.displayId}`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="grid-2">
              <div className="card" style={{ padding: 16 }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: 14, color: 'var(--gray-500)' }}>Pharmacy Details</h4>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{selectedOrder.pharmacyName}</div>
                <div style={{ color: 'var(--gray-600)' }}>{selectedOrder.pharmacyOwner}</div>
              </div>
              <div className="card" style={{ padding: 16 }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: 14, color: 'var(--gray-500)' }}>Order Summary</h4>
                <div style={{ fontSize: 14 }}>Created: <b>{selectedOrder.createdAt}</b></div>
                <div style={{ fontSize: 16, marginTop: 4 }}>Total: <b style={{ color: 'var(--brand)' }}>Rs. {selectedOrder.totalAmount.toLocaleString()}</b></div>
              </div>
            </div>

            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{item.medicineName}</div>
                        <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>{item.genericName}</div>
                      </td>
                      <td>{item.quantity}</td>
                      <td>Rs. {item.salePrice}</td>
                      <td style={{ fontWeight: 600 }}>Rs. {item.subtotal.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedOrder.note && (
              <div className="card" style={{ padding: 16, background: 'var(--blue-50)', border: '1px solid var(--blue-200)' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: 13 }}>Order Note</h4>
                <p style={{ margin: 0, fontSize: 14 }}>{selectedOrder.note}</p>
              </div>
            )}

            {selectedOrder.rejectionReason && (
              <div className="card" style={{ padding: 16, background: 'var(--red-50)', border: '1px solid var(--red-200)' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: 13, color: 'var(--danger)' }}>Rejection Reason</h4>
                <p style={{ margin: 0, fontSize: 14 }}>{selectedOrder.rejectionReason}</p>
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
              {selectedOrder.status === 'pending' && (
                <>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handleApprove(selectedOrder.id)}>
                    <FiCheckCircle /> Approve Order
                  </button>
                  <button className="btn btn-secondary" style={{ color: 'var(--danger)' }} onClick={() => handleReject(selectedOrder.id)}>
                    <FiXCircle /> Reject
                  </button>
                </>
              )}

              {selectedOrder.status === 'approved' && (
                <button className="btn btn-primary btn-full" onClick={() => handleStatusChange(selectedOrder.id, 'dispatched')}>
                  <FiTruck /> Mark as Dispatched
                </button>
              )}

              {selectedOrder.status === 'dispatched' && (
                <button className="btn btn-primary btn-full" onClick={() => handleStatusChange(selectedOrder.id, 'delivered')}>
                  <FiCheckCircle /> Mark as Delivered
                </button>
              )}
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

export default OrderManagement;