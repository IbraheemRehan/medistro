import React, { useState, useEffect, useContext, useCallback } from "react";
import axios from "../../config/api.config";
import AuthContext from "../../context/AuthContext";
import { useProfile } from "../../context/ProfileContext";
import SidebarNav from "../../components/SidebarNav";
import TopBar from "../../components/TopBar";
import { AdminNavItems, PharmacyNavItems, DistributorNavItems, EmployeeNavItems } from "../../config/navItems";
import toast from "react-hot-toast";
import { FiLock, FiChevronDown, FiEye, FiEyeOff, FiUser, FiInfo } from "react-icons/fi";
import "../../styles/Profile.css";

// ─── Nav items helper ──────────────────────────────────────────
const getNavItems = (role) => {
  switch (role) {
    case "admin": return AdminNavItems;
    case "pharmacy": return PharmacyNavItems;
    case "distributor": return DistributorNavItems;
    case "employee": return EmployeeNavItems;
    default: return [];
  }
};

// ─── Role color map ────────────────────────────────────────────
const roleColors = {
  admin:       { bg: "#EEF2FF", color: "#3730A3" },
  distributor: { bg: "#FFF7ED", color: "#C2410C" },
  pharmacy:    { bg: "#F0FDF4", color: "#15803D" },
  employee:    { bg: "#F0F4FF", color: "#1565C0" },
};

// ─── Skeleton Loader ───────────────────────────────────────────
const ProfileSkeleton = () => (
  <>
    <div className="skeleton-card">
      <div className="skeleton skeleton-banner" />
      <div className="skeleton skeleton-avatar" />
      <div className="skeleton skeleton-text medium" />
      <div className="skeleton skeleton-text short" />
    </div>
    <div className="skeleton-card" style={{ marginTop: 28 }}>
      <div style={{ padding: "30px 30px 0" }}>
        <div className="skeleton skeleton-text short" style={{ margin: 0 }} />
      </div>
      {[1, 2, 3].map(i => (
        <div key={i} className="skeleton-form-row" style={{ marginTop: i === 1 ? 24 : 0 }}>
          <div>
            <div className="skeleton skeleton-label" />
            <div className="skeleton skeleton-input" />
          </div>
          <div>
            <div className="skeleton skeleton-label" />
            <div className="skeleton skeleton-input" />
          </div>
        </div>
      ))}
    </div>
  </>
);

// ─── Password Visibility Toggle ────────────────────────────────
const PasswordInput = ({ value, onChange, placeholder, name }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="password-input-wrapper">
      <input
        type={visible ? "text" : "password"}
        className="form-input"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete="new-password"
      />
      <button
        type="button"
        className="password-toggle-btn"
        onClick={() => setVisible(v => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        tabIndex={-1}
      >
        {visible ? <FiEyeOff /> : <FiEye />}
      </button>
    </div>
  );
};

// ─── Complete Profile Modal ────────────────────────────────────
const CompleteProfileModal = ({ user, onComplete }) => {
  const [form, setForm] = useState({
    username: user?.username || "",
    contactNumber: "",
    businessName: "",
    address: "",
  });
  const [saving, setSaving] = useState(false);

  const onChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.username?.trim()) return toast.error("Username is required");
    if (!form.contactNumber?.trim()) return toast.error("Contact number is required");
    if (!form.businessName?.trim()) return toast.error("Business name is required");
    if (!form.address?.trim()) return toast.error("Address is required");

    try {
      setSaving(true);
      await axios.put("/api/v1/users/profile", {
        username: form.username,
        pharmacyName: user?.role === "pharmacy" ? form.businessName : undefined,
        companyName: user?.role === "distributor" ? form.businessName : undefined,
        contactNumber: form.contactNumber,
        address: form.address,
        isProfileCompleted: true,
      });
      toast.success("Profile completed successfully!");
      onComplete();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to complete profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="complete-profile-overlay">
      <div className="complete-profile-modal">
        <div className="complete-profile-modal-header">
          <div className="complete-profile-modal-icon">
            <FiUser />
          </div>
          <h2>Complete Your Profile</h2>
          <p>Welcome! Please fill in the required information to get started with Medistro.</p>
        </div>
        <div className="complete-profile-modal-body">
          <div className="form-group">
            <label className="form-label">Username <span className="required-star">*</span></label>
            <input name="username" className="form-input" value={form.username} onChange={onChange} placeholder="Your username" />
          </div>
          <div className="form-group">
            <label className="form-label">
              {user?.role === "distributor" ? "Company Name" : "Pharmacy Name"} <span className="required-star">*</span>
            </label>
            <input name="businessName" className="form-input" value={form.businessName} onChange={onChange} placeholder={user?.role === "distributor" ? "Enter company name" : "Enter pharmacy name"} />
          </div>
          <div className="form-group">
            <label className="form-label">Contact Number <span className="required-star">*</span></label>
            <input name="contactNumber" className="form-input" value={form.contactNumber} onChange={onChange} placeholder="e.g. +92 300 1234567" />
          </div>
          <div className="form-group">
            <label className="form-label">Address <span className="required-star">*</span></label>
            <textarea name="address" className="form-input" value={form.address} onChange={onChange} placeholder="Business address" rows={3} />
          </div>
          <button
            className="btn btn-primary btn-full complete-profile-submit-btn"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? "Saving..." : "Complete Profile & Continue"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// ─── MAIN PROFILE COMPONENT ──────────────────────────────────
// ═══════════════════════════════════════════════════════════════
const Profile = () => {
  const { user } = useContext(AuthContext);
  const { profileData: globalProfile, updateProfile: updateGlobalProfile, refreshProfile } = useProfile();

  // Local state
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  // Password accordion
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordSaving, setPasswordSaving] = useState(false);

  const isGoogleUser = !!(user?.googleId || globalProfile?.googleId);
  const roleStyle = roleColors[user?.role] || roleColors.employee;

  // ─── Fetch Profile ────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/v1/users/profile");
      const u = res.data.user || {};
      const p = res.data.profile || {};

      setForm({
        username: u.username || "",
        email: u.email || "",
        businessName: u.role === "distributor" ? (p.companyName || "") : (p.pharmacyName || ""),
        ownerName: p.ownerName || "",
        contactNumber: p.contactNumber || "",
        alternateNumber: p.alternateNumber || "",
        businessEmail: p.businessEmail || u.email || "",
        address: p.address || "",
        logo: p.logo || "",
      });

      // Check if Google user with incomplete profile
      if (u.googleId && u.isProfileCompleted === false) {
        setShowCompleteModal(true);
      }
    } catch {
      toast.error("Failed to load profile details");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const onChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  // ─── Validation ───────────────────────────────────────
  const validate = () => {
    if (!form.username?.trim()) return "Username is required";
    if (!form.email?.trim()) return "Email is required";
    if (["pharmacy", "distributor"].includes(user?.role)) {
      if (!form.businessName?.trim()) return "Business name is required";
      if (!form.contactNumber?.trim()) return "Contact number is required";
      if (!form.address?.trim()) return "Business address is required";
    }
    return "";
  };

  // ─── Save Profile ─────────────────────────────────────
  const saveProfile = async () => {
    const err = validate();
    if (err) return toast.error(err);

    try {
      setSaving(true);
      await axios.put("/api/v1/users/profile", {
        username: form.username,
        email: form.email,
        companyName: user?.role === "distributor" ? form.businessName : undefined,
        pharmacyName: user?.role === "pharmacy" ? form.businessName : undefined,
        ownerName: user?.role === "pharmacy" ? form.ownerName : undefined,
        contactNumber: form.contactNumber,
        alternateNumber: form.alternateNumber,
        businessEmail: form.businessEmail,
        address: form.address,
        logo: form.logo,
      });

      // Sync globally
      updateGlobalProfile({
        username: form.username,
        email: form.email,
        logo: form.logo,
      });

      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // ─── Password Validation + Save ───────────────────────
  const passwordValidation = () => {
    const { oldPassword, newPassword, confirmPassword } = passwordForm;
    if (!oldPassword || !newPassword || !confirmPassword) return "All password fields are required";
    if (newPassword.length < 6) return "New password must be at least 6 characters";
    if (newPassword === oldPassword) return "New password must differ from current password";
    if (newPassword !== confirmPassword) return "Passwords do not match";
    return "";
  };

  const savePassword = async () => {
    const err = passwordValidation();
    if (err) return toast.error(err);

    try {
      setPasswordSaving(true);
      await axios.post("/api/v1/users/change-password", {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordOpen(false);
      toast.success("Password changed successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setPasswordSaving(false);
    }
  };

  // ─── Complete Profile Modal Handler ───────────────────
  const handleCompleteProfile = async () => {
    setShowCompleteModal(false);
    updateGlobalProfile({ isProfileCompleted: true });
    await fetchProfile();
    await refreshProfile();
  };

  // Avatar display helper
  const avatarSrc = form.logo || globalProfile?.logo || globalProfile?.avatar;
  const avatarInitial = (form.username || user?.username || "?").charAt(0).toUpperCase();
  const roleLabel = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "";

  // ═══════════════════════════════════════════════════════
  // ─── RENDER ───────────────────────────────────────────
  // ═══════════════════════════════════════════════════════
  return (
    <div className="app-layout">
      <SidebarNav role={user?.role} navItems={getNavItems(user?.role)} />
      <div className="main-content">
        <TopBar title="My Profile" />
        <div className="page-content animate-fade" style={{ paddingTop: 40 }}>

          {/* Complete Profile Modal */}
          {showCompleteModal && (
            <CompleteProfileModal user={user} onComplete={handleCompleteProfile} />
          )}

          {loading ? (
            <ProfileSkeleton />
          ) : (
            <>
              {/* ──── Profile Header Card ──── */}
              <div className="card profile-header-card">
                <div className="profile-header-banner" />
                <div className="profile-header-body">
                  <div className="profile-avatar-lg" style={{ background: roleStyle.color }}>
                    {avatarSrc ? (
                      <img
                        src={avatarSrc}
                        alt="avatar"
                        onError={(e) => { e.target.style.display = "none"; e.target.parentNode.textContent = avatarInitial; }}
                      />
                    ) : avatarInitial}
                  </div>
                  <div className="profile-header-info">
                    <h1 className="profile-header-name">{form.username || user?.username || "User"}</h1>
                    <p className="profile-header-email">{form.email || user?.email}</p>
                    <div className="profile-badges-row">
                      <span className="profile-role-badge" style={{ background: roleStyle.bg, color: roleStyle.color }}>
                        {roleLabel}
                      </span>
                      {isGoogleUser && (
                        <span className="profile-google-badge">
                          <svg width="14" height="14" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.9 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.2-2.7-.4-3.9z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.4 15.1 18.8 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.8-3-11.3-7.2l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4-4.1 5.5l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.2-2.7-.4-3.9z"/></svg>
                          Google Account
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ──── Profile Information Card ──── */}
              <div className="profile-cards-grid">
                <div className="card">
                  <div className="card-header">
                    <span className="card-title">Profile Information</span>
                  </div>
                  <div className="card-body">
                    {/* Account Section */}
                    <div className="profile-section-title">Account Details</div>
                    <div className="profile-form-grid">
                      <div className="form-group">
                        <label className="form-label">Username</label>
                        <input name="username" className="form-input" value={form.username || ""} onChange={onChange} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                          name="email"
                          className="form-input"
                          value={form.email || ""}
                          onChange={onChange}
                          disabled={isGoogleUser}
                          style={isGoogleUser ? { opacity: 0.6, cursor: "not-allowed" } : {}}
                        />
                      </div>
                    </div>

                    {/* Business Section (pharmacy/distributor) */}
                    {["pharmacy", "distributor"].includes(user?.role) && (
                      <>
                        <div className="profile-section-title" style={{ marginTop: 12 }}>Business Details</div>
                        <div className="profile-form-grid">
                          <div className="form-group">
                            <label className="form-label">{user?.role === "distributor" ? "Company Name" : "Pharmacy Name"}</label>
                            <input name="businessName" className="form-input" value={form.businessName || ""} onChange={onChange} />
                          </div>
                          {user?.role === "pharmacy" && (
                            <div className="form-group">
                              <label className="form-label">Owner Name</label>
                              <input name="ownerName" className="form-input" value={form.ownerName || ""} onChange={onChange} />
                            </div>
                          )}
                          <div className="form-group">
                            <label className="form-label">Contact Number</label>
                            <input name="contactNumber" className="form-input" value={form.contactNumber || ""} onChange={onChange} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Alternate Number <span style={{ color: "var(--gray-400)", fontWeight: 400 }}>(Optional)</span></label>
                            <input name="alternateNumber" className="form-input" value={form.alternateNumber || ""} onChange={onChange} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Business Email</label>
                            <input name="businessEmail" className="form-input" value={form.businessEmail || ""} onChange={onChange} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Logo URL</label>
                            <input name="logo" className="form-input" value={form.logo || ""} onChange={onChange} placeholder="https://..." />
                          </div>
                          <div className="form-group full-width">
                            <label className="form-label">Business Address</label>
                            <textarea name="address" className="form-input" value={form.address || ""} onChange={onChange} rows={3} />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Save Button */}
                    <div className="profile-actions-bar">
                      <button className="btn btn-primary" onClick={saveProfile} disabled={saving}>
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* ──── Security Card ──── */}
                <div className="card security-card">
                  <div className="card-header">
                    <span className="card-title">Security</span>
                  </div>
                  <div className="card-body" style={{ padding: isGoogleUser ? 24 : 0 }}>
                    {isGoogleUser ? (
                      <div className="security-google-notice">
                        <FiInfo />
                        <p>Password management is not available for Google-authenticated accounts. Your account is secured through Google.</p>
                      </div>
                    ) : (
                      <>
                        {/* Accordion Trigger */}
                        <button
                          className="security-trigger-btn"
                          onClick={() => setPasswordOpen(v => !v)}
                          aria-expanded={passwordOpen}
                          id="change-password-toggle"
                        >
                          <div className="security-trigger-left">
                            <div className="security-trigger-icon">
                              <FiLock />
                            </div>
                            <div className="security-trigger-text">
                              <h4>Change Password</h4>
                              <p>Update your account password</p>
                            </div>
                          </div>
                          <span className={`security-chevron ${passwordOpen ? "open" : ""}`}>
                            <FiChevronDown />
                          </span>
                        </button>

                        {/* Accordion Body */}
                        <div className={`security-accordion-body ${passwordOpen ? "expanded" : ""}`}>
                          <div className="security-accordion-inner">
                            <div className="form-group">
                              <label className="form-label">Current Password</label>
                              <PasswordInput
                                name="oldPassword"
                                value={passwordForm.oldPassword}
                                onChange={(e) => setPasswordForm(p => ({ ...p, oldPassword: e.target.value }))}
                                placeholder="Enter current password"
                              />
                            </div>
                            <div className="form-group">
                              <label className="form-label">New Password</label>
                              <PasswordInput
                                name="newPassword"
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                                placeholder="Enter new password (min 6 characters)"
                              />
                              {passwordForm.newPassword && passwordForm.oldPassword && passwordForm.newPassword === passwordForm.oldPassword && (
                                <div className="password-validation-msg error">New password must differ from current</div>
                              )}
                            </div>
                            <div className="form-group">
                              <label className="form-label">Confirm New Password</label>
                              <PasswordInput
                                name="confirmPassword"
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                                placeholder="Confirm new password"
                              />
                              {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                                <div className="password-validation-msg error">Passwords do not match</div>
                              )}
                              {passwordForm.confirmPassword && passwordForm.newPassword && passwordForm.newPassword === passwordForm.confirmPassword && (
                                <div className="password-validation-msg success">Passwords match ✓</div>
                              )}
                            </div>
                            <div className="profile-actions-bar" style={{ borderTop: "none", marginTop: 4 }}>
                              <button
                                className="btn btn-secondary"
                                onClick={() => { setPasswordOpen(false); setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" }); }}
                              >
                                Cancel
                              </button>
                              <button className="btn btn-primary" onClick={savePassword} disabled={passwordSaving}>
                                {passwordSaving ? "Updating..." : "Update Password"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
