import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import PublicTopBar from '../components/PublicTopBar';
import '../styles/Auth.css';
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiUser, FiZap, FiBarChart2, FiCheck } from 'react-icons/fi';
import { MdOutlineLocalPharmacy, MdLocalShipping } from 'react-icons/md';

const STEPS = ['Role', 'Account', 'Profile'];

const ROLES = [
  { id: 'pharmacy',    icon: <MdOutlineLocalPharmacy />, title: 'Pharmacy',    desc: 'Order medicines from distributors' },
  { id: 'distributor', icon: <MdLocalShipping />, title: 'Distributor', desc: 'Sell & distribute medicines' },
];

export default function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [showPw, setShowPw] = useState(false);

  const [account, setAccount] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [profile, setProfile] = useState({
    // shared
    address: '',
    // distributor
    companyName: '', licenseNumber: '', NTN: '', contactNumber: '', alternateNumber: '', businessEmail: '',
    // pharmacy
    pharmacyName: '', drugLicenseNumber: '', ownerName: '', creditLimit: '',
  });

  const handleAccount = e => { setAccount(a => ({ ...a, [e.target.name]: e.target.value })); setError(''); };
  const handleProfile = e => { setProfile(p => ({ ...p, [e.target.name]: e.target.value })); setError(''); };

  const validateAccount = () => {
    if (!account.username.trim()) return 'Username is required.';
    if (!account.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account.email)) return 'Valid email is required.';
    if (account.password.length < 6) return 'Password must be at least 6 characters.';
    if (account.password !== account.confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const validateProfile = () => {
    if (!profile.address.trim()) return 'Address is required.';
    if (role === 'distributor') {
      if (!profile.companyName || !profile.licenseNumber || !profile.NTN || !profile.contactNumber || !profile.businessEmail)
        return 'All distributor fields are required.';
    }
    if (role === 'pharmacy') {
      if (!profile.pharmacyName || !profile.drugLicenseNumber || !profile.ownerName || !profile.contactNumber || !profile.businessEmail)
        return 'All pharmacy fields are required.';
    }
    return null;
  };

  const nextStep = () => {
    if (step === 0 && !role) { setError('Please select a role.'); return; }
    if (step === 1) { const e = validateAccount(); if (e) { setError(e); return; } }
    setError('');
    setStep(s => s + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateProfile();
    if (err) { setError(err); return; }
    setLoading(true);
    setError('');

    const payload = { ...account, role, ...profile };
    const result = await register(payload);
    setLoading(false);

    if (result.success) {
      let target = `/verify-email?email=${encodeURIComponent(account.email)}`;
      navigate(target);
    } else {
      setError(result.message);
    }
  };

  const stepStatus = (i) => {
    if (i < step) return 'done';
    if (i === step) return 'active';
    return 'pending';
  };

  return (
    <div className="auth-page">
      <PublicTopBar />
      <div className="auth-split">
        <div className="auth-brand-panel">
          <div className="auth-brand-content">
            <div className="auth-logo"><MdOutlineLocalPharmacy /></div>
            <h1>Join Medistro</h1>
            <p>Create your account and start managing your medicine supply chain today.</p>
            <div className="auth-features">
              <div className="auth-feature"><span><FiLock /></span> Bank-grade security</div>
              <div className="auth-feature"><span><FiZap /></span> Instant account activation</div>
              <div className="auth-feature"><span><FiBarChart2 /></span> Real-time analytics</div>
              <div className="auth-feature"><span><FiMail /></span> Email OTP verification</div>
            </div>
          </div>
        </div>

        <div className="auth-form-panel">
          <div className="auth-form-card">
            <div className="auth-form-header">
              <h2>Create Account</h2>
              <p>Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>
            </div>

            {/* Step indicator */}
            <div className="auth-stepper">
              {STEPS.map((label, i) => (
                <React.Fragment key={i}>
                  <div className={`auth-step ${stepStatus(i)}`}>
                    <div className="auth-step-circle">
                      {i < step ? '✓' : i + 1}
                    </div>
                    <span className="auth-step-label">{label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`auth-step-connector${i < step ? ' done' : ''}`} />
                  )}
                </React.Fragment>
              ))}
            </div>

            {error && <div className="alert alert-error" style={{marginBottom:16}}><FiAlertCircle style={{marginRight:8}}/> {error}</div>}

            {/* STEP 0 — Role Selection */}
            {step === 0 && (
              <div>
                <p style={{fontSize:14,color:'#6B7280',marginBottom:16}}>What best describes your business?</p>
                <div className="role-cards">
                  {ROLES.map(r => (
                    <div key={r.id} className={`role-card${role === r.id ? ' selected' : ''}`} onClick={() => { setRole(r.id); setError(''); }}>
                      <div className="role-card-icon">{r.icon}</div>
                      <div className="role-card-title">{r.title}</div>
                      <div className="role-card-desc">{r.desc}</div>
                    </div>
                  ))}
                </div>
                <button className="btn btn-primary btn-full btn-lg" style={{marginTop:24}} onClick={nextStep}>
                  Continue →
                </button>
              </div>
            )}

            {/* STEP 1 — Account Info */}
            {step === 1 && (
              <div className="auth-form">
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <div className="input-wrapper">
                    <span className="input-icon"><FiUser /></span>
                    <input id="reg-username" name="username" type="text" className="form-input" placeholder="johndoe" value={account.username} onChange={handleAccount} autoComplete="username"/>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="input-wrapper">
                    <span className="input-icon"><FiMail /></span>
                    <input id="reg-email" name="email" type="email" className="form-input" placeholder="you@example.com" value={account.email} onChange={handleAccount} autoComplete="email"/>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="input-wrapper">
                    <span className="input-icon"><FiLock /></span>
                    <input id="reg-password" name="password" type={showPw ? 'text' : 'password'} className="form-input" placeholder="Min. 6 characters" value={account.password} onChange={handleAccount}/>
                    <button type="button" className="input-suffix" onClick={() => setShowPw(v => !v)}>{showPw ? <FiEyeOff /> : <FiEye />}</button>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <div className="input-wrapper">
                    <span className="input-icon"><FiLock /></span>
                    <input id="reg-confirm" name="confirmPassword" type="password" className="form-input" placeholder="Repeat password" value={account.confirmPassword} onChange={handleAccount}/>
                  </div>
                </div>
                <div style={{display:'flex',gap:10}}>
                  <button className="btn btn-secondary" style={{flex:1}} onClick={() => { setStep(0); setError(''); }}>← Back</button>
                  <button className="btn btn-primary" style={{flex:2}} onClick={nextStep}>Continue →</button>
                </div>
              </div>
            )}

            {/* STEP 2 — Profile Info */}
            {step === 2 && (
              <form className="auth-form" onSubmit={handleSubmit} noValidate>
                {role === 'distributor' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Company Name</label>
                      <input id="reg-company" name="companyName" className="form-input" placeholder="MedCo Pharmaceuticals" value={profile.companyName} onChange={handleProfile}/>
                    </div>
                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">License Number</label>
                        <input id="reg-license" name="licenseNumber" className="form-input" placeholder="LIC-00001" value={profile.licenseNumber} onChange={handleProfile}/>
                      </div>
                      <div className="form-group">
                        <label className="form-label">NTN</label>
                        <input id="reg-ntn" name="NTN" className="form-input" placeholder="1234567-8" value={profile.NTN} onChange={handleProfile}/>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Contact Number</label>
                      <input id="reg-contact" name="contactNumber" className="form-input" placeholder="+92 300 0000000" value={profile.contactNumber} onChange={handleProfile}/>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Alternate Number (Optional)</label>
                      <input name="alternateNumber" className="form-input" placeholder="+92 311 0000000" value={profile.alternateNumber} onChange={handleProfile}/>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Business Email</label>
                      <input name="businessEmail" className="form-input" placeholder="accounts@medco.com" value={profile.businessEmail} onChange={handleProfile}/>
                    </div>
                  </>
                )}

                {role === 'pharmacy' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Pharmacy Name</label>
                      <input id="reg-pharma-name" name="pharmacyName" className="form-input" placeholder="City Pharmacy" value={profile.pharmacyName} onChange={handleProfile}/>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Owner Name</label>
                      <input id="reg-owner" name="ownerName" className="form-input" placeholder="Dr. Ahmed" value={profile.ownerName} onChange={handleProfile}/>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Contact Number</label>
                      <input name="contactNumber" className="form-input" placeholder="+92 300 0000000" value={profile.contactNumber} onChange={handleProfile}/>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Alternate Number (Optional)</label>
                      <input name="alternateNumber" className="form-input" placeholder="+92 311 0000000" value={profile.alternateNumber} onChange={handleProfile}/>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Business Email</label>
                      <input name="businessEmail" className="form-input" placeholder="contact@citypharmacy.com" value={profile.businessEmail} onChange={handleProfile}/>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Drug License Number</label>
                      <input id="reg-drug-license" name="drugLicenseNumber" className="form-input" placeholder="DL-00001" value={profile.drugLicenseNumber} onChange={handleProfile}/>
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label className="form-label">Business Address</label>
                  <input id="reg-address" name="address" className="form-input" placeholder="Street, City, Pakistan" value={profile.address} onChange={handleProfile}/>
                </div>

                <div style={{display:'flex',gap:10}}>
                  <button type="button" className="btn btn-secondary" style={{flex:1}} onClick={() => { setStep(1); setError(''); }}>← Back</button>
                  <button type="submit" className="btn btn-primary" style={{flex:2}} disabled={loading}>
                    {loading ? <><span className="spinner"/>Creating…</> : <><FiCheck style={{marginRight:8}}/> Create Account</>}
                  </button>
                </div>
              </form>
            )}

            <p className="auth-footer-text">
              Already have an account?{' '}
              <Link to="/login" className="auth-link">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}