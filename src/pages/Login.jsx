import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import PublicTopBar from '../components/PublicTopBar';
import '../styles/Auth.css';
import { FiMail, FiLock, FiEye, FiEyeOff, FiCheckCircle, FiAlertCircle, FiXCircle } from 'react-icons/fi';
import { MdOutlineLocalPharmacy } from 'react-icons/md';
import API from '../config/api.config';
import toast from 'react-hot-toast';

const GOOGLE_AUTH_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:4000'}/api/v1/users/auth/google`;

export default function Login() {
  const { login, loginWithGoogleToken, isAuthenticated, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeRole, setActiveRole] = useState('pharmacy');
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [needsVerify, setNeedsVerify] = useState(null); // email that needs verification

  // Suspension state
  const [blockedInfo, setBlockedInfo] = useState(null);
  const [reviewMessage, setReviewMessage] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Handle Google OAuth redirect callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gToken = params.get('token');
    const gRole  = params.get('role');
    const gError = params.get('error');
    if (gToken) {
      loginWithGoogleToken(gToken, gRole);
      window.history.replaceState({}, '', '/login');
    }
    if (gError) setError('Google login failed. Please try again.');
  }, [loginWithGoogleToken]);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      const routes = { admin: '/admin/dashboard', distributor: '/distributor/dashboard', pharmacy: '/pharmacy/dashboard', employee: '/employee/dashboard' };
      navigate(routes[user.role] || '/login');
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
    // Pass the selected role tab so the backend validates role match
    const result = await login(form.email, form.password, activeRole);
    setLoading(false);
    if (!result.success) {
      if (result.requiresVerification) {
        setNeedsVerify({
          email: result.email || form.email,
        });
      } else if (result.isBlocked) {
        setBlockedInfo({
          userId: result.userId,
          reason: result.reason,
          reviewRequested: result.reviewRequested,
        });
      } else {
        setError(result.message);
      }
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewMessage.trim()) return toast.error("Please enter a message");
    try {
      setReviewSubmitting(true);
      await API.post('/api/v1/users/request-review', {
        userId: blockedInfo.userId,
        message: reviewMessage
      });
      setBlockedInfo(prev => ({ ...prev, reviewRequested: true }));
      toast.success("Review request submitted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit request");
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (needsVerify) {
    const emailToVerify = typeof needsVerify === 'object' ? needsVerify.email : needsVerify;
    return (
      <div className="auth-page">
        <PublicTopBar />
        <div className="auth-split">
          <div className="auth-form-panel">
            <div className="auth-verify-notice">
              <div className="auth-verify-icon"><FiMail /></div>
              <h2>Verify Your Email</h2>
              <p>Your email <strong>{emailToVerify}</strong> is not verified yet. Please check your inbox for the OTP.</p>
              <Link to={`/verify-email?email=${encodeURIComponent(emailToVerify)}`} className="btn btn-primary btn-full" style={{marginTop:24}}>
                Enter OTP to Verify
              </Link>
              <button className="btn btn-secondary btn-full" style={{marginTop:12}} onClick={() => setNeedsVerify(null)}>
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Blocked modal overlay (render inline for simplicity)
  const renderBlockedModal = () => {
    if (!blockedInfo) return null;
    return (
      <div className="complete-profile-overlay" style={{ zIndex: 9999 }}>
        <div className="complete-profile-modal" style={{ maxWidth: 480 }}>
          <div className="complete-profile-modal-header">
            <div className="complete-profile-modal-icon" style={{ background: "var(--danger)" }}>
              <FiXCircle />
            </div>
            <h2>Account Suspended</h2>
            <p style={{ color: "var(--danger)" }}>Your account has been temporarily blocked from accessing the platform.</p>
          </div>
          <div className="complete-profile-modal-body">
            <div style={{ background: "var(--red-50)", padding: 12, borderRadius: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--danger)", display: "block", marginBottom: 4 }}>Reason for Suspension:</span>
              <p style={{ fontSize: 14, color: "var(--red-900)", margin: 0 }}>"{blockedInfo.reason}"</p>
            </div>

            {blockedInfo.reviewRequested ? (
              <div style={{ background: "var(--blue-50)", padding: 16, borderRadius: 8, textAlign: "center" }}>
                <span style={{ color: "var(--brand)", fontWeight: 600 }}>Review in Progress</span>
                <p style={{ fontSize: 13, margin: "4px 0 0", color: "var(--gray-600)" }}>Your appeal has been submitted and is currently being reviewed by our administration team. We will notify you of the outcome.</p>
                <button className="btn btn-secondary btn-full" style={{ marginTop: 16 }} onClick={() => setBlockedInfo(null)}>Back to Login</button>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit}>
                <div className="form-group">
                  <label className="form-label">Request an Appeal</label>
                  <textarea
                    className="form-input"
                    rows={4}
                    placeholder="Provide additional details or context for why your account should be reinstated..."
                    value={reviewMessage}
                    onChange={e => setReviewMessage(e.target.value)}
                    style={{ resize: "vertical" }}
                  />
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setBlockedInfo(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={reviewSubmitting}>
                    {reviewSubmitting ? "Submitting..." : "Submit Appeal"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="auth-page">
      {renderBlockedModal()}
      <PublicTopBar />
      <div className="auth-split">
        {/* Left brand panel */}
        <div className="auth-brand-panel">
          <div className="auth-brand-content">
            <div className="auth-logo"><MdOutlineLocalPharmacy /></div>
            <h1>Medistro</h1>
            <p>The professional medicine distribution platform connecting distributors and pharmacies seamlessly.</p>
            <div className="auth-features">
              <div className="auth-feature"><span><FiCheckCircle /></span> Real-time inventory management</div>
              <div className="auth-feature"><span><FiCheckCircle /></span> Secure order placement & tracking</div>
              <div className="auth-feature"><span><FiCheckCircle /></span> Smart invoicing & analytics</div>
              <div className="auth-feature"><span><FiCheckCircle /></span> Multi-role access control</div>
            </div>
          </div>
        </div>

        {/* Right form panel */}
        <div className="auth-form-panel">
          <div className="auth-form-card">
            <div className="auth-form-header">
              <h2>Welcome back</h2>
              <p>Sign in to your Medistro account</p>
            </div>

            {/* Role tabs */}
            <div className="auth-role-tabs">
              {['pharmacy','distributor','employee'].map(r => (
                <button
                  key={r}
                  className={`auth-role-tab${activeRole === r ? ' active' : ''}`}
                  onClick={() => { setActiveRole(r); setError(''); }}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>

            {/* Google OAuth */}
            <a href={GOOGLE_AUTH_URL} className="btn btn-google btn-full">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width={20} height={20}/>
              Continue with Google
            </a>

            <div className="divider">or sign in with email</div>

            {error && <div className="alert alert-error" style={{marginTop:16, marginBottom: 0}}><FiAlertCircle style={{marginRight:8}}/> {error}</div>}

            <form onSubmit={handleSubmit} className="auth-form" style={{marginTop:16}} noValidate>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <span className="input-icon"><FiMail /></span>
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    className="form-input"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="form-group">
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <label className="form-label">Password</label>
                  <Link to="/forgot-password" className="auth-forgot-link">Forgot password?</Link>
                </div>
                <div className="input-wrapper">
                  <span className="input-icon"><FiLock /></span>
                  <input
                    id="login-password"
                    name="password"
                    type={showPw ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                  />
                  <button type="button" className="input-suffix" onClick={() => setShowPw(v => !v)}>
                    {showPw ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{marginTop:8}}>
                {loading ? <><span className="spinner"/>&nbsp;Signing in…</> : `Sign In as ${activeRole.charAt(0).toUpperCase()+activeRole.slice(1)}`}
              </button>
            </form>

            <p className="auth-footer-text">
              Don't have an account?{' '}
              <Link to="/register" className="auth-link">Create one free</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}