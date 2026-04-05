import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gizlilik Politikası",
  description:
    "Araç Karar Motoru gizlilik politikası. Kişisel verilerinizin nasıl toplandığı, işlendiği ve korunduğu hakkında bilgi.",
  alternates: { canonical: "/gizlilik" },
};

export default function GizlilikPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Gizlilik Politikası
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          Son güncelleme: 5 Nisan 2026
        </p>

        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              1. Toplanan Veriler
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Araç Karar Motoru, hesaplama araçlarını kullanırken girdiğiniz
              araç bilgilerini (marka, model, yakıt türü, motor hacmi, yıl)
              işler. Bu veriler hesaplama amacıyla kullanılır ve anonim olarak
              saklanır. Rapor satın alımlarında ad, soyad, e-posta ve telefon
              bilgileri toplanır.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              2. Verilerin Kullanımı
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Toplanan veriler yalnızca hizmet sunumu, rapor oluşturma ve
              kullanıcı deneyimini iyileştirme amacıyla kullanılır. Verileriniz
              üçüncü taraflarla pazarlama amacıyla paylaşılmaz.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              3. Çerezler
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Sitemiz oturum yönetimi ve kullanıcı tercihlerini hatırlamak için
              teknik çerezler kullanır. Analitik çerezler yalnızca onayınız ile
              etkinleştirilir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              4. Veri Güvenliği
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Tüm veriler SSL/TLS şifrelemesi ile korunur. Ödeme altyapısı
              hazırlanmakta olup entegre edildiğinde güvenli ödeme hizmeti
              sağlanacaktır. Supabase altyapısı ile Row Level Security (RLS)
              uygulanmaktadır.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              5. İletişim
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Gizlilik politikamızla ilgili sorularınız için{" "}
              <a
                href="mailto:info@arackararmotoru.com"
                className="text-blue-600 hover:underline"
              >
                info@arackararmotoru.com
              </a>{" "}
              adresine yazabilirsiniz.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
