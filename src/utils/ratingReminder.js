const STORAGE_KEY = 'medistro_dismissed_rating_reminders';

export function getDismissedRatingReminders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function dismissRatingReminder(orderId) {
  const id = String(orderId);
  const list = getDismissedRatingReminders();
  if (!list.includes(id)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...list, id]));
  }
}

export function findUnratedOrderForReminder(orders, role) {
  const dismissed = new Set(getDismissedRatingReminders());
  const eligible = (orders || []).filter((o) => {
    if (!o?.id && !o?._id) return false;
    const id = o.id || o._id;
    if (dismissed.has(String(id))) return false;
    if (['cancelled', 'rejected'].includes(o.status)) return false;
    if (role === 'pharmacy') return !o.distributorRating;
    if (role === 'distributor') return !o.pharmacyRating;
    return false;
  });
  return eligible[0] || null;
}
