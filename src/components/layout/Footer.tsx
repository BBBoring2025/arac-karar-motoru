import React from "react";
import Link from "next/link";
import { Mail } from "lucide-react";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

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
          <div>
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
          </div>

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
