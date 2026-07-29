import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchRecommendations } from "../api/client";
import { addToCartWithGuestMirror } from "../api/cartActions";
import { PreferenceFilterBand } from "../components/filters/PreferenceFilterBand";
import { AppHeader, SiteFooter } from "../components/layout/AppHeader";
import {
  capRecommendations,
  RecommendationSections,
} from "../components/product/RecommendationSections";
import { cartQuantityTotal } from "../lib/money";
import {
  draftFromPreferences,
  draftToPreferences,
  validateDraftForRecommendations,
  type PreferenceDraft,
} from "../lib/preferenceOptions";
import { useAppState } from "../state/appState";
import "../components/filters/PreferenceFilterBand.css";
import "./RecommendationsPage.css";

export function RecommendationsPage() {
  const navigate = useNavigate();
  const {
    preferences,
    recommendations,
    sessionId,
    setPreferences,
    setRecommendations,
    setCartCount,
  } = useAppState();
  const [draft, setDraft] = useState<PreferenceDraft>(() =>
    draftFromPreferences(preferences),
  );
  const [loading, setLoading] = useState(!recommendations && Boolean(preferences));
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterError, setFilterError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!preferences) {
      navigate("/questionnaire", { replace: true });
      return;
    }
    setDraft(draftFromPreferences(preferences));
    if (recommendations) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchRecommendations(preferences)
      .then((result) => {
        if (!cancelled) setRecommendations(result);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "We could not load recommendations right now. Please try again shortly.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [preferences, recommendations, navigate, setRecommendations]);

  const capped = useMemo(
    () => (recommendations ? capRecommendations(recommendations) : null),
    [recommendations],
  );

  const totalCount = capped
    ? capped.primary.length + capped.additional.length + capped.accessories.length
    : 0;

  async function onAddToCart(productId: string) {
    setBusyId(productId);
    setNotice(null);
    try {
      const cart = await addToCartWithGuestMirror({ sessionId, productId, quantity: 1 });
      setCartCount(cartQuantityTotal(cart.items));
      setNotice("Item added to cart.");
    } catch (err) {
      setNotice(
        err instanceof Error ? err.message : "Could not add this item to your cart.",
      );
    } finally {
      setBusyId(null);
    }
  }

  function onRefine() {
    setRecommendations(null);
    navigate("/questionnaire");
  }

  async function onApplyFilters() {
    const validation = validateDraftForRecommendations(draft);
    if (validation) {
      setFilterError(validation);
      return;
    }
    const nextPrefs = draftToPreferences(draft);
    if (!nextPrefs) {
      setFilterError("Fill in age, sport, product type, experience, and budget.");
      return;
    }

    setFilterError(null);
    setApplying(true);
    setError(null);
    try {
      const result = await fetchRecommendations(nextPrefs);
      setPreferences(nextPrefs);
      setRecommendations(result);
      setNotice("Recommendations updated from your filters.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We could not update recommendations. Please try again.",
      );
    } finally {
      setApplying(false);
    }
  }

  function onClearFilters() {
    if (!preferences) return;
    setDraft(draftFromPreferences(preferences));
    setFilterError(null);
    setNotice("Filters reset to your last questionnaire answers.");
  }

  return (
    <div className="recs-page">
      <AppHeader />
      <main className="app-main--contained">
        <div className="recs-page__heading">
          <div>
            <h1>Recommended for you</h1>
            <p>
              Based on your answers — we’ve limited the list to make choosing
              easier. Adjust filters on the left anytime.
            </p>
          </div>
          <button type="button" className="btn btn--secondary" onClick={onRefine}>
            Refine preferences
          </button>
        </div>

        {recommendations?.meta.fallbackUsed ? (
          <p className="recs-banner" role="status">
            {recommendations.meta.message ??
              "No exact matches were found, so here are close alternatives."}
          </p>
        ) : null}

        <div className="catalog-layout">
          <PreferenceFilterBand
            value={draft}
            onChange={setDraft}
            onApply={() => void onApplyFilters()}
            onClear={onClearFilters}
            applyLabel="Update recommendations"
            applying={applying}
            error={filterError}
          />

          <div>
            {loading ? <p>Finding suitable products…</p> : null}
            {error ? (
              <div role="alert">
                <p className="field-error">{error}</p>
                <button type="button" className="btn btn--secondary" onClick={onRefine}>
                  Refine preferences
                </button>
              </div>
            ) : null}
            {notice ? (
              <p
                className={
                  notice.toLowerCase().includes("updated") ||
                  notice.toLowerCase().includes("added") ||
                  notice.toLowerCase().includes("reset")
                    ? "status-ok"
                    : "field-error"
                }
                role="status"
              >
                {notice}
              </p>
            ) : null}

            {!loading && !error && capped ? (
              totalCount === 0 ? (
                <section className="recs-empty-cta" role="status">
                  <h2>No matching products right now</h2>
                  <p>
                    We could not find suitable products for these preferences.
                    Try changing filters or choosing a wider budget.
                  </p>
                  <div className="button-row">
                    <button type="button" className="btn btn--primary" onClick={onRefine}>
                      Refine preferences
                    </button>
                  </div>
                </section>
              ) : (
                <>
                  <RecommendationSections
                    primary={capped.primary}
                    additional={capped.additional}
                    accessories={capped.accessories}
                    busyId={busyId}
                    onAddToCart={onAddToCart}
                  />

                  <section className="recs-why" aria-labelledby="recs-why-title">
                    <h2 id="recs-why-title">Why these products?</h2>
                    <p>
                      We filter by your sport, age group, experience, budget, and
                      preferences, then rank a short list so you only see the most
                      relevant options — not an endless catalog.
                    </p>
                  </section>

                  <section className="recs-empty-cta" aria-labelledby="recs-more-title">
                    <h2 id="recs-more-title">Didn’t find what you were looking for?</h2>
                    <div className="button-row">
                      <Link className="btn btn--secondary" to="/browse">
                        Browse all products
                      </Link>
                      <button type="button" className="btn btn--primary" onClick={onRefine}>
                        Start quiz again
                      </button>
                    </div>
                  </section>
                </>
              )
            ) : null}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
