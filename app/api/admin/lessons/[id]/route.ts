import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

type Params = { params: Promise<{ id: string }> }

export async function DELETE(req: Request, { params }: Params) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.lesson.delete({ where: { id } })
    return NextResponse.json({ message: "Lesson deleted" })
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 })
  }
}
