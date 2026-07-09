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

    const questions = await prisma.importantQuestion.findMany({
      where: { courseId: id },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(questions)
  } catch (error) {
    console.error("[QUESTIONS_GET]", error)
    return NextResponse.json({ error: "Internal Error" }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: Params) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { question, textAnswer, videoAnswerUrl, isVvi } = await req.json()
    if (!question) {
      return NextResponse.json({ error: "Question text is required" }, { status: 400 })
    }

    const newQuestion = await prisma.importantQuestion.create({
      data: {
        question,
        textAnswer: textAnswer || null,
        videoAnswerUrl: videoAnswerUrl || null,
        isVvi: !!isVvi,
        courseId: id
      }
    })

    return NextResponse.json(newQuestion)
  } catch (error) {
    console.error("[QUESTIONS_POST]", error)
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

    const { questionId, question, textAnswer, videoAnswerUrl, isVvi } = await req.json()
    if (!questionId) {
      return NextResponse.json({ error: "Missing questionId" }, { status: 400 })
    }

    const updatedQuestion = await prisma.importantQuestion.update({
      where: { id: questionId, courseId: id },
      data: {
        question,
        textAnswer: textAnswer !== undefined ? textAnswer : undefined,
        videoAnswerUrl: videoAnswerUrl !== undefined ? videoAnswerUrl : undefined,
        isVvi: isVvi !== undefined ? !!isVvi : undefined
      }
    })

    return NextResponse.json(updatedQuestion)
  } catch (error) {
    console.error("[QUESTION_PATCH]", error)
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

    const { searchParams } = new URL(req.url)
    const questionId = searchParams.get("questionId")

    if (!questionId) {
      return NextResponse.json({ error: "Missing questionId" }, { status: 400 })
    }

    await prisma.importantQuestion.delete({
      where: { id: questionId, courseId: id }
    })

    return NextResponse.json({ message: "Important Question deleted successfully" })
  } catch (error) {
    console.error("[QUESTION_DELETE]", error)
    return NextResponse.json({ error: "Internal Error" }, { status: 500 })
  }
}
