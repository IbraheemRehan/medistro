import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import SidebarNav from '../../components/SidebarNav';
import TopBar from '../../components/TopBar';
import '../../styles/Dashboard.css';

const DistributorDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Dummy data
  const [dashboardData] = useState({
    totalOrders: 156,
    pendingOrders: 23,
    totalRevenue: 145320,
    activePharmacies: 32,
    lowStockMedicines: 8,
    employees: 12,
    invoicesPending: 5,
    recentOrders: [
      {
        id: 'ORD-001',
        pharmacy: 'City Pharmacy',
        amount: 4500,
        status: 'pending',
        date: '2024-03-24'
      },
      {
        id: 'ORD-002',
        pharmacy: 'Health Plus',
        amount: 3200,
        status: 'approved',
        date: '2024-03-23'
      },
      {
        id: 'ORD-003',
        pharmacy: 'MediCare',
        amount: 5600,
        status: 'dispatched',
        date: '2024-03-22'
      },
    ],
    lowStockItems: [
      { name: 'Aspirin', sku: 'ASP-001', current: 8, threshold: 10 },
      { name: 'Paracetamol', sku: 'PAR-001', current: 5, threshold: 10 },
      { name: 'Antibiotics', sku: 'ANT-001', current: 3, threshold: 10 },
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
      link: '/distributor/orders'
    },
    {
      title: 'Pending Orders',
      value: dashboardData.pendingOrders,
      icon: '⏳',
      color: 'orange',
      link: '/distributor/orders'
    },
    {
      title: 'Total Revenue',
      value: `Rs. ${dashboardData.totalRevenue.toLocaleString()}`,
      icon: '💰',
      color: 'green',
      link: '/distributor/invoices'
    },
    {
      title: 'Active Pharmacies',
      value: dashboardData.activePharmacies,
      icon: '🏥',
      color: 'purple',
      link: '/distributor/stock'
    },
    {
      title: 'Low Stock Items',
      value: dashboardData.lowStockMedicines,
      icon: '⚠️',
      color: 'red',
      link: '/distributor/stock'
    },
    {
      title: 'Employees',
      value: dashboardData.employees,
      icon: '👥',
      color: 'cyan',
      link: '/distributor/employees'
    },
  ];

  return (
    <div className="dashboard-container">
      <SidebarNav userRole="distributor" onLogout={handleLogout} />
      
      <div className="dashboard-content">
        <TopBar userName={user?.username} userRole="Distributor" />

        <div className="dashboard-main">
          <div className="dashboard-header">
            <h1>Dashboard</h1>
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
                  onClick={() => navigate('/distributor/orders')}
                >
                  View All →
                </button>
              </div>
              <div className="orders-list">
                {dashboardData.recentOrders.map((order) => (
                  <div key={order.id} className="order-item">
                    <div className="order-left">
                      <p className="order-id">{order.id}</p>
                      <p className="order-pharmacy">{order.pharmacy}</p>
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

            {/* Low Stock Alert */}
            <div className="dashboard-card">
              <div className="card-header">
                <h2>Low Stock Alert</h2>
                <button
                  className="btn-text"
                  onClick={() => navigate('/distributor/stock')}
                >
                  Manage Stock →
                </button>
              </div>
              <div className="low-stock-list">
                {dashboardData.lowStockItems.map((item, idx) => (
                  <div key={idx} className="low-stock-item">
                    <div className="item-info">
                      <p className="item-name">{item.name}</p>
                      <p className="item-sku">{item.sku}</p>
                    </div>
                    <div className="item-stock">
                      <div className="progress-bar">
                        <div
                          className="progress-fill danger"
                          style={{
                            width: `${(item.current / item.threshold) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <p className="stock-text">
                        {item.current} of {item.threshold}
                      </p>
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
                onClick={() => navigate('/distributor/orders')}
              >
                📋 View Orders
              </button>
              <button
                className="action-btn secondary"
                onClick={() => navigate('/distributor/stock')}
              >
                📦 Manage Stock
              </button>
              <button
                className="action-btn secondary"
                onClick={() => navigate('/distributor/employees')}
              >
                👥 Manage Employees
              </button>
              <button
                className="action-btn secondary"
                onClick={() => navigate('/distributor/invoices')}
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

export default DistributorDashboard;