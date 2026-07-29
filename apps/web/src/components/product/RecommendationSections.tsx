import type { RecommendationResult, ScoredRecommendation } from "@sports-shop/shared";
import { RecommendationCard } from "./RecommendationCard";

/** Architecture caps: primary ≤6, additional ≤4, accessories ≤3 */
export const RECOMMENDATION_CAPS = {
  primary: 6,
  additional: 4,
  accessories: 3,
} as const;

export function capRecommendations(
  result: RecommendationResult,
): Pick<RecommendationResult, "primary" | "additional" | "accessories"> {
  return {
    primary: result.primary.slice(0, RECOMMENDATION_CAPS.primary),
    additional: result.additional.slice(0, RECOMMENDATION_CAPS.additional),
    accessories: result.accessories.slice(0, RECOMMENDATION_CAPS.accessories),
  };
}

function RecommendationSection({
  title,
  sectionId,
  items,
  busyId,
  onAddToCart,
  markTopMatch = false,
}: {
  title: string;
  sectionId: string;
  items: ScoredRecommendation[];
  busyId: string | null;
  onAddToCart: (productId: string) => void;
  markTopMatch?: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <section className="recs-section" aria-labelledby={sectionId}>
      <h2 id={sectionId}>{title}</h2>
      <div className="recs-grid">
        {items.map((item, index) => (
          <RecommendationCard
            key={item.product.productId}
            item={item}
            topMatch={markTopMatch && index === 0}
            busy={busyId === item.product.productId}
            onAddToCart={() => onAddToCart(item.product.productId)}
          />
        ))}
      </div>
    </section>
  );
}

export function RecommendationSections({
  primary,
  additional,
  accessories,
  busyId,
  onAddToCart,
}: {
  primary: ScoredRecommendation[];
  additional: ScoredRecommendation[];
  accessories: ScoredRecommendation[];
  busyId: string | null;
  onAddToCart: (productId: string) => void;
}) {
  return (
    <>
      <RecommendationSection
        title="Top picks"
        sectionId="recs-top-picks"
        items={primary}
        busyId={busyId}
        onAddToCart={onAddToCart}
        markTopMatch
      />
      <RecommendationSection
        title="More options"
        sectionId="recs-more-options"
        items={additional}
        busyId={busyId}
        onAddToCart={onAddToCart}
      />
      <RecommendationSection
        title="Helpful accessories"
        sectionId="recs-accessories"
        items={accessories}
        busyId={busyId}
        onAddToCart={onAddToCart}
      />
    </>
  );
}
