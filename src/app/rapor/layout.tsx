import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "TCO Raporu - Toplam Sahip Olma Maliyeti",
    description:
      "Aracınızın toplam sahip olma maliyetini (TCO) hesaplayın. MTV, yakıt, sigorta, bakım, amortisman ve noter masrafları dahil kapsamlı maliyet analizi.",
    keywords:
      "TCO hesaplama, toplam sahip olma maliyeti, araç maliyet analizi, araç rapor",
    alternates: {
      canonical: "/rapor",
    },
    openGraph: {
      title: "TCO Raporu - Toplam Sahip Olma Maliyeti",
      description:
        "Aracınızın toplam sahip olma maliyetini hesaplayın. Kapsamlı maliyet analizi.",
    },
  };
}

export default function RaporLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
