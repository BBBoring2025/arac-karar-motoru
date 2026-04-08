# Sprint D — Baseline Precheck

**Date**: 2026-04-09
**Sprint C final commit**: `c34193a2fd00a83a9b81ff9728afe7ae6ed1b6df`
**Production deployment**: `dpl_4Go7mVr4dTV1X5R83N7LEPSoj66h`
**Production URL**: https://arac-karar-motoru.vercel.app
**Sprint D starts at**: this commit

---

## 6 Spec Pre-Check Questions (from Sprint D spec §0)

### Q1 — `/api/build-info` production'da 200 dönüyor mu?

✅ **YES**

```bash
$ curl -s -w "HTTP:%{http_code}\n" https://arac-karar-motoru.vercel.app/api/build-info
{
  "commit": "c34193a2fd00a83a9b81ff9728afe7ae6ed1b6df",
  "commitShort": "c34193a",
  "commitMessage": "docs(sprint-c): Sprint B caveat CLOSED in prod — final delivery docs",
  "branch": "main",
  "env": "production",
  "builtAt": "2026-04-08T20:13:39.476Z",
  "nextVersion": "16.2.2",
  "nodeVersion": "24.13.0",
  "deploymentId": "dpl_4Go7mVr4dTV1X5R83N7LEPSoj66h",
  "region": "iad1"
}
HTTP:200
```

Captured to `delivery/sprint-d/baseline/prod-build-info.json`.

### Q2 — `build-info.commit`, Sprint C son commit'i ile eşleşiyor mu?

✅ **YES — PARITY MATCH**

- Local `git rev-parse HEAD` → `c34193a2fd00a83a9b81ff9728afe7ae6ed1b6df`
- Production `/api/build-info.commit` → `c34193a2fd00a83a9b81ff9728afe7ae6ed1b6df`

### Q3 — `/api/health` production'da 200 dönüyor mu?

✅ **YES**

Captured to `delivery/sprint-d/baseline/prod-health.json`. Key fields:
- `status: "ok"`
- `paymentMode: "paymentSandbox"` (Sprint C P12 field)
- `services.supabase.reachable: true`
- `services.iyzico.mode: "sandbox"`
- `flags.paymentEnabled.enabled: true`
- `flags.analyticsEnabled.enabled: false` (reason: `unknown` — Sprint D P7 will fix this to `missing_env`)
- `flags.routeV3Enabled.enabled: true`
- `flags.pdfEnabled.enabled: true`
- `flags.adminWriteEnabled.enabled: true`

### Q4 — `health.paymentMode` gerçekten `paymentSandbox` mı?

✅ **YES**

Sprint C P12 eklendi, Sprint C caveat closure sonrasında production'da `paymentSandbox` döndürüyor.

### Q5 — `/odeme` sayfası hâlâ "Yükleniyor..." mu?

⚠️ **Kısmen**

Sprint C'de `/odeme`:
- `paymentState === null` → Loader spinner ("Yükleniyor...")
- `paymentMode === 'paymentSandbox'` → amber banner ile Sprint C 3-step checkout
- Loader durumu hala var ama çok kısa (fetch tamamlandıktan sonra state machine'e göre render).

**Sprint D'nin fix ettiği**: Default public kullanıcı (sandbox mode) `<EarlyAccessForm>` görecek, amber banner + 3-step ise sadece `?mode=sandbox` query ile admin/test kullanıcıya.

### Q6 — Metodoloji sayfasında MTV ve confidence dili runtime ile birebir uyumlu mu?

✅ **YES — %100 parity** (Phase 1 exploration'da audit edildi)

Tek gap: `src/data/araclar.ts.confidence === 'yüksek'` ama metodoloji tablosunda 'Tahmini' olarak listeleniyor. Bu bir **content drift**. Sprint D P12'de documented gap olarak kaydedilir, **Sprint E content fix** için bırakılır.

---

## Test Suite Baseline (3391 assertions)

```
8    callback-url.test.ts        (Sprint C P2)
9    state-machine.test.ts       (Sprint C P2, 9 getPaymentMode fixtures)
84   data-manifest.test.ts       (Sprint C P5, 8 entries × ~10-11 assertions)
34   route-engine.test.ts        (Sprint A/B)
16   edge-cases.test.ts          (Sprint A/B)
3240 graph-connectivity.test.ts  (Sprint A/B)
─────
3391 total PASS
```

All 6 suites captured in `delivery/sprint-d/baseline/test-suite-baseline.txt`.

---

## Production State Snapshot (Sprint C final)

| Field | Value |
|---|---|
| Production commit | `c34193a` |
| Production deployment ID | `dpl_4Go7mVr4dTV1X5R83N7LEPSoj66h` |
| Next version | `16.2.2` |
| Node version | `24.13.0` |
| Region | `iad1` |
| Build parity | ✅ MATCH |
| Payment caveat (Sprint B) | ✅ CLOSED in Sprint C |
| ADR-001 | Bound (src/data source of truth) |
| Admin UI | Sprint C P6 3-tab (dashboard / data-manifest / araclar) |
| Data manifest | 8 entries, no refreshCadence yet (Sprint D P8 adds) |
| publicBetaMode | Does not exist yet (Sprint D P1 adds) |
| Early access / waitlist | Does not exist (Sprint D P2-P5 adds) |
| Plausible / analytics | 0 provider scripts (Sprint D P7 adds) |

---

## Blockers

**None**.

Sprint C kapanışında herhangi bir blocker yok. Tüm Sprint A/B/C test assertion'ları (3391) geçiyor, production parity MATCH, deployment pipeline Vercel CLI üzerinden çalışıyor (Sprint C'de 4 manual deploy başarılı).

Sprint D başlatılabilir.

---

## Artifacts Captured

- `delivery/sprint-d/baseline/git-rev-parse-head.txt` — `c34193a...`
- `delivery/sprint-d/baseline/prod-health.json` — Sprint C health state
- `delivery/sprint-d/baseline/prod-build-info.json` — Sprint C deployment state
- `delivery/sprint-d/baseline/prod-data-status.json` — Sprint C data status
- `delivery/sprint-d/baseline/test-suite-baseline.txt` — 3391 assertion pass
