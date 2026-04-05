import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Metodoloji - Veri Kaynakları ve Hesaplama Yöntemi",
    description:
      "Araç Karar Motoru'nun kullandığı resmi veri kaynakları ve hesaplama metodolojisi. GİB, TÜVTÜRK, KGM, PETDER ve OYDER verileri.",
    keywords:
      "metodoloji, veri kaynakları, GİB, TÜVTÜRK, KGM, PETDER, OYDER, TCO hesaplama yöntemi",
    alternates: {
      canonical: "/metodoloji",
    },
    openGraph: {
      title: "Metodoloji - Veri Kaynakları ve Hesaplama Yöntemi",
      description:
        "Araç Karar Motoru'nun kullandığı resmi veri kaynakları ve hesaplama metodolojisi.",
    },
  };
}

export default function MetodolojiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
