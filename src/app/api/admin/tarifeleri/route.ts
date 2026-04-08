import { NextRequest } from "next/server";
import { createAdminClient, supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth";

/**
 * Admin tarife CRUD API — DEPRECATED in Sprint C (ADR-001)
 *
 * Sprint B's runtime verification proved this endpoint writes to Supabase
 * tables that the user-facing calculators DO NOT read from. The calculators
 * read from src/data/*.ts. Sprint C ADR-001 binds src/data as the single
 * source of truth and hides the admin tarife edit tabs from the UI.
 *
 * This route is KEPT functional (not deleted) so that:
 *   1. Sprint B's regression script (sprint-b-crud-prod-sync.mjs) keeps
 *      working as a black-box CRUD smoke test
 *   2. Future Sprint D (Path B) can re-enable the route by writing
 *      docs/adr/0002-supabase-tariff-source.md to supersede ADR-001
 *
 * Every call now:
 *   - Returns deprecation headers (X-Deprecated-Endpoint, X-See-ADR)
 *   - Logs a server-side console.warn surfacing the misalignment
 *
 * See: docs/adr/0001-src-data-as-source-of-truth.md
 *      docs/data-source-truth.md
 */

const DEPRECATION_HEADERS = {
  "X-Deprecated-Endpoint": "true",
  "X-Deprecated-Reason":
    "Writes to Supabase tables that are not read by user-facing calculators (ADR-001)",
  "X-See-ADR": "docs/adr/0001-src-data-as-source-of-truth.md",
} as const;

function warnDeprecation(method: string, tablo: string | null): void {
  console.warn(
    `[ADR-001] /api/admin/tarifeleri ${method} called (tablo=${tablo ?? "?"}). ` +
      `This endpoint writes to Supabase tables that are not read by the ` +
      `user-facing calculators. See docs/adr/0001-src-data-as-source-of-truth.md.`
  );
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) {
    return Response.json(
      { error: auth.error },
      { status: 403, headers: DEPRECATION_HEADERS }
    );
  }

  const { searchParams } = request.nextUrl;
  const tablo = searchParams.get("tablo");

  warnDeprecation("GET", tablo);

  const allowedTables = [
    "mtv_tarifeleri", "muayene_ucretleri", "otoyol_ucretleri",
    "yakit_fiyatlari", "araclar", "amortisman_oranlari", "bakim_benchmark",
  ];

  if (!tablo || !allowedTables.includes(tablo)) {
    return Response.json(
      { error: "Geçersiz tablo adı" },
      { status: 400, headers: DEPRECATION_HEADERS }
    );
  }

  const { data, error } = await supabase
    .from(tablo)
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    return Response.json(
      { error: error.message },
      { status: 500, headers: DEPRECATION_HEADERS }
    );
  }

  return Response.json({ data }, { headers: DEPRECATION_HEADERS });
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) {
    return Response.json(
      { error: auth.error },
      { status: 403, headers: DEPRECATION_HEADERS }
    );
  }

  const body = await request.json();
  const { tablo, id, updates } = body;

  warnDeprecation("PUT", tablo);

  if (!tablo || !id || !updates) {
    return Response.json(
      { error: "tablo, id ve updates gerekli" },
      { status: 400, headers: DEPRECATION_HEADERS }
    );
  }

  const allowedTables = [
    "mtv_tarifeleri", "muayene_ucretleri", "otoyol_ucretleri",
    "yakit_fiyatlari", "araclar", "amortisman_oranlari", "bakim_benchmark",
  ];

  if (!allowedTables.includes(tablo)) {
    return Response.json(
      { error: "Geçersiz tablo adı" },
      { status: 400, headers: DEPRECATION_HEADERS }
    );
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
    return Response.json(
      { error: error.message },
      { status: 500, headers: DEPRECATION_HEADERS }
    );
  }

  return Response.json({ data }, { headers: DEPRECATION_HEADERS });
}
