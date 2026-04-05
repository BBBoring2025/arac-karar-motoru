import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/**
 * Supabase browser client — lazy singleton
 * Client component'lerde ve API route'larda kullanılır
 * Build sırasında env değişkenleri olmayabilir, lazy init ile çözülür
 */
let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || supabaseUrl;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || supabaseAnonKey;
    if (!url || !key) {
      throw new Error(
        "NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY tanımlanmalı"
      );
    }
    _supabase = createClient(url, key);
  }
  return _supabase;
}

// Geriye uyumluluk — mevcut import'ları bozmamak için
// Build sırasında modül yüklendiğinde hata vermez, runtime'da çağrılınca çalışır
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getSupabase() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

/**
 * Supabase admin client — service role key ile
 * Sadece server-side'da kullanılır (API routes, middleware)
 * RLS bypass eder
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
