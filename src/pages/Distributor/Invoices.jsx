import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import SidebarNav from '../../components/SidebarNav';
import TopBar from '../../components/TopBar';
import Modal from '../../components/Modal';
import Invoice from '../../components/Invoice';
import '../../styles/OrderManagement.css';

const DistributorInvoices = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [invoices] = useState([
    {
      id: 'INV-2024-001',
      orderId: 'ORD-2024-001',
      pharmacyName: 'City Pharmacy',
      amount: 4500,
      paidAmount: 4500,
      paymentStatus: 'paid',
      dueDate: '2024-04-24',
      createdDate: '2024-03-24',
      totalAmount: 4500,
      items: [
        { medicineName: 'Aspirin', quantity: 100, salePrice: 25, subtotal: 2500, batchId: 'BATCH-001' },
        { medicineName: 'Paracetamol', quantity: 80, salePrice: 25, subtotal: 2000, batchId: 'BATCH-002' }
      ]
    },
    {
      id: 'INV-2024-002',
      orderId: 'ORD-2024-002',
      pharmacyName: 'Health Plus',
      amount: 3200,
      paidAmount: 1600,
      paymentStatus: 'partial',
      dueDate: '2024-04-23',
      createdDate: '2024-03-23',
      totalAmount: 3200,
      items: [
        { medicineName: 'Ibuprofen', quantity: 128, salePrice: 25, subtotal: 3200, batchId: 'BATCH-003' }
      ]
    },
    {
      id: 'INV-2024-003',
      orderId: 'ORD-2024-003',
      pharmacyName: 'MediCare',
      amount: 5600,
      paidAmount: 0,
      paymentStatus: 'unpaid',
      dueDate: '2024-04-22',
      createdDate: '2024-03-22',
      totalAmount: 5600,
      items: [
        { medicineName: 'Amoxicillin', quantity: 224, salePrice: 25, subtotal: 5600, batchId: 'BATCH-004' }
      ]
    },
    {
      id: 'INV-2024-004',
      orderId: 'ORD-2024-004',
      pharmacyName: 'City Pharmacy',
      amount: 2800,
      paidAmount: 2800,
      paymentStatus: 'paid',
      dueDate: '2024-03-20',
      createdDate: '2024-02-20',
      totalAmount: 2800,
      items: [
        { medicineName: 'Metformin', quantity: 112, salePrice: 25, subtotal: 2800, batchId: 'BATCH-005' }
      ]
    },
    {
      id: 'INV-2024-005',
      orderId: 'ORD-2024-005',
      pharmacyName: 'Wellness Center',
      amount: 3500,
      paidAmount: 0,
      paymentStatus: 'unpaid',
      dueDate: '2024-04-25',
      createdDate: '2024-03-25',
      totalAmount: 3500,
      items: [
        { medicineName: 'Aspirin', quantity: 140, salePrice: 25, subtotal: 3500, batchId: 'BATCH-001' }
      ]
    },
  ]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.pharmacyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.orderId.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && invoice.paymentStatus === filterStatus;
  });

  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const totalPending = totalAmount - totalPaid;

  const stats = [
    { label: 'Total Invoices', value: invoices.length, color: 'blue' },
    { label: 'Total Amount', value: `Rs. ${totalAmount.toLocaleString()}`, color: 'green' },
    { label: 'Amount Received', value: `Rs. ${totalPaid.toLocaleString()}`, color: 'green' },
    { label: 'Pending Payment', value: `Rs. ${totalPending.toLocaleString()}`, color: 'red' },
  ];

  const getStatusColor = (status) => {
    const colors = {
      unpaid: 'red',
      partial: 'orange',
      paid: 'green'
    };
    return colors[status] || 'gray';
  };

  return (
    <div className="dashboard-container">
      <SidebarNav userRole="distributor" onLogout={handleLogout} />

      <div className="dashboard-content">
        <TopBar userName={user?.username} userRole="Distributor" />

        <div className="order-management">
          <div className="page-header">
            <h1>Invoices</h1>
            <p className="subtitle">Manage customer invoices and payments</p>
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
          <div className="order-controls" style={{ marginBottom: '24px' }}>
            <input
              type="text"
              placeholder="Search invoice ID, order ID or pharmacy..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Invoices</option>
              <option value="unpaid">Unpaid</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          {/* Invoices Table */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-sm)',
            overflow: 'auto'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{
                backgroundColor: 'var(--bg-secondary)',
                borderBottom: '2px solid var(--border)'
              }}>
                <tr>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>
                    Invoice ID
                  </th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>
                    Order ID
                  </th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>
                    Pharmacy
                  </th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: 600 }}>
                    Amount
                  </th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: 600 }}>
                    Received
                  </th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: 600 }}>
                    Pending
                  </th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: 600 }}>
                    Status
                  </th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: 600 }}>
                    Due Date
                  </th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: 600 }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => {
                  const pending = invoice.amount - invoice.paidAmount;
                  return (
                    <tr key={invoice.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{
                        padding: '16px',
                        fontWeight: 600,
                        color: 'var(--primary)'
                      }}>
                        {invoice.id}
                      </td>
                      <td style={{ padding: '16px' }}>{invoice.orderId}</td>
                      <td style={{ padding: '16px' }}>{invoice.pharmacyName}</td>
                      <td style={{
                        padding: '16px',
                        textAlign: 'center',
                        fontWeight: 600
                      }}>
                        Rs. {invoice.amount.toLocaleString()}
                      </td>
                      <td style={{
                        padding: '16px',
                        textAlign: 'center',
                        fontWeight: 600,
                        color: 'var(--success)'
                      }}>
                        Rs. {invoice.paidAmount.toLocaleString()}
                      </td>
                      <td style={{
                        padding: '16px',
                        textAlign: 'center',
                        fontWeight: 600,
                        color: pending > 0 ? 'var(--danger)' : 'var(--success)'
                      }}>
                        Rs. {pending.toLocaleString()}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <span className={`status-badge status-${getStatusColor(invoice.paymentStatus)}`}>
                          {invoice.paymentStatus}
                        </span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        {invoice.dueDate}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <button
                          className="btn-text"
                          style={{ fontSize: '0.85rem', margin: 0 }}
                          onClick={() => {
                            setSelectedOrder(invoice);
                            setShowInvoice(true);
                          }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredInvoices.length === 0 && (
            <div className="no-results">
              <p>No invoices found</p>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Modal */}
      {showInvoice && selectedOrder && (
        <Modal onClose={() => setShowInvoice(false)} title={`Invoice ${selectedOrder.id}`} size="lg">
          <Invoice order={selectedOrder} />
        </Modal>
      )}
    </div>
  );
};

export default DistributorInvoices;