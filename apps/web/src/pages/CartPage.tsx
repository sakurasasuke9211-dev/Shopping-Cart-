import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { CartLineItem, CartView } from "@sports-shop/shared";
import {
  fetchCart,
  removeFromCart,
  updateCart,
} from "../api/client";
import {
  removeGuestCartItem,
  setGuestCartItemQuantity,
} from "../auth/guestStorage";
import { AppHeader, SiteFooter } from "../components/layout/AppHeader";
import { cartQuantityTotal, formatMoney } from "../lib/money";
import { useAppState } from "../state/appState";
import "./commerce.css";

export function CartPage() {
  const navigate = useNavigate();
  const { sessionId, setCartCount } = useAppState();
  const [cart, setCart] = useState<CartView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const syncCart = useCallback(
    (next: CartView) => {
      setCart(next);
      setCartCount(cartQuantityTotal(next.items));
    },
    [setCartCount],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchCart(sessionId)
      .then((result) => {
        if (!cancelled) syncCart(result);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "We could not load your cart.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [sessionId, syncCart]);

  function lineKey(item: CartLineItem): string {
    return `${item.productId}::${item.size ?? ""}::${item.color ?? ""}`;
  }

  async function onQuantityChange(item: CartLineItem, quantity: number) {
    const key = lineKey(item);
    setBusyKey(key);
    setError(null);
    try {
      const next = await updateCart({
        sessionId,
        productId: item.productId,
        quantity,
        size: item.size,
        color: item.color,
      });
      setGuestCartItemQuantity({
        productId: item.productId,
        quantity,
        size: item.size,
        color: item.color,
      });
      syncCart(next);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not update quantity.",
      );
    } finally {
      setBusyKey(null);
    }
  }

  async function onRemove(item: CartLineItem) {
    const key = lineKey(item);
    setBusyKey(key);
    setError(null);
    try {
      const next = await removeFromCart({
        sessionId,
        productId: item.productId,
        size: item.size,
        color: item.color,
      });
      removeGuestCartItem({
        productId: item.productId,
        size: item.size,
        color: item.color,
      });
      syncCart(next);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not remove this item.",
      );
    } finally {
      setBusyKey(null);
    }
  }

  const items = cart?.items ?? [];
  const hasOutOfStock = items.some(
    (item) => item.availability === "out_of_stock",
  );
  const itemCount = cartQuantityTotal(items);
  const empty = !loading && !error && items.length === 0;

  return (
    <div className="commerce-page">
      <AppHeader />
      <main className="app-main--contained">
        <Link className="commerce-back" to="/recommendations">
          ← Back to recommendations
        </Link>
        <h1>Review your cart</h1>

        {loading ? <p>Loading your cart…</p> : null}
        {error ? (
          <p className="field-error" role="alert">
            {error}
          </p>
        ) : null}

        {empty ? (
          <div className="cart-empty">
            <h2>Your cart is empty</h2>
            <p>Add a recommended product to continue.</p>
            <Link className="btn btn--primary" to="/recommendations">
              Browse recommendations
            </Link>
          </div>
        ) : null}

        {!loading && !empty && cart ? (
          <div className="commerce-layout commerce-layout--split">
            <div>
              <div className="cart-list">
                {items.map((item) => {
                  const key = lineKey(item);
                  const busy = busyKey === key;
                  return (
                    <article key={key} className="cart-line">
                      <div className="cart-line__media" aria-hidden="true" />
                      <div>
                        <div className="cart-line__top">
                          <div>
                            <h2>
                              <Link to={`/products/${item.productId}`}>
                                {item.name}
                              </Link>
                            </h2>
                            {item.size || item.color ? (
                              <p className="cart-line__meta">
                                {[
                                  item.size ? `Size: ${item.size}` : null,
                                  item.color ? `Color: ${item.color}` : null,
                                ]
                                  .filter(Boolean)
                                  .join(" · ")}
                              </p>
                            ) : null}
                            <p
                              className={
                                item.availability === "in_stock"
                                  ? "stock-ok"
                                  : "stock-out"
                              }
                            >
                              {item.availability === "in_stock"
                                ? "In stock"
                                : "Out of stock"}
                            </p>
                          </div>
                          <div className="cart-line__price">
                            {formatMoney(item.lineTotal)}
                          </div>
                        </div>

                        <div className="cart-line__controls">
                          <div className="qty-control" aria-label="Quantity">
                            <button
                              type="button"
                              disabled={busy || item.quantity <= 1}
                              onClick={() =>
                                onQuantityChange(item, item.quantity - 1)
                              }
                            >
                              Less
                            </button>
                            <span aria-live="polite">{item.quantity}</span>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() =>
                                onQuantityChange(item, item.quantity + 1)
                              }
                            >
                              More
                            </button>
                          </div>
                          <button
                            type="button"
                            className="btn--danger-text"
                            disabled={busy}
                            onClick={() => onRemove(item)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              <p className="commerce-banner commerce-banner--muted" role="status">
                Your items are saved for this browsing session.
              </p>
            </div>

            <aside className="commerce-panel" aria-labelledby="order-summary-title">
              <h2 id="order-summary-title">Order summary</h2>
              <div className="cart-summary__rows">
                <div className="cart-summary__row">
                  <span>
                    Subtotal ({itemCount} item{itemCount === 1 ? "" : "s"})
                  </span>
                  <strong>{formatMoney(cart.subtotal)}</strong>
                </div>
                <div className="cart-summary__row">
                  <span>Shipping</span>
                  <span className="status-ok">Calculated at checkout</span>
                </div>
                <div className="cart-summary__row cart-summary__row--total">
                  <span>Grand total</span>
                  <span>{formatMoney(cart.subtotal)}</span>
                </div>
              </div>

              {hasOutOfStock ? (
                <p className="field-error" role="alert">
                  Remove out-of-stock items before checkout.
                </p>
              ) : null}

              <button
                type="button"
                className="btn btn--primary btn--block"
                disabled={hasOutOfStock || items.length === 0}
                onClick={() => navigate("/checkout")}
              >
                Proceed to checkout
              </button>

              <div className="cart-summary__trust">
                <span>Secure checkout</span>
                <span>Free 30-day returns</span>
              </div>
            </aside>
          </div>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}
