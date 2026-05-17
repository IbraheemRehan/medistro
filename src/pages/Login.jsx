import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import PublicTopBar from '../components/PublicTopBar';
import '../styles/Auth.css';
import { FiMail, FiLock, FiEye, FiEyeOff, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { MdOutlineLocalPharmacy } from 'react-icons/md';

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
    // Pass undefined for role so the backend auto-resolves it. This allows admins to log in via any tab.
    const result = await login(form.email, form.password, undefined);
    setLoading(false);
    if (!result.success) {
      if (result.requiresVerification) {
        setNeedsVerify({
          email: result.email || form.email,
          dev_otp: result.dev_otp
        });
      } else {
        setError(result.message);
      }
    }
  };

  if (needsVerify) {
    const emailToVerify = typeof needsVerify === 'object' ? needsVerify.email : needsVerify;
    const devOtpToVerify = typeof needsVerify === 'object' ? needsVerify.dev_otp : '';
    return (
      <div className="auth-page">
        <PublicTopBar />
        <div className="auth-split">
          <div className="auth-form-panel">
            <div className="auth-verify-notice">
              <div className="auth-verify-icon"><FiMail /></div>
              <h2>Verify Your Email</h2>
              <p>Your email <strong>{emailToVerify}</strong> is not verified yet. Please check your inbox for the OTP.</p>
              <Link to={`/verify-email?email=${encodeURIComponent(emailToVerify)}${devOtpToVerify ? `&dev_otp=${devOtpToVerify}` : ''}`} className="btn btn-primary btn-full" style={{marginTop:24}}>
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

  return (
    <div className="auth-page">
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