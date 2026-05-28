const STOCK_MESSAGE =
  'Sorry, this medicine is out of stock or available quantity is not enough.';

const STOCK_PATTERNS = [
  /insufficient stock/i,
  /out of stock/i,
  /not enough stock/i,
  /available quantity/i,
  /exceeds available stock/i,
];

const ID_PATTERNS = [
  /\b[0-9a-f]{24}\b/i,
  /medicine:\s*/i,
  /batch not found/i,
  /batch is inactive/i,
];

/**
 * Maps raw API error messages to user-friendly text.
 * Never exposes MongoDB IDs or internal error strings.
 */
export function getApiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  const raw =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    (typeof error?.message === 'string' ? error.message : '');

  if (!raw || typeof raw !== 'string') return fallback;

  if (error?.response?.data?.code === 'INSUFFICIENT_STOCK') return STOCK_MESSAGE;

  if (STOCK_PATTERNS.some((p) => p.test(raw))) return STOCK_MESSAGE;

  if (ID_PATTERNS.some((p) => p.test(raw))) {
    if (/stock|inventory|quantity/i.test(raw)) return STOCK_MESSAGE;
    return fallback;
  }

  if (/internal server error/i.test(raw)) return fallback;

  return raw;
}

export { STOCK_MESSAGE };
