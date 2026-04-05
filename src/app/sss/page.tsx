import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sıkça Sorulan Sorular",
  description:
    "Araç Karar Motoru hakkında sıkça sorulan sorular. TCO nedir, hangi veriler kullanılır, hesaplamalar ne kadar doğrudur?",
  alternates: { canonical: "/sss" },
};

const faqs = [
  {
    q: "TCO (Toplam Sahip Olma Maliyeti) nedir?",
    a: 'TCO, bir aracı belirli bir süre boyunca sahip olmanın toplam maliyetidir. Satın alma bedeli, MTV, yakıt, sigorta, bakım, muayene, amortisman ve noter masraflarını kapsar. Sadece fiyat etiketine değil, "gerçek maliyete" bakmayı sağlar.',
  },
  {
    q: "Hangi veri kaynakları kullanılıyor?",
    a: "GİB (Gelir İdaresi Başkanlığı) MTV tarifeleri, TÜVTÜRK muayene ücretleri, KGM otoyol ve köprü tarifeleri, PETDER akaryakıt fiyatları ve OYDER amortisman verileri kullanılmaktadır. Tüm veriler resmi ve sektörel kaynaklardandır.",
  },
  {
    q: "Hesaplamalar ne kadar doğru?",
    a: 'Her hesaplama kaleminde güven seviyesini belirtiriz. Resmi tarifelere dayanan kalemler (MTV, muayene, otoyol) "kesin" olarak işaretlenir. Sigorta ve bakım gibi piyasa ortalamalarına dayanan kalemler "tahmini" olarak gösterilir.',
  },
  {
    q: "Elektrikli araçlar destekleniyor mu?",
    a: "Evet. Elektrikli araçlar için MTV muafiyeti, düşük bakım maliyeti çarpanı (%40), şarj maliyeti hesaplaması ve amortisman farkları otomatik uygulanır.",
  },
  {
    q: "Veriler ne sıklıkla güncelleniyor?",
    a: "Tarife verileri resmi kurumlarca yayımlandığında güncellenmektedir. Akaryakıt fiyatları aylık olarak PETDER verilerine göre güncellenir.",
  },
  {
    q: "Rapor ücretli mi?",
    a: "Ücretsiz hesaplama araçlarımız herkes tarafından kullanılabilir. Detaylı TCO raporu ve karşılaştırma analizleri için ödeme planlarımızı inceleyebilirsiniz.",
  },
  {
    q: "Hibrit ve LPG araçlar nasıl hesaplanıyor?",
    a: "Hibrit araçlar için MTV'de %50 indirim, bakım maliyetinde düşük çarpan uygulanır. LPG'li araçlar için LPG yakıt fiyatı ve tüketim değerleri ayrı olarak hesaplanır. Her yakıt türünün kendine özgü parametreleri sisteme tanımlıdır.",
  },
  {
    q: "İkinci el araç analizi yapılabiliyor mu?",
    a: "Evet. Araç yaşını ve kilometre bilgisini girerek ikinci el araçların kalan ömür maliyetini hesaplayabilirsiniz. İkinci el araçlarda noter masrafı da otomatik eklenir.",
  },
  {
    q: "Kaç araç modeli destekleniyor?",
    a: "Veritabanımızda 35+ markanın 160'tan fazla modeli bulunmaktadır. TOGG'dan BMW'ye, Dacia'dan Porsche'a kadar Türkiye pazarındaki tüm popüler araçlar kapsanmaktadır.",
  },
  {
    q: "Kredi ile alırsam maliyet nasıl değişir?",
    a: "Kredi faiz oranı, vade ve peşinat miktarını girerek toplam faiz maliyetini görebilirsiniz. Sistem, peşin alım ile kredi alımını karşılaştırarak farkı net olarak ortaya koyar.",
  },
  {
    q: "Rota maliyet hesaplama nasıl çalışır?",
    a: "Sistem, 81 il ve 970+ ilçe merkezi arasında karayolu koridor grafı üzerinden en uygun güzergahı bulur. Yakıt tüketimi ve köprü/tünel/otoyol geçiş ücretlerini ayrı ayrı hesaplayarak toplam rota maliyetini çıkarır. Köprü ve tünel ücretleri KGM resmi 2026 tarifelerine dayanır.",
  },
  {
    q: "Hangi köprü ve tünel ücretleri dahil?",
    a: "Osmangazi Köprüsü, 1915 Çanakkale Köprüsü, 15 Temmuz Şehitler Köprüsü, Fatih Sultan Mehmet Köprüsü, Yavuz Sultan Selim Köprüsü ve Avrasya Tüneli 2026 resmi tarifeleriyle dahildir. Ayrıca O-1'den O-7'ye kadar tüm otoyol koridorları tahmini ücretlerle desteklenmektedir.",
  },
];

export default function SSSPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Sıkça Sorulan Sorular
        </h1>
        <p className="text-gray-600 mb-12">
          Araç Karar Motoru hakkında merak edilenler.
        </p>

        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {faq.q}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
