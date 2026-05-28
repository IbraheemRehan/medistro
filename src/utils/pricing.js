/** Apply discount percentage to a base price (0–100). */
export function calcDiscountedPrice(originalPrice, discountPercent = 0) {
  const base = Number(originalPrice) || 0;
  const pct = Math.min(100, Math.max(0, Number(discountPercent) || 0));
  if (pct <= 0) return base;
  return Number((base * (1 - pct / 100)).toFixed(2));
}

export function calcLineSubtotal(unitPrice, quantity) {
  return Number((Number(unitPrice) * Number(quantity)).toFixed(2));
}

export function calcTotalSavings(items) {
  return items.reduce((sum, item) => {
    const orig = Number(item.originalPrice ?? item.originalUnitPrice ?? item.salePrice ?? item.price ?? 0);
    const final = Number(item.salePrice ?? item.unitPrice ?? item.price ?? orig);
    const qty = Number(item.quantity) || 0;
    const savings = Math.max(0, (orig - final) * qty);
    return sum + savings;
  }, 0);
}
