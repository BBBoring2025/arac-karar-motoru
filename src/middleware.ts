import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Middleware — /admin ve /api/admin route'larını Supabase Auth ile korur
 * Session yoksa /admin'e giriş engellenir, ana sayfaya yönlendirilir
 * 3 katmanlı güvenlik: Middleware → API route auth guard → Supabase RLS
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Supabase yapılandırılmamışsa geçir (dev mode)
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next();
  }

  // Cookie'den veya Authorization header'dan token al
  const accessToken =
    request.cookies.get("sb-access-token")?.value ||
    request.headers.get("Authorization")?.replace("Bearer ", "");

  if (!accessToken) {
    if (pathname.startsWith("/api/")) {
      return Response.json(
        { error: "Yetkilendirme gerekli" },
        { status: 401 }
      );
    }
    // Session yoksa → ana sayfaya yönlendir
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Token'ı Supabase ile doğrula
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    if (pathname.startsWith("/api/")) {
      return Response.json({ error: "Geçersiz oturum" }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Admin rol kontrolü
  const { data: kullanici } = await supabase
    .from("kullanicilar")
    .select("rol")
    .eq("auth_id", user.id)
    .single();

  if (kullanici?.rol !== "admin") {
    if (pathname.startsWith("/api/")) {
      return Response.json(
        { error: "Admin yetkisi gerekli" },
        { status: 403 }
      );
    }
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
