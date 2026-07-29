import type { CartLineInput } from "../api/client";

const BUY_NOW_KEY = "sports-mart.buyNow";

export type BuyNowItem = CartLineInput;

export function setBuyNowItem(item: BuyNowItem): void {
  sessionStorage.setItem(BUY_NOW_KEY, JSON.stringify(item));
}

export function getBuyNowItem(): BuyNowItem | null {
  try {
    const raw = sessionStorage.getItem(BUY_NOW_KEY);
    return raw ? (JSON.parse(raw) as BuyNowItem) : null;
  } catch {
    return null;
  }
}

export function clearBuyNowItem(): void {
  sessionStorage.removeItem(BUY_NOW_KEY);
}
