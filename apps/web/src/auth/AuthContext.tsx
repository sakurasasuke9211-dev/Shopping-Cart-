import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { setAuthMode } from "../state/appState";
import { ensureSessionId } from "../state/session";
import { getSupabase, isSupabaseConfigured } from "../lib/supabase";
import { transferGuestDataToDatabase } from "./guestTransfer";

type AuthContextValue = {
  configured: boolean;
  loading: boolean;
  session: Session | null;
  user: User | null;
  signUp: (input: {
    email: string;
    password: string;
    fullName: string;
  }) => Promise<{ needsEmailConfirmation: boolean }>;
  signIn: (input: { email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const redirectBase = () => window.location.origin;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const runGuestTransfer = useCallback(async (user: User) => {
    try {
      // Mutex inside transferGuestDataToDatabase prevents concurrent qty inflation
      await transferGuestDataToDatabase(user, ensureSessionId());
    } catch (error) {
      console.warn("[auth] guest data transfer failed", error);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    const supabase = getSupabase();
    let cancelled = false;

    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setSession(data.session);
      if (data.session?.user) {
        setAuthMode("registered");
        void runGuestTransfer(data.session.user);
      }
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next);
      if (next?.user) {
        setAuthMode("registered");
        if (event === "SIGNED_IN" || event === "USER_UPDATED") {
          void runGuestTransfer(next.user);
        }
      } else if (event === "SIGNED_OUT") {
        setAuthMode(null);
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [runGuestTransfer]);

  const value = useMemo<AuthContextValue>(
    () => ({
      configured: isSupabaseConfigured,
      loading,
      session,
      user: session?.user ?? null,
      async signUp({ email, password, fullName }) {
        const supabase = getSupabase();
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${redirectBase()}/auth/callback`,
          },
        });
        if (error) throw error;
        const needsEmailConfirmation = !data.session;
        if (data.session?.user) {
          setAuthMode("registered");
          await runGuestTransfer(data.session.user);
        }
        return { needsEmailConfirmation };
      },
      async signIn({ email, password }) {
        const supabase = getSupabase();
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) {
          setAuthMode("registered");
          await runGuestTransfer(data.user);
        }
      },
      async signOut() {
        const supabase = getSupabase();
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        setAuthMode(null);
      },
      async resetPasswordForEmail(email: string) {
        const supabase = getSupabase();
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${redirectBase()}/reset-password`,
        });
        if (error) throw error;
      },
      async updatePassword(password: string) {
        const supabase = getSupabase();
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
      },
    }),
    [loading, session, runGuestTransfer],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
