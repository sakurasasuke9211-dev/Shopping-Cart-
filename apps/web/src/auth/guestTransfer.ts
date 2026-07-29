import type { User } from "@supabase/supabase-js";
import type { UserPreferences } from "@sports-shop/shared";
import { addToCart, fetchCart, updateCart } from "../api/client";
import { getSupabase } from "../lib/supabase";
import {
  clearGuestCart,
  readGuestCart,
  readGuestPreferences,
  type GuestCartItem,
} from "./guestStorage";

function productTypesFromPrefs(prefs: UserPreferences): string[] {
  return Array.isArray(prefs.productType)
    ? prefs.productType
    : [prefs.productType];
}

function lineKey(item: {
  productId: string;
  size?: string | null;
  color?: string | null;
}): string {
  return `${item.productId}::${item.size ?? ""}::${item.color ?? ""}`;
}

/** In-flight merges keyed by user id — prevents qty inflation from concurrent SIGNED_IN handlers. */
const transferInFlight = new Map<string, Promise<void>>();

/**
 * Merge guest localStorage preferences + cart into Supabase (RLS).
 * Express session cart is synced to absolute guest quantities (not incremented).
 */
export async function transferGuestDataToDatabase(
  user: User,
  sessionId: string,
): Promise<void> {
  const existing = transferInFlight.get(user.id);
  if (existing) return existing;

  const run = doTransfer(user, sessionId).finally(() => {
    transferInFlight.delete(user.id);
  });
  transferInFlight.set(user.id, run);
  return run;
}

async function doTransfer(user: User, sessionId: string): Promise<void> {
  const supabase = getSupabase();
  const prefs = readGuestPreferences();
  const guestCart = readGuestCart();

  const fullName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    "";

  await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email ?? null,
      full_name: fullName,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (prefs) {
    await supabase.from("user_preferences").upsert(
      {
        user_id: user.id,
        age_group: prefs.ageGroup,
        primary_sport: prefs.primarySport,
        additional_sports: prefs.additionalSports ?? [],
        product_types: productTypesFromPrefs(prefs),
        experience_level: prefs.experienceLevel,
        budget_min: prefs.budgetMin,
        budget_max: prefs.budgetMax,
        preferred_benefits: prefs.preferredBenefits ?? [],
        raw_preferences: prefs,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
  }

  if (guestCart.length === 0) return;

  for (const item of guestCart) {
    await supabase.from("cart_items").upsert(
      {
        user_id: user.id,
        product_id: item.productId,
        quantity: item.quantity,
        size: item.size ?? "",
        color: item.color ?? "",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,product_id,size,color" },
    );
  }

  await syncGuestCartToExpress(sessionId, guestCart);
  clearGuestCart();
}

/** Set Express lines to guest absolute quantities — never stack addToCart on existing lines. */
async function syncGuestCartToExpress(
  sessionId: string,
  guestCart: GuestCartItem[],
): Promise<void> {
  try {
    const current = await fetchCart(sessionId);
    const byKey = new Map(
      current.items.map((item) => [lineKey(item), item] as const),
    );

    for (const item of guestCart) {
      const key = lineKey(item);
      const existing = byKey.get(key);
      const quantity = Math.max(1, item.quantity || 1);

      if (existing) {
        if (existing.quantity !== quantity) {
          await updateCart({
            sessionId,
            productId: item.productId,
            quantity,
            size: item.size,
            color: item.color,
          });
        }
      } else {
        await addToCart({
          sessionId,
          productId: item.productId,
          quantity,
          size: item.size,
          color: item.color,
        });
      }
    }
  } catch {
    /* Express cart merge is best-effort for checkout continuity */
  }
}
