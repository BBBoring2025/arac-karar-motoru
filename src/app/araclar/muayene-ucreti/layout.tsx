import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Araç Muayene Ücreti 2026 - TÜVTÜRK Hesaplama",
    description:
      "2026 yılı TÜVTÜRK muayene ücretlerini hesaplayın. Araç türüne göre muayene ücreti, egzoz emisyon ölçüm ücreti ve toplam maliyet.",
    keywords:
      "araç muayene ücreti 2026, TÜVTÜRK ücret, muayene hesaplama, egzoz emisyon ücreti",
    alternates: {
      canonical: "/araclar/muayene-ucreti",
    },
    openGraph: {
      title: "Araç Muayene Ücreti 2026 - TÜVTÜRK Hesaplama",
      description:
        "2026 TÜVTÜRK muayene ücretlerini hesaplayın. Araç türüne göre muayene ve egzoz ücreti.",
    },
  };
}

export default function MuayeneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
