import { Link } from "react-router-dom";
import type { Product } from "@sports-shop/shared";
import { formatMoney } from "../../lib/money";
import { ProductImage } from "./ProductImage";

export type BrowseProduct = Product & {
  availability: "in_stock" | "out_of_stock";
};

export function BrowseProductCard({
  product,
  busy,
  onAddToCart,
}: {
  product: BrowseProduct;
  busy: boolean;
  onAddToCart: () => void;
}) {
  const image = product.images[0];
  const benefit = product.benefits[0] ?? product.category;
  const inStock = product.availability === "in_stock";
  const sports = product.sport.slice(0, 2).join(", ");

  return (
    <article className="rec-card">
      <div className="rec-card__media">
        <ProductImage
          src={image}
          altSrcs={product.images.slice(1)}
          alt={product.name}
        />
      </div>
      <div className="rec-card__body">
        <p className="rec-card__brand">{product.brand}</p>
        <p className="rec-card__rating">
          Rating {product.rating.toFixed(1)}
          {product.reviewCount ? ` (${product.reviewCount})` : ""}
        </p>
        <h3>{product.name}</h3>
        <p className="rec-card__meta">
          {product.category}
          {sports ? ` | ${sports}` : ""}
        </p>
        <div className="rec-card__price-row">
          <strong>{formatMoney(product.price)}</strong>
          <span
            className={
              inStock ? "rec-card__stock" : "rec-card__stock rec-card__stock--out"
            }
          >
            {inStock ? "In stock" : "Out of stock"}
          </span>
        </div>
        <p className="rec-card__benefit">{benefit}</p>
        <div className="rec-card__actions">
          <button
            type="button"
            className="btn btn--primary btn--block"
            onClick={onAddToCart}
            disabled={busy || !inStock}
          >
            {busy ? "Adding…" : "Add to cart"}
          </button>
          <Link
            className="btn btn--secondary btn--block"
            to={`/products/${product.productId}`}
          >
            View product
          </Link>
        </div>
      </div>
    </article>
  );
}
