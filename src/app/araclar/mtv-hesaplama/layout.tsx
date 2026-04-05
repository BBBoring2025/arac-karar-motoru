import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "MTV Hesaplama 2026 - Motorlu Taşıtlar Vergisi",
    description:
      "2026 yılı güncel GİB tarifelerine göre MTV hesaplayın. Motor hacmi, yakıt türü ve araç yaşına göre otomatik Motorlu Taşıtlar Vergisi hesaplama.",
    keywords:
      "MTV hesaplama, motorlu taşıtlar vergisi 2026, GİB MTV, araç vergisi hesaplama",
    alternates: {
      canonical: "/araclar/mtv-hesaplama",
    },
    openGraph: {
      title: "MTV Hesaplama 2026 - Motorlu Taşıtlar Vergisi",
      description:
        "2026 güncel GİB tarifelerine göre MTV hesaplayın. Motor hacmi, yakıt türü ve araç yaşına göre otomatik hesaplama.",
    },
  };
}

export default function MTVLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
