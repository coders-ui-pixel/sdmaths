import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { lessonId, seconds } = await request.json()

    if (!lessonId || typeof seconds !== "number") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    const progress = await prisma.progress.upsert({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId: lessonId,
        },
      },
      update: {
        watchTime: {
          increment: seconds,
        },
      },
      create: {
        userId: session.user.id,
        lessonId: lessonId,
        watchTime: seconds,
        completed: false, // Don't auto-complete just by watching 10s
      },
    })

    return NextResponse.json(progress)
  } catch (error) {
    console.error("Error updating watch time:", error)
    return NextResponse.json(
      { error: "Failed to update watch time" },
      { status: 500 }
    )
  }
}
