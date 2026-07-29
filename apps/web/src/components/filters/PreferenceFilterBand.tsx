import {
  PRODUCT_BENEFITS,
  SPORTS,
  type ProductCategory,
  type UserAgeGroup,
  type UserExperienceLevel,
} from "@sports-shop/shared";
import {
  BUDGET_PRESETS,
  PRODUCT_TYPE_OPTIONS,
  type PreferenceDraft,
} from "../../lib/preferenceOptions";
import "./PreferenceFilterBand.css";

type Props = {
  value: PreferenceDraft;
  onChange: (next: PreferenceDraft) => void;
  onApply: () => void;
  onClear?: () => void;
  applyLabel?: string;
  title?: string;
  /** When set (category landing), keep this type selected */
  lockedCategory?: ProductCategory | null;
  applying?: boolean;
  error?: string | null;
};

function Chip({
  selected,
  label,
  onClick,
  multi = false,
}: {
  selected: boolean;
  label: string;
  onClick: () => void;
  multi?: boolean;
}) {
  return (
    <button
      type="button"
      className={`filter-chip${selected ? " is-selected" : ""}`}
      role={multi ? "checkbox" : "radio"}
      aria-checked={selected}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export function PreferenceFilterBand({
  value,
  onChange,
  onApply,
  onClear,
  applyLabel = "Apply filters",
  title = "Your preferences",
  lockedCategory = null,
  applying = false,
  error = null,
}: Props) {
  function setAge(ageGroup: UserAgeGroup) {
    onChange({ ...value, ageGroup });
  }

  function setPrimarySport(sport: string) {
    onChange({
      ...value,
      primarySport: sport,
      additionalSports: value.additionalSports.filter((s) => s !== sport),
    });
  }

  function toggleAdditional(sport: string) {
    const selected = value.additionalSports.includes(sport);
    onChange({
      ...value,
      additionalSports: selected
        ? value.additionalSports.filter((s) => s !== sport)
        : [...value.additionalSports, sport].slice(0, 3),
    });
  }

  function toggleProductType(category: ProductCategory) {
    if (lockedCategory && category === lockedCategory) return;
    const selected = value.productTypes.includes(category);
    let next = selected
      ? value.productTypes.filter((c) => c !== category)
      : [...value.productTypes, category];
    if (lockedCategory && !next.includes(lockedCategory)) {
      next = [lockedCategory, ...next];
    }
    onChange({ ...value, productTypes: next });
  }

  function setExperience(experienceLevel: UserExperienceLevel) {
    onChange({ ...value, experienceLevel });
  }

  function setBudget(min: number, max: number) {
    onChange({ ...value, budgetMin: min, budgetMax: max });
  }

  function toggleBenefit(benefit: string) {
    const selected = value.preferredBenefits.includes(benefit);
    onChange({
      ...value,
      preferredBenefits: selected
        ? value.preferredBenefits.filter((b) => b !== benefit)
        : [...value.preferredBenefits, benefit],
    });
  }

  return (
    <aside className="filter-band" aria-labelledby="filter-band-title">
      <h2 id="filter-band-title">{title}</h2>
      <p className="filter-band__help">
        Change any answers below, then apply. Controls match the questionnaire.
      </p>

      <fieldset className="filter-group">
        <legend>Age group</legend>
        <div className="filter-chip-row" role="radiogroup" aria-label="Age group">
          {(["45-55", "55+"] as const).map((age) => (
            <Chip
              key={age}
              label={age === "45-55" ? "45–55" : "55+"}
              selected={value.ageGroup === age}
              onClick={() => setAge(age)}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="filter-group">
        <legend>Primary sport</legend>
        <div className="filter-chip-row" role="radiogroup" aria-label="Primary sport">
          {SPORTS.map((sport) => (
            <Chip
              key={sport}
              label={sport}
              selected={value.primarySport === sport}
              onClick={() => setPrimarySport(sport)}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="filter-group">
        <legend>Additional sports (optional)</legend>
        <div className="filter-chip-row">
          {SPORTS.filter((sport) => sport !== value.primarySport).map((sport) => (
            <Chip
              key={sport}
              label={sport}
              multi
              selected={value.additionalSports.includes(sport)}
              onClick={() => toggleAdditional(sport)}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="filter-group">
        <legend>Product type</legend>
        <div className="filter-chip-row">
          {PRODUCT_TYPE_OPTIONS.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              multi
              selected={value.productTypes.includes(option.value)}
              onClick={() => toggleProductType(option.value)}
            />
          ))}
        </div>
        {lockedCategory ? (
          <p className="filter-band__note">
            This page keeps {lockedCategory} selected.
          </p>
        ) : null}
      </fieldset>

      <fieldset className="filter-group">
        <legend>Experience level</legend>
        <div className="filter-chip-row" role="radiogroup" aria-label="Experience">
          {(["Beginner", "Intermediate", "Experienced"] as const).map((level) => (
            <Chip
              key={level}
              label={level}
              selected={value.experienceLevel === level}
              onClick={() => setExperience(level)}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="filter-group">
        <legend>Budget</legend>
        <div className="filter-chip-row" role="radiogroup" aria-label="Budget">
          {BUDGET_PRESETS.map((preset) => (
            <Chip
              key={preset.id}
              label={`${preset.label} (${preset.hint})`}
              selected={
                value.budgetMin === preset.min && value.budgetMax === preset.max
              }
              onClick={() => setBudget(preset.min, preset.max)}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="filter-group">
        <legend>Benefits (optional)</legend>
        <div className="filter-chip-row">
          {PRODUCT_BENEFITS.map((benefit) => (
            <Chip
              key={benefit}
              label={benefit}
              multi
              selected={value.preferredBenefits.includes(benefit)}
              onClick={() => toggleBenefit(benefit)}
            />
          ))}
        </div>
      </fieldset>

      {error ? (
        <p className="field-error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="filter-band__actions">
        <button
          type="button"
          className="btn btn--primary btn--block"
          onClick={onApply}
          disabled={applying}
        >
          {applying ? "Updating…" : applyLabel}
        </button>
        {onClear ? (
          <button
            type="button"
            className="btn btn--secondary btn--block"
            onClick={onClear}
            disabled={applying}
          >
            Clear filters
          </button>
        ) : null}
      </div>
    </aside>
  );
}
