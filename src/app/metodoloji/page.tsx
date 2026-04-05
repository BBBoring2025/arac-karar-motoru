import React from 'react';
import {
  CheckCircle,
  AlertCircle,
  Zap,
  TrendingUp,
  Database,
  Shield,
} from 'lucide-react';

interface DataSource {
  component: string;
  source: string;
  reliability: 'Kesin' | 'Tahmini' | 'Ortalama';
  lastUpdate: string;
  url?: string;
}

export default function MetodolojPage() {
  const dataSources: DataSource[] = [
    {
      component: 'MTV (Motorlu Taşıt Vergisi)',
      source: 'GİB (Gelir İdaresi Başkanlığı)',
      reliability: 'Kesin',
      lastUpdate: 'Nisan 2026',
      url: 'https://www.gib.gov.tr',
    },
    {
      component: 'Muayene Ücretleri',
      source: 'TÜVTÜRK Resmi Tarifesi',
      reliability: 'Kesin',
      lastUpdate: 'Nisan 2026',
      url: 'https://www.tuvturk.com.tr',
    },
    {
      component: 'Otoyol Ücretleri',
      source: 'KGM (Karayolları Genel Müdürlüğü)',
      reliability: 'Kesin',
      lastUpdate: 'Nisan 2026',
      url: 'https://www.kgm.gov.tr',
    },
    {
      component: 'Sigorta Fiyatları',
      source: 'Sigorta Şirketi Verileri (Ağırlıklı Ortalama)',
      reliability: 'Tahmini',
      lastUpdate: 'Nisan 2026',
      url: 'https://www.sigortam.net',
    },
    {
      component: 'Bakım Maliyetleri',
      source: 'OYDER Sektör Benchmark Verileri',
      reliability: 'Tahmini',
      lastUpdate: 'Mart 2026',
    },
    {
      component: 'Yakıt Fiyatları',
      source: 'PETDER / Güncel Pazar Verileri',
      reliability: 'Ortalama',
      lastUpdate: 'Periyodik Güncelleme',
      url: 'https://www.petder.org.tr',
    },
    {
      component: 'Amortisman (Değer Kaybı)',
      source: 'İkinci El Araç Pazar Analizi',
      reliability: 'Tahmini',
      lastUpdate: 'Aylık Güncelleme',
    },
    {
      component: 'Rota Hesaplama',
      source: 'KGM Tarifeleri + İl/İlçe Koridor Grafı',
      reliability: 'Kesin',
      lastUpdate: 'Nisan 2026',
      url: 'https://www.kgm.gov.tr',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1B2A4A] to-[#0F1722]">
      {/* Header */}
      <div className="bg-[#1B2A4A] border-b border-orange-500/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Metodoloji
          </h1>
          <p className="text-gray-400 text-lg">
            Hesaplamalarımızın nasıl yapıldığını öğrenin
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <div className="bg-[#1B2A4A]/50 border border-orange-500/20 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="w-6 h-6 text-orange-500" />
            Araç Karar Motoru Nedir?
          </h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Araç Karar Motoru, bir araç satın almanın toplam maliyetini (TCO - Total Cost of Ownership)
            hesaplayarak size bilinçli bir karar vermenize yardımcı olan platform. Sadece satın alma
            fiyatı değil, yakıt, sigorta, bakım, vergi ve daha birçok faktörü dikkate alır.
          </p>
          <p className="text-gray-300 leading-relaxed">
            Raporlarımız, resmi kaynaklar ve pazar verilerine dayanarak Türkiye için özel olarak
            tasarlanmış hesaplama algoritmaları kullanır.
          </p>
        </div>

        {/* Data Sources */}
        <div className="bg-[#1B2A4A]/50 border border-orange-500/20 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Database className="w-6 h-6 text-orange-500" />
            Veri Kaynakları
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-4 px-4 text-white font-semibold">Bileşen</th>
                  <th className="text-left py-4 px-4 text-white font-semibold">Kaynak</th>
                  <th className="text-center py-4 px-4 text-white font-semibold">Güvenilirlik</th>
                  <th className="text-center py-4 px-4 text-white font-semibold">Son Güncelleme</th>
                </tr>
              </thead>
              <tbody>
                {dataSources.map((source, idx) => (
                  <tr key={idx} className="border-b border-gray-800 hover:bg-gray-800/30">
                    <td className="py-4 px-4 text-gray-300 font-medium">
                      {source.component}
                    </td>
                    <td className="py-4 px-4 text-gray-400">
                      {source.url ? (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-orange-400 hover:text-orange-300 underline"
                        >
                          {source.source}
                        </a>
                      ) : (
                        source.source
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {source.reliability === 'Kesin' && (
                        <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-semibold flex items-center justify-center gap-1 mx-auto w-fit">
                          <CheckCircle className="w-3 h-3" />
                          {source.reliability}
                        </span>
                      )}
                      {source.reliability === 'Tahmini' && (
                        <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs font-semibold flex items-center justify-center gap-1 mx-auto w-fit">
                          <AlertCircle className="w-3 h-3" />
                          {source.reliability}
                        </span>
                      )}
                      {source.reliability === 'Ortalama' && (
                        <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-semibold flex items-center justify-center gap-1 mx-auto w-fit">
                          <TrendingUp className="w-3 h-3" />
                          {source.reliability}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center text-gray-400 text-xs">
                      {source.lastUpdate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Calculation Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* MTV Calculation */}
          <div className="bg-[#1B2A4A]/50 border border-orange-500/20 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">MTV Hesabı</h3>
            <p className="text-gray-400 text-sm mb-4">
              Motor hacmı ve araç yaşına göre GİB tarifelerini kullanarak aylık MTV tutarı hesaplanır.
            </p>
            <div className="bg-gray-800/50 rounded p-4 space-y-2 text-xs text-gray-300 font-mono">
              <p><span className="text-orange-400">Motor Hacmi:</span> 0-1300cc, 1301-1600cc, 1601-1800cc, 1801-2000cc, 2001-2500cc, 2501-3000cc, 3001-3500cc, 3501-4000cc, 4001cc+</p>
              <p><span className="text-orange-400">Yaş Grubu:</span> 1-3 yıl, 4-6 yıl, 7-11 yıl, 12-15 yıl, 16+ yıl</p>
              <p><span className="text-orange-400">Formül:</span> GİB tarife tablosu → motor hacmi × yaş grubu → sabit yıllık tutar ÷ 12 = aylık MTV</p>
            </div>
          </div>

          {/* Yakıt Hesabı */}
          <div className="bg-[#1B2A4A]/50 border border-orange-500/20 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Yakıt Maliyeti</h3>
            <p className="text-gray-400 text-sm mb-4">
              Ortalama tüketim, yıllık KM ve güncel yakıt fiyatlarına göre hesaplanır.
            </p>
            <div className="bg-gray-800/50 rounded p-4 space-y-2 text-xs text-gray-300 font-mono">
              <p><span className="text-orange-400">Tüketim:</span> Ürün şaretine göre L/100km</p>
              <p><span className="text-orange-400">Yıllık KM:</span> Kullanıcı tarafından belirlenir (5.000-50.000)</p>
              <p><span className="text-orange-400">Formül:</span> (Yıllık KM / 100) × Tüketim × Yakıt Fiyatı</p>
            </div>
          </div>

          {/* Amortisman */}
          <div className="bg-[#1B2A4A]/50 border border-orange-500/20 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Amortisman (Değer Kaybı)</h3>
            <p className="text-gray-400 text-sm mb-4">
              Araç segmentine göre yıllık değer kaybı oranları uygulanır.
            </p>
            <div className="bg-gray-800/50 rounded p-4 space-y-2 text-xs text-gray-300 font-mono">
              <p><span className="text-orange-400">1. Yıl:</span> Kompakt %15, Sedan %14, SUV %13</p>
              <p><span className="text-orange-400">Sonrası:</span> Yıllık oranlar kademeli olarak düşer</p>
              <p><span className="text-orange-400">5+ Yıl:</span> Sabit %8 yıllık</p>
            </div>
          </div>

          {/* Rota Maliyet Hesabı */}
          <div className="bg-[#1B2A4A]/50 border border-orange-500/20 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Rota Maliyet Hesabı</h3>
            <p className="text-gray-400 text-sm mb-4">
              Türkiye karayolu ağı üzerinde il/ilçe merkezleri arası koridor grafı kullanılarak hesaplanır.
            </p>
            <div className="bg-gray-800/50 rounded p-4 space-y-2 text-xs text-gray-300 font-mono">
              <p><span className="text-orange-400">Adım 1:</span> İlçe merkezinden en yakın ana düğüme offset mesafe</p>
              <p><span className="text-orange-400">Adım 2:</span> Ana düğümler arası en kısa yol (Dijkstra)</p>
              <p><span className="text-orange-400">Adım 3:</span> Güzergahtaki geçiş segmentleri (köprü/tünel/otoyol) toplanır</p>
              <p><span className="text-orange-400">Adım 4:</span> Yakıt = (km ÷ 100) × tüketim × fiyat</p>
              <p className="mt-2"><span className="text-green-400">Kesin:</span> Köprü/tünel ücretleri (KGM resmi tarife)</p>
              <p><span className="text-orange-400">Tahmini:</span> Otoyol segment ücretleri, ilçe offset mesafeleri</p>
            </div>
          </div>

          {/* Sigorta Tahmini */}
          <div className="bg-[#1B2A4A]/50 border border-orange-500/20 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Sigorta Tahmini</h3>
            <p className="text-gray-400 text-sm mb-4">
              Kasko ve trafik sigortası için pazar ortalamaları kullanılır.
            </p>
            <div className="bg-gray-800/50 rounded p-4 space-y-2 text-xs text-gray-300 font-mono">
              <p><span className="text-orange-400">Kasko:</span> Fiyat × %1.5 (yaş/segmente göre değişir)</p>
              <p><span className="text-orange-400">Trafik:</span> ₺300-800 (fiyat aralığına göre)</p>
              <p><span className="text-orange-400">Not:</span> Gerçek fiyatlar kullanıcı tarafından girilirse kullanılır</p>
            </div>
          </div>
        </div>

        {/* Confidence Levels */}
        <div className="bg-[#1B2A4A]/50 border border-orange-500/20 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6 text-orange-500" />
            Güven Seviyeleri
          </h2>

          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                A
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1">Resmi Kaynaklı Veriler (Kesin)</h4>
                <p className="text-gray-400 text-sm">
                  GİB, TÜVTÜRK ve KGM gibi resmi kurumlardan alınan veriler. MTV, muayene ücretleri, otoyol tarifeleri ve köprü/tünel geçiş ücretleri bu kategoriye girer.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                B
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1">Pazar Ortalamaları (Tahmini)</h4>
                <p className="text-gray-400 text-sm">
                  Sigorta şirketleri, bakım hizmetleri ve değer kaybı gibi faktörler pazar analizi ve istatistiksel verilerle tahmin edilir. Rota hesaplamalarında otoyol segment ücretleri ve ilçe-merkez offset mesafeleri de bu kategoridedir.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                C
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1">Kullanıcı Girdisi (Özel)</h4>
                <p className="text-gray-400 text-sm">
                  Yakıt fiyatı, yıllık KM ve sigorta tutarı gibi kullanıcı tarafından girilecek veriler en yüksek doğruluk sağlar.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-orange-500" />
            Önemli Notlar
          </h2>

          <ul className="space-y-3 text-gray-300">
            <li className="flex gap-3">
              <span className="text-orange-400 font-bold">•</span>
              <span>
                <strong className="text-white">Kişisel Faktörler:</strong> Bu hesaplamalar ortalama kullanım şartlarında geçerlidir.
                Gerçek maliyet, sürüş alışkanlıkları, bakım kalitesi ve pazar koşullarına göre değişebilir.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-orange-400 font-bold">•</span>
              <span>
                <strong className="text-white">Piyasa Dalgalanmaları:</strong> Yakıt fiyatları, vergi oranları ve sigorta ücretleri
                zaman içinde değişebilir. Raporlar oluşturuldukları tarihte geçerlidir.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-orange-400 font-bold">•</span>
              <span>
                <strong className="text-white">Vergi ve İnsentifler:</strong> Elektrikli araçlar ve hibrit modeller için
                özel vergi indirimlerinin hesaplamaya dahil edilmediğini unutmayın.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-orange-400 font-bold">•</span>
              <span>
                <strong className="text-white">Finansman Koşulları:</strong> Kredi hesaplamaları 2026 yılı faiz oranlarına
                dayanır. Gerçek kredi koşullarınız için bankanızla iletişime geçin.
              </span>
            </li>
          </ul>
        </div>

        {/* Updates and Improvements */}
        <div className="bg-[#1B2A4A]/50 border border-orange-500/20 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            Güncellemeler ve İyileştirmeler
          </h2>

          <div className="space-y-4">
            <div className="border-l-4 border-orange-500 pl-4 py-2">
              <p className="text-white font-semibold">Nisan 2026</p>
              <ul className="text-gray-400 text-sm list-disc list-inside space-y-1 mt-1">
                <li>Tüm resmi tarifeleri 2026 değerlerine güncelledik</li>
                <li>Rota hesaplama modülü eklendi (81 il, 970+ ilçe, koridor grafı bazlı)</li>
                <li>Köprü ve tünel ücretleri KGM 2026 resmi tarifelerine güncellendi</li>
                <li>Araç veritabanı 161 modele genişletildi (35+ marka)</li>
              </ul>
            </div>

            <div className="border-l-4 border-gray-600 pl-4 py-2">
              <p className="text-white font-semibold">Yakında</p>
              <ul className="text-gray-400 text-sm list-disc list-inside space-y-1 mt-2">
                <li>Elektrikli araç seçeneğinin genişletilmesi</li>
                <li>Satış sonrası hizmet maliyetleri</li>
                <li>Kargo ve ticari araçlar için özel tarifeler</li>
                <li>Karşılaştırma seçeneklerinin artırılması</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 py-8 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-gray-500 text-sm text-center">
            Son Güncelleme: Nisan 2026 | Araç Karar Motoru - Bilinçli Kararlar İçin
          </p>
        </div>
      </div>
    </div>
  );
}
