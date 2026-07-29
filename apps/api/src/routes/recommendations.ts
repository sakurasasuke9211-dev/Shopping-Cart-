import type { Request, Response } from "express";
import type { UserPreferences } from "@sports-shop/shared";
import { assertInventoryReady } from "../services/inventory/inventoryService.js";
import { getRecommendations } from "../services/recommendation/recommendationService.js";
import { parseOrThrow } from "../validation/parse.js";
import { recommendationsBodySchema } from "../validation/schemas.js";

export async function createRecommendations(
  req: Request,
  res: Response,
): Promise<void> {
  assertInventoryReady();
  const body = parseOrThrow(recommendationsBodySchema, req.body);
  const preferences: UserPreferences = {
    ageGroup: body.ageGroup,
    primarySport: body.primarySport,
    additionalSports: body.additionalSports,
    productType: body.productType as UserPreferences["productType"],
    experienceLevel: body.experienceLevel,
    budgetMin: body.budgetMin,
    budgetMax: body.budgetMax,
    preferredBenefits: body.preferredBenefits,
  };

  const result = await getRecommendations(preferences);
  res.json(result);
}
