import type { ProductCategory } from "@sports-shop/shared";

/**
 * Curated Unsplash product-scene URLs (w=800) used when inventory image cells are
 * empty or point at non-resolving placeholders such as example.com.
 */
const BY_CATEGORY: Record<ProductCategory, string[]> = {
  Footwear: [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=800&q=80",
  ],
  Equipment: [
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=800&q=80",
  ],
  Clothing: [
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=800&q=80",
  ],
  Accessories: [
    "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=800&q=80",
  ],
  Support: [
    "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80",
  ],
  "Fitness technology": [
    "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&w=800&q=80",
  ],
};

export const LOCAL_PRODUCT_PLACEHOLDER = "/placeholder-product.svg";

function hashId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** Reject empty, obviously fake, or non-http(s) inventory image cells. */
export function isUsableImageUrl(value: string): boolean {
  const url = value.trim();
  if (!url) return false;
  if (url.startsWith("/")) return true;
  if (!/^https?:\/\//i.test(url)) return false;
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (
      host === "example.com" ||
      host.endsWith(".example.com") ||
      host === "example.org" ||
      host === "localhost"
    ) {
      return false;
    }
  } catch {
    return false;
  }
  return true;
}

export function fallbackImageForProduct(
  productId: string,
  category: ProductCategory,
): string {
  const pool = BY_CATEGORY[category] ?? BY_CATEGORY.Equipment;
  return pool[hashId(productId) % pool.length]!;
}

/** Keep real URLs; replace empty / example.com cells with category stock photos. */
export function resolveProductImages(
  productId: string,
  category: ProductCategory,
  images: string[],
): string[] {
  const usable = images.map((item) => item.trim()).filter(isUsableImageUrl);
  if (usable.length > 0) return usable;
  return [fallbackImageForProduct(productId, category)];
}
