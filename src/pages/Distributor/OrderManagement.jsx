import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import SidebarNav from "../../components/SidebarNav";
import TopBar from "../../components/TopBar";
import Modal from "../../components/Modal";
import Invoice from "../../components/Invoice";
import API from "../../config/api.config";
import { DistributorNavItems } from "../../config/navItems";
import {
  FiShoppingCart,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiTruck,
  FiFileText,
  FiStar,
} from "react-icons/fi";
import toast from "react-hot-toast";
import ReportModal from "../../components/ReportModal";
import PostOrderRatingModal from "../../components/PostOrderRatingModal";
import OrderDetailsPanel from "../../components/OrderDetailsPanel";
import { useSocket } from "../../context/SocketContext";
import {
  getPaymentBadgeClass,
  getPaymentLabel,
  getWorkflowBadgeClass,
  getWorkflowLabel,
  normalizePaymentStatus,
  normalizeWorkflowStatus,
} from "../../utils/orderStatus";

const OrderManagement = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paymentUpdatingOrderId, setPaymentUpdatingOrderId] = useState("");
  const [statusUpdatingOrderId, setStatusUpdatingOrderId] = useState("");

  const [orders, setOrders] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [ratingModal, setRatingModal] = useState(null);
  const { socket } = useSocket();

  const canRateOrder = (order) =>
    !["cancelled", "rejected"].includes(order.status) && !order.pharmacyRating;

  const openRateModal = (order) => {
    setRatingModal({
      orderId: order.id,
      counterpartName: order.pharmacyName,
      reportedUserId: order.pharmacyUserId,
    });
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const [ordersResponse, invoiceResponse] = await Promise.all([
        API.get("/api/v1/orders"),
        API.get("/api/v1/invoices").catch(() => ({ data: [] })),
      ]);

      const invoices = Array.isArray(invoiceResponse.data) ? invoiceResponse.data : [];
      const invoiceByOrderId = invoices.reduce((acc, inv) => {
        const key = inv.orderId?._id || inv.orderId;
        if (!key) return acc;
        acc[key.toString()] = inv;
        return acc;
      }, {});

      const mappedOrders = ordersResponse.data.orders.map((o) => {
        const orderInvoice = invoiceByOrderId[o._id?.toString?.() || o._id];
        return {
          id: o._id,
          displayId: `ORD-${o._id.substring(0, 8).toUpperCase()}`,
          pharmacyId: o.pharmacyId?._id,
          pharmacyUserId: o.pharmacyId?.userId,
          pharmacyName: o.pharmacyId?.pharmacyName || "Unknown",
          pharmacyOwner: o.pharmacyId?.ownerName || "",
          status: normalizeWorkflowStatus(o.status),
          createdAt: new Date(o.createdAt).toLocaleDateString(),
          updatedAt: o.updatedAt ? new Date(o.updatedAt).toLocaleString() : "",
          totalAmount: o.totalAmount,
          note: o.note || "",
          rejectionReason: o.rejectionReason || "",
          pharmacyContact: o.pharmacyId?.contactNumber || "",
          pharmacyEmail: o.pharmacyId?.businessEmail || "",
          pharmacyAddress: o.pharmacyId?.address || "",
          paymentStatus: normalizePaymentStatus(orderInvoice?.paymentStatus),
          invoiceDbId: orderInvoice?._id || "",
          pharmacyRating: o.pharmacyRating,
          distributorRating: o.distributorRating,
          pharmacyScore: o.pharmacyId?.rating || 0,
          items: o.items.map((item) => ({
            medicineName: item.medicineId?.name || "Unknown",
            genericName: item.medicineId?.genericName || "",
            batchId: item.batchId,
            quantity: item.quantity,
            salePrice: item.salePrice,
            subtotal: item.subtotal,
          })),
        };
      });
      setOrders(mappedOrders);
      if (selectedOrder?.id) {
        const fresh = mappedOrders.find((entry) => entry.id === selectedOrder.id);
        if (fresh) setSelectedOrder(fresh);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const syncOrders = () => fetchOrders();
    socket.on("order:updated", syncOrders);
    socket.on("payment:updated", syncOrders);
    return () => {
      socket.off("order:updated", syncOrders);
      socket.off("payment:updated", syncOrders);
    };
  }, [socket]);

  // ── Payment toggle: updates local state only — no re-fetch, no refresh ──
  const handlePaymentToggle = async (order, targetStatus) => {
    if (!order?.invoiceDbId) {
      toast.error("No invoice found for this order.");
      return;
    }
    if (order.paymentStatus === targetStatus) return;
    if (!window.confirm(`Mark ${order.displayId} as ${targetStatus.toUpperCase()}?`)) return;

    setPaymentUpdatingOrderId(order.id);
    try {
      await API.put(`/api/v1/invoices/${order.invoiceDbId}/status`, {
        paymentStatus: targetStatus,
        amountPaid: targetStatus === "paid" ? order.totalAmount : 0,
      });

      // Mutate local orders array — no page re-fetch
      setOrders(prev =>
        prev.map(o =>
          o.id === order.id ? { ...o, paymentStatus: targetStatus } : o
        )
      );

      // Keep selectedOrder in sync if detail modal is open
      if (selectedOrder?.id === order.id) {
        setSelectedOrder(prev => ({ ...prev, paymentStatus: targetStatus }));
      }

      localStorage.setItem("paymentUpdated", Date.now().toString());
      toast.success(`Payment marked as ${targetStatus}.`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update payment status");
    } finally {
      setPaymentUpdatingOrderId("");
    }
  };

  const handleAccept = async (orderId) => {
    if (!window.confirm("Accept this order?")) return;
    try {
      setStatusUpdatingOrderId(orderId);
      await API.put(`/api/v1/orders/${orderId}/approve`);
      toast.success("Order accepted successfully.");
      fetchOrders();
      setShowDetailsModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to accept order");
    } finally {
      setStatusUpdatingOrderId("");
    }
  };

  const handleReject = async (orderId) => {
    const reason = prompt("Enter cancellation reason:");
    if (!reason) return;
    if (!window.confirm("Cancel this order?")) return;
    try {
      setStatusUpdatingOrderId(orderId);
      await API.put(`/api/v1/orders/${orderId}/reject`, { rejectionReason: reason });
      toast.success("Order cancelled successfully.");
      fetchOrders();
      setShowDetailsModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel order");
    } finally {
      setStatusUpdatingOrderId("");
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    const label = getWorkflowLabel(newStatus);
    if (!window.confirm(`Mark this order as ${label}?`)) return;
    try {
      setStatusUpdatingOrderId(orderId);
      await API.put(`/api/v1/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order marked as ${label}`);
      fetchOrders();
      setShowDetailsModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setStatusUpdatingOrderId("");
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.displayId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.pharmacyName.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterStatus === "all") return matchesSearch;
    return matchesSearch && order.status === filterStatus;
  });

  const stats = [
    { label: "Total Orders", value: orders.length,                                                                    icon: <FiShoppingCart />, color: "blue"  },
    { label: "Pending",      value: orders.filter(o => o.status === "pending").length,                                icon: <FiClock />,        color: "amber" },
    { label: "Dispatched",   value: orders.filter(o => o.status === "dispatched").length,                             icon: <FiTruck />,        color: "info"  },
    { label: "Completed",    value: orders.filter(o => ["completed","delivered","received"].includes(o.status)).length,   icon: <FiCheckCircle />,  color: "green" },
  ];

  // ── Clean select style — NO appearance:none so selected value is fully visible ──
  const filterSelectStyle = {
    height: 40,
    fontSize: 13,
    padding: '0 12px',
    borderRadius: 8,
    border: '1px solid var(--gray-200)',
    backgroundColor: '#fff',
    color: 'var(--gray-800)',
    cursor: 'pointer',
    minWidth: 180,
  };

  const inlineSelectStyle = {
    height: 30,
    fontSize: 11,
    padding: '0 6px',
    borderRadius: 6,
    border: '1px solid var(--gray-200)',
    backgroundColor: '#fff',
    color: 'var(--gray-800)',
    cursor: 'pointer',
    minWidth: 110,
  };


  return (
    <div className="app-layout">
      <SidebarNav role="distributor" navItems={DistributorNavItems} />

      <div className="main-content">
        <TopBar title="Order Management" />

        <div className="page-content animate-fade" style={{ paddingTop: 40 }}>
          <div className="page-header" style={{ marginBottom: 32 }}>
            <h1>Order Management</h1>
            <p style={{ color: "var(--gray-500)" }}>Process and track pharmacy orders</p>
          </div>

          <div className="grid-4" style={{ marginBottom: 32 }}>
            {stats.map((stat, idx) => (
              <div key={idx} className="stat-card">
                <div className={`stat-icon ${stat.color}`}>{stat.icon}</div>
                <div>
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-header">
              <span className="card-title">Order Filters</span>
            </div>
            <div className="card-body order-filters-row" style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <input
                type="text"
                placeholder="Search order ID or pharmacy..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
                style={{ flex: 1, minWidth: 200 }}
              />
              {/* No wrapper div / no absolute arrow — native select renders selected value cleanly */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="form-input"
                style={filterSelectStyle}
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="processing">Processing</option>
                <option value="dispatched">Dispatched</option>
                <option value="delivered">Delivered</option>
                <option value="received">Received</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="table-wrapper distributor-orders-table-wrapper">
            <table className="data-table distributor-orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Pharmacy</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="8" style={{ textAlign: "center", padding: 40 }}>Loading orders...</td></tr>
                ) : filteredOrders.length === 0 ? (
                  <tr><td colSpan="8" style={{ textAlign: "center", padding: 40 }}>No orders found</td></tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td style={{ fontWeight: 700, color: "var(--brand)" }}>{order.displayId}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontWeight: 600 }}>{order.pharmacyName}</span>
                          <span style={{
                            display: "inline-flex", alignItems: "center", gap: 2,
                            fontSize: "11px", color: "#fbbf24", background: "#fffbeb",
                            padding: "2px 6px", borderRadius: "6px", border: "1px solid #fde68a",
                          }}>
                            <FiStar fill="#fbbf24" style={{ fontSize: "10px" }} />{" "}
                            {order.pharmacyScore ? Number(order.pharmacyScore).toFixed(1) : "0.0"}
                          </span>
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--gray-500)" }}>{order.pharmacyOwner}</div>
                      </td>
                      <td>{order.createdAt}</td>
                      <td>{order.items.length} items</td>
                      <td style={{ fontWeight: 700 }}>Rs. {order.totalAmount.toLocaleString()}</td>
                      <td>
                        <span className={`badge ${getWorkflowBadgeClass(order.status)}`}>
                          {getWorkflowLabel(order.status).toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          <span className={`badge ${getPaymentBadgeClass(order.paymentStatus)}`}>
                            {getPaymentLabel(order.paymentStatus).toUpperCase()}
                          </span>
                          {order.invoiceDbId ? (
                            /* Plain select — no appearance:none, no absolute arrow overlay */
                            <select
                              value={order.paymentStatus}
                              disabled={paymentUpdatingOrderId === order.id}
                              onChange={(e) => handlePaymentToggle(order, e.target.value)}
                              style={inlineSelectStyle}
                            >
                              <option value="pending_payment">Pending Payment</option>
                              <option value="unpaid">Unpaid</option>
                              <option value="payment_verified">Payment Verified</option>
                              <option value="paid">Paid</option>
                            </select>
                          ) : (
                            <span style={{ fontSize: 11, color: "var(--gray-400)", fontWeight: 600 }}>No invoice</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => { setSelectedOrder(order); setShowDetailsModal(true); }}
                          >
                            Details
                          </button>
                          {(order.status === "completed" || order.status === "delivered" || order.status === "received") && (
                            <button
                              className="btn btn-secondary btn-sm"
                              title="Generate Invoice"
                              onClick={() => { setSelectedOrder(order); setShowInvoice(true); }}
                            >
                              <FiFileText />
                            </button>
                          )}
                          {canRateOrder(order) && (
                            <button className="btn btn-primary btn-sm" onClick={() => openRateModal(order)}>
                              <FiStar /> Rate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showDetailsModal && selectedOrder && (
        <Modal onClose={() => setShowDetailsModal(false)} title={`Order Details: ${selectedOrder.displayId}`} size="xl">
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <OrderDetailsPanel
              order={selectedOrder}
              role="distributor"
              statusUpdating={statusUpdatingOrderId === selectedOrder.id}
              paymentUpdating={paymentUpdatingOrderId === selectedOrder.id}
              onAccept={() => handleAccept(selectedOrder.id)}
              onCancel={() => handleReject(selectedOrder.id)}
              onStatusChange={(newStatus) => handleStatusChange(selectedOrder.id, newStatus)}
              onPaymentChange={(newPaymentStatus) => handlePaymentToggle(selectedOrder, newPaymentStatus)}
              canManagePayment
            />

            <div style={{ borderTop: "1px solid var(--gray-200)", paddingTop: 16, marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "var(--gray-500)" }}>Having compliance or payment issues?</span>
              <button className="btn btn-danger btn-sm" onClick={() => setShowReportModal(true)}>Report Pharmacy</button>
            </div>

            {selectedOrder.pharmacyRating ? (
              <div style={{ marginTop: 16, fontSize: 14, color: "var(--gray-600)" }}>
                Your rating: <span style={{ color: "#fbbf24", fontWeight: 700 }}>{"★".repeat(selectedOrder.pharmacyRating)}</span>
              </div>
            ) : canRateOrder(selectedOrder) ? (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                style={{ marginTop: 16 }}
                onClick={() => { setShowDetailsModal(false); openRateModal(selectedOrder); }}
              >
                <FiStar /> Rate this order
              </button>
            ) : null}
          </div>
        </Modal>
      )}

      {showInvoice && selectedOrder && (
        <Modal onClose={() => setShowInvoice(false)} title="Order Invoice" size="xl">
          <Invoice order={selectedOrder} />
        </Modal>
      )}

      {showReportModal && selectedOrder && (
        <ReportModal
          onClose={() => setShowReportModal(false)}
          orderId={selectedOrder.id}
          reportedUserId={selectedOrder.pharmacyUserId}
          defaultType="user"
        />
      )}

      {ratingModal?.orderId && (
        <PostOrderRatingModal
          orderId={ratingModal.orderId}
          counterpartName={ratingModal.counterpartName}
          reportedUserId={ratingModal.reportedUserId}
          raterRole="distributor"
          onClose={() => { setRatingModal(null); fetchOrders(); }}
          onSkip={() => setRatingModal(null)}
        />
      )}
    </div>
  );
};

export default OrderManagement;