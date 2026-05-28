import React, { useState, useEffect, useContext } from "react";
import axios from "../../config/api.config";
import AuthContext from "../../context/AuthContext";
import SidebarNav from "../../components/SidebarNav";
import TopBar from "../../components/TopBar";
import { AdminNavItems, PharmacyNavItems, DistributorNavItems, EmployeeNavItems } from "../../config/navItems";
import toast from "react-hot-toast";

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "" });
  const [passwordSaving, setPasswordSaving] = useState(false);

  const getNavItems = () => {
    switch (user?.role) {
      case "admin": return AdminNavItems;
      case "pharmacy": return PharmacyNavItems;
      case "distributor": return DistributorNavItems;
      case "employee": return EmployeeNavItems;
      default: return [];
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/v1/users/profile");
      const profile = res.data.profile || {};
      setProfileData(profile);
      setForm({
        username: user?.username || "",
        email: user?.email || "",
        businessName: user?.role === "distributor" ? (profile.companyName || "") : (profile.pharmacyName || ""),
        ownerName: profile.ownerName || "",
        contactNumber: profile.contactNumber || "",
        alternateNumber: profile.alternateNumber || "",
        businessEmail: profile.businessEmail || user?.email || "",
        address: profile.address || "",
        logo: profile.logo || "",
      });
    } catch {
      setError("Failed to fetch profile details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const onChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!form.username?.trim()) return "Username is required";
    if (!form.email?.trim()) return "Email is required";
    if (!form.businessName?.trim() && ["pharmacy", "distributor"].includes(user?.role)) return "Business name is required";
    if (!form.contactNumber?.trim() && ["pharmacy", "distributor"].includes(user?.role)) return "Contact number is required";
    if (!form.address?.trim() && ["pharmacy", "distributor"].includes(user?.role)) return "Business address is required";
    return "";
  };

  const saveProfile = async () => {
    const validationError = validate();
    if (validationError) {
      toast.error(validationError);
      return;
    }
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
      toast.success("Profile updated successfully");
      await fetchProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const updatePassword = async () => {
    if (!passwordForm.oldPassword || !passwordForm.newPassword) {
      toast.error("Both old and new passwords are required");
      return;
    }
    try {
      setPasswordSaving(true);
      await axios.post("/api/v1/users/change-password", passwordForm);
      setPasswordForm({ oldPassword: "", newPassword: "" });
      toast.success("Password updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update password");
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="app-layout">
      <SidebarNav role={user?.role} navItems={getNavItems()} />
      <div className="main-content">
        <TopBar title="My Profile" />
        <div className="page-content animate-fade" style={{ paddingTop: 40 }}>
          <div className="page-header">
            <h1>My Profile</h1>
            <p style={{ color: "var(--gray-500)" }}>Professional profile and security settings</p>
          </div>
          {loading ? <p>Loading profile...</p> : (
            <div className="grid-2 profile-grid">
              <div className="card profile-card">
                <div className="card-header"><span className="card-title">Profile Card</span></div>
                <div className="card-body profile-card-body">
                  {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
                  <div className="form-group"><label className="form-label">Username</label><input name="username" className="form-input" value={form.username || ""} onChange={onChange} /></div>
                  <div className="form-group"><label className="form-label">Email</label><input name="email" className="form-input" value={form.email || ""} onChange={onChange} /></div>
                  {["pharmacy", "distributor"].includes(user?.role) && (
                    <>
                      <div className="form-group"><label className="form-label">{user?.role === "distributor" ? "Business Name" : "Store Name"}</label><input name="businessName" className="form-input" value={form.businessName || ""} onChange={onChange} /></div>
                      {user?.role === "pharmacy" && <div className="form-group"><label className="form-label">Owner Name</label><input name="ownerName" className="form-input" value={form.ownerName || ""} onChange={onChange} /></div>}
                      <div className="form-group"><label className="form-label">Contact Number</label><input name="contactNumber" className="form-input" value={form.contactNumber || ""} onChange={onChange} /></div>
                      <div className="form-group"><label className="form-label">Alternate Number (Optional)</label><input name="alternateNumber" className="form-input" value={form.alternateNumber || ""} onChange={onChange} /></div>
                      <div className="form-group"><label className="form-label">Business Email</label><input name="businessEmail" className="form-input" value={form.businessEmail || ""} onChange={onChange} /></div>
                      <div className="form-group"><label className="form-label">Business Address</label><textarea name="address" className="form-input" value={form.address || ""} onChange={onChange} rows={3} /></div>
                      <div className="form-group"><label className="form-label">Logo URL / Image Data</label><input name="logo" className="form-input" value={form.logo || ""} onChange={onChange} /></div>
                    </>
                  )}
                  <div className="profile-actions">
                    <button className="btn btn-primary btn-full" onClick={saveProfile} disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              </div>
              <div className="card profile-card">
                <div className="card-header"><span className="card-title">Security</span></div>
                <div className="card-body profile-card-body">
                  <div className="form-group"><label className="form-label">Current Password</label><input type="password" className="form-input" value={passwordForm.oldPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, oldPassword: e.target.value }))} /></div>
                  <div className="form-group"><label className="form-label">New Password</label><input type="password" className="form-input" value={passwordForm.newPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))} /></div>
                  <div className="profile-actions">
                    <button className="btn btn-secondary btn-full" onClick={updatePassword} disabled={passwordSaving}>
                      {passwordSaving ? "Updating..." : "Change Password"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
