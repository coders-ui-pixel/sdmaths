import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET() {
  try {
    const session = await auth()
    if (!session || (session.user as any).role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const courses = await prisma.course.findMany({
      include: {
        _count: {
          select: { playlists: true, mcqExams: true, notes: true, importantQuestions: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(courses)
  } catch (error) {
    console.error("[COURSES_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session || (session.user as any).role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const {
      title,
      slug,
      description,
      price,
      discountAmount,
      discountLimit,
      hasMcqs,
      hasVideos,
      hasLiveClasses,
      hasNotes,
      thumbnail,
      paymentQrUrl
    } = body

    if (!title || !slug || !description || price === undefined) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Check if slug already exists
    const existingCourse = await prisma.course.findUnique({
      where: { slug }
    })

    if (existingCourse) {
      return new NextResponse("A course with this slug already exists", { status: 400 })
    }

    const course = await prisma.course.create({
      data: {
        title,
        slug,
        description,
        price: parseFloat(price),
        discountAmount: discountAmount ? parseFloat(discountAmount) : 0,
        discountLimit: discountLimit ? parseInt(discountLimit) : 0,
        hasMcqs: !!hasMcqs,
        hasVideos: !!hasVideos,
        hasLiveClasses: !!hasLiveClasses,
        hasNotes: !!hasNotes,
        thumbnail,
        paymentQrUrl: paymentQrUrl || null
      }
    })

    return NextResponse.json(course)
  } catch (error) {
    console.error("[COURSES_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
