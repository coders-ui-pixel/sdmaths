import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const enrolled = await prisma.payment.findMany({
      where: {
        userId: session.user.id,
        status: "VERIFIED"
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    const courses = enrolled.map(e => e.course)
    return NextResponse.json(courses)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch enrolled courses" }, { status: 500 })
  }
}
