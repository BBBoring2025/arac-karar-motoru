import type { Metadata } from "next";
import "./globals.css";
import Layout from "@/components/layout/Layout";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://arackararmotoru.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Araç Karar Motoru - Otomotiv Yatırım Danışmanı",
    template: "%s | Araç Karar Motoru",
  },
  description: "Araç satın alma kararlarınızı desteklemek için tasarlanmış akıllı danışman. MTV, otoyol, yakıt, muayene ve rota maliyetlerini hesaplayın.",
  keywords: "araç, otomobil, karar, MTV, otoyol, yakıt tüketimi, muayene, rota planlama, toplam sahip olma maliyeti, TCO",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Araç Karar Motoru - Otomotiv Yatırım Danışmanı",
    description: "Araç satın alma kararlarınızı desteklemek için akıllı hesaplamalar yapın.",
    type: "website",
    locale: "tr_TR",
    siteName: "Araç Karar Motoru",
    url: BASE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Araç Karar Motoru - Otomotiv Yatırım Danışmanı",
    description: "Araç satın alma kararlarınızı desteklemek için akıllı hesaplamalar yapın.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className="h-full antialiased"
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#1B2A4A" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Araç Karar Motoru",
              url: BASE_URL,
              description:
                "Araç satın alma kararlarınızı desteklemek için tasarlanmış akıllı danışman. MTV, otoyol, yakıt, muayene ve rota maliyetlerini hesaplayın.",
              applicationCategory: "FinanceApplication",
              operatingSystem: "Web",
              inLanguage: "tr",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "TRY",
              },
              publisher: {
                "@type": "Organization",
                name: "Araç Karar Motoru",
                url: BASE_URL,
              },
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
