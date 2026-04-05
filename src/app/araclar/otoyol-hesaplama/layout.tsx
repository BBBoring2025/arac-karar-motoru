import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Otoyol ve Köprü Ücreti 2026 - KGM Hesaplama",
    description:
      "2026 yılı KGM otoyol ve köprü geçiş ücretlerini hesaplayın. HGS/OGS fiyatları, araç sınıfına göre otoyol maliyeti.",
    keywords:
      "otoyol ücreti 2026, köprü geçiş ücreti, HGS OGS fiyat, KGM otoyol hesaplama",
    alternates: {
      canonical: "/araclar/otoyol-hesaplama",
    },
    openGraph: {
      title: "Otoyol ve Köprü Ücreti 2026 - KGM Hesaplama",
      description:
        "2026 KGM otoyol ve köprü geçiş ücretlerini hesaplayın. HGS/OGS fiyatları.",
    },
  };
}

export default function OtoyolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
