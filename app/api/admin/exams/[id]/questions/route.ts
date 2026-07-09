import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

type Params = { params: Promise<{ id: string }> }

async function requireAdmin() {
  const session = await auth()
  if (!session || (session.user as any)?.role !== "ADMIN") return null
  return session
}

// GET - questions currently attached to this exam (the "set")
export async function GET(req: Request, { params }: Params) {
  const { id } = await params
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const exam = await prisma.mCQExam.findUnique({
    where: { id },
    include: { questions: { orderBy: { createdAt: "asc" }, include: { subject: { select: { id: true, name: true } } } } }
  })
  if (!exam) return NextResponse.json({ error: "Exam not found" }, { status: 404 })

  return NextResponse.json(exam.questions)
}

// POST - attach bank questions to this exam set, either specific ids ("manual")
// or N random ones not already in the set ("random")
export async function POST(req: Request, { params }: Params) {
  const { id } = await params
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const exam = await prisma.mCQExam.findUnique({
    where: { id },
    include: { questions: { select: { id: true } } }
  })
  if (!exam) return NextResponse.json({ error: "Exam not found" }, { status: 404 })

  const body = await req.json()
  const alreadyAttachedIds = new Set(exam.questions.map(q => q.id))

  let questionIdsToConnect: string[] = []

  if (body.mode === "manual") {
    if (!Array.isArray(body.questionIds) || body.questionIds.length === 0) {
      return NextResponse.json({ error: "questionIds is required" }, { status: 400 })
    }
    questionIdsToConnect = body.questionIds
  } else if (body.mode === "random") {
    const count = parseInt(body.count)
    if (!count || count < 1) {
      return NextResponse.json({ error: "count must be a positive number" }, { status: 400 })
    }
    const available = await prisma.mCQQuestion.findMany({
      where: {
        id: { notIn: Array.from(alreadyAttachedIds) },
        // subjectId === null means "Uncategorized only"; omitted/undefined means "any subject".
        ...(body.subjectId === null ? { subjectId: null } : body.subjectId ? { subjectId: body.subjectId } : {}),
        ...(body.marks ? { marks: parseFloat(body.marks) } : {}),
      },
      select: { id: true }
    })
    if (available.length === 0) {
      return NextResponse.json({ error: "No unused bank questions left" }, { status: 400 })
    }
    const shuffled = available.sort(() => Math.random() - 0.5)
    questionIdsToConnect = shuffled.slice(0, count).map(q => q.id)
  } else if (body.mode === "random-multi") {
    // Attach random questions across one or more (subject, marks-tier) picks in
    // one action, e.g. [{ subjectId: "algebra-id", marks: 1, count: 10 }, { subjectId: "algebra-id", marks: 2, count: 5 }].
    // subjectId: null = Uncategorized only; subjectId omitted/undefined = any subject (combined pool).
    if (!Array.isArray(body.picks) || body.picks.length === 0) {
      return NextResponse.json({ error: "picks array is required" }, { status: 400 })
    }

    const excludeSet = new Set(alreadyAttachedIds)
    const warnings: string[] = []

    for (const pick of body.picks) {
      const count = parseInt(pick.count)
      if (!count || count < 1) continue

      const where: any = { id: { notIn: Array.from(excludeSet) } }
      if (pick.subjectId === null) where.subjectId = null
      else if (pick.subjectId) where.subjectId = pick.subjectId
      if (pick.marks) where.marks = parseFloat(pick.marks)

      const available = await prisma.mCQQuestion.findMany({ where, select: { id: true } })
      const label = `${pick.subjectName || (pick.subjectId === null ? "Uncategorized" : pick.subjectId ? "subject" : "All Subjects")}${pick.marks ? ` (${pick.marks} mark${pick.marks !== 1 ? "s" : ""})` : ""}`
      if (available.length < count) {
        warnings.push(`Only ${available.length} question(s) available for "${label}" (requested ${count})`)
      }

      const shuffled = available.sort(() => Math.random() - 0.5)
      const picked = shuffled.slice(0, count).map(q => q.id)
      picked.forEach(qid => excludeSet.add(qid))
      questionIdsToConnect.push(...picked)
    }

    if (questionIdsToConnect.length === 0) {
      return NextResponse.json({ error: "No questions could be attached", warnings }, { status: 400 })
    }

    await prisma.mCQExam.update({
      where: { id },
      data: { questions: { connect: questionIdsToConnect.map(qid => ({ id: qid })) } }
    })

    return NextResponse.json({ attached: questionIdsToConnect.length, warnings }, { status: 201 })
  } else {
    return NextResponse.json({ error: "Invalid mode" }, { status: 400 })
  }

  await prisma.mCQExam.update({
    where: { id },
    data: { questions: { connect: questionIdsToConnect.map(qid => ({ id: qid })) } }
  })

  return NextResponse.json({ attached: questionIdsToConnect.length }, { status: 201 })
}

// DELETE - remove a question from this set (does not delete it from the bank)
export async function DELETE(req: Request, { params }: Params) {
  const { id } = await params
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { questionId } = await req.json()
  if (!questionId) return NextResponse.json({ error: "questionId is required" }, { status: 400 })

  await prisma.mCQExam.update({
    where: { id },
    data: { questions: { disconnect: { id: questionId } } }
  })

  return NextResponse.json({ success: true })
}
