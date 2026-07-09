import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

type Params = { params: Promise<{ id: string }> }

export async function POST(req: Request, { params }: Params) {
  const { id } = await params
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { answers } = body // e.g. { "0": 1, "1": 0 }

    const exam = await prisma.mCQExam.findUnique({
      where: { id },
      include: { questions: true, courses: { select: { id: true } } }
    })

    if (!exam) return NextResponse.json({ error: "Exam not found" }, { status: 404 })

    const isAdmin = (session.user as any).role === "ADMIN"
    let hasAccess = isAdmin || exam.isFree
    if (!hasAccess && exam.courses.length > 0) {
      const verified = await prisma.payment.findFirst({
        where: { userId: session.user.id, courseId: { in: exam.courses.map(c => c.id) }, status: "VERIFIED" }
      })
      hasAccess = !!verified
    }
    if (!hasAccess) {
      return NextResponse.json({ error: "You don't have access to this exam" }, { status: 403 })
    }

    if (!isAdmin && exam.examType === "LIVE") {
      const now = Date.now()
      if (exam.startTime && now < new Date(exam.startTime).getTime()) {
        return NextResponse.json({ error: "This live exam hasn't started yet." }, { status: 403 })
      }
      if (exam.endTime && now > new Date(exam.endTime).getTime()) {
        return NextResponse.json({ error: "This live exam has ended and can no longer be submitted." }, { status: 403 })
      }
    }

    let score = 0
    const total = exam.questions.reduce((sum, q) => sum + q.marks, 0)

    exam.questions.forEach((q, idx) => {
      const given = answers[idx]
      if (given === undefined || given === null) return // not attempted → no penalty, ever
      if (given === q.correctOption) score += q.marks
      else if (exam.negativeMarking) score -= q.marks * 0.05
    })

    // Save or update result
    const result = await prisma.mCQResult.upsert({
      where: {
        userId_examId: {
          userId: session.user.id,
          examId: id
        }
      },
      update: {
        score,
        total,
        answers: answers
      },
      create: {
        userId: session.user.id,
        examId: id,
        score,
        total,
        answers: answers
      }
    })

    // Now that the attempt is recorded, it's safe to reveal correct answers for review.
    return NextResponse.json({
      ...result,
      negativeMarking: exam.negativeMarking,
      questions: exam.questions.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options,
        correctOption: q.correctOption,
        explanation: q.explanation,
        explanationVideoUrl: q.explanationVideoUrl,
      }))
    })
  } catch (error) {
    console.error("Submission error:", error)
    return NextResponse.json({ error: "Failed to submit exam" }, { status: 500 })
  }
}
