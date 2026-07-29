import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import type { Order } from "@sports-shop/shared";
import {
  confirmPayment,
  createPayment,
  fetchOrder,
} from "../api/client";
import { AppHeader, SiteFooter } from "../components/layout/AppHeader";
import { formatMoney } from "../lib/money";
import { useAppState } from "../state/appState";
import "./commerce.css";

type Method = "card" | "upi" | "cod";

export function PaymentPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const orderId = params.get("orderId") ?? "";
  const { setCartCount } = useAppState();

  const [order, setOrder] = useState<Order | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState<Method>("card");
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      setError("Missing order. Return to checkout and try again.");
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const existing = await fetchOrder(orderId);
        if (cancelled) return;

        if (existing.status === "confirmed") {
          navigate(`/orders/${encodeURIComponent(orderId)}`, { replace: true });
          return;
        }

        if (existing.status !== "pending_payment") {
          setError("This order cannot be paid. Please start a new checkout.");
          setOrder(existing);
          return;
        }

        const payment = await createPayment(orderId);
        if (cancelled) return;
        setOrder(existing);
        setPaymentId(payment.paymentId);
        setAmount(payment.amount);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "We could not start payment for this order.",
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
  }, [orderId, navigate]);

  async function onPay() {
    if (!orderId || !paymentId) return;
    setPaying(true);
    setError(null);
    try {
      await confirmPayment({ orderId, paymentId });
      setCartCount(0);
      navigate(`/orders/${encodeURIComponent(orderId)}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Payment could not be confirmed. Please try again.",
      );
    } finally {
      setPaying(false);
    }
  }

  const itemCount = order?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <div className="commerce-page">
      <AppHeader showSearch={false} />
      <main className="app-main--contained">
        <div className="payment-shell">
          <div className="commerce-panel">
            <h1 style={{ textAlign: "center" }}>Payment</h1>

            {loading ? <p>Preparing secure mock payment…</p> : null}

            {!loading && order && paymentId ? (
              <>
                <div className="payment-total-box">
                  <p className="payment-total-box__label">Order total</p>
                  <p className="payment-total-box__amount">
                    {formatMoney(amount || order.amount)}
                  </p>
                  <p className="payment-total-box__meta">
                    {itemCount} item{itemCount === 1 ? "" : "s"} · Order #{order.orderId}
                  </p>
                </div>

                <h2>Choose payment method</h2>
                <div className="payment-methods" role="radiogroup" aria-label="Payment method">
                  {(
                    [
                      ["card", "Card"],
                      ["upi", "UPI"],
                      ["cod", "Cash on delivery"],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={method === value}
                      className={`payment-method${method === value ? " is-selected" : ""}`}
                      onClick={() => setMethod(value)}
                    >
                      <span>{label}</span>
                      {method === value ? <span aria-hidden="true">✓</span> : null}
                    </button>
                  ))}
                </div>

                <p className="commerce-banner" role="status">
                  Secure mock payment for demo — no real charge is made.
                </p>

                {error ? (
                  <p className="field-error" role="alert">
                    {error}
                  </p>
                ) : null}

                <button
                  type="button"
                  className="btn btn--primary btn--block"
                  onClick={onPay}
                  disabled={paying}
                >
                  {paying ? "Confirming…" : "Pay now →"}
                </button>

                <Link className="payment-cancel" to="/recommendations">
                  Cancel and return to store
                </Link>
              </>
            ) : null}

            {!loading && error && !paymentId ? (
              <>
                <p className="field-error" role="alert">
                  {error}
                </p>
                <Link className="btn btn--secondary btn--block" to="/cart">
                  Return to cart
                </Link>
              </>
            ) : null}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
