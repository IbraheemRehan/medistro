import React, { useState, useEffect, useContext } from 'react';
import SidebarNav from '../../components/SidebarNav';
import TopBar from '../../components/TopBar';
import Modal from '../../components/Modal';
import Invoice from '../../components/Invoice';
import API from '../../config/api.config';
import { PharmacyNavItems } from '../../config/navItems';
import { FiFileText, FiCheckCircle, FiClock } from 'react-icons/fi';

const PharmacyInvoices = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const response = await API.get('/api/v1/invoices');
        const formattedData = response.data.map(inv => {
          const orderRef = inv.orderId || {};
          return {
            id: inv.invoiceNumber,
            displayId: orderRef._id?.substring(0, 8) || 'Unknown',
            orderId: orderRef._id?.substring(0, 8) || 'Unknown',
            distributorName: inv.distributorId?.companyName || 'Unknown Distributor',
            amount: inv.totalAmount,
            paidAmount: inv.amountPaid || 0,
            paymentStatus: inv.paymentStatus,
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
    fetchInvoices();
  }, []);

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.distributorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.orderId.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && invoice.paymentStatus === filterStatus;
  });

  return (
    <div className="app-layout">
      <SidebarNav role="pharmacy" navItems={PharmacyNavItems} />

      <div className="main-content">
        <TopBar title="My Invoices" />

        <div className="page-content animate-fade">
          <div className="page-header" style={{ marginBottom: 32 }}>
            <h1>Billing & Invoices</h1>
            <p style={{ color: 'var(--gray-500)' }}>View and track your payments to distributors</p>
          </div>

          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-body" style={{ display: 'flex', gap: 16 }}>
              <input
                type="text"
                placeholder="Search invoice or distributor..."
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
                <option value="partial">Partial</option>
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
                  <th>Distributor</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40 }}>Loading invoices...</td></tr>
                ) : filteredInvoices.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40 }}>No invoices found.</td></tr>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td style={{ fontWeight: 700, color: 'var(--brand)' }}>{invoice.id}</td>
                      <td>ORD-{invoice.orderId}</td>
                      <td style={{ fontWeight: 600 }}>{invoice.distributorName}</td>
                      <td style={{ fontWeight: 700 }}>Rs. {invoice.amount.toLocaleString()}</td>
                      <td>
                        <span className={`badge badge-${invoice.paymentStatus === 'paid' ? 'green' : invoice.paymentStatus === 'partial' ? 'amber' : 'red'}`}>
                          {invoice.paymentStatus.toUpperCase()}
                        </span>
                      </td>
                      <td>{invoice.dueDate}</td>
                      <td>
                        <button className="btn btn-secondary btn-sm" onClick={() => { setSelectedOrder(invoice); setShowInvoice(true); }}>View</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showInvoice && selectedOrder && (
        <Modal onClose={() => setShowInvoice(false)} title={`Invoice: ${selectedOrder.id}`}>
          <Invoice order={selectedOrder} />
        </Modal>
      )}
    </div>
  );
};

export default PharmacyInvoices;