export function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function cartQuantityTotal(
  items: Array<{ quantity: number }>,
): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
