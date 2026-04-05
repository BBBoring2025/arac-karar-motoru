import { NextRequest } from "next/server";
import { createAdminClient, supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth";

/**
 * Admin tarife CRUD API
 * GET: Tüm tarifeleri oku (mtv, muayene, otoyol)
 * PUT: Tarife güncelle
 * Her iki endpoint de admin auth gerektirir
 */

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) {
    return Response.json({ error: auth.error }, { status: 403 });
  }

  const { searchParams } = request.nextUrl;
  const tablo = searchParams.get("tablo");

  const allowedTables = [
    "mtv_tarifeleri", "muayene_ucretleri", "otoyol_ucretleri",
    "yakit_fiyatlari", "araclar", "amortisman_oranlari", "bakim_benchmark",
  ];

  if (!tablo || !allowedTables.includes(tablo)) {
    return Response.json({ error: "Geçersiz tablo adı" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from(tablo)
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ data });
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) {
    return Response.json({ error: auth.error }, { status: 403 });
  }

  const body = await request.json();
  const { tablo, id, updates } = body;

  if (!tablo || !id || !updates) {
    return Response.json({ error: "tablo, id ve updates gerekli" }, { status: 400 });
  }

  const allowedTables = [
    "mtv_tarifeleri", "muayene_ucretleri", "otoyol_ucretleri",
    "yakit_fiyatlari", "araclar", "amortisman_oranlari", "bakim_benchmark",
  ];

  if (!allowedTables.includes(tablo)) {
    return Response.json({ error: "Geçersiz tablo adı" }, { status: 400 });
  }

  const adminClient = createAdminClient();

  const { data, error } = await adminClient
    .from(tablo)
    .update({
      ...updates,
      guncelleme_tarihi: new Date().toISOString(),
      updated_by: auth.email || 'admin',
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ data });
}
