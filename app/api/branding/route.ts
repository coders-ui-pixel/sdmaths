import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { SITE_NAME } from "@/lib/site"
import { auth } from "@/auth"

export async function GET() {
  try {
    const branding = await prisma.branding.findUnique({
      where: { id: "global" }
    })

    if (!branding) {
      const defaultBranding = await prisma.branding.create({
        data: {
          id: "global",
          siteName: SITE_NAME,
          primaryColor: "#3b82f6",
          secondaryColor: "#1e40af",
          heroHeadline: "Learn Math",
          heroHighlight: "Like A Pro",
          heroSubtitle: "Experience a revolutionary approach to mathematics. Our expert-led courses break down complex concepts into manageable steps for absolute mastery.",
        }
      })
      return NextResponse.json({ ...defaultBranding, siteName: SITE_NAME })
    }

    return NextResponse.json({ ...branding, siteName: SITE_NAME })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch branding" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    // Site name is locked to SITE_NAME and cannot be changed via this API,
    // regardless of what the request body contains.
    const branding = await prisma.branding.upsert({
      where: { id: "global" },
      update: {
        siteName: SITE_NAME,
        logoUrl: body.logoUrl,
        faviconUrl: body.faviconUrl,
        paymentQrUrl: body.paymentQrUrl,
        contactEmail: body.contactEmail,
        contactPhone: body.contactPhone,
        facebookUrl: body.facebookUrl,
        instagramUrl: body.instagramUrl,
        youtubeUrl: body.youtubeUrl,
        telegramUrl: body.telegramUrl,
        primaryColor: body.primaryColor,
        secondaryColor: body.secondaryColor,
        heroHeadline: body.heroHeadline,
        heroHighlight: body.heroHighlight,
        heroSubtitle: body.heroSubtitle,
        aboutImageUrl: body.aboutImageUrl,
      },
      create: {
        id: "global",
        siteName: SITE_NAME,
        logoUrl: body.logoUrl,
        faviconUrl: body.faviconUrl,
        paymentQrUrl: body.paymentQrUrl,
        contactEmail: body.contactEmail,
        contactPhone: body.contactPhone,
        facebookUrl: body.facebookUrl,
        instagramUrl: body.instagramUrl,
        youtubeUrl: body.youtubeUrl,
        telegramUrl: body.telegramUrl,
        primaryColor: body.primaryColor || "#3b82f6",
        secondaryColor: body.secondaryColor || "#1e40af",
        heroHeadline: body.heroHeadline || "Learn Math",
        heroHighlight: body.heroHighlight || "Like A Pro",
        heroSubtitle: body.heroSubtitle || "Experience a revolutionary approach to mathematics.",
        aboutImageUrl: body.aboutImageUrl,
      }
    })

    return NextResponse.json(branding)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update branding" }, { status: 500 })
  }
}
