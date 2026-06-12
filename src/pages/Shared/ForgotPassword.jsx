import React, { useState, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import '../../styles/Auth.css';
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiCheckCircle, FiUnlock, FiSend, FiKey } from 'react-icons/fi';

const STEPS = ['Email', 'OTP', 'New Password'];

export default function ForgotPassword() {
  const { sendForgotPasswordOTP, resetPassword } = useContext(AuthContext);
  const navigate = useNavigate();

  const [step, setStep]     = useState(0);
  const [email, setEmail]   = useState('');
  const [otp, setOtp]       = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');

  const inputRefs = useRef([]);

  const handleOtpChange = (i, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp]; next[i] = value; setOtp(next); setError('');
    if (value && i < 5) inputRefs.current[i + 1]?.focus();
  };
  const handleOtpKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputRefs.current[i - 1]?.focus();
  };
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) setOtp(pasted.split(''));
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError('Please enter your email.'); return; }
    setLoading(true); setError('');
    const res = await sendForgotPasswordOTP(email);
    setLoading(false);
    if (res.success) { 

      setStep(1); 
    }
    else setError(res.message);
  };

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) { setError('Enter the complete 6-digit OTP.'); return; }
    setError('');
    setStep(2);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirmPw) { setError('Passwords do not match.'); return; }
    setLoading(true); setError('');
    const res = await resetPassword(email, otp.join(''), password);
    setLoading(false);
    if (res.success) {
      setSuccess('Password reset! Redirecting to login…');
      setTimeout(() => navigate('/login'), 2000);
    } else setError(res.message);
  };

  const stepStatus = (i) => i < step ? 'done' : i === step ? 'active' : 'pending';

  return (
    <div className="auth-page">
      <div className="auth-form-panel" style={{ flex: 1 }}>
        <div className="auth-form-card">
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ marginBottom: 10 }}><FiUnlock size={48} color="#1565C0" /></div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111827' }}>Reset Password</h2>
            <p style={{ color: '#6B7280', fontSize: 14, marginTop: 4 }}>
              Step {step + 1} of {STEPS.length} — {STEPS[step]}
            </p>
          </div>

          {/* Step indicator */}
          <div className="auth-stepper" style={{ marginBottom: 24 }}>
            {STEPS.map((label, i) => (
              <React.Fragment key={i}>
                <div className={`auth-step ${stepStatus(i)}`}>
                  <div className="auth-step-circle">{i < step ? '✓' : i + 1}</div>
                  <span className="auth-step-label">{label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`auth-step-connector${i < step ? ' done' : ''}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {error   && <div className="alert alert-error"   style={{ marginBottom: 16 }}><FiAlertCircle style={{marginRight:8}}/> {error}</div>}
          {success && <div className="alert alert-success" style={{ marginBottom: 16 }}><FiCheckCircle style={{marginRight:8}}/> {success}</div>}

          {/* Step 0: Enter email */}
          {step === 0 && (
            <form onSubmit={handleSendOTP} className="auth-form">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <span className="input-icon"><FiMail /></span>
                  <input
                    id="fp-email" type="email" className="form-input"
                    placeholder="you@example.com" value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    autoFocus
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                {loading ? <><span className="spinner" /> Sending OTP…</> : <><FiSend style={{marginRight:8}}/> Send Reset OTP</>}
              </button>
            </form>
          )}

          {/* Step 1: Enter OTP */}
          {step === 1 && (
            <form onSubmit={handleVerifyOTP}>
              <p style={{ textAlign: 'center', fontSize: 14, color: '#6B7280', marginBottom: 20 }}>
                Check <strong style={{ color: '#1565C0' }}>{email}</strong> for your reset code.
              </p>
              <div className="otp-container" onPaste={handlePaste} style={{ marginBottom: 28 }}>
                {otp.map((digit, i) => (
                  <input
                    key={i} ref={el => inputRefs.current[i] = el}
                    type="text" inputMode="numeric" maxLength={1}
                    className={`otp-input${digit ? ' filled' : ''}`}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                  />
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setStep(0); setError(''); }}>← Back</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={otp.join('').length < 6}>
                  Verify OTP →
                </button>
              </div>
            </form>
          )}

          {/* Step 2: New password */}
          {step === 2 && (
            <form onSubmit={handleReset} className="auth-form">
              <div className="form-group">
                <label className="form-label">New Password</label>
                <div className="input-wrapper">
                  <span className="input-icon"><FiLock /></span>
                  <input
                    id="fp-newpw" type={showPw ? 'text' : 'password'} className="form-input"
                    placeholder="Min. 6 characters" value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                  />
                  <button type="button" className="input-suffix" onClick={() => setShowPw(v => !v)}>{showPw ? <FiEyeOff /> : <FiEye />}</button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <div className="input-wrapper">
                  <span className="input-icon"><FiLock /></span>
                  <input
                    id="fp-confirmpw" type="password" className="form-input"
                    placeholder="Repeat password" value={confirmPw}
                    onChange={e => { setConfirmPw(e.target.value); setError(''); }}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                {loading ? <><span className="spinner" /> Resetting…</> : <><FiKey style={{marginRight:8}}/> Reset Password</>}
              </button>
            </form>
          )}

          <p className="auth-footer-text" style={{ marginTop: 20 }}>
            <Link to="/login" className="auth-link" style={{ fontSize: 13 }}>← Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
