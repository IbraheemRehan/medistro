import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import API from '../config/api.config';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '../utils/apiErrors';
import { calcDiscountedPrice } from '../utils/pricing';

export default function EditMedicineModal({ item, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: '',
    salePrice: '',
    discountPercent: '',
    availableStock: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!item) return;
    setForm({
      name: item.medicineName || item.medicineId?.name || '',
      salePrice: item.salePrice ?? item.latestBatch?.salePrice ?? '',
      discountPercent: item.discountPercent ?? item.latestBatch?.discountPercent ?? 0,
      availableStock: item.availableStock ?? '',
    });
  }, [item]);

  if (!item) return null;

  const previewPrice = calcDiscountedPrice(
    Number(form.salePrice) || 0,
    Number(form.discountPercent) || 0
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.put(`/api/v1/inventory/${item.id || item._id}`, {
        name: form.name.trim(),
        salePrice: Number(form.salePrice),
        discountPercent: Number(form.discountPercent) || 0,
        availableStock: Number(form.availableStock),
      });
      toast.success('Medicine updated successfully');
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update medicine'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal onClose={onClose} title="Edit Medicine" size="md">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Medicine name</label>
          <input
            className="form-input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

        <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Sale price (Rs.)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="form-input"
              value={form.salePrice}
              onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Discount (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              className="form-input"
              value={form.discountPercent}
              onChange={(e) => setForm({ ...form, discountPercent: e.target.value })}
            />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Available stock</label>
          <input
            type="number"
            min="0"
            className="form-input"
            value={form.availableStock}
            onChange={(e) => setForm({ ...form, availableStock: e.target.value })}
            required
          />
        </div>

        {Number(form.discountPercent) > 0 && (
          <p style={{ fontSize: 13, color: '#166534', margin: 0, padding: '10px 12px', background: '#f0fdf4', borderRadius: 8 }}>
            Customer price after discount: <strong>Rs. {previewPrice.toLocaleString()}</strong>
          </p>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
