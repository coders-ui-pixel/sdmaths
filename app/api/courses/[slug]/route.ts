import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

type Params = { params: Promise<{ slug: string }> }

export async function GET(req: Request, { params }: Params) {
  const { slug } = await params
  try {
    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        playlists: {
          include: { lessons: { orderBy: { order: "asc" }, select: { id: true, title: true, order: true } } },
          orderBy: { createdAt: "asc" }
        },
        notes: { select: { id: true, title: true, fileUrl: true } },
        _count: { select: { payments: true } }
      }
    })

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    return NextResponse.json(course)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch course" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: Params) {
  const { slug } = await params
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const course = await prisma.course.update({
      where: { slug },
      data: {
        title: body.title,
        description: body.description,
        price: parseFloat(body.price),
        thumbnail: body.thumbnail,
        seoTitle: body.seoTitle,
        seoDescription: body.seoDescription,
      }
    })

    return NextResponse.json(course)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update course" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: Params) {
  const { slug } = await params
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.course.delete({ where: { slug } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete course" }, { status: 500 })
  }
}
