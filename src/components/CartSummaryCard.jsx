import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MdDelete, MdOutlineShoppingCart } from 'react-icons/md';
import PriceDisplay from './PriceDisplay';
import '../styles/cartSummary.css';

export default function CartSummaryCard({
  items = [],
  selectedDistributor,
  distributorName,
  onRemoveItem,
  onViewCart,
}) {
  const navigate = useNavigate();
  const distLabel = distributorName || selectedDistributor?.companyName;

  const total = items.reduce((sum, i) => sum + (i.subtotal || i.unitPrice * i.quantity || 0), 0);
  const totalSavings = items.reduce((sum, i) => {
    const orig = Number(i.originalUnitPrice ?? i.originalPrice ?? i.price ?? i.unitPrice) || 0;
    const final = Number(i.unitPrice ?? i.price) || orig;
    return sum + Math.max(0, (orig - final) * (i.quantity || 0));
  }, 0);

  return (
    <div className="card cart-summary-card">
      <div className="card-header">
        <h3 className="card-title">Cart Summary</h3>
        {distLabel && (
          <p className="cart-summary-subtitle">{distLabel}</p>
        )}
        {!distLabel && (
          <p className="cart-summary-subtitle">Select a distributor to view their cart items</p>
        )}
      </div>

      <div className="cart-summary-body">
        {items.length === 0 ? (
          <div className="cart-summary-empty">
            <MdOutlineShoppingCart size={36} style={{ marginBottom: 12, opacity: 0.4 }} />
            <p>
              {selectedDistributor
                ? 'No items for this distributor yet.'
                : 'Your cart is empty or no distributor is selected.'}
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={`${item.medicineId}_${item.distributorId}`}
              className="cart-summary-item"
            >
              <div className="cart-summary-item-main">
                <p className="cart-summary-item-name">{item.medicineName || 'Medicine'}</p>
                <p className="cart-summary-item-meta">
                  <PriceDisplay
                    originalPrice={item.originalUnitPrice ?? item.price ?? item.unitPrice}
                    discountPercent={item.discountPercent}
                    finalPrice={item.unitPrice ?? item.price}
                    size="sm"
                  />
                </p>
                {!selectedDistributor && item.distributorName && (
                  <span className="cart-summary-item-dist">{item.distributorName}</span>
                )}
              </div>
              <div className="cart-summary-item-right">
                <span className="cart-summary-qty">Qty: {item.quantity}</span>
                <span style={{ fontWeight: 700, fontSize: 14 }}>
                  Rs. {(item.subtotal || 0).toLocaleString()}
                </span>
                {onRemoveItem && (
                  <button
                    type="button"
                    className="cart-summary-remove"
                    onClick={() => onRemoveItem(item.medicineId)}
                    aria-label="Remove item"
                  >
                    <MdDelete size={18} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {items.length > 0 && (
        <div className="cart-summary-footer">
          {totalSavings > 0 && (
            <div className="cart-summary-total-row" style={{ marginBottom: 8 }}>
              <span className="cart-summary-total-label" style={{ color: '#166534', fontSize: 13 }}>
                You save
              </span>
              <span style={{ fontWeight: 700, color: '#166534', fontSize: 14 }}>
                Rs. {totalSavings.toLocaleString()}
              </span>
            </div>
          )}
          <div className="cart-summary-total-row">
            <span className="cart-summary-total-label">Estimated total</span>
            <span className="cart-summary-total-value">Rs. {total.toLocaleString()}</span>
          </div>
          <div className="cart-summary-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={onViewCart || (() => navigate('/pharmacy/cart'))}
            >
              View full cart
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/pharmacy/place-order')}
            >
              Place order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
