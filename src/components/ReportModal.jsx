import React, { useState } from 'react';
import Modal from './Modal';
import API from '../config/api.config';
import toast from 'react-hot-toast';

export default function ReportModal({ onClose, reportedUserId, orderId, defaultType = 'other' }) {
  const [type, setType] = useState(defaultType);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      return toast.error('Please enter a description for the report');
    }
    try {
      setSubmitting(true);
      await API.post('/api/v1/users/report', {
        reportedUser: reportedUserId || undefined,
        order: orderId || undefined,
        type,
        description
      });
      toast.success('Report submitted successfully. Our moderation team will review it.');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal onClose={onClose} title="File a Formal Report" size="md">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ fontSize: 13, color: 'var(--gray-500)', lineHeight: '1.4' }}>
          Please provide details regarding the issue. Your report will be routed to Medistro administrators for immediate review and action.
        </p>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Report Category</label>
          <select 
            value={type} 
            onChange={(e) => setType(e.target.value)} 
            className="form-input"
          >
            <option value="user">User Conduct</option>
            <option value="order">Order Issues (e.g. damages, delay)</option>
            <option value="product">Product Quality / Batch Info</option>
            <option value="other">Other Issues</option>
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Detailed Description</label>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-input"
            rows="5"
            placeholder="Describe the issue in detail, including specific batch numbers, timestamps, or behaviors..."
            style={{ resize: 'vertical', minHeight: 100 }}
          />
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 12 }}>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
