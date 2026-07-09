import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

// Admin fetches all exams, optionally filtered by ?type=PRACTICE|LIVE
export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type")

    const exams = await prisma.mCQExam.findMany({
      where: type === "LIVE" || type === "PRACTICE" ? { examType: type } : {},
      include: {
        courses: { select: { id: true, title: true, slug: true } },
        _count: { select: { questions: true } }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(exams)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch exams" }, { status: 500 })
  }
}

// Admin creates a new exam
export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { title, courseId, isFree, isFeaturedOnHome, negativeMarking, examType, startTime, endTime } = body

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }
    if (examType === "LIVE" && (!startTime || !endTime)) {
      return NextResponse.json({ error: "Start and end time are required for a live exam" }, { status: 400 })
    }

    const exam = await prisma.mCQExam.create({
      data: {
        title,
        isFree: !!isFree,
        isFeaturedOnHome: !!isFree && !!isFeaturedOnHome,
        negativeMarking: !!negativeMarking,
        examType: examType === "LIVE" ? "LIVE" : "PRACTICE",
        startTime: examType === "LIVE" && startTime ? new Date(startTime) : null,
        endTime: examType === "LIVE" && endTime ? new Date(endTime) : null,
        ...(courseId ? { courses: { connect: { id: courseId } } } : {})
      }
    })

    return NextResponse.json(exam, { status: 201 })
  } catch (error) {
    console.error("Create exam error:", error)
    return NextResponse.json({ error: "Failed to create exam" }, { status: 500 })
  }
}
