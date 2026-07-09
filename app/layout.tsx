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
import { ThemeProvider } from "@/components/ThemeProvider"
import { PopupNoticeDisplay } from "@/components/PopupNoticeDisplay"

const THEME_INIT_SCRIPT = `
(function() {
  try {
    var stored = localStorage.getItem("theme");
    var theme = stored === "light" || stored === "dark"
      ? stored
      : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {}
})();
`

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const branding = await getBranding()

  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
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
        </ThemeProvider>
      </body>
    </html>
  )
}
