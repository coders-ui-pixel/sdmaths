import type { Metadata, Viewport } from "next"
import { Inter, Outfit } from "next/font/google"
import "./globals.css"
import "./utilities.css"
import { BrandingProvider } from "@/components/BrandingProvider"
import { getBranding } from "@/lib/branding"
import { SITE_URL } from "@/lib/site"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" })

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getBranding()
  const description = `Learn mathematics online from expert instructors at ${branding.siteName} — live classes, HD video lectures, MCQ exams, and study notes for students in Nepal.`

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${branding.siteName} — Learn Mathematics Online`,
      template: `%s | ${branding.siteName}`,
    },
    description,
    keywords: ["online math classes Nepal", "math tuition Nepal", "SEE math course", "NEB math course", "online mathematics tutor", branding.siteName],
    alternates: { canonical: SITE_URL },
    icons: {
      icon: branding.faviconUrl || "/favicon.ico",
    },
    openGraph: {
      title: branding.siteName,
      description,
      siteName: branding.siteName,
      type: "website",
      url: SITE_URL,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: branding.siteName,
      description,
    },
  }
}

export const viewport: Viewport = {
  themeColor: "#FDB913",
  width: "device-width",
  initialScale: 1,
}

import { Providers } from "@/components/Providers"
import { Footer } from "@/components/Footer"
import { PopupNoticeDisplay } from "@/components/PopupNoticeDisplay"

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const branding = await getBranding()

  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <BrandingProvider data={branding}>
            <div className="layout-wrapper min-h-screen flex flex-col">
              <main className="flex-1">
                {children}
              </main>
              <Footer />
              <PopupNoticeDisplay />
            </div>
          </BrandingProvider>
        </Providers>
      </body>
    </html>
  )
}
