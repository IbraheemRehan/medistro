import React, { useState, useEffect, useContext } from 'react';
import axios from '../../config/api.config';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import SidebarNav from '../../components/SidebarNav';
import TopBar from '../../components/TopBar';
import { DistributorNavItems } from '../../config/navItems';
import { FiBox, FiClock, FiDollarSign, FiUsers, FiFileText, FiAlertCircle } from 'react-icons/fi';
import { MdOutlineInventory } from 'react-icons/md';
import { useSocket } from '../../context/SocketContext';
import {
  getPaymentBadgeClass,
  getPaymentLabel,
  getWorkflowBadgeClass,
  getWorkflowLabel,
  normalizePaymentStatus,
  normalizeWorkflowStatus,
} from '../../utils/orderStatus';

const DistributorDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    activePharmacies: 0,
    lowStockMedicines: 0,
    employees: 0,
    invoicesPending: 0,
    invoicesPaid: 0,
    recentOrders: [],
    lowStockItems: []
  });

  const [syncTick, setSyncTick] = useState(0);
  const [loading, setLoading] = useState(true);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [paymentUpdatingId, setPaymentUpdatingId] = useState('');
  const { socket } = useSocket();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [ordersRes, invRes, empRes, invoiceRes] = await Promise.all([
          axios.get('/api/v1/orders').catch(() => ({ data: { orders: [] } })),
          axios.get('/api/v1/inventory').catch(() => ({ data: { inventory: [] } })),
          axios.get('/api/v1/employees').catch(() => ({ data: { employees: [] } })),
          axios.get('/api/v1/invoices').catch(() => ({ data: [] }))
        ]);

        const orders = ordersRes.data?.orders || [];
        const inventory = invRes.data?.inventory || [];
        const employees = empRes.data?.employees || [];
        const invoices = invoiceRes.data || [];

        const paidInvoices = invoices.filter(i => i.paymentStatus === 'paid');
        const totalRevenue = paidInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

        const invoiceByOrderId = invoices.reduce((acc, inv) => {
          const key = inv.orderId?._id || inv.orderId;
          if (!key) return acc;
          acc[key.toString()] = inv;
          return acc;
        }, {});

        const pharmacies = new Set();
        orders.forEach(o => { if (o.pharmacyId?._id) pharmacies.add(o.pharmacyId._id); });

        const lowStockArr = inventory.filter(i => i.availableStock <= (i.lowStockThreshold || 10));

        setDashboardData({
          totalOrders: orders.length,
          pendingOrders: orders.filter(o => o.status === 'pending').length,
          totalRevenue,
          activePharmacies: pharmacies.size,
          lowStockMedicines: lowStockArr.length,
          employees: employees.length,
          invoicesPending: invoices.filter(i => i.paymentStatus !== 'paid').length,
          invoicesPaid: paidInvoices.length,
          recentOrders: orders.slice().reverse().slice(0, 5).map(o => ({
            id: o._id.substring(0, 8).toUpperCase(),
            pharmacy: o.pharmacyId?.pharmacyName || 'Unknown',
            amount: o.totalAmount,
            status: normalizeWorkflowStatus(o.status),
            date: new Date(o.createdAt).toLocaleDateString(),
            orderMongoId: o._id,
            paymentStatus: normalizePaymentStatus(invoiceByOrderId[o._id?.toString?.() || o._id]?.paymentStatus),
            invoiceDbId: invoiceByOrderId[o._id?.toString?.() || o._id]?._id,
          })),
          lowStockItems: lowStockArr.slice(0, 5).map(i => ({
            name: i.medicineId?.name || 'Unknown',
            current: i.availableStock,
            threshold: i.lowStockThreshold || 10
          }))
        });
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [syncTick]);

  // ── Payment update: mutates local state only — no page re-fetch ──
  const handlePaymentUpdate = async (order, targetStatus) => {
    if (!order?.invoiceDbId) {
      alert('No invoice found for this order.');
      return;
    }
    if (order.paymentStatus === targetStatus) return;
    if (!window.confirm(`Mark order ${order.id} as ${targetStatus.toUpperCase()}?`)) return;

    setPaymentUpdatingId(order.invoiceDbId);
    try {
      await axios.put(`/api/v1/invoices/${order.invoiceDbId}/status`, {
        paymentStatus: targetStatus,
        amountPaid: targetStatus === 'paid' ? order.amount : 0,
      });

      // Update local state — no re-fetch, no page refresh
      setDashboardData(prev => {
        const wasPaid = order.paymentStatus === 'paid';
        const becomingPaid = targetStatus === 'paid';
        return {
          ...prev,
          totalRevenue: becomingPaid && !wasPaid
            ? prev.totalRevenue + order.amount
            : !becomingPaid && wasPaid
              ? Math.max(0, prev.totalRevenue - order.amount)
              : prev.totalRevenue,
          invoicesPaid: becomingPaid && !wasPaid
            ? prev.invoicesPaid + 1
            : !becomingPaid && wasPaid
              ? Math.max(0, prev.invoicesPaid - 1)
              : prev.invoicesPaid,
          invoicesPending: becomingPaid && !wasPaid
            ? Math.max(0, prev.invoicesPending - 1)
            : !becomingPaid && wasPaid
              ? prev.invoicesPending + 1
              : prev.invoicesPending,
          recentOrders: prev.recentOrders.map(o =>
            o.invoiceDbId === order.invoiceDbId
              ? { ...o, paymentStatus: targetStatus }
              : o
          ),
        };
      });

    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to update payment.');
    } finally {
      setPaymentUpdatingId('');
    }
  };

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'inventoryUpdated') setSyncTick(Date.now());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    if (!socket) return;
    const onSync = () => setSyncTick(Date.now());
    socket.on("order:updated", onSync);
    socket.on("payment:updated", onSync);
    return () => {
      socket.off("order:updated", onSync);
      socket.off("payment:updated", onSync);
    };
  }, [socket]);

  const statCards = [
    { title: 'Total Orders',      value: dashboardData.totalOrders,                                    icon: <FiBox />,       color: 'blue',  link: '/distributor/orders'  },
    { title: 'Pending Orders',    value: dashboardData.pendingOrders,                                   icon: <FiClock />,     color: 'amber', link: '/distributor/orders'  },
    { title: 'Received',          value: `Rs. ${dashboardData.totalRevenue.toLocaleString()}`,          icon: <FiDollarSign />,color: 'green', link: '/distributor/invoices'},
    { title: 'Active Pharmacies', value: dashboardData.activePharmacies,                                icon: <FiUsers />,     color: 'info',  link: '/distributor/orders'  },
  ];

  const filteredRecentOrders = dashboardData.recentOrders.filter((order) => {
    const search = orderSearch.trim().toLowerCase();
    const searchMatch =
      !search ||
      `ord-${order.id}`.toLowerCase().includes(search) ||
      order.pharmacy.toLowerCase().includes(search);
    const orderStatusMatch = orderStatusFilter === 'all' || order.status === orderStatusFilter;
    const paymentStatusMatch = paymentFilter === 'all' || order.paymentStatus === paymentFilter;
    return searchMatch && orderStatusMatch && paymentStatusMatch;
  });

  // ── Shared select style — NO appearance:none so text renders fully ──
  const filterSelectStyle = {
    height: 36,
    fontSize: 12,
    padding: '0 10px',
    borderRadius: 8,
    border: '1px solid var(--gray-200)',
    backgroundColor: '#fff',
    color: 'var(--gray-800)',
    cursor: 'pointer',
    minWidth: 130,
  };

  const inlineSelectStyle = {
    height: 30,
    fontSize: 11,
    padding: '0 6px',
    borderRadius: 6,
    border: '1px solid var(--gray-200)',
    backgroundColor: '#fff',
    color: 'var(--gray-800)',
    cursor: 'pointer',
    minWidth: 100,
  };

  return (
    <div className="app-layout">
      <SidebarNav role="distributor" navItems={DistributorNavItems} />

      <div className="main-content">
        <TopBar title="Distributor Dashboard" />

        <div className="page-content animate-fade" style={{ paddingTop: 40 }}>
          <div className="page-header">
            <h1>Distributor Overview</h1>
            <p style={{ color: 'var(--gray-500)' }}>
              Welcome back, {user?.username}. Manage your distribution operations efficiently.
            </p>
          </div>

          <div className="grid-4" style={{ marginBottom: 32 }}>
            {statCards.map((card, idx) => (
              <div key={idx} className="stat-card" onClick={() => navigate(card.link)} style={{ cursor: 'pointer' }}>
                <div className={`stat-icon ${card.color}`}>{card.icon}</div>
                <div>
                  <div className="stat-value">{card.value}</div>
                  <div className="stat-label">{card.title}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="dashboard-content-grid">

            {/* ── Recent Orders Card ── */}
            <div className="card">
              <div className="card-header" style={{ paddingBottom: 8 }}>
                <span className="card-title">Recent Orders</span>
                <button className="btn btn-secondary btn-sm" onClick={() => navigate('/distributor/orders')}>
                  View All
                </button>
              </div>

              <div className="card-body" style={{ paddingTop: 0 }}>

                {/* Filter row — 14px gap below title */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginTop: 14,
                  marginBottom: 14,
                  flexWrap: 'nowrap',
                  overflowX: 'auto',
                }}>
                  <input
                    className="form-input"
                    placeholder="Search ID or pharmacy…"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    style={{
                      flex: '1 1 140px',
                      minWidth: 200,
                      height: 36,
                      fontSize: 12,
                      padding: '0 10px',
                      borderRadius: 8,
                    }}
                  />

                  <select
                    className="form-input"
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    style={filterSelectStyle}
                  >
                    <option value="all">All Orders</option>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="dispatched">Dispatched</option>
                    <option value="delivered">Delivered</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  <select
                    className="form-input"
                    value={paymentFilter}
                    onChange={(e) => setPaymentFilter(e.target.value)}
                    style={filterSelectStyle}
                  >
                    <option value="all">All Payments</option>
                    <option value="unpaid">Unpaid</option>
                    <option value="pending_payment">Pending Payment</option>
                    <option value="payment_verified">Payment Verified</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>

                {/* Scrollable table */}
                <div style={{
                  borderRadius: 14,
                  border: '1px solid var(--gray-200)',
                  overflowX: 'auto',
                  overflowY: 'auto',
                  maxHeight: 360,
                }}>
                  <table
                    className="data-table dashboard-orders-table"
                    style={{ margin: 0, minWidth: 640 }}
                  >
                    <thead style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: 'var(--gray-50, #f9fafb)' }}>
                      <tr>
                        <th style={{ whiteSpace: 'nowrap' }}>Order ID</th>
                        <th style={{ whiteSpace: 'nowrap' }}>Pharmacy</th>
                        <th style={{ whiteSpace: 'nowrap' }}>Amount</th>
                        <th style={{ whiteSpace: 'nowrap' }}>Status</th>
                        <th style={{ whiteSpace: 'nowrap' }}>Payment</th>
                        <th style={{ whiteSpace: 'nowrap' }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr><td colSpan="6" style={{ textAlign: 'center', padding: 32 }}>Loading…</td></tr>
                      ) : filteredRecentOrders.length === 0 ? (
                        <tr><td colSpan="6" style={{ textAlign: 'center', padding: 32 }}>No orders match your filters.</td></tr>
                      ) : (
                        filteredRecentOrders.map((order, idx) => (
                          <tr key={idx}>
                            <td style={{ fontWeight: 600, color: 'var(--brand)', whiteSpace: 'nowrap' }} title={`ORD-${order.id}`}>
                              ORD-{order.id}
                            </td>
                            <td style={{ whiteSpace: 'nowrap' }} title={order.pharmacy}>
                              {order.pharmacy}
                            </td>
                            <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                              Rs. {order.amount.toLocaleString()}
                            </td>
                            <td>
                              <span className={`badge ${getWorkflowBadgeClass(order.status)}`}>
                                {getWorkflowLabel(order.status).toUpperCase()}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <span className={`badge ${getPaymentBadgeClass(order.paymentStatus)}`}>
                                  {getPaymentLabel(order.paymentStatus).toUpperCase()}
                                </span>
                                {order.invoiceDbId ? (
                                  <select
                                    disabled={paymentUpdatingId === order.invoiceDbId}
                                    value={order.paymentStatus}
                                    onChange={(e) => handlePaymentUpdate(order, e.target.value)}
                                    style={inlineSelectStyle}
                                  >
                                    <option value="pending_payment">Pending Payment</option>
                                    <option value="unpaid">Unpaid</option>
                                    <option value="payment_verified">Payment Verified</option>
                                    <option value="paid">Paid</option>
                                  </select>
                                ) : (
                                  <span style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 600 }}>No invoice</span>
                                )}
                              </div>
                            </td>
                            <td style={{ fontSize: 12, color: 'var(--gray-500)', whiteSpace: 'nowrap' }}>
                              {order.date}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* ── Side Panel ── */}
            <div className="dashboard-right-panel">

              {/* Low Stock */}
              <div className="card">
                <div className="card-header">
                  <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FiAlertCircle color="var(--danger)" /> Low Stock
                  </span>
                </div>
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {dashboardData.lowStockItems.length === 0 ? (
                    <p style={{ fontSize: 13, color: 'var(--gray-500)' }}>All items are well stocked.</p>
                  ) : (
                    dashboardData.lowStockItems.map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{item.name}</span>
                        <span className="badge badge-red">{item.current} left</span>
                      </div>
                    ))
                  )}
                  <button className="btn btn-secondary btn-sm btn-full" style={{ marginTop: 8 }} onClick={() => navigate('/distributor/stock')}>
                    Manage Inventory
                  </button>
                </div>
              </div>

              {/* Payments Snapshot */}
              <div className="card">
                <div className="card-header">
                  <span className="card-title">Payments</span>
                </div>
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Paid Invoices</span>
                    <span className="badge badge-green">{dashboardData.invoicesPaid}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Pending Receipts</span>
                    <span className="badge badge-amber">{dashboardData.invoicesPending}</span>
                  </div>
                  <button className="btn btn-secondary btn-sm btn-full" onClick={() => navigate('/distributor/invoices')} style={{ marginTop: 6 }}>
                    View Invoice Payments
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card">
                <div className="card-header">
                  <span className="card-title">Quick Actions</span>
                </div>
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button className="btn btn-primary btn-full" onClick={() => navigate('/distributor/stock')}>
                    <MdOutlineInventory /> Manage Stock
                  </button>
                  <button className="btn btn-secondary btn-full" onClick={() => navigate('/distributor/employees')}>
                    <FiUsers /> Employees
                  </button>
                  <button className="btn btn-secondary btn-full" onClick={() => navigate('/distributor/invoices')}>
                    <FiFileText /> Invoices
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistributorDashboard;