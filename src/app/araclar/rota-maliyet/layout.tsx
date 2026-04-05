import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Rota Maliyet Hesaplama — İl/İlçe Bazlı Yakıt ve Geçiş Ücreti",
    description:
      "Türkiye geneli 81 il ve 970+ ilçe arası rota maliyetini hesaplayın. Yakıt tüketimi, otoyol, köprü ve tünel geçiş ücretleri dahil. KGM ve PETDER 2026 verileriyle.",
    keywords:
      "rota maliyet hesaplama, yol masrafı hesaplama, yakıt maliyeti, otoyol ücreti, köprü geçiş ücreti, Osmangazi köprüsü ücreti, Avrasya tüneli ücreti, Çanakkale köprüsü ücreti, araç yol masrafı, il ilçe rota hesaplama",
    alternates: {
      canonical: "/araclar/rota-maliyet",
    },
    openGraph: {
      title: "Rota Maliyet Hesaplama — Araç Karar Motoru",
      description:
        "İlçeden ilçeye yakıt ve geçiş ücreti hesaplayın. Osmangazi, Avrasya, Çanakkale köprü ücretleri dahil.",
      type: "website",
      locale: "tr_TR",
    },
  };
}

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Rota Maliyet Hesaplama",
  url: "https://arackararmotoru.com/araclar/rota-maliyet",
  description: "Türkiye geneli il/ilçe bazlı rota maliyet hesaplama aracı",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  inLanguage: "tr",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "TRY",
  },
};

export default function RotaMaliyetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      {children}
    </>
  );
}
