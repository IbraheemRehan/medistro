import React from 'react';
import { FiStar, FiX } from 'react-icons/fi';
import { dismissRatingReminder } from '../utils/ratingReminder';

export default function RatingReminderBanner({ order, role, onRate, onDismiss }) {
  if (!order) return null;

  const orderId = order.id || order._id;
  const counterpart =
    role === 'pharmacy'
      ? order.distributorName || order.distributorId?.companyName || 'your distributor'
      : order.pharmacyName || order.pharmacyId?.pharmacyName || 'the pharmacy';

  const handleDismiss = () => {
    dismissRatingReminder(orderId);
    onDismiss?.();
  };

  return (
    <div
      role="status"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 16,
        padding: '14px 18px',
        marginBottom: 24,
        borderRadius: 12,
        background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)',
        border: '1px solid #bfdbfe',
        boxShadow: '0 2px 8px rgba(21, 101, 192, 0.08)',
      }}
    >
      <FiStar size={22} color="#fbbf24" style={{ flexShrink: 0, marginTop: 2 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: '#1e3a5f' }}>
          Please rate your recent order
        </p>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#4b5563', lineHeight: 1.45 }}>
          How was your experience with <strong>{counterpart}</strong>?
          Order {order.displayId || `#${String(orderId).slice(-8).toUpperCase()}`}
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => onRate?.(order)}>
            Rate order
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={handleDismiss}>
            Remind me later
          </button>
        </div>
      </div>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss"
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: '#6b7280',
          padding: 4,
        }}
      >
        <FiX size={18} />
      </button>
    </div>
  );
}
