import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchProduct, type ProductDetail } from "../api/client";
import { addToCartWithGuestMirror } from "../api/cartActions";
import { ProductImage } from "../components/product/ProductImage";
import { AppHeader, SiteFooter } from "../components/layout/AppHeader";
import { cartQuantityTotal, formatMoney } from "../lib/money";
import { useAppState } from "../state/appState";
import { setBuyNowItem } from "../state/buyNow";
import "./commerce.css";

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { sessionId, preferences, setCartCount } = useAppState();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState<"cart" | "buy" | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchProduct(id)
      .then((result) => {
        if (cancelled) return;
        setProduct(result);
        setSelectedImage(0);
        setSize(result.sizes?.[0] ?? null);
        setColor(result.colors?.[0] ?? null);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "We could not load this product.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const selectionError = useMemo(() => {
    if (!product) return null;
    if (product.sizes?.length && !size) return "Please select a size.";
    if (product.colors?.length && !color) return "Please select a color.";
    return null;
  }, [product, size, color]);

  const inStock = product?.availability === "in_stock";

  async function onAddToCart() {
    if (!product || selectionError || !inStock) {
      setNotice(selectionError ?? "This item is currently out of stock.");
      return;
    }
    setBusy("cart");
    setNotice(null);
    try {
      const cart = await addToCartWithGuestMirror({
        sessionId,
        productId: product.productId,
        quantity: 1,
        size: size ?? undefined,
        color: color ?? undefined,
      });
      setCartCount(cartQuantityTotal(cart.items));
      setNotice("Added to cart.");
    } catch (err) {
      setNotice(
        err instanceof Error ? err.message : "Could not add this item to cart.",
      );
    } finally {
      setBusy(null);
    }
  }

  function onBuyNow() {
    if (!product || selectionError || !inStock) {
      setNotice(selectionError ?? "This item is currently out of stock.");
      return;
    }
    setBusy("buy");
    setBuyNowItem({
      productId: product.productId,
      quantity: 1,
      size: size ?? undefined,
      color: color ?? undefined,
    });
    navigate("/checkout?mode=buy-now");
  }

  const images = product?.images?.length ? product.images : [];
  const mainImage = images[selectedImage] ?? images[0];
  const benefits = product?.benefits?.slice(0, 3) ?? [];

  return (
    <div className="commerce-page">
      <AppHeader />
      <main className="app-main--contained">
        <Link className="commerce-back" to="/recommendations">
          ← Back to recommendations
        </Link>

        {loading ? <p>Loading product details…</p> : null}
        {error ? (
          <p className="field-error" role="alert">
            {error}
          </p>
        ) : null}

        {product && !loading && !error ? (
          <>
            <div className="commerce-layout commerce-layout--pdp">
              <div>
                <div className="pdp-gallery">
                  <ProductImage src={mainImage} alt={product.name} />
                </div>
                {images.length > 1 ? (
                  <div className="pdp-thumbs" role="list">
                    {images.map((src, index) => (
                      <button
                        key={`${src}-${index}`}
                        type="button"
                        className={index === selectedImage ? "is-selected" : ""}
                        aria-label={`View image ${index + 1}`}
                        onClick={() => setSelectedImage(index)}
                      >
                        <ProductImage src={src} alt="" />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <div>
                <p className="pdp-brand">{product.brand}</p>
                <h1 className="pdp-title">{product.name}</h1>
                <p className="pdp-rating">
                  Rating {product.rating.toFixed(1)}
                  {product.reviewCount
                    ? ` (${product.reviewCount.toLocaleString()} reviews)`
                    : ""}
                </p>
                <p className="pdp-price">{formatMoney(product.price)}</p>

                {preferences ? (
                  <p className="commerce-banner" role="status">
                    Personalized for you: suited to {preferences.primarySport}
                    {preferences.preferredBenefits[0]
                      ? ` and ${preferences.preferredBenefits[0].toLowerCase()}`
                      : ""}
                    .
                  </p>
                ) : null}

                <p>{product.description}</p>

                {product.sizes?.length ? (
                  <div className="pdp-options">
                    <div className="pdp-options__label">
                      <span>Select size</span>
                    </div>
                    <div className="pdp-option-grid" role="group" aria-label="Size">
                      {product.sizes.map((option) => (
                        <button
                          key={option}
                          type="button"
                          className={`pdp-option${size === option ? " is-selected" : ""}`}
                          onClick={() => setSize(option)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {product.colors?.length ? (
                  <div className="pdp-options">
                    <div className="pdp-options__label">
                      <span>Select color</span>
                    </div>
                    <div className="pdp-option-grid" role="group" aria-label="Color">
                      {product.colors.map((option) => (
                        <button
                          key={option}
                          type="button"
                          className={`pdp-option${color === option ? " is-selected" : ""}`}
                          onClick={() => setColor(option)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                <p className={inStock ? "stock-ok" : "stock-out"}>
                  {inStock
                    ? `In stock${product.stockQuantity ? ` (${product.stockQuantity} available)` : ""}`
                    : "Out of stock"}
                </p>

                {notice ? (
                  <p
                    className={
                      notice.toLowerCase().includes("added")
                        ? "status-ok"
                        : "field-error"
                    }
                    role="status"
                  >
                    {notice}
                  </p>
                ) : null}

                <div className="pdp-actions">
                  <button
                    type="button"
                    className="btn btn--primary btn--block"
                    onClick={onAddToCart}
                    disabled={!inStock || busy !== null}
                  >
                    {busy === "cart" ? "Adding…" : "Add to cart"}
                  </button>
                  <button
                    type="button"
                    className="btn btn--secondary btn--block"
                    onClick={onBuyNow}
                    disabled={!inStock || busy !== null}
                  >
                    {busy === "buy" ? "Continuing…" : "Buy now"}
                  </button>
                </div>

                <div className="pdp-trust">
                  <div className="pdp-trust__item">
                    <strong>Standard delivery</strong>
                    <p>Arrives in 3–5 days.</p>
                  </div>
                  <div className="pdp-trust__item">
                    <strong>Secure checkout</strong>
                    <p>Mock payment for this demo — no real card charge.</p>
                  </div>
                </div>
              </div>
            </div>

            {benefits.length > 0 ? (
              <section className="pdp-features" aria-labelledby="pdp-features-title">
                <h2 id="pdp-features-title">Why this product helps</h2>
                <div className="pdp-features__grid">
                  {benefits.map((benefit) => (
                    <article key={benefit} className="pdp-feature">
                      <h3>{benefit}</h3>
                      <p>
                        Chosen to match common needs for active adults 45 and
                        over.
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}
          </>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}
