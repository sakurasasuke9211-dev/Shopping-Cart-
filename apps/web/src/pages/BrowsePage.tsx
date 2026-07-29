import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import type { ProductCategory } from "@sports-shop/shared";
import { fetchProducts, type ProductDetail } from "../api/client";
import { addToCartWithGuestMirror } from "../api/cartActions";
import { PreferenceFilterBand } from "../components/filters/PreferenceFilterBand";
import { AppHeader, SiteFooter } from "../components/layout/AppHeader";
import { BrowseProductCard } from "../components/product/BrowseProductCard";
import { cartQuantityTotal } from "../lib/money";
import {
  draftFromPreferences,
  emptyPreferenceDraft,
  type PreferenceDraft,
} from "../lib/preferenceOptions";
import { useAppState } from "../state/appState";
import "../components/filters/PreferenceFilterBand.css";
import "./RecommendationsPage.css";

/** Every normalized catalog category — landings must sum to full inventory. */
const LANDING_CATEGORIES = [
  "Equipment",
  "Clothing",
  "Footwear",
  "Accessories",
  "Support",
  "Fitness technology",
] as const satisfies readonly ProductCategory[];

type LandingCategory = (typeof LANDING_CATEGORIES)[number];

const CATEGORY_TITLES: Record<LandingCategory, string> = {
  Equipment: "Equipment",
  Clothing: "Clothing",
  Footwear: "Footwear",
  Accessories: "Accessories",
  Support: "Support and recovery",
  "Fitness technology": "Fitness technology",
};

/** Large enough for the full demo catalog (36) and room to grow. */
const BROWSE_PAGE_SIZE = 100;

function isLandingCategory(value: string | undefined): value is LandingCategory {
  return Boolean(
    value && (LANDING_CATEGORIES as readonly string[]).includes(value),
  );
}

function titleForCategory(category: LandingCategory | null): string {
  if (!category) return "All Sports";
  return CATEGORY_TITLES[category];
}

function buildInitialDraft(
  preferences: ReturnType<typeof useAppState>["preferences"],
  lockedCategory: LandingCategory | null,
): PreferenceDraft {
  const base = preferences
    ? draftFromPreferences(preferences)
    : { ...emptyPreferenceDraft };
  if (lockedCategory && !base.productTypes.includes(lockedCategory)) {
    base.productTypes = [lockedCategory, ...base.productTypes];
  }
  return base;
}

export function BrowsePage() {
  const { category: categoryParam } = useParams();
  const [searchParams] = useSearchParams();
  const lockedCategory = isLandingCategory(categoryParam) ? categoryParam : null;
  const { preferences, sessionId, setCartCount } = useAppState();

  const [draft, setDraft] = useState<PreferenceDraft>(() =>
    buildInitialDraft(preferences, lockedCategory),
  );
  const [applied, setApplied] = useState<PreferenceDraft>(() =>
    buildInitialDraft(preferences, lockedCategory),
  );
  const [items, setItems] = useState<ProductDetail[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const searchQ = searchParams.get("q")?.trim() || undefined;

  const pageTitle = titleForCategory(lockedCategory);

  useEffect(() => {
    const next = buildInitialDraft(preferences, lockedCategory);
    setDraft(next);
    setApplied(next);
  }, [lockedCategory, preferences]);

  const loadProducts = useCallback(
    async (filters: PreferenceDraft) => {
      setLoading(true);
      setError(null);
      try {
        const category =
          lockedCategory ??
          (filters.productTypes.length === 1 ? filters.productTypes[0] : undefined);
        const result = await fetchProducts({
          q: searchQ,
          sport: filters.primarySport ?? undefined,
          category,
          // Age: API includes all-45+ for 45-55 / 55+ selections
          ageGroup: filters.ageGroup ?? undefined,
          experienceLevel: filters.experienceLevel ?? undefined,
          minPrice: filters.budgetMin ?? undefined,
          maxPrice: filters.budgetMax ?? undefined,
          sort: "rating_desc",
          page: 1,
          pageSize: BROWSE_PAGE_SIZE,
        });
        setItems(result.items);
        setTotal(result.total);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "We could not load products right now. Please try again shortly.",
        );
        setItems([]);
        setTotal(0);
      } finally {
        setLoading(false);
        setApplying(false);
      }
    },
    [lockedCategory, searchQ],
  );

  useEffect(() => {
    void loadProducts(applied);
  }, [applied, loadProducts]);

  function onApply() {
    const next = { ...draft };
    if (lockedCategory && !next.productTypes.includes(lockedCategory)) {
      next.productTypes = [lockedCategory, ...next.productTypes];
    }
    setApplying(true);
    setApplied(next);
  }

  function onClear() {
    const cleared = {
      ...emptyPreferenceDraft,
      productTypes: lockedCategory ? [lockedCategory] : [],
    };
    setDraft(cleared);
    setApplying(true);
    setApplied(cleared);
  }

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

  const subtitle = useMemo(() => {
    if (lockedCategory) {
      return `Browse ${CATEGORY_TITLES[lockedCategory].toLowerCase()} for active adults 45+. Use filters on the left to narrow the list.`;
    }
    return "Browse the full catalog. Use filters on the left — or take the short quiz for personalized picks.";
  }, [lockedCategory]);

  return (
    <div className="recs-page">
      <AppHeader />
      <main className="app-main--contained">
        <div className="recs-page__heading">
          <div>
            <h1>{pageTitle}</h1>
            <p>{subtitle}</p>
          </div>
          <Link className="btn btn--secondary" to="/questionnaire">
            Take preference quiz
          </Link>
        </div>

        <div className="catalog-layout">
          <PreferenceFilterBand
            title="Filters"
            value={draft}
            onChange={setDraft}
            onApply={onApply}
            onClear={onClear}
            applyLabel="Apply filters"
            lockedCategory={lockedCategory}
            applying={applying || loading}
          />

          <div>
            {loading ? <p>Loading products…</p> : null}
            {error ? (
              <p className="field-error" role="alert">
                {error}
              </p>
            ) : null}
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

            {!loading && !error ? (
              <>
                <p className="browse-count">
                  Showing {items.length} of {total} product{total === 1 ? "" : "s"}
                </p>
                {items.length === 0 ? (
                  <section className="recs-empty-cta" role="status">
                    <h2>No products match these filters</h2>
                    <p>Try clearing filters or choosing a wider budget.</p>
                    <button type="button" className="btn btn--primary" onClick={onClear}>
                      Clear filters
                    </button>
                  </section>
                ) : (
                  <div className="recs-grid">
                    {items.map((product) => (
                      <BrowseProductCard
                        key={product.productId}
                        product={product}
                        busy={busyId === product.productId}
                        onAddToCart={() => onAddToCart(product.productId)}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
