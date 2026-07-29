const base = "http://localhost:4000";

async function json(method, path, body) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(`${method} ${path} -> ${response.status} ${JSON.stringify(data)}`);
  }
  return data;
}

async function main() {
  const prefs = {
    ageGroup: "55+",
    primarySport: "Walking",
    additionalSports: ["Yoga"],
    productType: ["Footwear", "Equipment"],
    experienceLevel: "Beginner",
    budgetMin: 20,
    budgetMax: 120,
    preferredBenefits: ["Lightweight", "Comfort-focused"],
  };

  const first = await json("POST", "/api/recommendations", prefs);
  const second = await json("POST", "/api/recommendations", prefs);

  const same =
    JSON.stringify(first.primary.map((p) => p.product.productId)) ===
    JSON.stringify(second.primary.map((p) => p.product.productId));

  console.log(
    JSON.stringify(
      {
        deterministic: same,
        meta: first.meta,
        primaryCount: first.primary.length,
        additionalCount: first.additional.length,
        accessoriesCount: first.accessories.length,
        primary: first.primary.map((item) => ({
          id: item.product.productId,
          score: item.score,
          brand: item.product.brand,
          subcategory: item.product.subcategory,
          explanation: item.explanation,
        })),
        accessories: first.accessories.map((item) => ({
          id: item.product.productId,
          explanation: item.explanation,
        })),
      },
      null,
      2,
    ),
  );

  const brands = first.primary.map((item) => item.product.brand);
  const brandCounts = brands.reduce((acc, brand) => {
    acc[brand] = (acc[brand] ?? 0) + 1;
    return acc;
  }, {});
  console.log("brandCounts", brandCounts);

  const tight = await json("POST", "/api/recommendations", {
    ...prefs,
    budgetMin: 480,
    budgetMax: 500,
    productType: "Footwear",
  });
  console.log("fallback", tight.meta, "primary", tight.primary.length);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
