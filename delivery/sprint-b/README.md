# Sprint B Delivery Package — Runtime Verification & Deployment Parity

**Delivered**: 2026-04-08
**Production commit**: `0be9b8e7612bd2b365a5418922d22981981c7f37`
**Production URL**: https://arac-karar-motoru.vercel.app
**Vercel deployment**: `dpl_8naZeBtVC6L5ofGfqUbJ8uhxStMa`
**Built at**: `2026-04-08T13:50:07.884Z`

---

## Purpose of Sprint B

Zero new user-facing features. The goal was to produce **4 separate proofs**
for every "live" claim (code / runtime / deploy / env) and surface hidden
misalignments. Sprint A had left the project with:

- No way to verify what commit was running in production
- Admin CRUD writing to Supabase tables that weren't read by the calculators
- Missing `/api/health`, `/api/build-info`, `/api/data-status` endpoints
- No centralized feature flag system
- No admin user, no iyzico env vars in Vercel, no runtime proof for either
- Two stale `runtime-status.md` documents contradicting each other

Sprint B fixed the **verification and observability layer**, not the tech
debt underneath. The tech debt is now surfaced, documented, and tracked.

---

## How to Read This Package

Start here, in order:

1. **`runtime-status.md`** — Single source of truth for what's live. Read first.
2. **`sprint-end-questions.md`** — 7 questions, 7 honest answers with citations.
3. **`data-source-truth.md`** — The critical hidden misalignment surfaced.
4. **`build-parity.md`** — Deploy parity proof (P8 Test 1).
5. **`admin-crud-verification.md`** — Supabase CRUD end-to-end (P8 Test 3).
6. **`payment-runtime-check.md`** — iyzico local-vs-prod (P8 Test 5/6/7).
7. **`analytics-runtime-check.md`** — Analytics honestly inactive (P8 Test 8).
8. **`manual-qa.md`** — 7 manual tests any human can run to independently
   verify Sprint B.

Reference material:

- **`baseline.md`** — P0 starting state (Vercel deploy, Supabase tables, env vars)
- **`feature-flags.md`** — Centralized flag architecture
- **`status.md`** — Phase-by-phase execution status
- **`env-audit.md`** — Vercel env vars list (names only)
- **`changed-files.md`** — Git diff summary vs Sprint A head
- **`health-checks.md`** — Endpoint specifications
- **`supabase-runtime-check.md`** — Supabase-specific probes
- **`claim-audit.md`** — Updated from Sprint A, delta only

Proof artifacts:

- **`api-responses/`** — 15+ JSON files, raw endpoint responses with
  timestamps

---

## One-Paragraph Sprint B Summary

Sprint B added three new API endpoints (`/api/health`, `/api/build-info`,
`/api/data-status`), centralized feature flags in `src/lib/flags.ts`,
introduced a payment state machine, rewired `/odeme` to use the health
endpoint instead of the old create-route probe, seeded an admin user into
`kullanicilar`, enabled the user to flip `SUPABASE_SERVICE_ROLE_KEY` and
`IYZICO_*` env vars in Vercel Production, and verified ten runtime tests
with artifacts. **Deploy parity is proven** at runtime. **Supabase CRUD is
proven real** with audit trail. **Analytics is proven honestly inactive.**
**iyzico sandbox is set in Vercel but `/api/payment/create` returns 500
in prod** (local PASS) — suspected missing `NEXT_PUBLIC_SITE_URL`, not
diagnosable without Vercel logs (MCP was offline during verification).
**The `src/data` vs Supabase fork is now surfaced** via `/api/data-status`
and `docs/data-source-truth.md`.

---

## Delivery Package Layout

```
delivery/sprint-b/
├── README.md                     ← you are here
├── status.md
├── baseline.md
├── build-log.txt                 (local build + 106 tests + 3240 graph pairs)
├── build-parity.md               (P8 Test 1)
├── deploy-parity.md
├── feature-flags.md
├── runtime-status.md             (tek doğruluk kaynağı, docs/ kopya)
├── data-source-truth.md          (kritik misalignment, docs/ kopya)
├── admin-crud-verification.md    (P8 Test 3)
├── payment-runtime-check.md      (P8 Tests 5/6/7)
├── analytics-runtime-check.md    (P8 Test 8)
├── supabase-runtime-check.md
├── health-checks.md              (endpoint specs)
├── env-audit.md                  (Vercel env var names)
├── changed-files.md              (git diff summary)
├── claim-audit.md                (delta vs Sprint A)
├── manual-qa.md                  (P11, human checklist)
├── sprint-end-questions.md       (P13, 7 Q&A)
└── api-responses/
    ├── local-build-info.json
    ├── local-data-status.json
    ├── local-health.json
    ├── prod-build-info-pre-env.json
    ├── prod-build-info-post-env.json
    ├── prod-data-status-pre-env.json
    ├── prod-data-status-post-env.json
    ├── prod-health-pre-env.json
    ├── prod-health-post-env.json
    ├── secret-leak-check.txt
    ├── secret-leak-check-post-env.txt
    ├── admin-crud-run.json
    ├── admin-crud-prod-sync.json
    ├── iyzico-create-local.json
    ├── iyzico-local-vs-prod.txt
    ├── odemeler-after-iyzico-local-test.json
    ├── data-status-misalignment-proof.json
    └── analytics-html-scan.txt
```

Admin credentials are stored **locally** at
`delivery/sprint-b/admin-credentials.md` and are gitignored — never
committed, never shipped in the ZIP.

---

## Verdict

Sprint B is **delivered as scoped**: verification and parity layer is in
place, runtime proofs are recorded, hidden misalignments are surfaced and
documented. Three known caveats are tracked for Sprint B+1 / B+2:

1. `/api/payment/create` 500 in production (suspected NEXT_PUBLIC_SITE_URL)
2. `src/data` vs Supabase fork (documented, not fixed)
3. MTV tarife snapshot accuracy (yaklaşık, needs GİB PDF audit)

See `sprint-end-questions.md` Q7 for the full caveat list.
