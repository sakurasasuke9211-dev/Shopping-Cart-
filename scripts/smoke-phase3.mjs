const base = "http://localhost:4000";

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

async function main() {
  const health = await json("GET", "/api/health");
  console.log("health", health.status, health.inventory?.productCount);

  const products = await json(
    "GET",
    "/api/products?sport=Walking&sort=price_asc&pageSize=5",
  );
  console.log("products", products.total, products.items[0]?.productId);

  const detail = await json(
    "GET",
    `/api/products/${products.items[0].productId}`,
  );
  console.log("detail", detail.productId, detail.availability);

  const sessionId = `sess_phase3_${Date.now()}`;
  const cart = await json("POST", "/api/cart", {
    sessionId,
    productId: products.items[0].productId,
    quantity: 1,
  });
  console.log("cart", cart.subtotal, cart.items.length);

  const order = await json("POST", "/api/orders", {
    sessionId,
    customer: {
      name: "Guest User",
      email: "guest@example.com",
      shippingAddress: {
        line1: "12 Example Street",
        city: "Mumbai",
        postalCode: "400001",
      },
    },
  });
  console.log("order", order.orderId, order.status, order.amount);

  const payment = await json("POST", "/api/payments/create", {
    orderId: order.orderId,
  });
  console.log("payment", payment.paymentId, payment.status);

  const confirmed = await json("POST", "/api/payments/confirm", {
    paymentId: payment.paymentId,
    orderId: order.orderId,
  });
  console.log("confirmed", confirmed);

  const emptyCart = await json("GET", `/api/cart/${sessionId}`);
  console.log("cart after pay", emptyCart.items.length);

  const recs = await json("POST", "/api/recommendations", {
    ageGroup: "55+",
    primarySport: "Walking",
    additionalSports: ["Yoga"],
    productType: ["Footwear", "Accessories"],
    experienceLevel: "Beginner",
    budgetMin: 10,
    budgetMax: 200,
    preferredBenefits: ["Lightweight"],
  });
  console.log("recs meta", recs.meta);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
