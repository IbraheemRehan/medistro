import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import SidebarNav from '../../components/SidebarNav';
import TopBar from '../../components/TopBar';
import Modal from '../../components/Modal';
import Invoice from '../../components/Invoice';
import API from '../../config/api.config';
import { DistributorNavItems } from '../../config/navItems';
import { FiFileText, FiDollarSign, FiClock, FiCheckCircle } from 'react-icons/fi';
import { useSocket } from '../../context/SocketContext';
import { getPaymentBadgeClass, getPaymentLabel, normalizePaymentStatus } from '../../utils/orderStatus';

const DistributorInvoices = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const [invoices, setInvoices] = useState([]);
  const { socket } = useSocket();

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await API.get('/api/v1/invoices');
      const formattedData = response.data.map(inv => {
        const orderRef = inv.orderId || {};
        return {
          invoiceDbId: inv._id,
          id: inv.invoiceNumber,
          displayId: orderRef._id?.substring(0, 8) || 'Unknown',
          orderMongoId: orderRef._id,
          orderStatus: orderRef.status || 'unknown',
          orderId: orderRef._id?.substring(0, 8) || 'Unknown',
          pharmacyName: inv.pharmacyId?.pharmacyName || 'Unknown Pharmacy',
          amount: inv.totalAmount,
          paidAmount: inv.amountPaid || 0,
          paymentStatus: normalizePaymentStatus(inv.paymentStatus),
          dueDate: new Date(inv.dueDate).toLocaleDateString(),
          createdDate: new Date(inv.createdAt).toLocaleDateString(),
          totalAmount: inv.totalAmount,
          
          // Reconstruct the nested structures expected by <Invoice />
          invoiceNumber: inv.invoiceNumber,
          createdAt: new Date(inv.createdAt).toLocaleDateString(),
          distributorId: inv.distributorId || {},
          pharmacyId: {
            ...inv.pharmacyId,
            licenseNumber: inv.pharmacyId?.drugLicenseNumber || 'N/A',
          },
          items: orderRef.items || [],
        };
      });
      setInvoices(formattedData);
    } catch (err) {
      console.error("Failed to fetch invoices", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on("payment:updated", fetchInvoices);
    return () => socket.off("payment:updated", fetchInvoices);
  }, [socket]);

  const handleMarkPaid = async (invoice) => {
    if (!invoice?.invoiceDbId) return;
    if (!window.confirm(`Mark invoice ${invoice.id} as PAID? This will update distributor earnings.`)) return;

    try {
      await API.put(`/api/v1/invoices/${invoice.invoiceDbId}/status`, {
        paymentStatus: 'paid',
        amountPaid: invoice.amount,
      });
      await fetchInvoices();
      alert('Payment marked as paid successfully.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark as paid.');
    }
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
    { label: 'Total Billed', value: `Rs. ${totalAmount.toLocaleString()}`, icon: <FiFileText />, color: 'blue' },
    { label: 'Received', value: `Rs. ${totalPaid.toLocaleString()}`, icon: <FiCheckCircle />, color: 'green' },
    { label: 'Pending', value: `Rs. ${totalPending.toLocaleString()}`, icon: <FiClock />, color: 'amber' },
  ];

  return (
    <div className="app-layout">
      <SidebarNav role="distributor" navItems={DistributorNavItems} />

      <div className="main-content">
        <TopBar title="Invoice Management" />

        <div className="page-content animate-fade" style={{ paddingTop: 40 }}>
          <div className="page-header" style={{ marginBottom: 32 }}>
            <h1>Invoices & Payments</h1>
            <p style={{ color: 'var(--gray-500)' }}>Track billing and incoming payments from pharmacies</p>
          </div>

          <div className="grid-3" style={{ marginBottom: 32 }}>
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
            <div className="card-body" style={{ display: 'flex', gap: 16 }}>
              <input
                type="text"
                placeholder="Search invoice ID, order ID or pharmacy..."
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
                <option value="all">All Statuses</option>
                <option value="unpaid">Unpaid</option>
                <option value="pending_payment">Pending Payment</option>
                <option value="payment_verified">Payment Verified</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Order</th>
                  <th>Pharmacy</th>
                  <th>Billed</th>
                  <th>Received</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="8" style={{ textAlign: 'center', padding: 40 }}>Loading invoices...</td></tr>
                ) : filteredInvoices.length === 0 ? (
                  <tr><td colSpan="8" style={{ textAlign: 'center', padding: 40 }}>No invoices found.</td></tr>
                ) : filteredInvoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td style={{ fontWeight: 700, color: 'var(--brand)' }}>{invoice.id}</td>
                    <td>ORD-{invoice.orderId}</td>
                    <td style={{ fontWeight: 600 }}>{invoice.pharmacyName}</td>
                    <td style={{ fontWeight: 700 }}>Rs. {invoice.amount.toLocaleString()}</td>
                    <td style={{ color: 'var(--success)', fontWeight: 600 }}>Rs. {invoice.paidAmount.toLocaleString()}</td>
                    <td>
                      <span className={`badge ${getPaymentBadgeClass(invoice.paymentStatus)}`}>
                        {getPaymentLabel(invoice.paymentStatus).toUpperCase()}
                      </span>
                    </td>
                    <td>{invoice.dueDate}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {invoice.paymentStatus !== 'paid' &&
                          (invoice.orderStatus === 'completed' || invoice.orderStatus === 'delivered' || invoice.orderStatus === 'received') && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleMarkPaid(invoice)}
                            >
                              Mark as Paid
                            </button>
                          )}
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setSelectedOrder(invoice);
                            setShowInvoice(true);
                          }}
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showInvoice && selectedOrder && (
        <Modal onClose={() => setShowInvoice(false)} title={`Invoice: ${selectedOrder.id}`} size="xl">
          <Invoice order={selectedOrder} />
        </Modal>
      )}
    </div>
  );
};

export default DistributorInvoices;