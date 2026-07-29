import type { UserPreferences } from "@sports-shop/shared";
import type { CartLineInput } from "../api/client";

export const PREFS_STORAGE_KEY = "sports-mart.preferences";
export const GUEST_CART_KEY = "sports-mart.guestCart";

export type GuestCartItem = CartLineInput;

export function readGuestPreferences(): UserPreferences | null {
  try {
    const raw =
      localStorage.getItem(PREFS_STORAGE_KEY) ??
      sessionStorage.getItem(PREFS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UserPreferences) : null;
  } catch {
    return null;
  }
}

export function writeGuestPreferences(preferences: UserPreferences | null): void {
  if (preferences) {
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(preferences));
    sessionStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(preferences));
  } else {
    localStorage.removeItem(PREFS_STORAGE_KEY);
    sessionStorage.removeItem(PREFS_STORAGE_KEY);
  }
}

export function readGuestCart(): GuestCartItem[] {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as GuestCartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeGuestCart(items: GuestCartItem[]): void {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

export function clearGuestCart(): void {
  localStorage.removeItem(GUEST_CART_KEY);
}

function lineKey(item: Pick<GuestCartItem, "productId" | "size" | "color">): string {
  return `${item.productId}::${item.size ?? ""}::${item.color ?? ""}`;
}

/** Increment (or add) a guest cart line — used when Add to cart succeeds. */
export function upsertGuestCartItem(item: GuestCartItem): GuestCartItem[] {
  const items = readGuestCart();
  const key = lineKey(item);
  const index = items.findIndex((row) => lineKey(row) === key);
  if (index >= 0) {
    const existing = items[index]!;
    items[index] = {
      ...existing,
      quantity: existing.quantity + (item.quantity || 1),
    };
  } else {
    items.push({ ...item, quantity: item.quantity || 1 });
  }
  writeGuestCart(items);
  return items;
}

/** Set absolute quantity for a guest cart line (0 removes). */
export function setGuestCartItemQuantity(item: GuestCartItem): GuestCartItem[] {
  const items = readGuestCart().filter((row) => lineKey(row) !== lineKey(item));
  if ((item.quantity || 0) > 0) {
    items.push({ ...item, quantity: item.quantity });
  }
  writeGuestCart(items);
  return items;
}

export function removeGuestCartItem(
  item: Pick<GuestCartItem, "productId" | "size" | "color">,
): GuestCartItem[] {
  const items = readGuestCart().filter((row) => lineKey(row) !== lineKey(item));
  writeGuestCart(items);
  return items;
}
