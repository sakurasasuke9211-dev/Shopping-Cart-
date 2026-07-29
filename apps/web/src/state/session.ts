const SESSION_KEY = "sports-shop.sessionId";

function createSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `sess_${crypto.randomUUID()}`;
  }
  return `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function ensureSessionId(): string {
  const existing = localStorage.getItem(SESSION_KEY);
  if (existing) return existing;

  const sessionId = createSessionId();
  localStorage.setItem(SESSION_KEY, sessionId);
  return sessionId;
}

export function getSessionId(): string | null {
  return localStorage.getItem(SESSION_KEY);
}
