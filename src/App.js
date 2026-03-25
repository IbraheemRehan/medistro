import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/App.css';

// Auth
import Login from './pages/Login';
import Register from './pages/Register';

// Distributor Pages
import DistributorDashboard from './pages/Distributor/Dashboard';
import StockManagement from './pages/Distributor/StockManagement';
import OrderManagement from './pages/Distributor/OrderManagement';
import EmployeeManagement from './pages/Distributor/EmployeeManagement';
import DistributorInvoices from './pages/Distributor/Invoices';

// Pharmacy Pages
import PharmacyDashboard from './pages/Pharmacy/Dashboard';
import PlaceOrder from './pages/Pharmacy/PlaceOrder';
import MyOrders from './pages/Pharmacy/MyOrders';
import PharmacyInvoices from './pages/Pharmacy/Invoices';
import FindDistributors from './pages/Pharmacy/FindDistributors';

// Admin Pages
import AdminDashboard from './pages/Admin/Dashboard';

// Context
import AuthContext from './context/AuthContext';
import { AuthProvider } from './context/AuthContext';

function AppContent() {
  const { user, loading } = React.useContext(AuthContext);

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <Routes>
      {!user ? (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </>
      ) : (
        <>
          {/* Admin Routes */}
          {user.role === 'admin' && (
            <>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="*" element={<Navigate to="/admin/dashboard" />} />
            </>
          )}

          {/* Distributor Routes */}
          {user.role === 'distributor' && (
            <>
              <Route path="/distributor/dashboard" element={<DistributorDashboard />} />
              <Route path="/distributor/stock" element={<StockManagement />} />
              <Route path="/distributor/orders" element={<OrderManagement />} />
              <Route path="/distributor/employees" element={<EmployeeManagement />} />
              <Route path="/distributor/invoices" element={<DistributorInvoices />} />
              <Route path="*" element={<Navigate to="/distributor/dashboard" />} />
            </>
          )}

          {/* Pharmacy Routes */}
          {user.role === 'pharmacy' && (
            <>
              <Route path="/pharmacy/dashboard" element={<PharmacyDashboard />} />
              <Route path="/pharmacy/place-order" element={<PlaceOrder />} />
              <Route path="/pharmacy/my-orders" element={<MyOrders />} />
              <Route path="/pharmacy/invoices" element={<PharmacyInvoices />} />
              <Route path="/pharmacy/distributors" element={<FindDistributors />} />
              <Route path="*" element={<Navigate to="/pharmacy/dashboard" />} />
            </>
          )}

          {/* Employee Routes (Limited) */}
          {user.role === 'employee' && (
            <>
              <Route path="/employee/tasks" element={<EmployeeManagement />} />
              <Route path="*" element={<Navigate to="/employee/tasks" />} />
            </>
          )}
        </>
      )}
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;