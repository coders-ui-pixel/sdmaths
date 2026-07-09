import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { isFeaturedSample } = await request.json()

    const lesson = await prisma.lesson.update({
      where: { id },
      data: { isFeaturedSample },
    })

    return NextResponse.json(lesson)
  } catch (error) {
    console.error("Error updating lesson feature status:", error)
    return NextResponse.json(
      { error: "Failed to update lesson" },
      { status: 500 }
    )
  }
}
