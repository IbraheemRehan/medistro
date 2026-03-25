import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import SidebarNav from '../../components/SidebarNav';
import TopBar from '../../components/TopBar';
import '../../styles/Dashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [adminData] = useState({
    totalDistributors: 8,
    totalPharmacies: 45,
    totalOrders: 500,
    totalRevenue: 2500000,
    activeUsers: 123,
    pendingApprovals: 5,
    recentOrders: [
      {
        id: 'ORD-001',
        distributor: 'Prime Distributor',
        pharmacy: 'City Pharmacy',
        amount: 4500,
        status: 'delivered',
        date: '2024-03-24'
      },
      {
        id: 'ORD-002',
        distributor: 'Health Supplies Co',
        pharmacy: 'Health Plus',
        amount: 3200,
        status: 'dispatched',
        date: '2024-03-23'
      },
      {
        id: 'ORD-003',
        distributor: 'MediPro Dist',
        pharmacy: 'MediCare',
        amount: 5600,
        status: 'approved',
        date: '2024-03-22'
      },
    ],
    topDistributors: [
      { name: 'Prime Distributor', orders: 156, revenue: 450000 },
      { name: 'Health Supplies Co', orders: 98, revenue: 280000 },
      { name: 'MediPro Distribution', orders: 145, revenue: 420000 },
      { name: 'Global Medical Supplies', orders: 203, revenue: 580000 },
    ]
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const statCards = [
    {
      title: 'Total Distributors',
      value: adminData.totalDistributors,
      icon: '🏢',
      color: 'blue'
    },
    {
      title: 'Total Pharmacies',
      value: adminData.totalPharmacies,
      icon: '🏥',
      color: 'green'
    },
    {
      title: 'Total Orders',
      value: adminData.totalOrders,
      icon: '📦',
      color: 'purple'
    },
    {
      title: 'Total Revenue',
      value: `Rs. ${(adminData.totalRevenue / 100000).toFixed(1)}L`,
      icon: '💰',
      color: 'orange'
    },
    {
      title: 'Active Users',
      value: adminData.activeUsers,
      icon: '👥',
      color: 'cyan'
    },
    {
      title: 'Pending Approvals',
      value: adminData.pendingApprovals,
      icon: '⏳',
      color: 'red'
    },
  ];

  return (
    <div className="dashboard-container">
      <SidebarNav userRole="admin" onLogout={handleLogout} />

      <div className="dashboard-content">
        <TopBar userName={user?.username} userRole="Admin" />

        <div className="dashboard-main">
          <div className="dashboard-header">
            <h1>Admin Dashboard</h1>
            <p className="subtitle">System Overview & Analytics</p>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            {statCards.map((card, idx) => (
              <div key={idx} className={`stat-card stat-${card.color}`}>
                <div className="stat-icon">{card.icon}</div>
                <div className="stat-content">
                  <p className="stat-title">{card.title}</p>
                  <p className="stat-value">{card.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Content Grid */}
          <div className="dashboard-grid">
            {/* Recent Orders */}
            <div className="dashboard-card">
              <div className="card-header">
                <h2>Recent Orders</h2>
                <button className="btn-text">View All →</button>
              </div>
              <div className="orders-list">
                {adminData.recentOrders.map((order) => (
                  <div key={order.id} className="order-item">
                    <div className="order-left">
                      <p className="order-id">{order.id}</p>
                      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {order.distributor} → {order.pharmacy}
                      </p>
                    </div>
                    <div className="order-middle">
                      <p className="order-amount">Rs. {order.amount}</p>
                      <p className="order-date">{order.date}</p>
                    </div>
                    <div className="order-right">
                      <span className={`status-badge status-${order.status}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Distributors */}
            <div className="dashboard-card">
              <div className="card-header">
                <h2>Top Distributors</h2>
                <button className="btn-text">View All →</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {adminData.topDistributors.map((dist, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: '8px',
                    borderLeft: `4px solid var(--primary)`
                  }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {dist.name}
                      </p>
                      <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {dist.orders} orders
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: 0, fontWeight: 700, color: 'var(--success)' }}>
                        Rs. {(dist.revenue / 1000).toFixed(0)}K
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* System Statistics */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2>System Statistics</h2>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px'
            }}>
              <div style={{
                padding: '20px',
                backgroundColor: '#dbeafe',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <p style={{ margin: 0, color: '#1e40af', fontSize: '0.9rem', fontWeight: 500 }}>
                  Total Transactions
                </p>
                <p style={{
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: '#1e40af',
                  margin: '8px 0 0 0'
                }}>
                  {adminData.totalOrders}
                </p>
              </div>

              <div style={{
                padding: '20px',
                backgroundColor: '#d1fae5',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <p style={{ margin: 0, color: '#065f46', fontSize: '0.9rem', fontWeight: 500 }}>
                  System Health
                </p>
                <p style={{
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: '#065f46',
                  margin: '8px 0 0 0'
                }}>
                  99.8%
                </p>
              </div>

              <div style={{
                padding: '20px',
                backgroundColor: '#fed7aa',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <p style={{ margin: 0, color: '#92400e', fontSize: '0.9rem', fontWeight: 500 }}>
                  Avg. Order Value
                </p>
                <p style={{
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: '#92400e',
                  margin: '8px 0 0 0'
                }}>
                  Rs. 5K
                </p>
              </div>

              <div style={{
                padding: '20px',
                backgroundColor: '#f0fdf4',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <p style={{ margin: 0, color: '#166534', fontSize: '0.9rem', fontWeight: 500 }}>
                  User Retention
                </p>
                <p style={{
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: '#166534',
                  margin: '8px 0 0 0'
                }}>
                  87%
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2>Admin Actions</h2>
            </div>
            <div className="quick-actions" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px'
            }}>
              <button className="action-btn primary">👤 Manage Users</button>
              <button className="action-btn secondary">🏢 Manage Distributors</button>
              <button className="action-btn secondary">🏥 Manage Pharmacies</button>
              <button className="action-btn secondary">✓ Approve Users</button>
              <button className="action-btn secondary">📊 View Reports</button>
              <button className="action-btn secondary">⚙️ System Settings</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;