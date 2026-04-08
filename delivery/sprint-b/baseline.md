# Sprint B Baseline — Runtime Truth Snapshot

**Tarih:** Nisan 2026
**Amaç:** Sprint B başlamadan önce production ve repo'nun tam durumunu yakalamak. Her şeyin öncesi burada kayıtlı olmalı ki sonrası ile kıyaslayabilelim.

---

## 1. Git State

| Alan | Değer |
|------|-------|
| Local HEAD (full) | `dd408ef225ea5eb1cebe76509dd296d1cbc57872` |
| Local HEAD (short) | `dd408ef` |
| Local HEAD commit | `docs: Sprint A delivery package — claim audit, build log, screenshots` |
| Branch | `main` |
| Working tree | `D dev.sh` (deleted dev.sh, will be gitignored) |

**Recent commits:**
```
dd408ef  docs: Sprint A delivery package — claim audit, build log, screenshots
3c4d723  fix: Production Truth Alignment — gerçek 2026 değerleri + dürüst confidence
f62e23b  feat: P2 Sprint — PDF rapor + gerçek karşılaştırma + rota testleri
153d546  feat: P1 Sprint — iyzico sandbox + admin CRUD + analytics provider
812503e  feat: P0 Sprint — Veri Doğruluğu ve Güven Katmanı
```

---

## 2. Production Deployment State

**Vercel deployment:**

| Alan | Değer |
|------|-------|
| Deployment ID | `dpl_Gi5LahvvYHjkRrbrV9QLWofzmULv` |
| URL | https://arac-karar-motoru.vercel.app |
| State | READY |
| Target | production |
| Region | iad1 |
| Bundler | turbopack |
| Node runtime | nodejs22.x |
| Created | Apr 5, 2026 (Sprint A deploy) |
| Source | CLI (`npx vercel --prod`) |
| Git SHA | `3c4d723df77cde23133ff70ecf8b9165c8a10697` |
| Git branch | main |
| Git commit message | "fix: Production Truth Alignment — gerçek 2026 değerleri + dürüst confidence" |
| **gitDirty flag** | **1 (dirty working tree at deploy time)** |

### Deploy Parity Gap (THE FIRST PROBLEM SPRINT B SURFACES)

| | Local | Production |
|---|---|---|
| Commit | `dd408ef` | `3c4d723` |
| Delta | — | 1 commit behind |
| Type of delta | `docs/` only (Sprint A delivery artifacts) |
| Breaking change | No (no code in delta) |

**Hüküm**: Deploy parity kırık, ama farkta kod yok — sadece `delivery/sprint-a/` docs. Sprint B'nin P5 deploy'u bunu otomatik düzeltir.

---

## 3. Production Endpoint Inventory

Baseline capture tarihinde production'da var olan endpoint'ler:

| Endpoint | HTTP | Body Snippet | Notlar |
|----------|------|--------------|--------|
| `/api/health` | **404** | HTML 404 page | Sprint B P2'de oluşturulacak |
| `/api/build-info` | **404** | HTML 404 page | Sprint B P2'de oluşturulacak |
| `/api/data-status` | **404** | HTML 404 page | Sprint B P2'de oluşturulacak (hidden misalignment surfacing) |
| `/api/admin/dashboard` | 401 | `{"error":"Yetkilendirme gerekli"}` | Auth korumalı, middleware çalışıyor ✓ |
| `/api/payment/create` | 405 | (empty) | GET'e izin vermiyor, POST bekleniyor ✓ |

**Önemli bulgular:**
- 3 adet planned endpoint henüz yok (beklenen davranış).
- Middleware token validation çalışıyor (`401` yanıtı).
- Payment endpoint method guard doğru çalışıyor (`405` yanıtı).

---

## 4. Supabase Runtime State

**Project:** `fyuxlmcugtdxuvjnzdtu` (active_healthy, eu-central-1, postgres 17)

### Migrations (5 applied)

| Version | Name |
|---------|------|
| 20260405050531 | create_enums_and_tariff_tables |
| 20260405050544 | create_vehicle_and_benchmark_tables |
| 20260405050600 | create_user_and_business_tables |
| 20260405050617 | create_rls_triggers_views |
| 20260405152520 | add_updated_by_columns (Sprint A P1) |

### Tables (14 tables, ALL EMPTY)

| Table | RLS | Rows |
|-------|-----|------|
| `mtv_tarifeleri` | ✅ true | **0** |
| `muayene_ucretleri` | ✅ true | **0** |
| `otoyol_ucretleri` | ✅ true | **0** |
| `yakit_fiyatlari` | ✅ true | **0** |
| `noter_ucretleri` | ❌ **false** | 0 |
| `araclar` | ✅ true | **0** |
| `amortisman_oranlari` | ❌ **false** | 0 |
| `bakim_benchmark` | ❌ **false** | 0 |
| `kullanicilar` | ✅ true | **0** |
| `raporlar` | ✅ true | **0** |
| `odemeler` | ✅ true | **0** |
| `b2b_musteriler` | ❌ **false** | 0 |
| `hesaplama_loglari` | ❌ **false** | 0 |
| `sayfa_goruntulumeleri` | ❌ **false** | 0 |

**KRITIK**: Tüm 14 tablo **boş**. Uygulama hesaplamaları `src/data/*.ts` hardcoded dosyalardan yapıyor — Supabase tarife tabloları decorative.

**Admin user**: `SELECT FROM kullanicilar WHERE rol='admin'` → 0 satır. Admin login production'da HİÇ test edilmemiş.

### Supabase Security Advisors

| Severity | Issue | Detail |
|----------|-------|--------|
| ERROR | security_definer_view | `populer_araclar` view — SECURITY DEFINER property |
| ERROR | security_definer_view | `admin_dashboard` view — SECURITY DEFINER property |
| **ERROR** | **rls_disabled_in_public** | `noter_ucretleri` — **RLS disabled on public table** |
| **ERROR** | **rls_disabled_in_public** | `amortisman_oranlari` — **RLS disabled on public table** |
| **ERROR** | **rls_disabled_in_public** | `bakim_benchmark` — **RLS disabled on public table** |
| **ERROR** | **rls_disabled_in_public** | `sayfa_goruntulumeleri` — **RLS disabled on public table** |
| **ERROR** | **rls_disabled_in_public** | `b2b_musteriler` — **RLS disabled on public table** |
| **ERROR** | **rls_disabled_in_public** | `hesaplama_loglari` — **RLS disabled on public table** |
| **ERROR** | **sensitive_columns_exposed** | `b2b_musteriler.api_key` — exposed via API without RLS (data exposure risk!) |
| WARN | function_search_path_mutable | `update_updated_at` — search_path not set |
| WARN | function_search_path_mutable | `increment_b2b_query` — search_path not set |
| WARN | function_search_path_mutable | `reset_monthly_queries` — search_path not set |

**Sprint B scope**: REPORT ONLY — RLS fix'leri kullanıcı onayıyla ayrı migration olabilir. B2B api_key expose'u en kritik risk.

---

## 5. Src/data vs Supabase Fork (Hidden Misalignment)

Sprint B'nin en önemli keşfi — admin UI ve public calculators **farklı data store'lar** kullanıyor:

| Data | Admin UI writes to | Public calculator reads from | User-visible effect of admin edits |
|------|-------------------|------------------------------|-------------------------------------|
| MTV | Supabase `mtv_tarifeleri` | `src/data/mtv.ts` | **Zero** |
| Muayene | Supabase `muayene_ucretleri` | `src/data/muayene.ts` | **Zero** |
| Otoyol | Supabase `otoyol_ucretleri` | `src/data/otoyol.ts`, `src/data/routes/toll-segments.ts` | **Zero** |
| Yakıt | Supabase `yakit_fiyatlari` | `src/data/yakit.ts` | **Zero** |
| Amortisman | Supabase `amortisman_oranlari` | `src/data/amortisman.ts` | **Zero** |
| Bakım | Supabase `bakim_benchmark` | `src/data/araclar.ts` (embedded) | **Zero** |
| Araçlar | — (read-only display) | `src/data/araclar.ts` | N/A (no edit UI) |

**Evidence**:
- `src/lib/mtv/calculator.ts:17` — `import { mtvData, MTVBracket } from "@/data/mtv";`
- `src/lib/muayene/calculator.ts:7` — `import { inspectionData } from "@/data/muayene";`
- `src/lib/route/toll-calculator.ts` — imports from `src/data/routes/toll-segments.ts`
- `src/app/api/admin/tarifeleri/route.ts` — `.from('mtv_tarifeleri')`, `.from('muayene_ucretleri')`, etc.

**Sonuç**: Admin panelinde MTV tarifesini 5750'den 5800'e değiştirmek, `/araclar/mtv-hesaplama` sonucunu **değiştirmez**. Kullanıcı hâlâ `src/data/mtv.ts`'deki 3950'yi görür.

Bu Sprint B'de `docs/data-source-truth.md` dosyasında detaylı dokümante edilecek.

---

## 6. Vercel Environment Variables (expected state)

Kullanıcının `.env.local.example` ve `runtime-status.md`'ye göre production'daki beklenen durum:

| Env Var | Production'da | Kanıt |
|---------|---------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Var | Site çalışıyor, anon client init oluyor |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Var | Same |
| `NEXT_PUBLIC_SITE_URL` | ✅ Var | Canonical URL'ler çalışıyor |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ **Yok** | Admin CRUD canlıda test edilmemiş |
| `IYZICO_API_KEY` | ❌ **Yok** | /odeme "Hazırlanıyor" gösteriyor |
| `IYZICO_SECRET_KEY` | ❌ **Yok** | Same |
| `IYZICO_BASE_URL` | ❌ **Yok** | Same |
| `NEXT_PUBLIC_GA_ID` | ❌ Yok | Analytics script yüklenmiyor |

**Sprint B P7**: Eksik 4 tane kritik env var Vercel Dashboard'a eklenecek.

**Note**: Production'daki env var listesi yalnızca Vercel Dashboard üzerinden doğrulanabilir (Vercel MCP API'de listing endpoint yok). Kullanıcı P7 öncesinde Dashboard'tan ekran görüntüsü paylaşabilir.

---

## 7. Sprint A Artifact Inventory

`delivery/sprint-a/` içeriği:

| Dosya | Boyut |
|-------|-------|
| status.md | 3.8K |
| claim-audit.md | 5.7K |
| data-source-map.md | 4.1K |
| official-data-verification.md | 4.9K |
| golden-tests-summary.md | 5.2K |
| manual-qa.md | 6.0K |
| changed-files.md | 6.0K |
| build-log.txt | 9.7K |
| screenshots/ (9 files) | ~311K (8 HTML + README) |

**Archival plan (P12)**: `delivery/sprint-a/` REMAINS IN PLACE (historical record). Sprint B'nin kendi paketi `delivery/sprint-b/` olarak paralel oluşturulacak.

`docs/` içerisindeki stale artifact'ler (P12 archival):
- `status-phase-1.md` — Phase 1 artifact (eski)
- `status-phase-2.md` — Phase 2 artifact (eski)
- `status-phase-3.md` — Phase 3 artifact (eski)
- `status-phase-4.md` — Phase 4 artifact (eski)
- `runtime-status.md` — Sprint A version (P10'da `archive/`'a taşınacak)

---

## 8. Known Runtime Caveats

1. **Next 16 deprecation warning**: `The "middleware" file convention is deprecated. Please use "proxy" instead.` — build uyarısı. Sprint B'de **düzeltilmez**, raporlanır.
2. **Supabase `gitDirty: 1`** flag in Sprint A deployment — deploy zamanında working tree kirliydi (muhtemelen `.env.local` veya `dev.sh`). Bu bir runtime problem değil ama parity açısından not edilmeli.
3. **Admin panel is a "view without data"** — boş Supabase tabloları ile hiç anlamlı kullanım yapılmamış.
4. **Hiçbir admin kullanıcı yok** — admin login production'da hiç test edilmemiş.

---

## 9. Sprint B'nin 5 Core Sorusu (baseline'da cevaplanmıyor, hedef)

| # | Soru | Baseline Cevabı | Hedef Cevap (P8 sonrası) |
|---|------|-----------------|--------------------------|
| 1 | Production'da çalışan commit hash gerçekten ne? | Bilinmiyor (endpoint yok) | `/api/build-info.commit` ile kanıtlanacak |
| 2 | Vercel deploy ile GitHub HEAD birebir aynı mı? | HAYIR — 1 commit delta (`dd408ef` vs `3c4d723`) | P5 deploy sonrası parity |
| 3 | Supabase migration / tablo / RLS / CRUD gerçekten canlıda çalışıyor mu? | Kısmi — tablolar var ama boş, 6 RLS açığı, CRUD test edilmemiş | P8 test 3 ile kanıtlanacak |
| 4 | iyzico entegrasyonu gerçekten aktif mi? | HAYIR — sadece kod hazır, Vercel env yok | P7+P8 sonrası ACTIVE SANDBOX |
| 5 | Analytics provider gerçekten bağlı mı? | HAYIR — abstraction var, provider script yok | P8 test 8 ile DOĞRULANMIŞ NEGATIVE ANSWER |

---

## 10. Sprint B Başlangıç Checkpoint

Aşağıdaki durum dondurulmuştur. Sprint B'nin tüm karşılaştırmaları bu state'e göredir:

- [x] Git HEAD: `dd408ef`
- [x] Production commit: `3c4d723`
- [x] Vercel deployment: `dpl_Gi5LahvvYHjkRrbrV9QLWofzmULv`
- [x] Supabase tables: 14, rows: 0
- [x] Supabase migrations: 5
- [x] Admin users: 0
- [x] Health endpoints: 0 (all 404)
- [x] Vercel env vars for payment/admin write: MISSING

**Sprint B'nin görevi**: Bu dondurulmuş state'i "after" snapshot'ıyla eşleştirerek her değişikliği kanıtlamak.
