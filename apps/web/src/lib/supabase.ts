import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey);

let client: SupabaseClient | null = null;

/** Reusable browser Supabase client (anon key only). */
export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
    );
  }
  if (!client) {
    client = createClient(url!, anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: localStorage,
      },
    });
  }
  return client;
}

export type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
};

export type UserPreferencesRow = {
  user_id: string;
  age_group: string | null;
  primary_sport: string | null;
  additional_sports: string[];
  product_types: string[];
  experience_level: string | null;
  budget_min: number | null;
  budget_max: number | null;
  preferred_benefits: string[];
  raw_preferences: unknown;
};
