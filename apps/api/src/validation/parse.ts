import { ZodError, type z } from "zod";
import { AppError } from "../middleware/errorHandler.js";

export function parseOrThrow<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown,
): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw validationError(result.error);
  }
  return result.data;
}

export function validationError(error: ZodError): AppError {
  return new AppError(
    400,
    "VALIDATION_ERROR",
    error.errors[0]?.message ?? "Invalid request",
    error.errors.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    })),
  );
}
