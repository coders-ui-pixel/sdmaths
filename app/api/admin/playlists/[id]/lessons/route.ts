import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

type Params = { params: Promise<{ id: string }> }

export async function POST(req: Request, { params }: Params) {
  try {
    const { id: playlistId } = await params
    const session = await auth()
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { title, videoUrl, content, isFreeSample, order } = body

    if (!title || !videoUrl) {
      return NextResponse.json({ error: "Title and Video URL are required" }, { status: 400 })
    }

    const lesson = await prisma.lesson.create({
      data: {
        title,
        videoUrl,
        content,
        isFreeSample,
        order: order || 0,
        playlistId
      }
    })

    return NextResponse.json(lesson, { status: 201 })
  } catch (error) {
    console.error("[PLAYLIST_LESSONS_POST]", error)
    return NextResponse.json({ error: "Internal Error" }, { status: 500 })
  }
}
