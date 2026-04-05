import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni",
  description:
    "Araç Karar Motoru KVKK aydınlatma metni. 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında haklarınız.",
  alternates: { canonical: "/kvkk" },
};

export default function KVKKPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          KVKK Aydınlatma Metni
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında
          <br />
          Son güncelleme: 5 Nisan 2026
        </p>

        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              1. Veri Sorumlusu
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Araç Karar Motoru olarak, 6698 sayılı Kişisel Verilerin Korunması
              Kanunu (&quot;KVKK&quot;) uyarınca, kişisel verileriniz aşağıda
              açıklanan amaçlarla işlenmektedir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              2. İşlenen Kişisel Veriler
            </h2>
            <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
              <li>Kimlik bilgileri (ad, soyad)</li>
              <li>İletişim bilgileri (e-posta, telefon)</li>
              <li>İşlem güvenliği (IP adresi, oturum bilgileri)</li>
              <li>
                Araç tercihleri (marka, model, yakıt türü — anonim olarak)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              3. Veri İşleme Amaçları
            </h2>
            <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
              <li>Hizmetlerin sunulması ve rapor oluşturulması</li>
              <li>Ödeme işlemlerinin gerçekleştirilmesi</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi</li>
              <li>Hizmet kalitesinin iyileştirilmesi</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              4. Veri Aktarımı
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Kişisel verileriniz, altyapı sağlayıcıları (Supabase, Vercel) ile
              yalnızca hizmet sunumu amacıyla paylaşılmaktadır. Ödeme altyapısı
              entegre edildiğinde ilgili ödeme hizmet sağlayıcısı ile de
              paylaşılacaktır. Pazarlama amacıyla üçüncü taraflarla paylaşılmaz.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              5. Haklarınız
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-3">
              KVKK&apos;nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:
            </p>
            <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
              <li>İşlenmişse buna ilişkin bilgi talep etme</li>
              <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
              <li>Düzeltilmesini veya silinmesini isteme</li>
              <li>İşlemenin kısıtlanmasını talep etme</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              6. Başvuru
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              KVKK kapsamındaki taleplerinizi{" "}
              <a
                href="mailto:info@arackararmotoru.com"
                className="text-blue-600 hover:underline"
              >
                info@arackararmotoru.com
              </a>{" "}
              adresine iletebilirsiniz.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
