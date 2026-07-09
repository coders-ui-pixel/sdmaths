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

    const exam = await prisma.mCQExam.findUnique({
      where: { id },
      include: {
        courses: { select: { id: true, title: true, slug: true } }
      }
    })

    if (!exam) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json(exam)
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
    const { title, connectCourseId, disconnectCourseId, isFree, isFeaturedOnHome, negativeMarking, startTime, endTime } = body

    const updated = await prisma.mCQExam.update({
      where: { id },
      data: {
        ...(title ? { title } : {}),
        ...(isFree !== undefined ? { isFree: !!isFree, isFeaturedOnHome: !!isFree && !!isFeaturedOnHome } : {}),
        ...(isFree === undefined && isFeaturedOnHome !== undefined ? { isFeaturedOnHome: !!isFeaturedOnHome } : {}),
        ...(negativeMarking !== undefined ? { negativeMarking: !!negativeMarking } : {}),
        ...(startTime !== undefined ? { startTime: startTime ? new Date(startTime) : null } : {}),
        ...(endTime !== undefined ? { endTime: endTime ? new Date(endTime) : null } : {}),
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

    await prisma.mCQExam.delete({ where: { id } })
    return NextResponse.json({ message: "Deleted" })
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 })
  }
}
