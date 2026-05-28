import React from "react";
import {
  FiCheckCircle,
  FiClock,
  FiPackage,
  FiTruck,
  FiHome,
  FiAward,
  FiMapPin,
  FiPhone,
  FiMail,
} from "react-icons/fi";
import {
  getPaymentBadgeClass,
  getPaymentLabel,
  getWorkflowBadgeClass,
  getWorkflowLabel,
} from "../utils/orderStatus";

const TIMELINE = [
  { key: "pending", label: "Order Placed", icon: <FiClock /> },
  { key: "accepted", label: "Accepted", icon: <FiCheckCircle /> },
  { key: "processing", label: "Processing", icon: <FiPackage /> },
  { key: "dispatched", label: "Dispatched", icon: <FiTruck /> },
  { key: "delivered", label: "Delivered", icon: <FiHome /> },
  { key: "received", label: "Received", icon: <FiCheckCircle /> },
  { key: "completed", label: "Completed", icon: <FiAward /> },
];

const statusProgressIndex = (status) => {
  const normalized = status === "out_for_delivery" ? "dispatched" : status;
  const idx = TIMELINE.findIndex((step) => step.key === normalized);
  return idx === -1 ? 0 : idx;
};

const OrderDetailsPanel = ({
  order,
  role,
  statusUpdating = false,
  paymentUpdating = false,
  onAccept,
  onCancel,
  onStatusChange,
  onMarkReceived,
  onPaymentChange,
  canManagePayment = false,
}) => {
  if (!order) return null;

  const currentIdx = statusProgressIndex(order.status);
  const isCancelled = order.status === "cancelled";
  const progressPercent = isCancelled ? 0 : Math.round((currentIdx / (TIMELINE.length - 1)) * 100);

  const isDistributor = role === "distributor";
  const isPharmacy = role === "pharmacy";
  const isAdmin = role === "admin";
  const canShowDistributorActions = isDistributor && !isCancelled;
  const canShowPharmacyAction = isPharmacy && ["dispatched", "out_for_delivery", "delivered"].includes(order.status);

  return (
    <div className="order-details-enterprise">
      <section className="order-details-header">
        <div>
          <h3>{order.displayId}</h3>
          <p>Created {order.createdAt}</p>
        </div>
        <div className="order-details-header-badges">
          <span className={`badge ${getWorkflowBadgeClass(order.status)}`}>
            Workflow: {getWorkflowLabel(order.status)}
          </span>
          <span className={`badge ${getPaymentBadgeClass(order.paymentStatus)}`}>
            Payment: {getPaymentLabel(order.paymentStatus)}
          </span>
          <span className="badge badge-blue">Total: Rs. {order.totalAmount.toLocaleString()}</span>
        </div>
      </section>

      <section className="order-details-grid">
        <article className="card order-details-info-card">
          <div className="card-header">
            <span className="card-title">{isDistributor ? "Pharmacy Information" : "Distributor Information"}</span>
          </div>
          <div className="card-body order-details-contact">
            <div><strong>{isDistributor ? order.pharmacyName : order.distributorName}</strong></div>
            <div><FiPhone /> {isDistributor ? (order.pharmacyContact || "N/A") : (order.distributorContact || "N/A")}</div>
            <div><FiMail /> {isDistributor ? (order.pharmacyEmail || "N/A") : (order.distributorEmail || "N/A")}</div>
            <div><FiMapPin /> {isDistributor ? (order.pharmacyAddress || "N/A") : (order.distributorAddress || "N/A")}</div>
          </div>
        </article>

        <article className="card order-details-timeline-card">
          <div className="card-header">
            <span className="card-title">Workflow Timeline</span>
            <span className="badge badge-amber">{progressPercent}% Progress</span>
          </div>
          <div className="card-body">
            <div className="timeline-progress-track">
              <div className="timeline-progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
            <div className="workflow-timeline">
              {TIMELINE.map((step, index) => {
                const active = !isCancelled && index <= currentIdx;
                return (
                  <div key={step.key} className={`workflow-step ${active ? "active" : ""}`}>
                    <div className="workflow-step-icon">{step.icon}</div>
                    <div className="workflow-step-label">{step.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </article>
      </section>

      <section className="card">
        <div className="card-header">
          <span className="card-title">Medicines & Products</span>
        </div>
        <div className="card-body" style={{ paddingTop: 8 }}>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <div className="order-item-main">
                        <div className="order-item-avatar">{(item.medicineName || "M").slice(0, 1).toUpperCase()}</div>
                        <div>
                          <div style={{ fontWeight: 700 }}>{item.medicineName}</div>
                          <div style={{ fontSize: 12, color: "var(--gray-500)" }}>{item.genericName || "Generic not provided"}</div>
                        </div>
                      </div>
                    </td>
                    <td>{item.quantity}</td>
                    <td>Rs. {Number(item.salePrice || 0).toLocaleString()}</td>
                    <td style={{ fontWeight: 700 }}>Rs. {Number(item.subtotal || 0).toLocaleString()}</td>
                    <td>
                      <span className="badge badge-gray">{item.stockAvailability || "N/A"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <span className="card-title">Order Workflow Management</span>
        </div>
        <div className="card-body">
          <div className="order-actions-grid">
            {canShowDistributorActions && order.status === "pending" && (
              <>
                <button className="btn btn-primary workflow-btn workflow-btn-accept" disabled={statusUpdating} onClick={onAccept}>Accept Order</button>
                <button className="btn btn-danger workflow-btn workflow-btn-cancel" disabled={statusUpdating} onClick={onCancel}>Reject/Cancel</button>
              </>
            )}

            {canShowDistributorActions && order.status === "accepted" && (
              <>
                <button className="btn btn-secondary workflow-btn workflow-btn-processing" disabled={statusUpdating} onClick={() => onStatusChange("processing")}>Mark as Processing</button>
                <button className="btn btn-primary workflow-btn workflow-btn-dispatched" disabled={statusUpdating} onClick={() => onStatusChange("dispatched")}>Mark as Dispatched</button>
                <button className="btn btn-danger workflow-btn workflow-btn-cancel" disabled={statusUpdating} onClick={onCancel}>Cancel Order</button>
              </>
            )}

            {canShowDistributorActions && order.status === "processing" && (
              <>
                <button className="btn btn-primary workflow-btn workflow-btn-dispatched" disabled={statusUpdating} onClick={() => onStatusChange("dispatched")}>Mark as Dispatched</button>
                <button className="btn btn-danger workflow-btn workflow-btn-cancel" disabled={statusUpdating} onClick={onCancel}>Cancel Order</button>
              </>
            )}

            {canShowDistributorActions && (order.status === "dispatched" || order.status === "out_for_delivery") && (
              <button className="btn btn-primary workflow-btn workflow-btn-delivered" disabled={statusUpdating} onClick={() => onStatusChange("delivered")}>Mark as Delivered</button>
            )}

            {canShowPharmacyAction && (
              <button className="btn btn-primary workflow-btn workflow-btn-received" disabled={statusUpdating} onClick={onMarkReceived}>Mark as Received</button>
            )}
          </div>

          <div className="order-payment-controls">
            <span className="form-label">Payment Status</span>
            <select
              className="form-input"
              disabled={!canManagePayment || paymentUpdating}
              value={order.paymentStatus}
              onChange={(e) => onPaymentChange?.(e.target.value)}
            >
              <option value="pending_payment">Pending Payment</option>
              <option value="unpaid">Unpaid</option>
              <option value="payment_verified">Payment Verified</option>
              <option value="paid">Paid</option>
            </select>
            {!canManagePayment && (
              <p style={{ margin: 0, fontSize: 12, color: "var(--gray-500)" }}>
                {isAdmin ? "Admin override unavailable for this order." : "Payment updates are managed by distributor/admin."}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <span className="card-title">Activity & Insights</span>
        </div>
        <div className="card-body order-activity-list">
          <div>Order created at: <strong>{order.createdAt}</strong></div>
          <div>Last update: <strong>{order.updatedAt || order.createdAt}</strong></div>
          <div>Estimated progress: <strong>{progressPercent}%</strong></div>
          {order.note ? <div>Order note: <strong>{order.note}</strong></div> : null}
          {order.rejectionReason ? <div>Cancellation reason: <strong>{order.rejectionReason}</strong></div> : null}
        </div>
      </section>
    </div>
  );
};

export default OrderDetailsPanel;

