const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** Formats a numeric amount as Indian Rupees, e.g. 14999 → "₹14,999". */
export function formatPrice(amount: number): string {
  return inr.format(amount);
}
