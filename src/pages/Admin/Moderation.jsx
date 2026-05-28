import React, { useState, useEffect } from "react";
import SidebarNav from "../../components/SidebarNav";
import TopBar from "../../components/TopBar";
import Modal from "../../components/Modal";
import API from "../../config/api.config";
import { AdminNavItems } from "../../config/navItems";
import {
  FiShield,
  FiAlertTriangle,
  FiCheckCircle,
  FiUserX,
  FiRotateCcw,
  FiTrash2,
  FiClock,
  FiUser,
  FiFileText,
  FiSearch,
  FiAlertCircle,
  FiStar
} from "react-icons/fi";
import toast from "react-hot-toast";
import "../../styles/Moderation.css";

export default function AdminModeration() {
  const [activeTab, setActiveTab] = useState("reports");
  const [loading, setLoading] = useState(true);

  // States for tabs
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchUser, setSearchUser] = useState("");
  const [modLogs, setModLogs] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [adminRatings, setAdminRatings] = useState([]);
  const [adminRatingReports, setAdminRatingReports] = useState([]);

  // Detail Modal States
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportStatus, setReportStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [updatingReport, setUpdatingReport] = useState(false);

  // Fetch functions
  const fetchReports = async () => {
    try {
      const res = await API.get("/api/v1/admin/admin-reports");
      setReports(res.data.reports || []);
    } catch (err) {
      console.error("Failed to load reports:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await API.get("/api/v1/users/all-users");
      setUsers(res.data.users || []);
    } catch (err) {
      console.error("Failed to load users:", err);
    }
  };

  const fetchLogs = async () => {
    try {
      const [modRes, auditRes] = await Promise.all([
        API.get("/api/v1/admin/moderation-logs?limit=50"),
        API.get("/api/v1/admin/audit-logs?limit=50")
      ]);
      setModLogs(modRes.data.logs || []);
      setAuditLogs(auditRes.data.logs || []);
    } catch (err) {
      console.error("Failed to load logs:", err);
    }
  };

  const fetchRatingsOverview = async () => {
    try {
      const res = await API.get("/api/v1/orders/ratings/admin-overview");
      setAdminRatings(res.data.ratings || []);
      setAdminRatingReports(res.data.reports || []);
    } catch (err) {
      console.error("Failed to load ratings overview:", err);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchReports(),
      fetchUsers(),
      fetchLogs(),
      fetchRatingsOverview(),
    ]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Moderation Actions
  const handleApprove = async (userId) => {
    try {
      await API.put(`/api/v1/admin/approve/${userId}`);
      toast.success("User registration approved!");
      fetchAllData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve user");
    }
  };

  const handleBlock = async (userId) => {
    try {
      await API.put(`/api/v1/admin/block/${userId}`);
      toast.success("User account blocked!");
      fetchAllData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to block user");
    }
  };

  const handleWarn = async (userId) => {
    const reason = prompt("Enter warning reason:");
    if (!reason) return;
    try {
      await API.put(`/api/v1/admin/warn/${userId}`, { reason });
      toast.success("User warned (account suspended/blocked).");
      fetchAllData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to warn user");
    }
  };

  const handleSuspend = async (userId) => {
    const reason = prompt("Enter suspension reason:");
    if (!reason) return;
    try {
      await API.put(`/api/v1/admin/suspend/${userId}`, { reason });
      toast.success("User account suspended.");
      fetchAllData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to suspend user");
    }
  };

  const handleDisable = async (userId) => {
    const reason = prompt("Enter disabling reason:");
    if (!reason) return;
    try {
      await API.put(`/api/v1/admin/disable/${userId}`, { reason });
      toast.success("User account disabled.");
      fetchAllData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to disable user");
    }
  };

  const handleRemove = async (userId) => {
    const reason = prompt("Enter soft delete reason:");
    if (!reason) return;
    try {
      await API.put(`/api/v1/admin/remove/${userId}`, { reason });
      toast.success("User account soft-removed.");
      fetchAllData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove user");
    }
  };

  const handleRestore = async (userId) => {
    try {
      await API.put(`/api/v1/admin/restore/${userId}`);
      toast.success("User account restored to active status!");
      fetchAllData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to restore user");
    }
  };

  // Report status update handler
  const handleUpdateReport = async (e) => {
    e.preventDefault();
    try {
      setUpdatingReport(true);
      await API.put(`/api/v1/admin/admin-reports/${selectedReport._id}/status`, {
        status: reportStatus,
        adminNotes
      });
      toast.success("Report updated successfully.");
      setSelectedReport(null);
      fetchReports();
      fetchLogs();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update report");
    } finally {
      setUpdatingReport(false);
    }
  };

  // Filtered Users list
  const filteredUsers = users.filter((u) => {
    return (
      u.username?.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.role?.toLowerCase().includes(searchUser.toLowerCase())
    );
  });

  const getStatusBadge = (status) => {
    const variants = {
      pending: "amber",
      active: "green",
      blocked: "red",
      removed: "gray",
      in_review: "blue",
      resolved: "green",
      dismissed: "gray"
    };
    return `badge badge-${variants[status] || "gray"}`;
  };

  return (
    <div className="app-layout">
      <SidebarNav role="admin" navItems={AdminNavItems} />
      <div className="main-content">
        <TopBar title="Moderation Panel" />
        <div className="page-content animate-fade" style={{ paddingTop: 40 }}>
          
          <div className="page-header" style={{ marginBottom: 32 }}>
            <h1>
              <FiShield style={{ marginRight: 12, verticalAlign: "middle" }} />
              Security & Moderation Controls
            </h1>
            <p style={{ color: "var(--gray-500)" }}>
              Manage user registration, file reports, account actions, and review audit trails.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="moderation-tabs">
            <button
              className={`mod-tab-btn ${activeTab === "reports" ? "active" : ""}`}
              onClick={() => setActiveTab("reports")}
            >
              <FiAlertTriangle /> Reports Queue ({reports.filter(r => r.status !== 'resolved' && r.status !== 'dismissed').length})
            </button>
            <button
              className={`mod-tab-btn ${activeTab === "users" ? "active" : ""}`}
              onClick={() => setActiveTab("users")}
            >
              <FiUser /> User Accounts Control ({users.length})
            </button>
            <button
              className={`mod-tab-btn ${activeTab === "ratings" ? "active" : ""}`}
              onClick={() => setActiveTab("ratings")}
            >
              <FiStar /> Ratings &amp; Complaints ({adminRatings.length})
            </button>
            <button
              className={`mod-tab-btn ${activeTab === "logs" ? "active" : ""}`}
              onClick={() => setActiveTab("logs")}
            >
              <FiFileText /> System Logs & Audits
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: 60 }}>
              <div className="spinner" style={{ width: 40, height: 40, margin: "0 auto 16px" }} />
              <p style={{ color: "var(--gray-500)" }}>Fetching moderation records...</p>
            </div>
          ) : (
            <div className="tab-panel animate-fade">
              
              {/* Reports Queue */}
              {activeTab === "reports" && (
                <div className="card">
                  <div className="card-header">
                    <span className="card-title">Submitted System Reports</span>
                  </div>
                  <div className="table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Reporter</th>
                          <th>Subject</th>
                          <th>Type</th>
                          <th>Created At</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reports.length === 0 ? (
                          <tr>
                            <td colSpan="6" style={{ textAlign: "center", padding: 32 }}>
                              No reports submitted.
                            </td>
                          </tr>
                        ) : (
                          reports.map((report) => (
                            <tr key={report._id}>
                              <td style={{ fontWeight: 600 }}>
                                {report.reporter?.username || "System"}
                                <div style={{ fontSize: 11, color: "var(--gray-500)", fontWeight: 400 }}>
                                  {report.reporter?.email}
                                </div>
                              </td>
                              <td>
                                {report.reportedUser ? (
                                  <div>
                                    User: <b>{report.reportedUser?.username}</b> ({report.reportedUser?.role})
                                  </div>
                                ) : report.order ? (
                                  <div>
                                    Order: <b style={{ fontFamily: "monospace" }}>#{report.order._id?.slice(-8).toUpperCase()}</b>
                                  </div>
                                ) : (
                                  "N/A"
                                )}
                              </td>
                              <td style={{ textTransform: "capitalize" }}>{report.type}</td>
                              <td>{new Date(report.createdAt).toLocaleString()}</td>
                              <td>
                                <span className={getStatusBadge(report.status)}>
                                  {report.status?.replace("_", " ")}
                                </span>
                              </td>
                              <td>
                                <button
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => {
                                    setSelectedReport(report);
                                    setReportStatus(report.status);
                                    setAdminNotes(report.adminNotes || "");
                                  }}
                                >
                                  Review
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* User Accounts Control */}
              {activeTab === "users" && (
                <div>
                  <div className="card" style={{ marginBottom: 24 }}>
                    <div className="card-body" style={{ display: "flex", gap: 16, padding: 20 }}>
                      <div style={{ position: "relative", flex: 1 }}>
                        <FiSearch style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} />
                        <input
                          type="text"
                          placeholder="Search users by name, email, or role..."
                          value={searchUser}
                          onChange={(e) => setSearchUser(e.target.value)}
                          className="form-input"
                          style={{ paddingLeft: 44 }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <div className="table-wrapper">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>User Details</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.length === 0 ? (
                            <tr>
                              <td colSpan="4" style={{ textAlign: "center", padding: 32 }}>
                                No users matching search filter.
                              </td>
                            </tr>
                          ) : (
                            filteredUsers.map((userObj) => (
                              <tr key={userObj._id}>
                                <td style={{ fontWeight: 600 }}>
                                  {userObj.username}
                                  <div style={{ fontSize: 12, color: "var(--gray-500)", fontWeight: 400 }}>
                                    {userObj.email}
                                  </div>
                                </td>
                                <td style={{ textTransform: "capitalize", fontWeight: 500 }}>
                                  {userObj.role}
                                </td>
                                <td>
                                  <span className={getStatusBadge(userObj.status)}>
                                    {userObj.status}
                                  </span>
                                </td>
                                <td>
                                  {userObj.role === "admin" ? (
                                    <span style={{ fontSize: 12, color: "var(--gray-400)" }}>
                                      Protected Admin Account
                                    </span>
                                  ) : (
                                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                      {userObj.status === "active" ? (
                                        <>
                                          <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => handleWarn(userObj._id)}
                                            style={{ color: "var(--warning)", borderColor: "rgba(217,119,6,0.2)" }}
                                            title="Warn & Block"
                                          >
                                            Warn
                                          </button>
                                          <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => handleSuspend(userObj._id)}
                                            style={{ color: "var(--danger)", borderColor: "rgba(220,38,38,0.2)" }}
                                            title="Suspend account"
                                          >
                                            Suspend
                                          </button>
                                          <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleRemove(userObj._id)}
                                            title="Soft remove account"
                                          >
                                            <FiTrash2 />
                                          </button>
                                        </>
                                      ) : (
                                        <button
                                          className="btn btn-primary btn-sm"
                                          onClick={() => handleRestore(userObj._id)}
                                          style={{ background: "var(--brand-accent)" }}
                                        >
                                          <FiRotateCcw /> Restore Active
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Ratings & Complaints */}
              {activeTab === "ratings" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">All Ratings &amp; Feedback</span>
                    </div>
                    <div className="table-wrapper">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Rated party</th>
                            <th>Rater</th>
                            <th>Stars</th>
                            <th>Feedback</th>
                            <th>Date</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {adminRatings.length === 0 ? (
                            <tr>
                              <td colSpan="6" style={{ textAlign: "center", padding: 32 }}>
                                No ratings recorded yet.
                              </td>
                            </tr>
                          ) : (
                            adminRatings.map((r, idx) => (
                              <tr key={`${r.orderId}-${idx}`}>
                                <td style={{ fontWeight: 600 }}>{r.ratedEntity || "—"}</td>
                                <td>{r.raterEntity || "—"}</td>
                                <td style={{ color: "#fbbf24", fontWeight: 700 }}>★ {r.rating}</td>
                                <td style={{ fontSize: 13, maxWidth: 220 }}>{r.feedback || "—"}</td>
                                <td style={{ fontSize: 12, color: "var(--gray-500)" }}>
                                  {r.date ? new Date(r.date).toLocaleDateString() : "—"}
                                </td>
                                <td>
                                  {r.ratedUserId && (
                                    <button
                                      className="btn btn-danger btn-sm"
                                      onClick={() => handleBlock(r.ratedUserId)}
                                      title="Ban user account"
                                    >
                                      <FiUserX /> Ban
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">User Reports &amp; Complaints</span>
                    </div>
                    <div className="table-wrapper">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Reporter</th>
                            <th>Reported user</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {adminRatingReports.length === 0 ? (
                            <tr>
                              <td colSpan="5" style={{ textAlign: "center", padding: 32 }}>
                                No complaints filed.
                              </td>
                            </tr>
                          ) : (
                            adminRatingReports.map((report) => (
                              <tr key={report._id}>
                                <td>{report.reporter?.username || "—"}</td>
                                <td>{report.reportedUser?.username || "—"}</td>
                                <td style={{ textTransform: "capitalize" }}>{report.type}</td>
                                <td>
                                  <span className={getStatusBadge(report.status || "pending")}>
                                    {(report.status || "pending").toUpperCase()}
                                  </span>
                                </td>
                                <td style={{ display: "flex", gap: 8 }}>
                                  <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => {
                                      setSelectedReport(report);
                                      setReportStatus(report.status || "in_review");
                                      setAdminNotes(report.adminNotes || "");
                                    }}
                                  >
                                    Review
                                  </button>
                                  {report.reportedUser?._id && (
                                    <button
                                      className="btn btn-danger btn-sm"
                                      onClick={() => handleBlock(report.reportedUser._id)}
                                    >
                                      Ban
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Logs & Audits */}
              {activeTab === "logs" && (
                <div className="grid-2">
                  
                  {/* Moderation Logs */}
                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">Moderation Action Logs</span>
                    </div>
                    <div className="table-wrapper" style={{ maxHeight: 500, overflowY: "auto" }}>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Admin</th>
                            <th>Action</th>
                            <th>Reason</th>
                          </tr>
                        </thead>
                        <tbody>
                          {modLogs.length === 0 ? (
                            <tr>
                              <td colSpan="3" style={{ textAlign: "center", padding: 24 }}>
                                No moderation logs recorded.
                              </td>
                            </tr>
                          ) : (
                            modLogs.map((log) => (
                              <tr key={log._id}>
                                <td style={{ fontSize: 13, fontWeight: 600 }}>
                                  {log.adminId?.username || "Admin"}
                                </td>
                                <td>
                                  <span className={`badge badge-${log.action === "warn" ? "amber" : "red"}`} style={{ fontSize: 10 }}>
                                    {log.action?.toUpperCase()}
                                  </span>
                                  <div style={{ fontSize: 11, color: "var(--gray-500)" }}>
                                    Target: {log.targetUserId?.username || "Deleted"}
                                  </div>
                                </td>
                                <td style={{ fontSize: 12, color: "var(--gray-600)" }}>
                                  {log.reason}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Audit Logs */}
                  <div className="card">
                    <div className="card-header">
                      <span className="card-title">System Audit Trails</span>
                    </div>
                    <div className="table-wrapper" style={{ maxHeight: 500, overflowY: "auto" }}>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>User</th>
                            <th>Activity</th>
                            <th>Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {auditLogs.length === 0 ? (
                            <tr>
                              <td colSpan="3" style={{ textAlign: "center", padding: 24 }}>
                                No audit events.
                              </td>
                            </tr>
                          ) : (
                            auditLogs.map((log) => (
                              <tr key={log._id}>
                                <td style={{ fontSize: 13, fontWeight: 600 }}>
                                  {log.userId?.username || "Guest"}
                                </td>
                                <td style={{ fontSize: 12 }}>
                                  <b>{log.action?.replace("_", " ").toUpperCase()}</b>
                                  <div style={{ color: "var(--gray-500)", fontSize: 11 }}>{log.details}</div>
                                </td>
                                <td style={{ fontSize: 11, color: "var(--gray-400)" }}>
                                  {new Date(log.createdAt).toLocaleTimeString()}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}

        </div>
      </div>

      {/* Report Review Modal */}
      {selectedReport && (
        <Modal
          onClose={() => setSelectedReport(null)}
          title={`Review Report: #${selectedReport._id.slice(-8).toUpperCase()}`}
          size="md"
        >
          <form onSubmit={handleUpdateReport} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "var(--gray-50)", padding: 14, borderRadius: 10, border: "1px solid var(--gray-200)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 8, fontSize: 13 }}>
                <div>
                  <span style={{ color: "var(--gray-500)" }}>Reporter:</span>{" "}
                  <b>{selectedReport.reporter?.username}</b>
                </div>
                <div>
                  <span style={{ color: "var(--gray-500)" }}>Type:</span>{" "}
                  <b style={{ textTransform: "capitalize" }}>{selectedReport.type}</b>
                </div>
              </div>
              <div style={{ fontSize: 13, borderTop: "1px solid var(--gray-200)", paddingTop: 8 }}>
                <span style={{ color: "var(--gray-500)" }}>Report Description:</span>
                <p style={{ marginTop: 4, fontStyle: "italic", color: "var(--gray-800)", lineHeight: "1.4" }}>
                  "{selectedReport.description}"
                </p>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Update Report Status</label>
              <select
                value={reportStatus}
                onChange={(e) => setReportStatus(e.target.value)}
                className="form-input"
              >
                <option value="pending">Pending</option>
                <option value="in_review">In Review</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Internal Administrator Notes</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="form-input"
                rows="4"
                placeholder="Add actions taken, notes on warnings sent, or final resolutions..."
                style={{ resize: "vertical" }}
              />
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 12 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedReport(null)}
                disabled={updatingReport}
              >
                Close
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={updatingReport}
              >
                {updatingReport ? "Updating..." : "Save Resolution"}
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
}
