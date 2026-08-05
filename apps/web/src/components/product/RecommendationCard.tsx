import { Link } from "react-router-dom";
import type { ScoredRecommendation } from "@sports-shop/shared";
import { formatMoney } from "../../lib/money";
import { ProductImage } from "./ProductImage";

function StarRating({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  const filled = Math.round(Math.min(5, Math.max(0, rating)));
  return (
    <p className="rec-card__rating" aria-label={`Rated ${rating.toFixed(1)} out of 5`}>
      <span className="rec-card__stars" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <span
            key={index}
            className={
              index < filled ? "rec-card__star rec-card__star--on" : "rec-card__star"
            }
          >
            ★
          </span>
        ))}
      </span>
      <span>
        {rating.toFixed(1)}
        {reviewCount ? ` (${reviewCount})` : ""}
      </span>
    </p>
  );
}

export function RecommendationCard({
  item,
  topMatch,
  busy,
  onAddToCart,
}: {
  item: ScoredRecommendation;
  topMatch?: boolean;
  busy: boolean;
  onAddToCart: () => void;
}) {
  const product = item.product;
  const image = product.images[0];
  const benefit = product.benefits[0] ?? product.category;
  const inStock = product.availability === "in_stock";
  const sports = product.sport.slice(0, 2).join(", ");

  return (
    <article className="rec-card">
      <div className="rec-card__media">
        {topMatch ? <span className="rec-card__badge">Top Match</span> : null}
        <ProductImage
          src={image}
          altSrcs={product.images.slice(1)}
          alt={product.name}
        />
      </div>

      <div className="rec-card__body">
        <p className="rec-card__brand">{product.brand}</p>
        <StarRating rating={product.rating} reviewCount={product.reviewCount} />
        <h3>{product.name}</h3>
        <p className="rec-card__meta">
          {product.category}
          {sports ? ` | ${sports}` : ""}
        </p>

        <p className="rec-card__explain">{item.explanation}</p>

        <div className="rec-card__price-row">
          <strong>{formatMoney(product.price)}</strong>
          <span className={inStock ? "rec-card__stock" : "rec-card__stock rec-card__stock--out"}>
            {inStock ? "In stock" : "Out of stock"}
          </span>
        </div>

        <p className="rec-card__benefit">
          <span className="sr-only">Main benefit: </span>
          {benefit}
        </p>

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
