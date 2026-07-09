import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

type Params = { params: Promise<{ id: string }> }

export async function GET(req: Request, { params }: Params) {
  const { id } = await params
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const exam = await prisma.mCQExam.findUnique({
      where: { id },
      include: {
        courses: {
          include: {
            notes: { select: { id: true, title: true, fileUrl: true } }
          }
        },
        questions: {
          select: {
            id: true,
            question: true,
            options: true,
            // correctOption/explanation intentionally omitted here — they're only
            // returned after submission, otherwise the answer is visible via devtools
            // before the student even attempts the question.
          }
        }
      }
    })

    if (!exam) return NextResponse.json({ error: "Exam not found" }, { status: 404 })

    const isAdmin = (session.user as any).role === "ADMIN"
    let hasAccess = isAdmin || exam.isFree

    if (!hasAccess && exam.courses.length > 0) {
      const verified = await prisma.payment.findFirst({
        where: {
          userId: session.user.id,
          courseId: { in: exam.courses.map(c => c.id) },
          status: "VERIFIED"
        }
      })
      hasAccess = !!verified
    }

    if (!hasAccess) {
      return NextResponse.json({ error: "You don't have access to this exam" }, { status: 403 })
    }

    if (!isAdmin && exam.examType === "LIVE") {
      const now = Date.now()
      if (exam.startTime && now < new Date(exam.startTime).getTime()) {
        return NextResponse.json({ error: `This live exam hasn't started yet. It opens at ${new Date(exam.startTime).toLocaleString()}.` }, { status: 403 })
      }
      if (exam.endTime && now > new Date(exam.endTime).getTime()) {
        return NextResponse.json({ error: "This live exam has ended and can no longer be attempted." }, { status: 403 })
      }
    }

    return NextResponse.json(exam)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch exam" }, { status: 500 })
  }
}
