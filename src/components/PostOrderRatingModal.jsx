import React, { useState } from 'react';
import Modal from './Modal';
import API from '../config/api.config';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '../utils/apiErrors';
import { dismissRatingReminder } from '../utils/ratingReminder';

const REPORT_REASONS = [
  { value: 'user', label: 'Inappropriate conduct' },
  { value: 'order', label: 'Order / delivery issues' },
  { value: 'product', label: 'Product quality concerns' },
  { value: 'other', label: 'Other' },
];

export default function PostOrderRatingModal({
  onClose,
  onSkip,
  orderId,
  counterpartName,
  reportedUserId,
  raterRole = 'pharmacy',
}) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [wantReport, setWantReport] = useState(false);
  const [reportType, setReportType] = useState('user');
  const [reportDescription, setReportDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const targetLabel = raterRole === 'pharmacy' ? 'distributor' : 'pharmacy';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1) {
      toast.error('Please select a star rating, or skip for now.');
      return;
    }
    setSubmitting(true);
    try {
      await API.put(`/api/v1/orders/${orderId}/rate`, { rating, feedback });
      if (wantReport && reportDescription.trim()) {
        await API.post('/api/v1/users/report', {
          reportedUser: reportedUserId || undefined,
          order: orderId,
          type: reportType,
          description: reportDescription.trim(),
        });
        toast.success('Thank you! Your rating and report were submitted.');
      } else {
        toast.success('Thank you for your feedback!');
      }
      if (orderId) dismissRatingReminder(orderId);
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to submit rating.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    if (orderId) dismissRatingReminder(orderId);
    (onSkip || onClose)?.();
  };

  return (
    <Modal onClose={handleSkip} title="Rate your experience" size="md">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ fontSize: 14, color: 'var(--gray-600)', margin: 0 }}>
          How was your experience with <strong>{counterpartName}</strong>? Your feedback helps improve the platform.
        </p>

        <div>
          <label className="form-label">Rating (1–5 stars)</label>
          <div
            style={{ display: 'flex', gap: 6, fontSize: 32, cursor: 'pointer' }}
            onMouseLeave={() => setHover(0)}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                role="button"
                tabIndex={0}
                aria-label={`${star} stars`}
                onMouseEnter={() => setHover(star)}
                onClick={() => setRating(star)}
                onKeyDown={(ev) => ev.key === 'Enter' && setRating(star)}
                style={{ color: star <= (hover || rating) ? '#fbbf24' : '#d1d5db' }}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Feedback (optional)</label>
          <textarea
            className="form-input"
            rows={3}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder={`Share your experience with this ${targetLabel}...`}
          />
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={wantReport}
            onChange={(e) => setWantReport(e.target.checked)}
          />
          Report this {targetLabel}
        </label>

        {wantReport && (
          <>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Report reason</label>
              <select
                className="form-input"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                {REPORT_REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Report details</label>
              <textarea
                className="form-input"
                rows={3}
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Describe the issue..."
                required={wantReport}
              />
            </div>
          </>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
          <button type="button" className="btn btn-secondary" onClick={handleSkip} disabled={submitting}>
            Skip for now
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit feedback'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
