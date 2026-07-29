import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import type { CartView } from "@sports-shop/shared";
import {
  createOrder,
  fetchCart,
  fetchProduct,
  type CartLineInput,
} from "../api/client";
import { AppHeader, SiteFooter } from "../components/layout/AppHeader";
import { cartQuantityTotal, formatMoney } from "../lib/money";
import { useAppState } from "../state/appState";
import {
  clearBuyNowItem,
  getBuyNowItem,
  type BuyNowItem,
} from "../state/buyNow";
import "./commerce.css";

type FormState = {
  name: string;
  email: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  postalCode: string;
  state: string;
  country: string;
};

type SummaryLine = {
  key: string;
  name: string;
  quantity: number;
  lineTotal: number;
  availability?: "in_stock" | "out_of_stock";
};

const emptyForm: FormState = {
  name: "",
  email: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  postalCode: "",
  state: "",
  country: "United States",
};

export function CheckoutPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const buyNowMode = params.get("mode") === "buy-now";
  const { sessionId, setCartCount } = useAppState();

  const [form, setForm] = useState<FormState>(emptyForm);
  const [cart, setCart] = useState<CartView | null>(null);
  const [buyNow, setBuyNow] = useState<BuyNowItem | null>(null);
  const [buyNowName, setBuyNowName] = useState<string>("Selected item");
  const [buyNowPrice, setBuyNowPrice] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadError(null);
      setSubmitError(null);
      try {
        if (buyNowMode) {
          const item = getBuyNowItem();
          if (!item) {
            if (!cancelled) {
              setLoadError("Buy now expired. Please choose the product again.");
            }
            return;
          }
          const product = await fetchProduct(item.productId);
          if (cancelled) return;
          if (product.availability !== "in_stock") {
            setLoadError("This item is out of stock and cannot be purchased.");
            return;
          }
          setBuyNow(item);
          setBuyNowName(product.name);
          setBuyNowPrice(product.price * item.quantity);
        } else {
          const result = await fetchCart(sessionId);
          if (cancelled) return;
          setCart(result);
          setCartCount(cartQuantityTotal(result.items));
          if (result.items.length === 0) {
            setLoadError("Your cart is empty. Add a product before checkout.");
          } else if (
            result.items.some((item) => item.availability === "out_of_stock")
          ) {
            setLoadError(
              "Remove out-of-stock items from your cart before checkout.",
            );
          }
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof Error
              ? err.message
              : "We could not prepare checkout.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [buyNowMode, sessionId, setCartCount]);

  const summaryLines: SummaryLine[] = useMemo(() => {
    if (buyNowMode && buyNow) {
      return [
        {
          key: buyNow.productId,
          name: buyNowName,
          quantity: buyNow.quantity,
          lineTotal: buyNowPrice,
          availability: "in_stock",
        },
      ];
    }
    return (cart?.items ?? []).map((item) => ({
      key: `${item.productId}::${item.size ?? ""}::${item.color ?? ""}`,
      name: item.name,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
      availability: item.availability,
    }));
  }, [buyNowMode, buyNow, buyNowName, buyNowPrice, cart]);

  const subtotal = buyNowMode
    ? buyNowPrice
    : (cart?.subtotal ?? 0);

  const blocked =
    Boolean(loadError) ||
    summaryLines.length === 0 ||
    summaryLines.some((line) => line.availability === "out_of_stock");

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) next.name = "Enter your full name.";
    if (!form.email.trim()) next.email = "Enter your email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = "Enter a valid email address.";
    }
    if (!form.line1.trim()) next.line1 = "Enter your street address.";
    if (!form.city.trim()) next.city = "Enter your city.";
    if (!form.postalCode.trim()) next.postalCode = "Enter your postal code.";
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (blocked || !validate()) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const items: CartLineInput[] | undefined = buyNowMode && buyNow
        ? [buyNow]
        : undefined;

      const order = await createOrder({
        sessionId,
        items,
        customer: {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          shippingAddress: {
            line1: form.line1.trim(),
            line2: form.line2.trim() || undefined,
            city: form.city.trim(),
            postalCode: form.postalCode.trim(),
            state: form.state.trim() || undefined,
            country: form.country.trim() || undefined,
          },
        },
      });

      if (buyNowMode) clearBuyNowItem();
      navigate(`/payment?orderId=${encodeURIComponent(order.orderId)}`);
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "We could not place your order. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="commerce-page">
      <AppHeader showSearch={false} />
      <main className="app-main--contained">
        <Link
          className="commerce-back"
          to={buyNowMode ? "/recommendations" : "/cart"}
        >
          ← {buyNowMode ? "Back to recommendations" : "Back to cart"}
        </Link>
        <h1>Checkout</h1>
        <p>
          {buyNowMode
            ? "Complete guest checkout for your Buy now item."
            : "Enter your details to place the order. No account required."}
        </p>

        {loading ? <p>Preparing checkout…</p> : null}

        {!loading ? (
          <div className="commerce-layout commerce-layout--split">
            <form className="commerce-panel checkout-form" onSubmit={onSubmit} noValidate>
              <h2>Customer & shipping</h2>

              <div className="field">
                <label htmlFor="checkout-name">Full name</label>
                <input
                  id="checkout-name"
                  autoComplete="name"
                  value={form.name}
                  aria-invalid={Boolean(fieldErrors.name)}
                  aria-describedby={fieldErrors.name ? "checkout-name-error" : undefined}
                  onChange={(e) => updateField("name", e.target.value)}
                />
                {fieldErrors.name ? (
                  <span id="checkout-name-error" className="field-error" role="alert">
                    {fieldErrors.name}
                  </span>
                ) : null}
              </div>

              <div className="field">
                <label htmlFor="checkout-email">Email</label>
                <input
                  id="checkout-email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? "checkout-email-error" : undefined}
                  onChange={(e) => updateField("email", e.target.value)}
                />
                {fieldErrors.email ? (
                  <span id="checkout-email-error" className="field-error" role="alert">
                    {fieldErrors.email}
                  </span>
                ) : null}
              </div>

              <div className="field">
                <label htmlFor="checkout-phone">Phone (optional)</label>
                <input
                  id="checkout-phone"
                  type="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="checkout-line1">Street address</label>
                <input
                  id="checkout-line1"
                  autoComplete="address-line1"
                  value={form.line1}
                  aria-invalid={Boolean(fieldErrors.line1)}
                  aria-describedby={fieldErrors.line1 ? "checkout-line1-error" : undefined}
                  onChange={(e) => updateField("line1", e.target.value)}
                />
                {fieldErrors.line1 ? (
                  <span id="checkout-line1-error" className="field-error" role="alert">
                    {fieldErrors.line1}
                  </span>
                ) : null}
              </div>

              <div className="field">
                <label htmlFor="checkout-line2">Apartment or suite (optional)</label>
                <input
                  id="checkout-line2"
                  autoComplete="address-line2"
                  value={form.line2}
                  onChange={(e) => updateField("line2", e.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="checkout-city">City</label>
                <input
                  id="checkout-city"
                  autoComplete="address-level2"
                  value={form.city}
                  aria-invalid={Boolean(fieldErrors.city)}
                  aria-describedby={fieldErrors.city ? "checkout-city-error" : undefined}
                  onChange={(e) => updateField("city", e.target.value)}
                />
                {fieldErrors.city ? (
                  <span id="checkout-city-error" className="field-error" role="alert">
                    {fieldErrors.city}
                  </span>
                ) : null}
              </div>

              <div className="field">
                <label htmlFor="checkout-postal">Postal code</label>
                <input
                  id="checkout-postal"
                  autoComplete="postal-code"
                  value={form.postalCode}
                  aria-invalid={Boolean(fieldErrors.postalCode)}
                  aria-describedby={
                    fieldErrors.postalCode ? "checkout-postal-error" : undefined
                  }
                  onChange={(e) => updateField("postalCode", e.target.value)}
                />
                {fieldErrors.postalCode ? (
                  <span id="checkout-postal-error" className="field-error" role="alert">
                    {fieldErrors.postalCode}
                  </span>
                ) : null}
              </div>

              <div className="field">
                <label htmlFor="checkout-state">State / region (optional)</label>
                <input
                  id="checkout-state"
                  autoComplete="address-level1"
                  value={form.state}
                  onChange={(e) => updateField("state", e.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="checkout-country">Country (optional)</label>
                <input
                  id="checkout-country"
                  autoComplete="country-name"
                  value={form.country}
                  onChange={(e) => updateField("country", e.target.value)}
                />
              </div>

              {loadError ? (
                <p className="field-error" role="alert">
                  {loadError}
                </p>
              ) : null}
              {submitError ? (
                <p className="field-error" role="alert">
                  {submitError}
                </p>
              ) : null}

              <button
                type="submit"
                className="btn btn--primary btn--block"
                disabled={blocked || submitting}
              >
                {submitting ? "Placing order…" : "Place order & pay"}
              </button>
            </form>

            <aside className="commerce-panel" aria-labelledby="checkout-summary-title">
              <h2 id="checkout-summary-title">Order summary</h2>
              <div className="checkout-summary-list">
                {summaryLines.map((line) => (
                  <div key={line.key} className="checkout-summary-item">
                    <span>
                      {line.name} × {line.quantity}
                    </span>
                    <strong>{formatMoney(line.lineTotal)}</strong>
                  </div>
                ))}
              </div>
              <div className="cart-summary__row cart-summary__row--total">
                <span>Total due</span>
                <span>{formatMoney(subtotal)}</span>
              </div>
            </aside>
          </div>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}
