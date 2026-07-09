import { Branding } from "@prisma/client"
import { SITE_NAME } from "./site"

const DEFAULT_BRANDING: Branding = {
  id: "global",
  siteName: SITE_NAME,
  logoUrl: null,
  faviconUrl: null,
  paymentQrUrl: null,
  contactEmail: null,
  contactPhone: null,
  facebookUrl: null,
  instagramUrl: null,
  youtubeUrl: null,
  telegramUrl: null,
  primaryColor: "#2563eb",
  secondaryColor: "#1e40af",
  heroHeadline: "Learn Math",
  heroHighlight: "Like A Pro",
  heroSubtitle: "Experience a revolutionary approach to mathematics. Our expert-led courses break down complex concepts into manageable steps for absolute mastery.",
  aboutImageUrl: null,
  updatedAt: new Date(),
}

export type BrandingData = Branding

export async function getBranding(): Promise<BrandingData> {
  try {
    const { prisma } = await import("./prisma")
    let branding = await prisma.branding.findUnique({ where: { id: "global" } })
    if (!branding) {
      branding = await prisma.branding.create({
        data: {
          id: "global",
          siteName: SITE_NAME,
          primaryColor: "#6366f1",
          secondaryColor: "#4f46e5",
          heroHeadline: "Learn Math",
          heroHighlight: "Like A Pro",
          heroSubtitle: "Experience a revolutionary approach to mathematics. Our expert-led courses break down complex concepts into manageable steps for absolute mastery.",
        }
      })
    }
    return { ...branding, siteName: SITE_NAME }
  } catch {
    return DEFAULT_BRANDING
  }
}
