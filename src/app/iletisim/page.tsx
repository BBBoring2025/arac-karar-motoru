import React from "react";
import type { Metadata } from "next";
import { Mail, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "İletişim",
  description:
    "Araç Karar Motoru ile iletişime geçin. Sorularınız, önerileriniz ve iş birliği talepleriniz için bize ulaşın.",
  alternates: { canonical: "/iletisim" },
};

export default function IletisimPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">İletişim</h1>
        <p className="text-gray-600 mb-12">
          Sorularınız, önerileriniz veya iş birliği talepleriniz için bize
          ulaşabilirsiniz.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
            <Mail className="w-8 h-8 text-orange-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">E-posta</h3>
            <a
              href="mailto:info@arackararmotoru.com"
              className="text-blue-600 hover:underline text-sm"
            >
              info@arackararmotoru.com
            </a>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
            <MapPin className="w-8 h-8 text-orange-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Konum</h3>
            <p className="text-gray-600 text-sm">İstanbul, Türkiye</p>
          </div>
        </div>

        <div className="bg-blue-900 text-white rounded-xl p-8 text-center">
          <h2 className="text-xl font-bold mb-2">B2B ve Kurumsal Çözümler</h2>
          <p className="text-blue-100 text-sm mb-4">
            Galeri, sigorta şirketi veya filo yönetimi çözümü arıyorsanız
            kurumsal paketlerimiz hakkında bilgi alabilirsiniz.
          </p>
          <a
            href="mailto:info@arackararmotoru.com?subject=B2B%20Bilgi%20Talebi"
            className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
          >
            Bize Yazın
          </a>
        </div>
      </div>
    </div>
  );
}
