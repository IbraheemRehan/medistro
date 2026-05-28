import React from 'react';
import { calcDiscountedPrice } from '../utils/pricing';

export default function PriceDisplay({
  originalPrice,
  discountPercent = 0,
  finalPrice,
  size = 'md',
  showBadge = true,
}) {
  const original = Number(originalPrice) || 0;
  const pct = Number(discountPercent) || 0;
  const final =
    finalPrice != null ? Number(finalPrice) : calcDiscountedPrice(original, pct);
  const hasDiscount = pct > 0 && final < original;

  const fontSize = size === 'sm' ? 13 : size === 'lg' ? 18 : 15;

  if (!hasDiscount) {
    return (
      <span style={{ fontWeight: 600, fontSize }}>Rs. {final.toLocaleString()}</span>
    );
  }

  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 700, fontSize, color: 'var(--brand, #1565C0)' }}>
          Rs. {final.toLocaleString()}
        </span>
        {showBadge && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              background: '#dcfce7',
              color: '#166534',
              padding: '2px 6px',
              borderRadius: 4,
            }}
          >
            -{pct}%
          </span>
        )}
      </span>
      <span
        style={{
          fontSize: size === 'sm' ? 11 : 12,
          color: 'var(--gray-400)',
          textDecoration: 'line-through',
        }}
      >
        Rs. {original.toLocaleString()}
      </span>
    </span>
  );
}
