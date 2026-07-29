/**
 * Phase 07 MVP smoke — full demo path against a running API.
 *
 * Usage:
 *   npm run smoke:phase7
 *   API_BASE=http://localhost:4000 npm run smoke:phase7
 */
const base = process.env.API_BASE ?? "http://localhost:4000";

const DEMO_PREFS = {
  ageGroup: "55+",
  primarySport: "Walking",
  additionalSports: [],
  productType: ["Footwear"],
  experienceLevel: "Beginner",
  budgetMin: 40,
  budgetMax: 100,
  preferredBenefits: ["Comfort-focused", "Low impact"],
};

const REFINE_PREFS = {
  ...DEMO_PREFS,
  primarySport: "Hiking",
  productType: ["Equipment", "Accessories"],
  budgetMin: 10,
  budgetMax: 120,
  preferredBenefits: ["Lightweight", "Beginner-friendly"],
};

async function json(method, path, body) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(`${method} ${path} -> ${response.status} ${text}`);
  }
  return data;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  console.log("Phase 07 smoke against", base);

  const health = await json("GET", "/api/health");
  assert(health.status === "ok", `API health degraded: ${JSON.stringify(health)}`);
  assert(
    health.inventory?.productCount > 0,
    "Inventory productCount must be > 0",
  );
  console.log(
    "✓ health",
    health.status,
    "source=",
    health.inventory.source,
    "products=",
    health.inventory.productCount,
  );

  const recs = await json("POST", "/api/recommendations", DEMO_PREFS);
  assert(Array.isArray(recs.primary), "primary missing");
  assert(recs.primary.length > 0, "demo prefs returned no primary products");
  assert(recs.primary.length <= 6, "primary cap exceeded");
  assert((recs.additional?.length ?? 0) <= 4, "additional cap exceeded");
  assert((recs.accessories?.length ?? 0) <= 3, "accessories cap exceeded");
  assert(
    recs.primary.every((item) => item.explanation && item.product?.availability === "in_stock"),
    "primary items need explanations and must be in stock",
  );
  console.log(
    "✓ recommendations",
    recs.primary.length,
    "+",
    recs.additional?.length ?? 0,
    "+",
    recs.accessories?.length ?? 0,
  );

  const refined = await json("POST", "/api/recommendations", REFINE_PREFS);
  const firstDemo = recs.primary[0]?.product?.productId;
  const firstRefine = refined.primary[0]?.product?.productId;
  console.log("✓ refine", firstDemo, "→", firstRefine || "(empty primary)");

  const productId = firstDemo;
  const before = await json("GET", `/api/products/${productId}`);
  assert(before.availability === "in_stock", "demo product must be in stock");
  const stockBefore = before.stockQuantity;

  const sessionId = `sess_phase7_${Date.now()}`;
  const cart = await json("POST", "/api/cart", {
    sessionId,
    productId,
    quantity: 1,
  });
  assert(cart.items.length === 1, "cart should have one line");
  console.log("✓ cart", cart.subtotal);

  const order = await json("POST", "/api/orders", {
    sessionId,
    customer: {
      name: "Phase Seven Guest",
      email: "phase7@example.com",
      shippingAddress: {
        line1: "45 Demo Lane",
        city: "Austin",
        postalCode: "78701",
        country: "United States",
      },
    },
  });
  assert(order.status === "pending_payment", "order should be pending_payment");
  console.log("✓ order", order.orderId, order.amount);

  const payment = await json("POST", "/api/payments/create", {
    orderId: order.orderId,
  });
  assert(payment.status === "requires_confirmation", "payment needs confirmation");

  const confirmed = await json("POST", "/api/payments/confirm", {
    paymentId: payment.paymentId,
    orderId: order.orderId,
  });
  assert(confirmed.status === "paid", "payment should be paid");
  console.log("✓ payment", confirmed.paymentId);

  const paidOrder = await json("GET", `/api/orders/${order.orderId}`);
  assert(paidOrder.status === "confirmed", "order should be confirmed");
  assert(paidOrder.items.length >= 1, "confirmed order should list items");

  const emptyCart = await json("GET", `/api/cart/${sessionId}`);
  assert(emptyCart.items.length === 0, "cart should clear after payment");

  const after = await json("GET", `/api/products/${productId}`);
  assert(
    after.stockQuantity === stockBefore - 1,
    `stock should decrement (${stockBefore} → ${after.stockQuantity})`,
  );
  console.log("✓ stock", stockBefore, "→", after.stockQuantity);
  console.log("✓ confirmation path ready for UI orderId", order.orderId);
  console.log("Phase 07 smoke passed.");
}

main().catch((error) => {
  console.error("Phase 07 smoke failed:", error.message || error);
  process.exit(1);
});
