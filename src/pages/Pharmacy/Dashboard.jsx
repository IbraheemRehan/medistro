import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import SidebarNav from '../../components/SidebarNav';
import TopBar from '../../components/TopBar';
import '../../styles/Dashboard.css';

const PharmacyDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [dashboardData] = useState({
    totalOrders: 45,
    pendingOrders: 3,
    totalSpent: 125450,
    activeDistributors: 8,
    recentOrders: [
      {
        id: 'ORD-2024-001',
        distributor: 'Prime Distributor',
        amount: 4500,
        status: 'delivered',
        date: '2024-03-24'
      },
      {
        id: 'ORD-2024-002',
        distributor: 'Health Supplies Co',
        amount: 3200,
        status: 'dispatched',
        date: '2024-03-23'
      },
      {
        id: 'ORD-2024-003',
        distributor: 'MediPro Dist',
        amount: 5600,
        status: 'approved',
        date: '2024-03-22'
      },
    ],
    lowInventory: [
      { name: 'Aspirin', current: 20, reorderLevel: 50 },
      { name: 'Paracetamol', current: 15, reorderLevel: 50 },
      { name: 'Antibiotics', current: 10, reorderLevel: 30 },
    ]
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const statCards = [
    {
      title: 'Total Orders',
      value: dashboardData.totalOrders,
      icon: '📦',
      color: 'blue',
      link: '/pharmacy/my-orders'
    },
    {
      title: 'Pending Orders',
      value: dashboardData.pendingOrders,
      icon: '⏳',
      color: 'orange',
      link: '/pharmacy/my-orders'
    },
    {
      title: 'Total Spent',
      value: `Rs. ${dashboardData.totalSpent.toLocaleString()}`,
      icon: '💰',
      color: 'green',
      link: '/pharmacy/invoices'
    },
    {
      title: 'Active Distributors',
      value: dashboardData.activeDistributors,
      icon: '🏢',
      color: 'purple',
      link: '/pharmacy/distributors'
    },
  ];

  return (
    <div className="dashboard-container">
      <SidebarNav userRole="pharmacy" onLogout={handleLogout} />

      <div className="dashboard-content">
        <TopBar userName={user?.username} userRole="Pharmacy" />

        <div className="dashboard-main">
          <div className="dashboard-header">
            <h1>Pharmacy Dashboard</h1>
            <p className="subtitle">Welcome back, {user?.username}!</p>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            {statCards.map((card, idx) => (
              <div
                key={idx}
                className={`stat-card stat-${card.color}`}
                onClick={() => navigate(card.link)}
                style={{ cursor: 'pointer' }}
              >
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
                <button
                  className="btn-text"
                  onClick={() => navigate('/pharmacy/my-orders')}
                >
                  View All →
                </button>
              </div>
              <div className="orders-list">
                {dashboardData.recentOrders.map((order) => (
                  <div key={order.id} className="order-item">
                    <div className="order-left">
                      <p className="order-id">{order.id}</p>
                      <p className="order-distributor">{order.distributor}</p>
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

            {/* Low Inventory Alert */}
            <div className="dashboard-card">
              <div className="card-header">
                <h2>Low Inventory Items</h2>
                <button
                  className="btn-text"
                  onClick={() => navigate('/pharmacy/place-order')}
                >
                  Order Now →
                </button>
              </div>
              <div className="inventory-list">
                {dashboardData.lowInventory.map((item, idx) => (
                  <div key={idx} className="inventory-item">
                    <div className="item-info">
                      <p className="item-name">{item.name}</p>
                      <p className="item-level">Reorder Level: {item.reorderLevel}</p>
                    </div>
                    <div className="item-stock">
                      <div className="progress-bar">
                        <div
                          className="progress-fill warning"
                          style={{
                            width: `${(item.current / item.reorderLevel) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <p className="stock-text">{item.current} units</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2>Quick Actions</h2>
            </div>
            <div className="quick-actions">
              <button
                className="action-btn primary"
                onClick={() => navigate('/pharmacy/place-order')}
              >
                🛒 Place New Order
              </button>
              <button
                className="action-btn secondary"
                onClick={() => navigate('/pharmacy/distributors')}
              >
                🔍 Find Distributors
              </button>
              <button
                className="action-btn secondary"
                onClick={() => navigate('/pharmacy/my-orders')}
              >
                📋 View Orders
              </button>
              <button
                className="action-btn secondary"
                onClick={() => navigate('/pharmacy/invoices')}
              >
                📄 View Invoices
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyDashboard;