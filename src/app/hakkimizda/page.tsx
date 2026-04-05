import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Target, Shield, Database } from "lucide-react";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description:
    "Araç Karar Motoru hakkında bilgi edinin. Misyonumuz, vizyonumuz ve araç sahipliği maliyetlerini şeffaflaştırma hedefimiz.",
  alternates: { canonical: "/hakkimizda" },
};

export default function HakkimizdaPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Hakkımızda</h1>

        <p className="text-lg text-gray-600 mb-12 leading-relaxed">
          Araç Karar Motoru, Türkiye&apos;deki araç sahipliği maliyetlerini
          şeffaf, güvenilir ve anlaşılır hale getirmek amacıyla kurulmuştur.
          Resmi kurum verilerini kullanarak karar sürecinizi destekliyoruz.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <Target className="w-10 h-10 text-orange-500 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Misyonumuz
            </h3>
            <p className="text-gray-600 text-sm">
              Araç alım kararlarında tüketiciye doğru, güncel ve kapsamlı
              maliyet bilgisi sunmak. Tek bir kalemle değil, toplam sahip olma
              maliyetiyle düşünmek.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <Database className="w-10 h-10 text-blue-600 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Veri Kaynakları
            </h3>
            <p className="text-gray-600 text-sm">
              GİB, TÜVTÜRK, KGM, PETDER ve OYDER gibi resmi ve sektörel
              kaynaklardan beslenen güncel tarife verileri kullanıyoruz.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <Shield className="w-10 h-10 text-green-600 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Güvenilirlik
            </h3>
            <p className="text-gray-600 text-sm">
              Her hesaplama kaleminde &quot;kesin&quot; veya &quot;tahmini&quot;
              güven seviyesini belirtiriz. Şeffaflık temel ilkemizdir.
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/metodoloji"
            className="inline-flex items-center gap-2 bg-blue-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-950 transition-colors"
          >
            Metodolojimizi İnceleyin
          </Link>
        </div>
      </div>
    </div>
  );
}
