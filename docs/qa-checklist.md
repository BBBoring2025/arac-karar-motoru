# QA Checklist — Arac Karar Motoru

## Sayfa Erisim Testi

- [ ] / (ana sayfa) — 200
- [ ] /araclar/mtv-hesaplama — 200
- [ ] /araclar/yakit-hesaplama — 200
- [ ] /araclar/otoyol-hesaplama — 200
- [ ] /araclar/muayene-ucreti — 200
- [ ] /araclar/rota-maliyet — 200
- [ ] /rapor — 200
- [ ] /metodoloji — 200
- [ ] /sss — 200
- [ ] /iletisim — 200
- [ ] /hakkimizda — 200
- [ ] /gizlilik — 200
- [ ] /kvkk — 200
- [ ] /odeme — 200
- [ ] /sitemap.xml — 200
- [ ] /robots.txt — 200

## Veri Dogrulama

- [ ] Osmangazi Koprusu 1. sinif: 995 TL
- [ ] Avrasya Tuneli 1. sinif: 280 TL
- [ ] 15 Temmuz Koprusu 1. sinif: 59 TL
- [ ] YSS Koprusu 1. sinif: 95 TL
- [ ] 1915 Canakkale 1. sinif: 995 TL
- [ ] Elektrikli arac MTV: 0 TL

## Rota Motoru

- [ ] Istanbul -> Bursa: Osmangazi dahil
- [ ] Ankara -> Konya: ~260 km
- [ ] Hakkari -> Edirne: ~1500-2200 km
- [ ] Ayni ilce secimi: ~0 km
- [ ] Ucretli yol kapali: Alternatif rota bulunur

## Durustluk Kontrolleri

- [ ] "para iade" ifadesi YOK
- [ ] "123 45 67" telefon YOK
- [ ] "iyzico guvencesi" ifadesi YOK
- [ ] Sahte premium icerik (blur) YOK
- [ ] Her veri dosyasinda sourceLabel VAR
- [ ] Her veri dosyasinda effectiveDate VAR

## SEO

- [ ] Her sayfada title var
- [ ] Her sayfada meta description var
- [ ] Sitemap tum sayfalari iceriyor
- [ ] Robots.txt admin/api gizliyor
- [ ] JSON-LD structured data var

## Guvenlik

- [ ] /admin rotasi auth korumali
- [ ] /api/admin rotalari auth korumali
- [ ] .env dosyalari gitignore'da
