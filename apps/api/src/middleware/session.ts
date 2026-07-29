import type { NextFunction, Request, Response } from "express";

declare global {
  namespace Express {
    interface Request {
      sessionId?: string;
    }
  }
}

/**
 * Reads optional session id from header or body for guest cart/order flows.
 */
export function sessionMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const headerSession = req.header("x-session-id");
  const bodySession =
    typeof req.body === "object" &&
    req.body !== null &&
    "sessionId" in req.body &&
    typeof (req.body as { sessionId?: unknown }).sessionId === "string"
      ? (req.body as { sessionId: string }).sessionId
      : undefined;

  const paramSession = req.params.sessionId;
  const fromParams = typeof paramSession === "string" ? paramSession : undefined;

  req.sessionId = headerSession ?? bodySession ?? fromParams;
  next();
}
