# Feature Flags — Merkezi Flag Sistemi

**Dosya**: `src/lib/flags.ts`
**Amaç**: Her runtime flag'ın tek doğruluk kaynağı. Kod, env, runtime provider — hepsi buradan görünür.

---

## 1. Neden Merkezi?

Sprint B öncesi flag mantığı **dağınıktı**:

- `src/lib/payment/config.ts::isPaymentEnabled()` — payment env check
- `src/lib/analytics/tracker.ts::isEnabled()` — browser + provider check
- `src/app/odeme/page.tsx` — runtime probe of `/api/payment/create`
- `adminWriteEnabled`, `routeV3Enabled`, `pdfEnabled` — **hiçbir yerde yoktu**

**Problem**: `/api/health` gibi bir endpoint yazarken hangi flag'lerin mevcut olduğunu bilmek için 3 farklı dosyayı grep etmek gerekiyordu.

**Çözüm**: Tek dosya = tüm flag'ler. Her flag 4 bilgiyle:
1. `enabled` — composite result
2. `reason` — neden enabled veya değil
3. `missingVars` — hangi env var eksik (sadece server-side)
4. Code comment — nasıl aktif edilir

---

## 2. Flag Listesi

| Flag | Tip | Kaynak | Enabled olma şartı |
|------|-----|--------|---------------------|
| `paymentEnabled` | env-based | `IYZICO_API_KEY` + `IYZICO_SECRET_KEY` | İkisi de set |
| `adminWriteEnabled` | env-based | `SUPABASE_SERVICE_ROLE_KEY` | Set |
| `analyticsEnabled` | client-side runtime | `window.gtag` OR `window.plausible` | Provider script yüklü |
| `routeV3Enabled` | always-on | — (no env gate) | Her zaman |
| `pdfEnabled` | always-on | — (jspdf bundled) | Her zaman |

---

## 3. API

### `getServerFlags(): Flags`

Server-side flag resolution. `process.env` okur.

```typescript
import { getServerFlags } from '@/lib/flags';

// API route içinde:
export async function GET() {
  const flags = getServerFlags();
  if (flags.paymentEnabled.enabled) {
    // ödeme aktif
  }
  return Response.json({ flags });
}
```

**Sadece server-side kullanım** (route handler, server component, server action). Client component'ten çağrılamaz.

### `getClientFlags(hints): Flags`

Client-safe flag resolution. `process.env` OKUMAZ.

```typescript
'use client';
import { getClientFlags } from '@/lib/flags';

const flags = getClientFlags({
  gtag: !!window.gtag,
  plausible: !!window.plausible,
});

if (flags.analyticsEnabled.enabled) {
  // analytics provider hazır
}
```

Client, payment/admin state için server'a fetch etmek zorunda (bkz. `/api/health`).

### `flagsToPublicJSON(flags): PublicFlags`

`missingVars` field'ını strip eder. Client'a sızdırılmasın.

```typescript
// /api/health içinde:
const serverFlags = getServerFlags();
return Response.json({
  flags: flagsToPublicJSON(serverFlags), // missingVars stripped
});
```

---

## 4. SSR vs Client Strategy

**Server modülleri** (`src/app/api/**/route.ts`, server components):
- Doğrudan `getServerFlags()` çağırır.
- `process.env` okumasına izin var.
- `flagsToPublicJSON()` ile serialize et, client'a sızmasın.

**Client componentleri** (`'use client'` içerenler):
- `getClientFlags()` sadece browser-only state için (analytics).
- Server-side state (payment, admin) için `/api/health` fetch et.
- Örnek pattern:

```typescript
'use client';
import { useEffect, useState } from 'react';

export function MyComponent() {
  const [flags, setFlags] = useState<PublicFlags | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(h => setFlags(h.flags))
      .catch(() => setFlags(null)); // graceful degradation
  }, []);

  if (!flags) return <Loading />;
  if (!flags.paymentEnabled.enabled) return <ComingSoon />;
  return <CheckoutFlow />;
}
```

**Neden bootstrap via layout.tsx DEĞİL?** Çünkü Sprint B'nin amacı **runtime verification**. Flag'lerin network tab'de görünmesi HTML'de gömülü olmasından daha değerli. Extra HTTP round-trip kabul edilir.

---

## 5. Migration Map (dağınık flag'ler → flags.ts)

| Önceki yer | Yeni yer | Değişiklik |
|-----------|----------|-----------|
| `src/lib/payment/config.ts::isPaymentEnabled()` | **KEEP** (primitive env check) | `flags.ts` bunu çağırır, duplicate etmez |
| `src/lib/payment/config.ts::getPaymentConfig()` | **KEEP** | Value returning, state machine tarafından kullanılır |
| `src/lib/analytics/tracker.ts::isEnabled()` | **REFACTORED** | İçeride `getClientFlags()` delegate eder, public API değişmez |
| `src/app/odeme/page.tsx` probe of `/api/payment/create` | **WILL MOVE (P3)** | `/api/health` fetch ile değiştirilecek, fallback olarak probe kalır |
| `adminWriteEnabled` | **NEW** (`src/lib/flags.ts`) | Daha önce yoktu |
| `routeV3Enabled` | **NEW** | Daha önce yoktu |
| `pdfEnabled` | **NEW** | Daha önce yoktu |

---

## 6. Gotchas

### Flag state lambda cold start'ta cache'lenir

Environment variable değişikliği redeploy gerektirir:
- Vercel'de env var ekle/değiştir → Deployments → latest → Redeploy
- Yeni lambda cold start'ta `getServerFlags()` yeni env'i okur
- Mevcut warm lambda'lar eski değeri kullanmaya devam edebilir

### `missingVars` asla client'a sızmaz

`flagsToPublicJSON()` her zaman kullanılmalı. Doğrudan `Response.json({ flags: getServerFlags() })` YANLIŞ — missing var listesi leak olur.

### Analytics server-side flag anlamsız

Server `window.gtag` göremez, bu yüzden `getServerFlags().analyticsEnabled.reason === 'unknown'`. Analytics durumunu bilmek için client-side `getClientFlags({gtag, plausible})` çağrısı şart.

### Dev mode override

`tracker.ts::isEnabled()` dev mode'da her zaman `true` döner (console.log için). Bu `flags.ts`'de değil, tracker.ts'de. Amaç: geliştirici local'de event'leri görsün.

---

## 7. Reason Kodları

| Reason | Anlam |
|--------|-------|
| `ok` | Tüm şartlar sağlandı, enabled: true |
| `missing_env` | Gerekli env var(lar) yok, enabled: false, `missingVars` set |
| `missing_provider` | Gerekli runtime provider yok (örn. window.gtag), enabled: false |
| `disabled_by_flag` | Manuel olarak disable edildi (şu an kullanılmıyor) |
| `unknown` | Server bu flag'in durumunu bilemez (client-side state) |

---

## 8. Security Notes

1. **`SUPABASE_SERVICE_ROLE_KEY` asla client'a gönderilmez**. `flagsToPublicJSON()` sadece `enabled: boolean` + `reason: string` gönderir.

2. **`missingVars` strip edilmiş olmalı**. Hangi env var'ın eksik olduğu bilgisi küçük bir metadata leak — `flagsToPublicJSON()` bunu engeller.

3. **Error handling**: Flag resolution asla throw etmez. Herhangi bir hata `{enabled: false, reason: 'unknown'}` olarak düşer.

---

## 9. Verification (Sprint B P4)

Local dev test:

```bash
# Tüm env var'lar set — beklenen: paymentEnabled=true, adminWriteEnabled=true
npm run dev
curl http://localhost:3000/api/health | jq .flags

# iyzico env var'lar unset — beklenen: paymentEnabled=false
mv .env.local .env.local.bak
# Sadece Supabase bırak
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=https://fyuxlmcugtdxuvjnzdtu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
EOF
npm run dev
curl http://localhost:3000/api/health | jq .flags.paymentEnabled
# → { "enabled": false, "reason": "missing_env" }

# Restore
mv .env.local.bak .env.local
```

---

## 10. Future Extensions

Sprint B+1 için potansiyel yeni flag'ler:

- `maintenanceMode` — tüm site maintenance'a alınır
- `b2bApiEnabled` — B2B API access (requires b2b_musteriler table seeded)
- `reportPdfPurchaseRequired` — premium PDF generation'a ödeme zorunlu mu
- `analyticsProvider: 'ga4' | 'plausible' | 'none'` — daha granüler provider switching

Bunlar Sprint B'de YAPILMIYOR — scope creep.
