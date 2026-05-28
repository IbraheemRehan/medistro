import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import SidebarNav from "../../components/SidebarNav";
import TopBar from "../../components/TopBar";
import Modal from "../../components/Modal";
import Invoice from "../../components/Invoice";
import API from "../../config/api.config";
import { PharmacyNavItems } from "../../config/navItems";
import {
  FiBox,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiFileText,
  FiPlus,
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

const MyOrders = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [ratingModal, setRatingModal] = useState(null);
  const [syncTick, setSyncTick] = useState(0);
  const { socket } = useSocket();

  const canRateOrder = (order) =>
    !["cancelled", "rejected"].includes(order.status) && !order.distributorRating;

  const openRateModal = (order) => {
    setRatingModal({
      orderId: order.id,
      counterpartName: order.distributorName,
      reportedUserId: order.distributorId?.userId?._id || order.distributorId?.userId,
    });
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const [ordersRes, invoicesRes] = await Promise.all([
        API.get("/api/v1/orders"),
        API.get("/api/v1/invoices").catch(() => ({ data: [] })),
      ]);

      const invoices = invoicesRes.data || [];
      const invoiceByOrderId = invoices.reduce((acc, inv) => {
        const key = inv.orderId?._id || inv.orderId;
        if (!key) return acc;
        acc[key.toString()] = inv;
        return acc;
      }, {});

      const mappedOrders = (ordersRes.data?.orders || []).map((o) => {
        const inv = invoiceByOrderId[o._id?.toString?.() || o._id] || null;
        return {
          id: o._id,
          displayId: `ORD-${o._id.substring(0, 8).toUpperCase()}`,
          distributorName: o.distributorId?.companyName || "Unknown Distributor",
          status: normalizeWorkflowStatus(o.status),
          paymentStatus: normalizePaymentStatus(inv?.paymentStatus),
          paidAmount: inv?.amountPaid || 0,
          createdAt: new Date(o.createdAt).toLocaleDateString(),
          updatedAt: o.updatedAt ? new Date(o.updatedAt).toLocaleString() : "",
          totalAmount: o.totalAmount,
          distributorRating: o.distributorRating,
          pharmacyRating: o.pharmacyRating,
          distributorId: o.distributorId || {},
          distributorContact: o.distributorId?.contactNumber || "",
          distributorEmail: o.distributorId?.businessEmail || "",
          distributorAddress: o.distributorId?.address || "",
          pharmacyId: {
            ...o.pharmacyId,
            licenseNumber: o.pharmacyId?.drugLicenseNumber || "N/A",
          },
          items: o.items.map((item) => ({
            medicineId: item.medicineId?._id,
            medicineName: item.medicineId?.name || "Medicine",
            batchId: item.batchId,
            quantity: item.quantity,
            salePrice: item.salePrice,
            originalPrice: item.originalPrice,
            discountPercent: item.discountPercent || 0,
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
  }, [syncTick]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'paymentUpdated') setSyncTick(Date.now());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleMarkReceived = async (orderId) => {
    try {
      await API.put(`/api/v1/orders/${orderId}/receive`);
      toast.success("Order marked as received successfully.");
      fetchOrders();
      setShowDetailsModal(false);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to mark order as received",
      );
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.displayId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.distributorName.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === "all") return matchesSearch;
    return matchesSearch && order.status === filterStatus;
  });

  useEffect(() => {
    if (!socket) return;
    const refreshOrders = () => setSyncTick(Date.now());
    socket.on("order:updated", refreshOrders);
    socket.on("payment:updated", refreshOrders);
    return () => {
      socket.off("order:updated", refreshOrders);
      socket.off("payment:updated", refreshOrders);
    };
  }, [socket]);

  return (
    <div className="app-layout">
      <SidebarNav role="pharmacy" navItems={PharmacyNavItems} />

      <div className="main-content">
        <TopBar title="My Orders" />

        <div className="page-content animate-fade" style={{ paddingTop: 40 }}>
          <div
            className="page-header"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 32,
            }}
          >
            <div>
              <h1>My Orders</h1>
              <p style={{ color: "var(--gray-500)" }}>
                Track and manage your procurement orders
              </p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => (window.location.href = "/pharmacy/place-order")}
            >
              <FiPlus /> New Order
            </button>
          </div>

          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-body" style={{ display: "flex", gap: 16 }}>
              <input
                type="text"
                placeholder="Search order ID or distributor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
                style={{ flex: 1 }}
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="form-input"
                style={{ width: "200px" }}
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="processing">Processing</option>
                <option value="dispatched">Dispatched</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="received">Received</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Distributor</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="6"
                      style={{ textAlign: "center", padding: 40 }}
                    >
                      Loading your orders...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      style={{ textAlign: "center", padding: 40 }}
                    >
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td style={{ fontWeight: 700, color: "var(--brand)" }}>
                        {order.displayId}
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {order.distributorName}
                      </td>
                      <td>{order.createdAt}</td>
                      <td style={{ fontWeight: 700 }}>
                        Rs. {order.totalAmount?.toLocaleString()}
                      </td>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <span className={`badge ${getWorkflowBadgeClass(order.status)}`} title="Delivery Workflow Status">
                            {getWorkflowLabel(order.status).toUpperCase()}
                          </span>
                          <span className={`badge ${getPaymentBadgeClass(order.paymentStatus)}`} title="Payment Status">
                            {getPaymentLabel(order.paymentStatus).toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowDetailsModal(true);
                            }}
                          >
                            Details
                          </button>
                          {(order.status === "completed" ||
                            order.status === "received" ||
                            order.status === "delivered") && (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowInvoice(true);
                              }}
                            >
                              <FiFileText />
                            </button>
                          )}
                          {canRateOrder(order) && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => openRateModal(order)}
                            >
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
        <Modal
          onClose={() => setShowDetailsModal(false)}
          title={`Order: ${selectedOrder.displayId}`}
          size="xl"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <OrderDetailsPanel
              order={selectedOrder}
              role="pharmacy"
              statusUpdating={false}
              onMarkReceived={() => handleMarkReceived(selectedOrder.id)}
              canManagePayment={false}
            />

            <div style={{ borderTop: "1px solid var(--gray-200)", paddingTop: 16, marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "var(--gray-500)" }}>
                Having issues with this order?
              </span>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => setShowReportModal(true)}
              >
                Report Issue
              </button>
            </div>

            {selectedOrder.distributorRating ? (
              <div style={{ marginTop: 16, fontSize: 14, color: "var(--gray-600)" }}>
                Your rating:{" "}
                <span style={{ color: "#fbbf24", fontWeight: 700 }}>
                  {"★".repeat(selectedOrder.distributorRating)}
                </span>
              </div>
            ) : canRateOrder(selectedOrder) ? (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                style={{ marginTop: 16 }}
                onClick={() => {
                  setShowDetailsModal(false);
                  openRateModal(selectedOrder);
                }}
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
          reportedUserId={selectedOrder.distributorId?.userId}
          defaultType="order"
        />
      )}

      {ratingModal?.orderId && (
        <PostOrderRatingModal
          orderId={ratingModal.orderId}
          counterpartName={ratingModal.counterpartName}
          reportedUserId={ratingModal.reportedUserId}
          raterRole="pharmacy"
          onClose={() => {
            setRatingModal(null);
            fetchOrders();
          }}
          onSkip={() => setRatingModal(null)}
        />
      )}
    </div>
  );
};

export default MyOrders;
