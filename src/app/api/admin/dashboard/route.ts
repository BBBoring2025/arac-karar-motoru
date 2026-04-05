import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth";

/**
 * Admin dashboard istatistikleri
 * Supabase admin_dashboard view'dan çeker
 */
export async function GET() {
  const auth = await requireAdmin();
  if (!auth.authorized) {
    return Response.json({ error: auth.error }, { status: 403 });
  }
  const { data, error } = await supabase
    .from("admin_dashboard")
    .select("*")
    .single();

  if (error) {
    // View henüz oluşturulmamışsa fallback
    return Response.json({
      data: {
        toplam_kullanici: 0,
        toplam_rapor: 0,
        aylik_rapor: 0,
        toplam_gelir: 0,
        aylik_gelir: 0,
        aktif_b2b: 0,
        aylik_pv: 0,
      },
    });
  }

  return Response.json({ data });
}
