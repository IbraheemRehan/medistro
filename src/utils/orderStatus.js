export const WORKFLOW_LABELS = {
  pending: "Pending",
  accepted: "Accepted",
  processing: "Processing",
  dispatched: "Dispatched",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  received: "Received",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const PAYMENT_LABELS = {
  paid: "Paid",
  unpaid: "Unpaid",
  pending_payment: "Pending Payment",
  payment_verified: "Payment Verified",
};

export const normalizeWorkflowStatus = (status) => {
  if (status === "approved") return "accepted";
  if (status === "rejected") return "cancelled";
  if (status === "paid") return "completed";
  return status || "pending";
};

export const normalizePaymentStatus = (status) => {
  if (status === "partial") return "pending_payment";
  return status || "pending_payment";
};

export const getWorkflowLabel = (status) =>
  WORKFLOW_LABELS[normalizeWorkflowStatus(status)] || "Pending";

export const getPaymentLabel = (status) =>
  PAYMENT_LABELS[normalizePaymentStatus(status)] || "Pending Payment";

export const getWorkflowBadgeClass = (status) => {
  const normalized = normalizeWorkflowStatus(status);
  if (["completed", "delivered", "received"].includes(normalized)) return "badge-green";
  if (["dispatched", "out_for_delivery"].includes(normalized)) return "badge-teal";
  if (normalized === "accepted" || normalized === "processing") return "badge-blue";
  if (normalized === "pending") return "badge-amber";
  if (normalized === "cancelled") return "badge-red";
  return "badge-gray";
};

export const getPaymentBadgeClass = (status) => {
  const normalized = normalizePaymentStatus(status);
  if (normalized === "paid" || normalized === "payment_verified") return "badge-green";
  if (normalized === "pending_payment") return "badge-amber";
  if (normalized === "unpaid") return "badge-red";
  return "badge-gray";
};

