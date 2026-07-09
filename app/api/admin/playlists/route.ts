import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

// Admin fetches all playlists
export async function GET() {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const playlists = await prisma.playlist.findMany({
      include: {
        courses: { select: { id: true, title: true } },
        _count: { select: { lessons: true } }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(playlists)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch playlists" }, { status: 500 })
  }
}

// Admin creates a new playlist
export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { title, courseId } = body

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const playlist = await prisma.playlist.create({
      data: { 
        title,
        ...(courseId ? { courses: { connect: { id: courseId } } } : {})
      }
    })

    return NextResponse.json(playlist, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create playlist" }, { status: 500 })
  }
}
