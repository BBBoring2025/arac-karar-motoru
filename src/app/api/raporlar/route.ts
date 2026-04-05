import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * Rapor CRUD API
 * POST: Yeni rapor kaydet
 * GET: Kullanıcının raporlarını getir
 */

export async function POST(request: NextRequest) {
  const body = await request.json();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Kullanıcı yoksa anonim rapor (kullanici_id null)
  let kullaniciId = null;
  if (user) {
    const { data: kullanici } = await supabase
      .from("kullanicilar")
      .select("id")
      .eq("auth_id", user.id)
      .single();
    kullaniciId = kullanici?.id || null;
  }

  const { data, error } = await supabase
    .from("raporlar")
    .insert({
      kullanici_id: kullaniciId,
      rapor_tipi: body.rapor_tipi || "tekli",
      durum: "tamamlandi",
      arac_bilgileri: body.arac_bilgileri,
      tco_12ay: body.tco_12ay,
      tco_36ay: body.tco_36ay,
      km_basi_maliyet: body.km_basi_maliyet,
      karar_ozeti: body.karar_ozeti,
      hesaplama_sonuclari: body.hesaplama_sonuclari,
      fiyat: body.fiyat || 0,
    })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ data }, { status: 201 });
}

export async function GET() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Giriş yapmanız gerekli" }, { status: 401 });
  }

  const { data: kullanici } = await supabase
    .from("kullanicilar")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!kullanici) {
    return Response.json({ data: [] });
  }

  const { data, error } = await supabase
    .from("raporlar")
    .select("*")
    .eq("kullanici_id", kullanici.id)
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ data });
}
