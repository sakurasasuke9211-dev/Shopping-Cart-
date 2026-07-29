import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { RecommendationResult, UserPreferences } from "@sports-shop/shared";
import {
  readGuestPreferences,
  writeGuestPreferences,
} from "../auth/guestStorage";
import { fetchCart } from "../api/client";
import { cartQuantityTotal } from "../lib/money";
import { ensureSessionId } from "./session";

const AUTH_KEY = "sports-mart.authMode";
const CART_COUNT_KEY = "sports-mart.cartCount";

export type AuthMode = "guest" | "registered" | null;

type StoreSnapshot = {
  preferences: UserPreferences | null;
  authMode: AuthMode;
  cartCount: number;
};

let memoryRecommendations: RecommendationResult | null = null;
let cachedSnapshot: StoreSnapshot | null = null;
const listeners = new Set<() => void>();

function emit() {
  cachedSnapshot = null;
  listeners.forEach((listener) => listener());
}

function getSnapshot(): StoreSnapshot {
  if (cachedSnapshot) return cachedSnapshot;
  cachedSnapshot = {
    preferences: readGuestPreferences(),
    authMode: (localStorage.getItem(AUTH_KEY) as AuthMode) ?? null,
    cartCount: Number(localStorage.getItem(CART_COUNT_KEY) ?? "0") || 0,
  };
  return cachedSnapshot;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setPreferences(preferences: UserPreferences | null) {
  writeGuestPreferences(preferences);
  emit();
}

export function setAuthMode(mode: AuthMode) {
  if (mode) localStorage.setItem(AUTH_KEY, mode);
  else localStorage.removeItem(AUTH_KEY);
  emit();
}

export function setCartCount(count: number) {
  localStorage.setItem(CART_COUNT_KEY, String(Math.max(0, count)));
  emit();
}

export function setRecommendationsCache(result: RecommendationResult | null) {
  memoryRecommendations = result;
}

export function getRecommendationsCache(): RecommendationResult | null {
  return memoryRecommendations;
}

type AppStateValue = StoreSnapshot & {
  sessionId: string;
  recommendations: RecommendationResult | null;
  setPreferences: typeof setPreferences;
  setAuthMode: typeof setAuthMode;
  setCartCount: typeof setCartCount;
  setRecommendations: (result: RecommendationResult | null) => void;
};

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [sessionId] = useState(() => ensureSessionId());
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const [recommendations, setRecs] = useState<RecommendationResult | null>(
    () => memoryRecommendations,
  );

  useEffect(() => {
    let cancelled = false;
    fetchCart(sessionId)
      .then((cart) => {
        if (!cancelled) setCartCount(cartQuantityTotal(cart.items));
      })
      .catch(() => {
        /* Keep local badge if API is briefly unavailable */
      });
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const value = useMemo<AppStateValue>(
    () => ({
      ...snapshot,
      sessionId,
      recommendations,
      setPreferences,
      setAuthMode,
      setCartCount,
      setRecommendations: (result) => {
        setRecommendationsCache(result);
        setRecs(result);
      },
    }),
    [snapshot, sessionId, recommendations],
  );

  return (
    <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
  );
}

export function useAppState(): AppStateValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error("useAppState must be used within AppStateProvider");
  }
  return ctx;
}
