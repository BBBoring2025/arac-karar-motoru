import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Ödeme Planları",
    description:
      "Araç Karar Motoru premium planlarını inceleyin. Detaylı TCO raporu, karşılaştırmalı analiz ve profesyonel özellikler.",
    keywords: "ödeme, premium rapor, TCO analizi, araç karşılaştırma paketi",
    alternates: {
      canonical: "/odeme",
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function OdemeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
