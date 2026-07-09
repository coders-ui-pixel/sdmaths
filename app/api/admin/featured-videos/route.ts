import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET() {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const videos = await prisma.featuredVideo.findMany({
      orderBy: { order: "asc" }
    })
    return NextResponse.json(videos)
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { title, videoUrl, thumbnailUrl } = body

    if (!title || !videoUrl) {
      return NextResponse.json({ error: "Title and Video URL are required" }, { status: 400 })
    }

    const video = await prisma.featuredVideo.create({
      data: { title, videoUrl, thumbnailUrl, order: 0 }
    })

    return NextResponse.json(video)
  } catch (e) {
    return NextResponse.json({ error: "Failed to create video" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })

    await prisma.featuredVideo.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
  }
}
