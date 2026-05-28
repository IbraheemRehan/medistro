import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import './styles/App.css';

// Auth pages
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/Shared/About';
import VerifyEmail from './pages/Shared/VerifyEmail';
import ForgotPassword from './pages/Shared/ForgotPassword';
import AdminLogin from './pages/Admin/AdminLogin';
import { Toaster } from 'react-hot-toast';

// Distributor pages
import DistributorDashboard  from './pages/Distributor/Dashboard';
import StockManagement       from './pages/Distributor/StockManagement';
import OrderManagement       from './pages/Distributor/OrderManagement';
import EmployeeManagement    from './pages/Distributor/EmployeeManagement';
import DistributorInvoices   from './pages/Distributor/Invoices';

// Employee pages
import EmployeeDashboard from './pages/Employee/Dashboard';

// Pharmacy pages
import PharmacyDashboard from './pages/Pharmacy/Dashboard';
import PlaceOrder        from './pages/Pharmacy/PlaceOrder';
import MyOrders          from './pages/Pharmacy/MyOrders';
import PharmacyInvoices  from './pages/Pharmacy/Invoices';
import FindDistributors  from './pages/Pharmacy/FindDistributors';
import Cart              from './pages/Pharmacy/Cart';

// Admin pages
import AdminDashboard from './pages/Admin/Dashboard';
import AdminModeration from './pages/Admin/Moderation';

// Shared
import Profile from './pages/Shared/Profile';

// Context
import AuthContext, { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Google OAuth callback handler component
function GoogleOAuthCallback() {
  const { loginWithGoogleToken } = React.useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const navigate = React.useCallback((path) => window.location.replace(path), []);

  React.useEffect(() => {
    const token = searchParams.get('token');
    const role  = searchParams.get('role');
    if (token) {
      loginWithGoogleToken(token, role);
      const routes = { admin:'/admin/dashboard', distributor:'/distributor/dashboard', pharmacy:'/pharmacy/dashboard', employee:'/employee/dashboard' };
      setTimeout(() => window.location.replace(routes[role] || '/login'), 300);
    } else {
      window.location.replace('/login?error=google_failed');
    }
  }, [searchParams, loginWithGoogleToken]);

  return (
    <div className="loading-screen">
      <div className="spinner" style={{ width:32, height:32 }}/>
      <p>Completing Google sign-in…</p>
    </div>
  );
}

function AppContent() {
  const { user, loading } = React.useContext(AuthContext);

  if (loading) return <div className="loading-screen">Loading…</div>;

  return (
    <Routes>
      {/* Public routes (always accessible) */}
      <Route path="/about"           element={<About />} />
      <Route path="/verify-email"    element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/admin-login"     element={<AdminLogin />} />
      <Route path="/auth/google/callback" element={<GoogleOAuthCallback />} />

      {!user ? (
        <>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*"         element={<Navigate to="/login" />} />
        </>
      ) : (
        <>
          {/* Admin */}
          {user.role === 'admin' && (
            <>
              <Route path="/admin/dashboard"  element={<AdminDashboard />} />
              <Route path="/admin/moderation" element={<AdminModeration />} />
              <Route path="/admin/users"      element={<AdminModeration />} />
              <Route path="/profile"          element={<Profile />} />
              <Route path="*"                 element={<Navigate to="/admin/dashboard" />} />
            </>
          )}

          {/* Distributor */}
          {user.role === 'distributor' && (
            <>
              <Route path="/distributor/dashboard" element={<DistributorDashboard />} />
              <Route path="/distributor/stock"     element={<StockManagement />} />
              <Route path="/distributor/orders"    element={<OrderManagement />} />
              <Route path="/distributor/employees" element={<EmployeeManagement />} />
              <Route path="/distributor/invoices"  element={<DistributorInvoices />} />
              <Route path="/profile"               element={<Profile />} />
              <Route path="*"                      element={<Navigate to="/distributor/dashboard" />} />
            </>
          )}

          {/* Pharmacy */}
          {user.role === 'pharmacy' && (
            <>
              <Route path="/pharmacy/dashboard"    element={<PharmacyDashboard />} />
              <Route path="/pharmacy/place-order"  element={<PlaceOrder />} />
              <Route path="/pharmacy/cart"         element={<Cart />} />
              <Route path="/pharmacy/my-orders"    element={<MyOrders />} />
              <Route path="/pharmacy/invoices"     element={<PharmacyInvoices />} />
              <Route path="/pharmacy/distributors" element={<FindDistributors />} />
              <Route path="/profile"               element={<Profile />} />
              <Route path="*"                      element={<Navigate to="/pharmacy/dashboard" />} />
            </>
          )}

          {/* Employee */}
          {user.role === 'employee' && (
            <>
              <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
              <Route path="/profile"            element={<Profile />} />
              <Route path="*"                   element={<Navigate to="/employee/dashboard" />} />
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
        <SocketProvider>
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
          <AppContent />
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;