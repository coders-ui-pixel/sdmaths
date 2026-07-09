import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

type Params = { params: Promise<{ questionId: string }> }

// DELETE - remove a bank question, unless it's already attached to an exam
// that has student results (would corrupt past attempts' review view)
export async function DELETE(req: Request, { params }: Params) {
  const { questionId } = await params
  const session = await auth()
  if (!session || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const question = await prisma.mCQQuestion.findUnique({
    where: { id: questionId },
    include: { exams: { include: { _count: { select: { results: true } } } } }
  })

  if (!question) return NextResponse.json({ error: "Question not found" }, { status: 404 })

  const inUseWithResults = question.exams.some(e => e._count.results > 0)
  if (inUseWithResults) {
    return NextResponse.json({ error: "This question is part of a set students have already attempted and can't be deleted." }, { status: 400 })
  }

  await prisma.mCQQuestion.delete({ where: { id: questionId } })
  return NextResponse.json({ success: true })
}
