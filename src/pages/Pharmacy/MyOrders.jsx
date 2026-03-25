import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import SidebarNav from '../../components/SidebarNav';
import TopBar from '../../components/TopBar';
import Modal from '../../components/Modal';
import Invoice from '../../components/Invoice';
import '../../styles/PlaceOrder.css';

const MyOrders = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [orders] = useState([
    {
      id: 'ORD-2024-001',
      distributorId: 'DIST-001',
      distributorName: 'Prime Distributor',
      status: 'delivered',
      createdAt: '2024-03-24',
      totalAmount: 4500,
      items: [
        {
          medicineId: 1,
          medicineName: 'Aspirin',
          batchId: 'BATCH-001',
          quantity: 100,
          salePrice: 25,
          subtotal: 2500
        },
        {
          medicineId: 2,
          medicineName: 'Paracetamol',
          batchId: 'BATCH-002',
          quantity: 80,
          salePrice: 25,
          subtotal: 2000
        }
      ]
    },
    {
      id: 'ORD-2024-002',
      distributorId: 'DIST-002',
      distributorName: 'Health Supplies Co',
      status: 'dispatched',
      createdAt: '2024-03-23',
      totalAmount: 3200,
      items: [
        {
          medicineId: 3,
          medicineName: 'Ibuprofen',
          batchId: 'BATCH-003',
          quantity: 128,
          salePrice: 25,
          subtotal: 3200
        }
      ]
    },
    {
      id: 'ORD-2024-003',
      distributorId: 'DIST-003',
      distributorName: 'MediPro Distribution',
      status: 'approved',
      createdAt: '2024-03-22',
      totalAmount: 5600,
      items: [
        {
          medicineId: 4,
          medicineName: 'Amoxicillin',
          batchId: 'BATCH-004',
          quantity: 224,
          salePrice: 25,
          subtotal: 5600
        }
      ]
    },
    {
      id: 'ORD-2024-004',
      distributorId: 'DIST-001',
      distributorName: 'Prime Distributor',
      status: 'pending',
      createdAt: '2024-03-21',
      totalAmount: 2800,
      items: [
        {
          medicineId: 5,
          medicineName: 'Metformin',
          batchId: 'BATCH-005',
          quantity: 112,
          salePrice: 25,
          subtotal: 2800
        }
      ]
    },
  ]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.distributorName.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && order.status === filterStatus;
  });

  const getStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      approved: 'blue',
      dispatched: 'purple',
      delivered: 'green'
    };
    return colors[status] || 'gray';
  };

  const stats = [
    { label: 'Total Orders', value: orders.length, color: 'blue' },
    { label: 'Pending', value: orders.filter(o => o.status === 'pending').length, color: 'orange' },
    { label: 'Approved', value: orders.filter(o => o.status === 'approved').length, color: 'blue' },
    { label: 'Dispatched', value: orders.filter(o => o.status === 'dispatched').length, color: 'purple' },
    { label: 'Delivered', value: orders.filter(o => o.status === 'delivered').length, color: 'green' },
  ];

  return (
    <div className="dashboard-container">
      <SidebarNav userRole="pharmacy" onLogout={handleLogout} />

      <div className="dashboard-content">
        <TopBar userName={user?.username} userRole="Pharmacy" />

        <div className="my-orders">
          <div className="page-header">
            <h1>My Orders</h1>
            <button
              className="btn-primary"
              onClick={() => navigate('/pharmacy/place-order')}
            >
              ➕ Place New Order
            </button>
          </div>

          {/* Stats */}
          <div className="orders-stats">
            {stats.map((stat, idx) => (
              <div key={idx} className={`stat-card stat-${stat.color}`}>
                <p className="stat-label">{stat.label}</p>
                <p className="stat-number">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Filter and Search */}
          <div className="order-controls">
            <input
              type="text"
              placeholder="Search order ID or distributor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="dispatched">Dispatched</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>

          {/* Orders List */}
          <div className="orders-container">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <div key={order.id} className="order-card">
                  <div className="order-card-header">
                    <div>
                      <h3>{order.id}</h3>
                      <p className="order-distributor">{order.distributorName}</p>
                    </div>
                    <span className={`status-badge status-${getStatusColor(order.status)}`}>
                      {order.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="order-card-body">
                    <div className="order-info">
                      <div className="info-item">
                        <label>Date</label>
                        <p>{order.createdAt}</p>
                      </div>
                      <div className="info-item">
                        <label>Items</label>
                        <p>{order.items.length}</p>
                      </div>
                      <div className="info-item">
                        <label>Total Amount</label>
                        <p className="amount">Rs. {order.totalAmount.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="order-items-preview">
                      <p className="preview-title">Items:</p>
                      {order.items.map((item, idx) => (
                        <p key={idx} className="item-preview">
                          • {item.quantity}x {item.medicineName}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="order-card-footer">
                    <button
                      className="btn-text"
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowDetailsModal(true);
                      }}
                    >
                      View Details →
                    </button>
                    <button
                      className="btn-primary btn-sm"
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowInvoice(true);
                      }}
                    >
                      📄 Invoice
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">
                <p>No orders found</p>
                <button
                  className="btn-primary"
                  onClick={() => navigate('/pharmacy/place-order')}
                >
                  Place Your First Order
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <Modal onClose={() => setShowDetailsModal(false)} title="Order Details">
          <div className="order-details">
            <div className="details-section">
              <h4>Order Information</h4>
              <div className="details-grid">
                <div>
                  <label>Order ID</label>
                  <p>{selectedOrder.id}</p>
                </div>
                <div>
                  <label>Status</label>
                  <p className={`status-badge status-${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </p>
                </div>
                <div>
                  <label>Date Placed</label>
                  <p>{selectedOrder.createdAt}</p>
                </div>
                <div>
                  <label>Total Amount</label>
                  <p className="highlight">Rs. {selectedOrder.totalAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="details-section">
              <h4>Distributor Information</h4>
              <div className="details-grid">
                <div>
                  <label>Distributor</label>
                  <p>{selectedOrder.distributorName}</p>
                </div>
              </div>
            </div>

            <div className="details-section">
              <h4>Order Items</h4>
              <table className="items-table">
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Batch</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.medicineName}</td>
                      <td>{item.batchId}</td>
                      <td>{item.quantity}</td>
                      <td>Rs. {item.salePrice}</td>
                      <td>Rs. {item.subtotal.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="modal-buttons">
              <button className="btn-primary" onClick={() => setShowDetailsModal(false)}>
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Invoice Modal */}
      {showInvoice && selectedOrder && (
        <Modal onClose={() => setShowInvoice(false)} title="Order Invoice">
          <Invoice order={selectedOrder} />
        </Modal>
      )}
    </div>
  );
};

export default MyOrders;