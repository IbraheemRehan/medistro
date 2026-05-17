import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import '../../styles/Auth.css';
import { FiMail, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

export default function VerifyEmail() {
  const { verifyEmail, resendOTP } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get('email') || '';

  const [otp, setOtp]         = useState(['', '', '', '', '', '']);
  const [email, setEmail]     = useState(emailFromUrl);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [devOtp, setDevOtp]       = useState(searchParams.get('dev_otp') || '');
  const inputRefs = useRef([]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    // Auto-submit when all filled
    if (value && index === 5) {
      const full = [...newOtp.slice(0, 5), value].join('');
      if (full.length === 6) setTimeout(() => handleVerify(full), 100);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      setTimeout(() => handleVerify(pasted), 100);
    }
  };

  const handleVerify = async (otpString) => {
    const code = otpString || otp.join('');
    if (code.length !== 6) { setError('Please enter the complete 6-digit OTP.'); return; }
    if (!email) { setError('Email address is missing.'); return; }
    setLoading(true);
    setError('');
    const result = await verifyEmail(email, code);
    setLoading(false);
    if (result.success) {
      setSuccess('Email verified! Redirecting to your dashboard…');
      setTimeout(() => navigate('/login'), 1500);
    } else {
      setError(result.message);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    if (!canResend || resending) return;
    setResending(true);
    setError('');
    const result = await resendOTP(email);
    setResending(false);
    if (result.success) {
      setSuccess('New OTP sent! Check your inbox.');
      if (result.dev_otp) setDevOtp(result.dev_otp);
      setCountdown(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-form-panel" style={{ flex: 1 }}>
        <div className="auth-form-card" style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: 16 }}><FiMail size={48} color="#1565C0" /></div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 8 }}>
            Verify Your Email
          </h2>
          <p style={{ color: '#6B7280', fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
            We sent a 6-digit code to{' '}
            <strong style={{ color: '#1565C0' }}>{email || 'your email'}</strong>.
            <br />Enter it below to activate your account.
          </p>

          {!emailFromUrl && (
            <div className="form-group" style={{ marginBottom: 20, textAlign: 'left' }}>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          )}

          {error   && <div className="alert alert-error"   style={{ marginBottom: 16, textAlign: 'left' }}><FiAlertCircle style={{marginRight:8}}/> {error}</div>}
          {success && <div className="alert alert-success" style={{ marginBottom: 16, textAlign: 'left' }}><FiCheckCircle style={{marginRight:8}}/> {success}</div>}
          
          {devOtp && (
            <div style={{ 
              background: '#EFF6FF', 
              border: '2px dashed #1565C0', 
              borderRadius: '12px', 
              padding: '16px', 
              marginBottom: 20,
              animation: 'fadeIn 0.5s ease-out'
            }}>
              <p style={{ margin: '0 0 4px', color: '#64748b', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
                Development Mode OTP
              </p>
              <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 800, color: '#1565C0', letterSpacing: '4px' }}>
                {devOtp}
              </h1>
              <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: '11px' }}>
                (Shown here because email delivery is limited in dev mode)
              </p>
            </div>
          )}

          {/* OTP boxes */}
          <div className="otp-container" onPaste={handlePaste} style={{ marginBottom: 28 }}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={el => inputRefs.current[i] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                className={`otp-input${digit ? ' filled' : ''}`}
                value={digit}
                onChange={e => handleOtpChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                aria-label={`OTP digit ${i + 1}`}
              />
            ))}
          </div>

          <button
            className="btn btn-primary btn-full btn-lg"
            onClick={() => handleVerify()}
            disabled={loading || otp.join('').length < 6}
          >
            {loading ? <><span className="spinner" /> Verifying…</> : <><FiCheckCircle style={{marginRight:8}}/> Verify Email</>}
          </button>

          {/* Resend */}
          <div style={{ marginTop: 20, fontSize: 14, color: '#6B7280' }}>
            Didn't receive the code?{' '}
            {canResend ? (
              <button
                className="auth-link"
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                onClick={handleResend}
                disabled={resending}
              >
                {resending ? 'Sending…' : 'Resend OTP'}
              </button>
            ) : (
              <span style={{ color: '#1565C0', fontWeight: 600 }}>
                Resend in {countdown}s
              </span>
            )}
          </div>

          <p style={{ marginTop: 20, fontSize: 13, color: '#9CA3AF' }}>
            <Link to="/login" className="auth-link" style={{ fontSize: 13 }}>← Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
