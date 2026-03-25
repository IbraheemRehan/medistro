import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import '../styles/Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  // Demo credentials
  const demoAccounts = {
    'distributor@demo.com': {
      password: 'demo123',
      user: {
        _id: '1',
        email: 'distributor@demo.com',
        role: 'distributor',
        username: 'distributor_demo',
        status: 'active'
      }
    },
    'pharmacy@demo.com': {
      password: 'demo123',
      user: {
        _id: '2',
        email: 'pharmacy@demo.com',
        role: 'pharmacy',
        username: 'pharmacy_demo',
        status: 'active'
      }
    },
    'admin@demo.com': {
      password: 'demo123',
      user: {
        _id: '3',
        email: 'admin@demo.com',
        role: 'admin',
        username: 'admin_demo',
        status: 'active'
      }
    },
    'employee@demo.com': {
      password: 'demo123',
      user: {
        _id: '4',
        email: 'employee@demo.com',
        role: 'employee',
        username: 'employee_demo',
        status: 'active'
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      const account = demoAccounts[email];
      if (account && account.password === password) {
        const token = 'demo_token_' + Date.now();
        login(account.user, token);

        // Navigate based on role
        const roleRoutes = {
          distributor: '/distributor/dashboard',
          pharmacy: '/pharmacy/dashboard',
          admin: '/admin/dashboard',
          employee: '/employee/tasks'
        };

        navigate(roleRoutes[account.user.role] || '/');
      } else {
        setError('Invalid email or password. Use demo credentials.');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-content">
          <div className="auth-header">
            <div className="auth-logo">
              <div className="logo-icon">💊</div>
            </div>
            <h1>MedDistro</h1>
            <p className="tagline">Pharmacy Distribution Management</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>

            {error && <div className="form-error">{error}</div>}

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Scrollable demo section */}
          <div className="demo-accounts">
            <p className="demo-title">Demo Credentials:</p>
            <div className="demo-list">
              <div className="demo-item">
                <span className="role-badge distributor">Distributor</span>
                <code>distributor@demo.com / demo123</code>
              </div>
              <div className="demo-item">
                <span className="role-badge pharmacy">Pharmacy</span>
                <code>pharmacy@demo.com / demo123</code>
              </div>
              <div className="demo-item">
                <span className="role-badge admin">Admin</span>
                <code>admin@demo.com / demo123</code>
              </div>
              <div className="demo-item">
                <span className="role-badge employee">Employee</span>
                <code>employee@demo.com / demo123</code>
              </div>
            </div>
          </div>

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="link">
                Sign up here
              </Link>
            </p>
          </div>
        </div>

        {/* Scrollable sidebar */}
        <div className="auth-sidebar">
          <div className="sidebar-content">
            <h2>Welcome to MedDistro</h2>
            <ul className="features-list">
              <li>📦 Smart Stock Management</li>
              <li>🛒 Order Placement & Tracking</li>
              <li>👥 Employee Task Management</li>
              <li>📄 Invoice Generation</li>
              <li>📊 Real-time Analytics</li>
              <li>🔐 Secure Authentication</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;