"use client";

import React from "react";
import Link from "next/link";
import { Mail, AlertTriangle } from "lucide-react";
// Sprint D P6 — public beta disclosure (shared hook with Header)
import { usePublicBeta } from "@/lib/hooks/usePublicBeta";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  // Sprint D P6 — disclosure block is visible when publicBetaMode=true
  const isBeta = usePublicBeta();

  const footerLinks = [
    { label: "Hakkımızda", href: "/hakkimizda" },
    { label: "Metodoloji", href: "/metodoloji" },
    { label: "SSS", href: "/sss" },
    { label: "İletişim", href: "/iletisim" },
    { label: "Gizlilik", href: "/gizlilik" },
    { label: "KVKK", href: "/kvkk" },
  ];

  return (
    <footer className="bg-blue-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-bold mb-3">Araç Karar Motoru</h3>
            <p className="text-blue-100 text-sm leading-relaxed">
              Araç satın alma kararlarınızı desteklemek için tasarlanmış akıllı danışman. MTV, otoyol, yakıt, muayene ve rota maliyetlerini hesaplayın.
            </p>
          </div>

          {/* Quick Links */}
          <nav aria-label="Alt sayfa bağlantıları">
            <h4 className="text-base font-semibold mb-4">Hızlı Bağlantılar</h4>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-blue-100 hover:text-orange-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact Info */}
          <div>
            <h4 className="text-base font-semibold mb-4">İletişim</h4>
            <div className="space-y-3">
              <a
                href="mailto:info@arackararmotoru.com"
                className="flex items-center gap-2 text-blue-100 hover:text-orange-400 transition-colors text-sm"
              >
                <Mail className="w-4 h-4" />
                info@arackararmotoru.com
              </a>
            </div>
          </div>
        </div>

        {/* Sprint D P6 — Public Beta disclosure block */}
        {isBeta && (
          <div className="mb-8 rounded-lg border border-orange-400/40 bg-orange-500/10 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 text-orange-300 mt-0.5" />
              <div className="text-sm leading-relaxed">
                <p className="font-semibold text-orange-200">
                  🧪 Public Beta
                </p>
                <p className="mt-1 text-blue-100/90">
                  Araç Karar Motoru şu anda public beta'da. Ödeme sistemi
                  sandbox modunda, gerçek tahsilat yapılmıyor. Bazı veriler
                  yaklaşık ya da bayat olabilir (runtime'da{' '}
                  <code className="font-mono text-xs text-orange-200">/api/data-status.dataFreshness</code>{' '}
                  ile görülür).
                </p>
                <p className="mt-2 text-xs text-blue-200/80">
                  Detay:{' '}
                  <a
                    href="https://github.com/BBBoring2025/arac-karar-motoru/blob/main/docs/public-beta-policy.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-300 hover:text-orange-200 underline"
                  >
                    Public Beta Policy
                  </a>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-blue-800 my-8"></div>

        {/* Data Freshness Notice */}
        <div className="text-center mb-6">
          <p className="text-blue-200 text-xs">
            Veriler periyodik olarak güncellenmektedir. Hesaplamalar resmi kurum tarifelerine dayanmaktadır.
          </p>
        </div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left text-sm text-blue-100">
            <p>
              &copy; {currentYear} Araç Karar Motoru. Tüm hakları saklıdır.
            </p>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300">
              <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
              Veriler periyodik olarak güncellenir
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
