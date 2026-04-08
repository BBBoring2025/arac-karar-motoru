# Claim Audit — Sprint B Delta

Sprint A shipped a claim audit (under `delivery/sprint-a/claim-audit.md`).
Sprint B did not touch the user-facing claims themselves — it added runtime
verification endpoints that make the audit easier to maintain.

This file lists the **delta**: new claims added, claims verified by runtime
probes, and claims that remain unchanged.

---

## Claims added in Sprint B

| Claim | Where | Evidence | Status |
|---|---|---|---|
| "Production is running the current git HEAD" | Footer (not yet shown), `/api/build-info` | Runtime endpoint, Test 1 | ✅ verifiable |
| "Ödeme sistemi hazır" (when paymentEnabled) | `/odeme` page, state-machine UI | `/api/health.flags.paymentEnabled` + state machine | ⚠️ partial (local PASS, prod blocked) |
| "Ödeme sistemi hazırlanıyor" (when disabled) | `/odeme` page, ComingSoon variant | Same | ✅ honest when disabled |
| "/api/health`, `/api/build-info`, `/api/data-status` exist" | this file | curl returns 200 JSON | ✅ verified |
| "No secrets leaked from health endpoints" | `health-checks.md` | grep test, Test 10 | ✅ verified |
| "Feature flags reflect real runtime state" | `feature-flags.md` | `/api/health.flags` | ✅ verified |

---

## Claims from Sprint A that Sprint B re-verified

| Sprint A claim | Sprint B re-verification | Verdict |
|---|---|---|
| MTV hesaplama doğru sonuç döndürür | `/araclar/mtv-hesaplama` returns 200 with numeric result; 35 unit tests + 3240 graph pairs pass (build log) | ✅ Still true |
| Muayene ve yakit hesaplamaları doğru | 21 + 16 unit tests pass | ✅ Still true |
| Route engine çalışır | 3240 graph pairs + 16 edge cases pass | ✅ Still true |
| Analytics altyapısı "code ready" ama provider yok | `/api/health.flags.analyticsEnabled.enabled=false`, 0 provider scripts in HTML | ✅ Verified honest |
| Admin dashboard var ama henüz login yapılabilmiş değil | `/api/admin/dashboard` returns 401, `/admin/login` reachable | ⚠️ Still partial (auth guard only, full browser E2E deferred to Sprint B+1) |
| Iyzico sandbox hazır ama env vars yok | **Sprint B changed this** — env vars now set, but `/api/payment/create` returns 500 in prod (caveat) | ⚠️ Changed — new partial state |
| src/data/*.ts authoritative for calculations | `/api/data-status.calculationSource="src_data_static_files"` | ✅ Verified explicit |
| Supabase admin CRUD works | `admin-crud-verification.md` P8 Test 3 | ✅ Verified with audit trail |
| Admin CRUD has no user-visible effect on calculators | `data-source-truth.md` + `/api/data-status.alignmentWarning` | ✅ **Surfaced in Sprint B** |

---

## Claims Sprint B can NOT make

The following are out of Sprint B's scope and should NOT be inferred from
the runtime verification:

1. "MTV tarife values are accurate to the 2026 GİB Tebliği" — they are
   tagged `yaklaşık` (approximate). Needs a data-audit sprint.
2. "iyzico full E2E works end-to-end in production" — only local E2E
   proven. Production `/api/payment/create` 500 is an outstanding caveat.
3. "Admin can log in to the dashboard" — auth guard verified (401
   without cookie) but full browser login E2E is deferred.
4. "All Supabase tables have correct RLS" — 6 tables have RLS disabled
   (P0 finding), not fixed in Sprint B.
5. "Next.js 16 is fully compatible" — `middleware → proxy` deprecation
   warning is present, not fixed.

---

## How to update this audit in future sprints

Pattern:
1. Keep each claim in its own row.
2. Each claim must have a **where** (UI / docs / file) and **evidence**
   (curl command, test name, artifact path).
3. Evidence should cite a runtime probe when possible, not a static
   code reference. Sprint B's whole point is that runtime > source.
4. Verdicts: ✅ (true and verified), ⚠️ (partial or caveat), ❌ (false),
   ⏸️ (deferred / not yet verified).
