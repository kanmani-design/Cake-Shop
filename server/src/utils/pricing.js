export const DELIVERY_FEE = 60, FREE_DELIVERY_OVER = 1500, DISCOUNT_OVER = 3000, DISCOUNT_RATE = 0.05;
export function calcTotals(items) {
  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  const deliveryFee = subtotal === 0 || subtotal >= FREE_DELIVERY_OVER ? 0 : DELIVERY_FEE;
  const discount = subtotal >= DISCOUNT_OVER ? Math.round(subtotal * DISCOUNT_RATE) : 0;
  return { subtotal, deliveryFee, discount, total: subtotal + deliveryFee - discount };
}
