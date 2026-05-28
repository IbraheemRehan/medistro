import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiShield } from 'react-icons/fi';
import { MdOutlineAdminPanelSettings } from 'react-icons/md';
import '../../styles/Auth.css';

export default function AdminLogin() {
  const { adminLogin, isAuthenticated, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already logged in as admin, redirect
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    setError('');
    const result = await adminLogin(form.email, form.password);
    setLoading(false);
    if (!result.success) {
      setError(result.message);
    }
  };

  return (
    <div className="auth-page admin-login-page">
      <div className="admin-login-split">
        {/* Left Brand Panel */}
        <div className="admin-brand-panel">
          <div className="admin-brand-content">
            <div className="admin-brand-icon">
              <MdOutlineAdminPanelSettings />
            </div>
            <h1>Medistro Admin</h1>
            <p>Secure administrative access portal for authorized personnel only.</p>
            <div className="admin-brand-features">
              <div className="admin-brand-feature"><FiShield /> Enterprise Security</div>
              <div className="admin-brand-feature"><FiShield /> Role-Verified Access</div>
              <div className="admin-brand-feature"><FiShield /> Audit Logging</div>
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="auth-form-panel admin-form-panel">
          <div className="auth-form-card admin-form-card">
            {/* Warning Banner */}
            <div className="admin-warning-banner">
              <FiAlertCircle className="admin-warning-icon" />
              <p>
                <strong>Restricted Access.</strong> If you are not an administrator, please exit this page immediately.
              </p>
            </div>

            <div className="auth-form-header" style={{ marginTop: 24 }}>
              <div className="admin-form-logo">
                <MdOutlineAdminPanelSettings />
              </div>
              <h2>Administrator Login</h2>
              <p>Sign in with your admin credentials</p>
            </div>

            {error && (
              <div className="alert alert-error" style={{ marginBottom: 16 }}>
                <FiAlertCircle style={{ marginRight: 8 }} /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              <div className="form-group">
                <label className="form-label">Admin Email</label>
                <div className="input-wrapper">
                  <span className="input-icon"><FiMail /></span>
                  <input
                    id="admin-email"
                    name="email"
                    type="email"
                    className="form-input"
                    placeholder="admin@medistro.com"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Admin Password</label>
                <div className="input-wrapper">
                  <span className="input-icon"><FiLock /></span>
                  <input
                    id="admin-password"
                    name="password"
                    type={showPw ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Enter admin password"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                  />
                  <button type="button" className="input-suffix" onClick={() => setShowPw(v => !v)}>
                    {showPw ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-admin btn-full btn-lg"
                disabled={loading}
                style={{ marginTop: 8 }}
              >
                {loading ? <><span className="spinner" />&nbsp;Authenticating…</> : 'Access Admin Panel'}
              </button>
            </form>

            <div className="admin-back-link">
              <a href="/login" className="auth-link">← Back to main login</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
