import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Yakıt Maliyeti Hesaplama - Güncel Akaryakıt Fiyatları",
    description:
      "Aracınızın yakıt maliyetini hesaplayın. PETDER güncel akaryakıt fiyatları ve WLTP tüketim verileriyle aylık ve yıllık yakıt gideri.",
    keywords:
      "yakıt hesaplama, akaryakıt fiyatı 2026, benzin fiyatı, motorin fiyatı, WLTP tüketim",
    alternates: {
      canonical: "/araclar/yakit-hesaplama",
    },
    openGraph: {
      title: "Yakıt Maliyeti Hesaplama - Güncel Akaryakıt Fiyatları",
      description:
        "Aracınızın yakıt maliyetini hesaplayın. Güncel akaryakıt fiyatları ve WLTP tüketim verileri.",
    },
  };
}

export default function YakitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
