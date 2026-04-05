"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Button,
  Card,
  CTABanner,
} from "@/components/ui";
import {
  DollarSign,
  Road,
  CheckCircle2,
  Fuel,
  Wrench,
  ArrowRight,
  ChevronDown,
  TrendingDown,
  BarChart3,
} from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

export default function Home() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const faqItems: FAQItem[] = [
    {
      question: "Veriler nereden geliyor?",
      answer:
        "MTV hesaplamaları GİB (Gelir İdaresi Başkanlığı) resmi tarifelerine, yakıt tüketimi verileri üretici WLTP test sonuçlarına, otoyol ve köprü ücretleri KGM (Karayolları Genel Müdürlüğü) resmi tarifelerine, yakıt fiyatları PETDER verilerine dayalıdır.",
    },
    {
      question: "Hesaplamalar ne kadar doğru?",
      answer:
        "MTV hesaplamaları GİB resmi tarifelerine dayandığı için yüksek kesinlik sunar. Yakıt, sigorta ve otoyol hesaplamaları tahmini olup gerçek kullanıma göre değişiklik gösterebilir. Her hesaplama kaleminde güven seviyesi (kesin/yüksek/tahmini) açıkça belirtilir.",
    },
    {
      question: "Hangi araçlar destekleniyor?",
      answer:
        "Türkiye pazarındaki 35+ markanın 160'tan fazla popüler modeli desteklenmektedir. TOGG'dan BMW'ye, Dacia'dan Porsche'a kadar geniş yelpaze. Aracınız listede yoksa iletişim formu aracılığıyla talep edebilirsiniz.",
    },
    {
      question: "Metodoloji nasıl çalışır?",
      answer:
        "Toplam Sahip Olma Maliyeti (TCO) metodolojisi, araç satın almanın sadece ön fiyatını değil, 5-10 yıllık kullanım döneminde yapılan tüm harcamaları hesaplar. Buna MTV, sigorta, bakım, yakıt, otoyol ve amortisman dâhil.",
    },
  ];

  const tools = [
    {
      icon: DollarSign,
      title: "MTV Hesaplama",
      description: "Araç motor vergisini resmi verilerle hesapla",
      href: "/araclar/mtv-hesaplama",
    },
    {
      icon: Road,
      title: "Otoyol Ücreti",
      description: "Uzun yolculuklara yönelik otoyol maliyeti hesapla",
      href: "/araclar/otoyol-hesaplama",
    },
    {
      icon: Fuel,
      title: "Yakıt Hesaplama",
      description: "Aylık ve yıllık yakıt harcamalarını tahmin et",
      href: "/araclar/yakit-hesaplama",
    },
    {
      icon: Wrench,
      title: "Muayene Ücreti",
      description: "Periyodik muayene ve bakım ücretlerini öğren",
      href: "/araclar/muayene-ucreti",
    },
    {
      icon: BarChart3,
      title: "Rota Maliyeti",
      description: "81 il, 970+ ilçe arası yakıt ve geçiş ücreti hesapla",
      href: "/araclar/rota-maliyet",
    },
  ];

  const valueProps = [
    {
      icon: TrendingDown,
      title: "Gerçek Maliyeti Gör",
      description:
        "MTV, sigorta, bakım, yakıt, amortisman ve otoyol ücretlerini tek ekranda görüntüle. Gizli maliyetleri ortaya çıkar.",
    },
    {
      icon: BarChart3,
      title: "Akıllı Karşılaştır",
      description:
        "Farklı araçları yan yana Toplam Sahip Olma Maliyeti (TCO) bazında kıyasla. En uygun aracı bul.",
    },
    {
      icon: CheckCircle2,
      title: "Doğru Karar Ver",
      description:
        "Al / Kirala / Bekle tavsiyesi ve detaylı karar özeti ile güvenle harekete geç.",
    },
  ];

  const pricingPlans = [
    {
      name: "Tekli Araç",
      price: 99,
      description: "Tek bir aracın detaylı analizi",
      features: [
        "Detaylı TCO analizi",
        "5 yıllık maliyet projeksiyon",
        "Karar özeti",
        "PDF rapor indir",
      ],
    },
    {
      name: "Karşılaştırma",
      price: 149,
      description: "3 araçla detaylı karşılaştırma",
      features: [
        "3 aracın yan yana analizi",
        "Kategori bazlı karşılaştırma",
        "Fark analizi",
        "Karar tavsiyesi",
        "PDF rapor indir",
      ],
      highlighted: true,
    },
    {
      name: "Ticari",
      price: 249,
      description: "Kurumsal kullanım (yakında)",
      features: [
        "Toplu araç analizi",
        "Kurumsal raporlama",
        "Teknik destek",
      ],
    },
  ];

  const steps = [
    {
      number: "1",
      title: "Aracını Seç",
      description: "Analiz etmek istediğin aracının markasını, modelini ve yılını gir",
    },
    {
      number: "2",
      title: "Bilgilerini Gir",
      description: "Kilometre, yakıt türü, kredi/nakit durumu ve diğer detayları belirt",
    },
    {
      number: "3",
      title: "Raporunu Al",
      description:
        "Detaylı TCO analizi, karar tavsiyesi ve PDF raporunu indir",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-28 px-4 sm:px-6 lg:px-8">
        {/* Background gradient and decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100/30 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-100/20 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block mb-4 px-4 py-2 bg-orange-100 rounded-full">
              <p className="text-orange-700 text-sm font-semibold">
                160+ Araç Modeli | 35+ Marka | Resmi Veri Kaynakları
              </p>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              İlan fiyatını değil,{" "}
              <span className="text-orange-500">cebinden çıkacak gerçek parayı gör</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
              Yanlış araç seçip 100 bin TL kayba uğrama. Araç Karar Motoru ile toplam
              sahip olma maliyetini hesapla.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/rapor">
                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                  <span>Ücretsiz Hesapla</span>
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/rapor">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Örnek Raporu Gör
                </Button>
              </Link>
            </div>

            {/* Trust signals */}
            <div className="flex flex-col md:flex-row gap-8 justify-center items-center text-center md:text-left py-6 border-t border-b border-gray-200">
              <div>
                <p className="text-3xl font-bold text-gray-900">160+</p>
                <p className="text-gray-600 text-sm">Araç Modeli</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">35+</p>
                <p className="text-gray-600 text-sm">Marka</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">Resmi</p>
                <p className="text-gray-600 text-sm">Veri Kaynakları</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition Cards */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">
            Neden Araç Karar Motoru?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {valueProps.map((prop, idx) => {
              const Icon = prop.icon;
              return (
                <Card key={idx} variant="default" className="p-8 hover:shadow-lg">
                  <div className="flex items-center justify-center w-16 h-16 bg-orange-100 rounded-lg mb-6">
                    <Icon className="w-8 h-8 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {prop.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{prop.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Free Tools Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Ücretsiz Araçlar
            </h2>
            <p className="text-xl text-gray-600">
              Hemen kullanmaya başla. Herhangi bir ödeme gerekmez.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {tools.map((tool, idx) => {
              const Icon = tool.icon;
              return (
                <Link key={idx} href={tool.href}>
                  <Card
                    variant="default"
                    className="h-full p-6 hover:shadow-lg cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                      <Icon className="w-6 h-6 text-blue-900" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {tool.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {tool.description}
                    </p>
                    <div className="flex items-center text-orange-500 font-semibold text-sm">
                      <span>Hesapla</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Premium Preview Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-4">
            Karar Raporu Önizlemesi
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12">
            Tam raporun ne gibi detaylar içerdiğini gör
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Report Preview */}
            <div className="lg:col-span-2">
              <Card variant="default" className="p-8 md:p-12 relative overflow-hidden">
                {/* Blurred overlay sections */}
                <div className="space-y-8">
                  {/* Visible: Araç Başlığı */}
                  <div>
                    <p className="text-gray-500 text-sm font-semibold uppercase mb-2">
                      Analiz Edilen Araç
                    </p>
                    <h3 className="text-3xl font-bold text-gray-900">
                      2024 Toyota Corolla 1.6 Benzin
                    </h3>
                    <p className="text-gray-600 mt-2">Otomatik Vites | 35.000 TL Deposit</p>
                  </div>

                  {/* Visible: Toplam Maliyet */}
                  <div className="py-6 border-y border-gray-200">
                    <p className="text-gray-500 text-sm font-semibold uppercase mb-2">
                      5 Yıllık Toplam Maliyet
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-gray-900">
                        ₺745.200
                      </span>
                      <span className="text-gray-600">/5 yıl</span>
                    </div>
                    <p className="text-gray-600 text-sm mt-2">
                      Aylık ≈ ₺12.420
                    </p>
                  </div>

                  {/* Blurred: Kırılım */}
                  <div className="space-y-4 opacity-40 blur-sm pointer-events-none">
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  </div>

                  {/* Blurred: Alternatifler */}
                  <div className="space-y-4 opacity-40 blur-sm pointer-events-none">
                    <div className="h-6 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-300 rounded w-4/6"></div>
                  </div>

                  {/* Blurred: Karar Özeti */}
                  <div className="bg-blue-100/50 p-4 rounded-lg opacity-40 blur-sm pointer-events-none">
                    <div className="h-4 bg-blue-300 rounded w-3/4"></div>
                    <div className="h-4 bg-blue-300 rounded w-2/3 mt-2"></div>
                  </div>
                </div>

                {/* Lock Badge */}
                <div className="absolute top-4 right-4">
                  <div className="flex items-center gap-1 text-gray-600 text-sm bg-white px-3 py-1.5 rounded-lg border border-gray-200">
                    <Lock className="w-4 h-4" />
                    <span>Kilitli</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Pricing Plans */}
            <div className="space-y-6">
              <Card
                variant="premium"
                className="p-6 text-center border-2 border-orange-500"
              >
                <div className="inline-block px-3 py-1 bg-orange-500/20 rounded-full mb-3">
                  <p className="text-orange-300 text-xs font-bold">EN POPÜLER</p>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Karşılaştırma
                </h3>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-white">₺149</span>
                </div>
                <p className="text-orange-100 text-sm mb-6">
                  3 araçla detaylı karşılaştırma
                </p>
                <div className="w-full mb-6 py-3 bg-gray-600 text-gray-300 font-semibold rounded-lg text-center text-sm">
                  Yakında Aktif Olacak
                </div>
                <ul className="space-y-3 text-left text-sm">
                  {["3 aracın yan yana analizi", "Kategori bazlı karşılaştırma", "Fark analizi", "Karar tavsiyesi", "PDF rapor indir"].map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-orange-300 mt-0.5 flex-shrink-0" />
                      <span className="text-white">{feature}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Other pricing options */}
              <div className="space-y-3">
                {pricingPlans.filter((_, i) => i !== 1).map((plan, idx) => (
                  <Card key={idx} variant="default" className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-gray-900">{plan.name}</h4>
                      <span className="text-xl font-bold text-orange-500">
                        ₺{plan.price}
                      </span>
                    </div>
                    <p className="text-gray-600 text-xs">{plan.description}</p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">
            Nasıl Çalışır?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
            {steps.map((step, idx) => (
              <div key={idx} className="relative">
                {/* Step card */}
                <Card variant="default" className="p-8 h-full">
                  <div className="flex items-center justify-center w-14 h-14 bg-orange-500 text-white rounded-full font-bold text-xl mb-6">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </Card>

                {/* Connector arrow */}
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 text-gray-300" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/rapor">
              <Button variant="primary" size="lg">
                Şimdi Başla
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-4">
            Sıkça Sorulan Sorular
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12">
            Hemen cevabını bul veya bize ulaş
          </p>

          <div className="space-y-4">
            {faqItems.map((item, idx) => (
              <Card key={idx} variant="default" className="overflow-hidden">
                <button
                  onClick={() =>
                    setExpandedFaq(expandedFaq === idx ? null : idx)
                  }
                  className="w-full p-6 flex items-start justify-between hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-gray-900 text-left">
                    {item.question}
                  </h3>
                  <ChevronDown
                    className={`w-6 h-6 text-gray-600 flex-shrink-0 transition-transform ${
                      expandedFaq === idx ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {expandedFaq === idx && (
                  <div className="px-6 pb-6 border-t border-gray-200">
                    <p className="text-gray-600 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">Sorunu çözülemediyse?</p>
            <Link href="/iletisim">
              <Button variant="outline">İletişim Formu</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <CTABanner
            title="İlk adımı at. Aracının gerçek maliyetini öğren."
            description="Birkaç dakikada detaylı analiz raporunu al ve doğru kararı ver. Ücretsiz araçlarla hemen başla."
            buttonText="Ücretsiz Hesapla"
          />
        </div>
      </section>
    </div>
  );
}

// Lock Icon Component (since it might not be in lucide-react)
function Lock({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm6-10V7a3 3 0 00-3 3v1h6V7a3 3 0 00-3-3z"
      />
    </svg>
  );
}
