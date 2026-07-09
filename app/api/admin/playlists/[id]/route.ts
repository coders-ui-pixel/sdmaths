import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

type Params = { params: Promise<{ id: string }> }

export async function GET(req: Request, { params }: Params) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const playlist = await prisma.playlist.findUnique({
      where: { id },
      include: {
        lessons: { orderBy: { order: "asc" } },
        courses: { select: { id: true, title: true } }
      }
    })

    if (!playlist) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json(playlist)
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { title, connectCourseId, disconnectCourseId } = body

    const updated = await prisma.playlist.update({
      where: { id },
      data: {
        ...(title ? { title } : {}),
        ...(connectCourseId ? {
          courses: {
            connect: { id: connectCourseId }
          }
        } : {}),
        ...(disconnectCourseId ? {
          courses: {
            disconnect: { id: disconnectCourseId }
          }
        } : {})
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.playlist.delete({ where: { id } })
    return NextResponse.json({ message: "Deleted" })
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 })
  }
}
