import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { Order } from "@sports-shop/shared";
import { fetchOrder } from "../api/client";
import { AppHeader, SiteFooter } from "../components/layout/AppHeader";
import { formatMoney } from "../lib/money";
import "./commerce.css";

export function OrderConfirmationPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      setError("Missing order id.");
      return;
    }

    let cancelled = false;
    setLoading(true);
    fetchOrder(orderId)
      .then((result) => {
        if (!cancelled) setOrder(result);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "We could not load this order.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const confirmed = order?.status === "confirmed";

  return (
    <div className="commerce-page">
      <AppHeader showSearch={false} />
      <main className="app-main--contained">
        <div className="payment-shell">
          <div className="commerce-panel">
            {loading ? <p>Loading your order…</p> : null}
            {error ? (
              <p className="field-error" role="alert">
                {error}
              </p>
            ) : null}

            {order && !loading ? (
              <>
                <div className="confirm-hero">
                  <div className="confirm-hero__badge">
                    {confirmed ? "Your order is confirmed" : order.status.replaceAll("_", " ")}
                  </div>
                  <h1>Thank you for your order</h1>
                  <p>
                    {confirmed
                      ? "Payment was successful. A receipt is not emailed in this demo."
                      : "This order is not fully paid yet."}
                  </p>
                  <p>
                    Order ID: <strong>{order.orderId}</strong>
                  </p>
                </div>

                <h2>Items</h2>
                <div className="confirm-list">
                  {order.items.map((item) => (
                    <div
                      key={`${item.productId}-${item.name}`}
                      className="confirm-list__row"
                    >
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <strong>
                        {formatMoney(item.unitPrice * item.quantity)}
                      </strong>
                    </div>
                  ))}
                </div>

                <div className="confirm-total">
                  <span>Total paid</span>
                  <span>{formatMoney(order.amount)}</span>
                </div>

                <div className="button-row" style={{ marginTop: "1.5rem" }}>
                  <Link className="btn btn--primary" to="/recommendations">
                    Continue shopping
                  </Link>
                  <Link className="btn btn--secondary" to="/">
                    Back to home
                  </Link>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
