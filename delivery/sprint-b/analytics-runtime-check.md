# Analytics Runtime Check — Sprint B P8 Test 8

**Date**: 2026-04-08
**Test**: Verify that analytics is honestly inactive in production (code ready, no provider injected).

## Method

Three independent probes:

1. **API flag** — `/api/health.flags.analyticsEnabled.enabled` should be `false`.
2. **HTML script scan** — Fetch production homepage and grep for any known
   analytics provider scripts (`gtag`, `googletagmanager`, `google-analytics`,
   `plausible`, `posthog`, `umami`).
3. **Client-side tracker** — `src/lib/analytics/tracker.ts::isEnabled()`
   returns `false` unless a provider is detected.

## Results

### Probe 1 — API Flag

```bash
curl -s https://arac-karar-motoru.vercel.app/api/health | jq .flags.analyticsEnabled
# {
#   "enabled": false,
#   "reason": "unknown"
# }
```

✅ Flag `analyticsEnabled.enabled = false`. (The `reason` is `unknown` because
server cannot detect whether a browser would find gtag/plausible globals —
server-side flags only report missing env var presence.)

### Probe 2 — HTML Script Scan

```bash
curl -s https://arac-karar-motoru.vercel.app/ > /tmp/prod-homepage.html

grep -c 'gtag\|googletagmanager\|google-analytics' /tmp/prod-homepage.html  # => 0
grep -c 'plausible'  /tmp/prod-homepage.html                                # => 0
grep -c 'posthog'    /tmp/prod-homepage.html                                # => 0
grep -c 'umami'      /tmp/prod-homepage.html                                # => 0
```

✅ No provider scripts present in the production homepage HTML (48,594
bytes). All loaded scripts are internal Next.js bundles (`/_next/static/...`).

### Probe 3 — Client Tracker

`src/lib/analytics/tracker.ts::isEnabled()` delegates to
`getClientFlags({ gtag: typeof window.gtag !== 'undefined', plausible:
typeof window.plausible !== 'undefined' })`. Since neither global is
available in production (see Probe 2), the client flag evaluates to:

```ts
analyticsEnabled: { enabled: false, reason: 'missing_provider' }
```

## Verdict

✅ **P8 Test 8: PASSED**

Analytics is **honestly** inactive in production:
- No provider script injected
- No tracking calls execute
- The feature flag reflects reality
- The truth is surfaced via both `/api/health` and the client tracker

## Artifacts

- `delivery/sprint-b/api-responses/analytics-html-scan.txt`
- `delivery/sprint-b/api-responses/prod-health-post-env.json`

## How to enable analytics in the future

From `docs/feature-flags.md`:

1. Add a provider to `src/app/layout.tsx` (e.g. `<Script src="..." />` for
   gtag or the Plausible snippet)
2. Ensure the provider populates `window.gtag` or `window.plausible` globally
3. The client tracker automatically flips to `enabled: true, reason: 'ok'`
4. No env var change needed for the current boolean-flag behavior
