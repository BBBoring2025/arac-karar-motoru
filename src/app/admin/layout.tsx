import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Admin Panel",
    description: "Araç Karar Motoru yönetim paneli. Tarife güncellemeleri ve kullanıcı yönetimi.",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
