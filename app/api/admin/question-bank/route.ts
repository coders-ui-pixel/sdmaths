import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { parseCsv, parseCorrectOption } from "@/lib/csv"

async function requireAdmin() {
  const session = await auth()
  if (!session || (session.user as any)?.role !== "ADMIN") return null
  return session
}

// GET - list all bank questions, optionally filtered by subject and/or marks
// (subjectId=__uncategorized__ means "no subject tagged yet")
export async function GET(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const subjectId = searchParams.get("subjectId")
  const marks = searchParams.get("marks")

  const questions = await prisma.mCQQuestion.findMany({
    where: {
      ...(subjectId === "__uncategorized__" ? { subjectId: null } : subjectId ? { subjectId } : {}),
      ...(marks ? { marks: parseFloat(marks) } : {}),
    },
    include: { _count: { select: { exams: true } }, subject: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" }
  })

  return NextResponse.json(questions)
}

// POST - add question(s) to the bank: manual entry, CSV parse-for-review, bulk
// save, or retroactively (re)assign a subject to existing questions.
export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()

  if (body.mode === "manual") {
    const { question, options, correctOption, explanation, explanationVideoUrl, subjectId, marks } = body
    if (!question || !Array.isArray(options) || options.length < 2 || correctOption === undefined) {
      return NextResponse.json({ error: "Question, at least 2 options, and a correct option are required" }, { status: 400 })
    }
    const created = await prisma.mCQQuestion.create({
      data: {
        subjectId: subjectId || null,
        question,
        options,
        correctOption: parseInt(correctOption),
        marks: marks ? parseFloat(marks) : 1,
        explanation: explanation || null,
        explanationVideoUrl: explanationVideoUrl || null,
      }
    })
    return NextResponse.json(created, { status: 201 })
  }

  // Parse a CSV into draft questions for the admin to review/edit before saving —
  // nothing is written to the database at this stage.
  if (body.mode === "csv-parse") {
    const { csvText } = body
    if (!csvText || typeof csvText !== "string") {
      return NextResponse.json({ error: "csvText is required" }, { status: 400 })
    }

    const rows = parseCsv(csvText)
    if (rows.length === 0) {
      return NextResponse.json({ error: "CSV appears to be empty" }, { status: 400 })
    }

    // Skip a header row if the first cell looks like a column label rather than a question.
    const firstCell = rows[0][0]?.trim().toLowerCase()
    const dataRows = firstCell === "question" ? rows.slice(1) : rows

    const drafts = dataRows.map((row, idx) => {
      const rowNum = idx + (firstCell === "question" ? 2 : 1)
      const [question, optionA, optionB, optionC, optionD, correctRaw, explanation, explanationVideoUrl] = row
      const options = [optionA, optionB, optionC, optionD].filter(o => o !== undefined)
      const correctOption = correctRaw ? parseCorrectOption(correctRaw) : null

      const errors: string[] = []
      if (!question || question.trim() === "") errors.push("Missing question text")
      if (options.filter(o => o.trim() !== "").length < 2) errors.push("Needs at least 2 non-empty options")
      if (correctOption === null) errors.push(`Correct option "${correctRaw || ""}" is invalid`)
      else if (correctOption >= options.filter(o => o.trim() !== "").length) errors.push("Correct option is out of range")

      return {
        rowNum,
        question: (question || "").trim(),
        options: [0, 1, 2, 3].map(i => (options[i] || "").trim()),
        correctOption: correctOption ?? 0,
        explanation: explanation?.trim() || "",
        explanationVideoUrl: explanationVideoUrl?.trim() || "",
        errors,
      }
    })

    return NextResponse.json({ drafts })
  }

  // Persist the final, admin-reviewed/edited set of questions.
  if (body.mode === "bulk") {
    if (!Array.isArray(body.questions) || body.questions.length === 0) {
      return NextResponse.json({ error: "questions array is required" }, { status: 400 })
    }

    const toCreate: { question: string; options: string[]; correctOption: number; explanation: string | null; explanationVideoUrl: string | null }[] = []
    const errors: string[] = []

    body.questions.forEach((q: any, idx: number) => {
      const options = Array.isArray(q.options) ? q.options.map((o: string) => (o || "").trim()).filter((o: string) => o !== "") : []
      const question = (q.question || "").trim()
      const correctOption = typeof q.correctOption === "number" ? q.correctOption : parseInt(q.correctOption)

      if (!question || options.length < 2 || isNaN(correctOption) || correctOption < 0 || correctOption >= options.length) {
        errors.push(`Question ${idx + 1}: invalid data, skipped`)
        return
      }

      toCreate.push({
        question,
        options,
        correctOption,
        explanation: q.explanation?.trim() || null,
        explanationVideoUrl: q.explanationVideoUrl?.trim() || null,
      })
    })

    const subjectId: string | null = body.subjectId || null
    const marks: number = body.marks ? parseFloat(body.marks) : 1

    if (toCreate.length > 0) {
      if (body.examId) {
        // Need the created rows' ids back so we can attach them to the exam —
        // createMany doesn't return rows, so create individually in a transaction.
        await prisma.$transaction(
          toCreate.map(q => prisma.mCQQuestion.create({
            data: { ...q, subjectId, marks, exams: { connect: { id: body.examId } } }
          }))
        )
      } else {
        await prisma.mCQQuestion.createMany({
          data: toCreate.map(q => ({ ...q, subjectId, marks }))
        })
      }
    }

    return NextResponse.json({
      imported: toCreate.length,
      failed: errors.length,
      errors: errors.slice(0, 20),
    }, { status: 201 })
  }

  // Retroactively tag one or more existing bank questions with a subject
  // (or clear the tag by passing subjectId: null).
  if (body.mode === "assign-subject") {
    if (!Array.isArray(body.questionIds) || body.questionIds.length === 0) {
      return NextResponse.json({ error: "questionIds is required" }, { status: 400 })
    }
    const result = await prisma.mCQQuestion.updateMany({
      where: { id: { in: body.questionIds } },
      data: { subjectId: body.subjectId || null }
    })
    return NextResponse.json({ updated: result.count })
  }

  // Retroactively change the marks value for one or more existing bank questions.
  if (body.mode === "assign-marks") {
    if (!Array.isArray(body.questionIds) || body.questionIds.length === 0) {
      return NextResponse.json({ error: "questionIds is required" }, { status: 400 })
    }
    const marksNum = parseFloat(body.marks)
    if (isNaN(marksNum) || marksNum <= 0) {
      return NextResponse.json({ error: "A positive marks value is required" }, { status: 400 })
    }
    const result = await prisma.mCQQuestion.updateMany({
      where: { id: { in: body.questionIds } },
      data: { marks: marksNum }
    })
    return NextResponse.json({ updated: result.count })
  }

  return NextResponse.json({ error: "Invalid mode" }, { status: 400 })
}
