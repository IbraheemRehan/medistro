import React, { useState, useEffect, useContext } from 'react';
import axios from '../../config/api.config';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import SidebarNav from '../../components/SidebarNav';
import TopBar from '../../components/TopBar';
import { DistributorNavItems } from '../../config/navItems';
import { FiBox, FiClock, FiDollarSign, FiUsers, FiFileText, FiAlertCircle } from 'react-icons/fi';
import { MdOutlineInventory } from 'react-icons/md';

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
    recentOrders: [],
    lowStockItems: []
  });

  const [loading, setLoading] = useState(true);

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

        const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
        const pharmacies = new Set();
        orders.forEach(o => { if(o.pharmacyId?._id) pharmacies.add(o.pharmacyId._id) });
        
        const lowStockArr = inventory.filter(i => i.availableStock <= (i.lowStockThreshold || 10));

        setDashboardData({
          totalOrders: orders.length,
          pendingOrders: orders.filter(o => o.status === 'pending').length,
          totalRevenue,
          activePharmacies: pharmacies.size,
          lowStockMedicines: lowStockArr.length,
          employees: employees.length,
          invoicesPending: invoices.filter(i => i.paymentStatus !== 'paid').length,
          recentOrders: orders.slice().reverse().slice(0, 5).map(o => ({
            id: o._id.substring(0,8).toUpperCase(),
            pharmacy: o.pharmacyId?.pharmacyName || 'Unknown',
            amount: o.totalAmount,
            status: o.status,
            date: new Date(o.createdAt).toLocaleDateString()
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
  }, []);

  const statCards = [
    { title: 'Total Orders', value: dashboardData.totalOrders, icon: <FiBox />, color: 'blue', link: '/distributor/orders' },
    { title: 'Pending Orders', value: dashboardData.pendingOrders, icon: <FiClock />, color: 'amber', link: '/distributor/orders' },
    { title: 'Total Revenue', value: `Rs. ${dashboardData.totalRevenue.toLocaleString()}`, icon: <FiDollarSign />, color: 'green', link: '/distributor/invoices' },
    { title: 'Active Pharmacies', value: dashboardData.activePharmacies, icon: <FiUsers />, color: 'info', link: '/distributor/orders' },
  ];

  return (
    <div className="app-layout">
      <SidebarNav role="distributor" navItems={DistributorNavItems} />
      
      <div className="main-content">
        <TopBar title="Distributor Dashboard" />

        <div className="page-content animate-fade">
          <div className="page-header">
            <h1>Distributor Overview</h1>
            <p style={{ color: 'var(--gray-500)' }}>Welcome back, {user?.username}. Manage your distribution operations efficiently.</p>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
            {/* Recent Orders Table */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Recent Orders</span>
                <button className="btn btn-secondary btn-sm" onClick={() => navigate('/distributor/orders')}>View All</button>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Pharmacy</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="5" style={{ textAlign: 'center', padding: 32 }}>Loading...</td></tr>
                    ) : dashboardData.recentOrders.length === 0 ? (
                      <tr><td colSpan="5" style={{ textAlign: 'center', padding: 32 }}>No recent orders.</td></tr>
                    ) : (
                      dashboardData.recentOrders.map((order, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 600, color: 'var(--brand)' }}>ORD-{order.id}</td>
                          <td>{order.pharmacy}</td>
                          <td style={{ fontWeight: 600 }}>Rs. {order.amount.toLocaleString()}</td>
                          <td>
                            <span className={`badge badge-${order.status === 'pending' ? 'amber' : order.status === 'completed' ? 'green' : 'blue'}`}>
                              {order.status.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ fontSize: '13px', color: 'var(--gray-500)' }}>{order.date}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Side Panel: Low Stock & Quick Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Low Stock Card */}
              <div className="card">
                <div className="card-header">
                  <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FiAlertCircle color="var(--danger)" /> Low Stock
                  </span>
                </div>
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {dashboardData.lowStockItems.length === 0 ? (
                    <p style={{ fontSize: '13px', color: 'var(--gray-500)' }}>All items are well stocked.</p>
                  ) : (
                    dashboardData.lowStockItems.map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: 500 }}>{item.name}</span>
                        <span className="badge badge-red">{item.current} left</span>
                      </div>
                    ))
                  )}
                  <button className="btn btn-secondary btn-sm btn-full" style={{ marginTop: 8 }} onClick={() => navigate('/distributor/stock')}>
                    Manage Inventory
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