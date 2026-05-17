import React, { useState, useEffect, useContext } from 'react';
import axios from '../../config/api.config';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import SidebarNav from '../../components/SidebarNav';
import TopBar from '../../components/TopBar';
import { PharmacyNavItems } from '../../config/navItems';
import { FiBox, FiClock, FiDollarSign, FiSearch, FiFileText } from 'react-icons/fi';
import { MdLocalShipping, MdOutlineShoppingCart } from 'react-icons/md';

const PharmacyDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalSpent: 0,
    activeDistributors: 0,
    recentOrders: [],
    lowInventory: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, distRes] = await Promise.all([
          axios.get('/api/v1/orders').catch(() => ({ data: { orders: [] } })),
          axios.get('/api/v1/distributors').catch(() => ({ data: [] }))
        ]);

        const orders = ordersRes.data?.orders || [];
        const distributors = distRes.data || [];

        const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const pending = orders.filter(o => o.status === 'pending').length;

        setDashboardData({
          totalOrders: orders.length,
          pendingOrders: pending,
          totalSpent: totalSpent,
          activeDistributors: distributors.length,
          recentOrders: orders.slice().reverse().slice(0, 5).map(o => ({
            id: o._id.substring(0,8),
            distributor: o.distributorId?.companyName || 'Unknown',
            amount: o.totalAmount,
            status: o.status,
            date: new Date(o.createdAt).toLocaleDateString()
          })),
          lowInventory: []
        });
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { title: 'Total Orders', value: dashboardData.totalOrders, icon: <FiBox />, color: 'blue', link: '/pharmacy/my-orders' },
    { title: 'Pending Orders', value: dashboardData.pendingOrders, icon: <FiClock />, color: 'amber', link: '/pharmacy/my-orders' },
    { title: 'Total Spent', value: `Rs. ${dashboardData.totalSpent.toLocaleString()}`, icon: <FiDollarSign />, color: 'green', link: '/pharmacy/invoices' },
    { title: 'Active Distributors', value: dashboardData.activeDistributors, icon: <MdLocalShipping />, color: 'info', link: '/pharmacy/distributors' },
  ];

  return (
    <div className="app-layout">
      <SidebarNav role="pharmacy" navItems={PharmacyNavItems} />

      <div className="main-content">
        <TopBar title="Pharmacy Dashboard" />

        <div className="page-content animate-fade">
          <div className="page-header">
            <h1>Welcome back, {user?.username || 'Pharmacy'}!</h1>
            <p style={{ color: 'var(--gray-500)' }}>Here's an overview of your pharmacy's activities.</p>
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
                <button className="btn btn-secondary btn-sm" onClick={() => navigate('/pharmacy/my-orders')}>View All</button>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Distributor</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.recentOrders.length === 0 ? (
                      <tr><td colSpan="5" style={{ textAlign: 'center', padding: 32 }}>No recent orders.</td></tr>
                    ) : (
                      dashboardData.recentOrders.map((order, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 600, color: 'var(--brand)' }}>ORD-{order.id.toUpperCase()}</td>
                          <td>{order.distributor}</td>
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

            {/* Quick Actions Card */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Quick Actions</span>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button className="btn btn-primary btn-full" onClick={() => navigate('/pharmacy/place-order')}>
                  <MdOutlineShoppingCart /> Place New Order
                </button>
                <button className="btn btn-secondary btn-full" onClick={() => navigate('/pharmacy/distributors')}>
                  <FiSearch /> Find Distributors
                </button>
                <button className="btn btn-secondary btn-full" onClick={() => navigate('/pharmacy/invoices')}>
                  <FiFileText /> My Invoices
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyDashboard;