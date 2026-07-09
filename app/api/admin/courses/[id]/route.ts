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

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        mcqExams: { select: { id: true, title: true, _count: { select: { questions: true } } } },
        playlists: { select: { id: true, title: true, _count: { select: { lessons: true } } } },
      }
    })

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    return NextResponse.json(course)
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
    const {
      title, slug, description, price,
      discountAmount, discountLimit,
      mcqExams, playlists,
      hasMcqs, hasVideos, hasLiveClasses, hasNotes,
      thumbnail, paymentQrUrl
    } = body

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        title,
        slug,
        description,
        price: price !== undefined ? parseFloat(price) : undefined,
        discountAmount: discountAmount !== undefined ? parseFloat(discountAmount) : undefined,
        discountLimit: discountLimit !== undefined ? parseInt(discountLimit) : undefined,
        hasMcqs,
        hasVideos,
        hasLiveClasses,
        hasNotes,
        thumbnail,
        paymentQrUrl,
        mcqExams: {
          set: mcqExams?.map((e: any) => ({ id: e.id })) || []
        },
        playlists: {
          set: playlists?.map((p: any) => ({ id: p.id })) || []
        }
      }
    })

    return NextResponse.json(updatedCourse)
  } catch (error) {
    console.error("[COURSE_PATCH]", error)
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

    await prisma.course.delete({ where: { id } })
    return NextResponse.json({ message: "Course deleted" })
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 })
  }
}
