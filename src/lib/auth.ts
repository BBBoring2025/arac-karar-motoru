import { supabase } from "./supabase";

/**
 * Mevcut kullanıcının admin olup olmadığını kontrol et
 * API route'larında ve server component'lerde kullanılır
 */
export async function requireAdmin(): Promise<{
  authorized: boolean;
  userId?: string;
  error?: string;
}> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { authorized: false, error: "Oturum açmanız gerekli" };
  }

  const { data: kullanici } = await supabase
    .from("kullanicilar")
    .select("id, rol")
    .eq("auth_id", user.id)
    .single();

  if (!kullanici || kullanici.rol !== "admin") {
    return { authorized: false, error: "Admin yetkisi gerekli" };
  }

  return { authorized: true, userId: kullanici.id };
}
