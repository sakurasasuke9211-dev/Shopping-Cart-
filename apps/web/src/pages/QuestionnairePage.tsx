import { AppHeader } from "../components/layout/AppHeader";
import { QuestionnaireOverlay } from "../components/questionnaire/QuestionnaireOverlay";

export function QuestionnairePage() {
  return (
    <div className="recs-page">
      <AppHeader showSearch={false} />
      <QuestionnaireOverlay />
    </div>
  );
}
