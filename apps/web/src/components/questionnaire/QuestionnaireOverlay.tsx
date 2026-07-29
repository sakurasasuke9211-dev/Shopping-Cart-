import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PRODUCT_BENEFITS,
  SPORTS,
  type ProductCategory,
} from "@sports-shop/shared";
import { fetchRecommendations } from "../../api/client";
import {
  BUDGET_PRESETS,
  PRODUCT_TYPE_OPTIONS,
  draftFromPreferences,
  draftToPreferences,
  validateDraftForRecommendations,
  type PreferenceDraft,
} from "../../lib/preferenceOptions";
import { useAppState } from "../../state/appState";
import "./QuestionnaireOverlay.css";

const TOTAL_STEPS = 7;

type Draft = PreferenceDraft;

export function QuestionnaireOverlay() {
  const navigate = useNavigate();
  const { preferences, setPreferences, setRecommendations } = useAppState();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(() => draftFromPreferences(preferences));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const headingId = useId();

  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  const canContinue = useMemo(() => {
    switch (step) {
      case 0:
        return Boolean(draft.ageGroup);
      case 1:
        return Boolean(draft.primarySport);
      case 2:
        return true;
      case 3:
        return draft.productTypes.length > 0;
      case 4:
        return Boolean(draft.experienceLevel);
      case 5:
        return (
          draft.budgetMin !== null &&
          draft.budgetMax !== null &&
          draft.budgetMax >= draft.budgetMin
        );
      case 6:
        return true;
      default:
        return false;
    }
  }, [draft, step]);

  function validateCurrent(): string | null {
    if (step === 0 && !draft.ageGroup) return "Please select an age group.";
    if (step === 1 && !draft.primarySport) return "Please select a primary sport.";
    if (step === 3 && draft.productTypes.length === 0) {
      return "Please select at least one product type.";
    }
    if (step === 4 && !draft.experienceLevel) {
      return "Please select your experience level.";
    }
    if (
      step === 5 &&
      (draft.budgetMin === null ||
        draft.budgetMax === null ||
        draft.budgetMax < draft.budgetMin)
    ) {
      return "Please choose a budget range.";
    }
    return null;
  }

  async function finish(fromDraft: Draft = draft) {
    const validationError = validateDraftForRecommendations(fromDraft);
    if (validationError) {
      // No answers at all → All Products. Partial answers still recommend.
      navigate("/browse");
      return;
    }

    const payload = draftToPreferences(fromDraft);
    if (!payload) {
      navigate("/browse");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const result = await fetchRecommendations(payload);
      setPreferences(payload);
      setRecommendations(result);
      navigate("/recommendations");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We could not load recommendations. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function onSkipAll() {
    navigate("/browse");
  }

  function clearCurrentStep(current: Draft): Draft {
    switch (step) {
      case 0:
        return { ...current, ageGroup: null };
      case 1:
        return { ...current, primarySport: null };
      case 2:
        return { ...current, additionalSports: [] };
      case 3:
        return { ...current, productTypes: [] };
      case 4:
        return { ...current, experienceLevel: null };
      case 5:
        return { ...current, budgetMin: null, budgetMax: null };
      case 6:
        return { ...current, preferredBenefits: [] };
      default:
        return current;
    }
  }

  function onSkipStep() {
    setError(null);
    const nextDraft = clearCurrentStep(draft);
    setDraft(nextDraft);
    if (step >= TOTAL_STEPS - 1) {
      void finish(nextDraft);
      return;
    }
    setStep((value) => value + 1);
  }

  function onNext() {
    const validationError = validateCurrent();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    if (step >= TOTAL_STEPS - 1) {
      void finish();
      return;
    }
    setStep((value) => value + 1);
  }

  function onBack() {
    setError(null);
    if (step === 0) {
      navigate("/");
      return;
    }
    setStep((value) => value - 1);
  }

  function toggleAdditionalSport(sport: string) {
    setDraft((current) => {
      const exists = current.additionalSports.includes(sport);
      if (exists) {
        return {
          ...current,
          additionalSports: current.additionalSports.filter((item) => item !== sport),
        };
      }
      if (current.additionalSports.length >= 3) return current;
      return {
        ...current,
        additionalSports: [...current.additionalSports, sport],
      };
    });
  }

  function toggleProductType(type: ProductCategory) {
    setDraft((current) => {
      const exists = current.productTypes.includes(type);
      return {
        ...current,
        productTypes: exists
          ? current.productTypes.filter((item) => item !== type)
          : [...current.productTypes, type],
      };
    });
  }

  function toggleBenefit(benefit: string) {
    setDraft((current) => {
      const exists = current.preferredBenefits.includes(benefit);
      return {
        ...current,
        preferredBenefits: exists
          ? current.preferredBenefits.filter((item) => item !== benefit)
          : [...current.preferredBenefits, benefit],
      };
    });
  }

  return (
    <div className="quiz-shell">
      <div className="quiz-shell__backdrop" aria-hidden="true" />
      <div
        className="quiz-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
      >
        <p className="quiz-modal__progress">
          Step {step + 1} of {TOTAL_STEPS}
        </p>

        <fieldset className="quiz-step">
          {step === 0 ? (
            <>
              <legend className="sr-only">Which age group are you in?</legend>
              <h2 id={headingId} ref={headingRef} tabIndex={-1}>
                Which age group are you in?
              </h2>
              <p className="quiz-step__help">
                This helps us recommend the right gear for your needs.
              </p>
              <div className="quiz-options">
                <OptionButton
                  selected={draft.ageGroup === "45-55"}
                  title="45–55 years"
                  subtitle="Active lifestyle and everyday performance"
                  tone="a"
                  onClick={() => setDraft((d) => ({ ...d, ageGroup: "45-55" }))}
                />
                <OptionButton
                  selected={draft.ageGroup === "55+"}
                  title="55+ years"
                  subtitle="Focus on comfort, mobility, and ease of use"
                  tone="b"
                  onClick={() => setDraft((d) => ({ ...d, ageGroup: "55+" }))}
                />
              </div>
            </>
          ) : null}

          {step === 1 ? (
            <>
              <legend className="sr-only">Which sport do you want equipment for?</legend>
              <h2 id={headingId} ref={headingRef} tabIndex={-1}>
                Which sport do you want equipment for?
              </h2>
              <div className="quiz-options quiz-options--grid">
                {SPORTS.map((sport) => (
                  <OptionButton
                    key={sport}
                    selected={draft.primarySport === sport}
                    title={sport}
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        primarySport: sport,
                        additionalSports: d.additionalSports.filter((s) => s !== sport),
                      }))
                    }
                  />
                ))}
              </div>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <legend className="sr-only">Any other sports you’re interested in?</legend>
              <h2 id={headingId} ref={headingRef} tabIndex={-1}>
                Any other sports you’re interested in?
              </h2>
              <p className="quiz-step__help">Optional — choose up to 3.</p>
              <div className="quiz-options quiz-options--grid">
                {SPORTS.filter((sport) => sport !== draft.primarySport).map((sport) => (
                  <OptionButton
                    key={sport}
                    selected={draft.additionalSports.includes(sport)}
                    title={sport}
                    multi
                    onClick={() => toggleAdditionalSport(sport)}
                  />
                ))}
              </div>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <legend className="sr-only">What type of product do you need?</legend>
              <h2 id={headingId} ref={headingRef} tabIndex={-1}>
                What type of product do you need?
              </h2>
              <div className="quiz-options quiz-options--grid">
                {PRODUCT_TYPE_OPTIONS.map((option) => (
                  <OptionButton
                    key={option.value}
                    selected={draft.productTypes.includes(option.value)}
                    title={option.label}
                    multi
                    onClick={() => toggleProductType(option.value)}
                  />
                ))}
              </div>
            </>
          ) : null}

          {step === 4 ? (
            <>
              <legend className="sr-only">What is your experience level?</legend>
              <h2 id={headingId} ref={headingRef} tabIndex={-1}>
                What is your experience level?
              </h2>
              <div className="quiz-options">
                {(["Beginner", "Intermediate", "Experienced"] as const).map(
                  (level) => (
                    <OptionButton
                      key={level}
                      selected={draft.experienceLevel === level}
                      title={level}
                      onClick={() =>
                        setDraft((d) => ({ ...d, experienceLevel: level }))
                      }
                    />
                  ),
                )}
              </div>
            </>
          ) : null}

          {step === 5 ? (
            <>
              <legend className="sr-only">What is your budget?</legend>
              <h2 id={headingId} ref={headingRef} tabIndex={-1}>
                What is your budget?
              </h2>
              <div className="quiz-options">
                {BUDGET_PRESETS.map((preset) => (
                  <OptionButton
                    key={preset.id}
                    selected={
                      draft.budgetMin === preset.min && draft.budgetMax === preset.max
                    }
                    title={preset.label}
                    subtitle={preset.hint}
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        budgetMin: preset.min,
                        budgetMax: preset.max,
                      }))
                    }
                  />
                ))}
              </div>
            </>
          ) : null}

          {step === 6 ? (
            <>
              <legend className="sr-only">Any extra preferences?</legend>
              <h2 id={headingId} ref={headingRef} tabIndex={-1}>
                Any extra preferences?
              </h2>
              <p className="quiz-step__help">Optional — select all that matter to you.</p>
              <div className="quiz-options quiz-options--grid">
                {PRODUCT_BENEFITS.map((benefit) => (
                  <OptionButton
                    key={benefit}
                    selected={draft.preferredBenefits.includes(benefit)}
                    title={benefit}
                    multi
                    onClick={() => toggleBenefit(benefit)}
                  />
                ))}
              </div>
            </>
          ) : null}
        </fieldset>

        {error ? (
          <p className="field-error" role="alert">
            {error}
          </p>
        ) : null}

        <div className="quiz-modal__actions">
          <button type="button" className="btn btn--secondary" onClick={onBack}>
            ← Back
          </button>
          <button
            type="button"
            className="btn btn--muted"
            onClick={onSkipStep}
            disabled={submitting}
          >
            Skip this step
          </button>
          <button
            type="button"
            className="btn btn--muted"
            onClick={onSkipAll}
            disabled={submitting}
          >
            Skip All
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={onNext}
            disabled={submitting || !canContinue}
          >
            {step >= TOTAL_STEPS - 1
              ? submitting
                ? "Finding products…"
                : "Show my recommendations"
              : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}

function OptionButton({
  selected,
  title,
  subtitle,
  onClick,
  multi = false,
  tone,
}: {
  selected: boolean;
  title: string;
  subtitle?: string;
  onClick: () => void;
  multi?: boolean;
  tone?: "a" | "b";
}) {
  return (
    <button
      type="button"
      className={`quiz-option ${selected ? "is-selected" : ""} ${tone ? `quiz-option--${tone}` : ""}`}
      role={multi ? "checkbox" : "radio"}
      aria-checked={selected}
      onClick={onClick}
    >
      <span className="quiz-option__text">
        <strong>{title}</strong>
        {subtitle ? <span>{subtitle}</span> : null}
      </span>
      <span className="quiz-option__marker" aria-hidden="true" />
    </button>
  );
}
