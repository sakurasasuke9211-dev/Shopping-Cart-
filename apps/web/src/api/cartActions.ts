import { addToCart as apiAddToCart, type CartLineInput } from "./client";
import { upsertGuestCartItem } from "../auth/guestStorage";
import type { CartView } from "@sports-shop/shared";

/** Add to Express cart and mirror into guest localStorage for post-login merge. */
export async function addToCartWithGuestMirror(
  input: CartLineInput & { sessionId: string },
): Promise<CartView> {
  const cart = await apiAddToCart(input);
  upsertGuestCartItem({
    productId: input.productId,
    quantity: input.quantity ?? 1,
    size: input.size,
    color: input.color,
  });
  return cart;
}
