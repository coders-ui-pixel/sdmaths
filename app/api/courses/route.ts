import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

// GET all courses (public)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")
    const skip = (page - 1) * limit

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true, title: true, slug: true, description: true,
          price: true, thumbnail: true,
          _count: { 
            select: { 
              playlists: true,
              mcqExams: true
            } 
          }
        }
      }),
      prisma.course.count()
    ])

    return NextResponse.json({ courses, total, page, pages: Math.ceil(total / limit) })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 })
  }
}

// POST create course (admin only)
export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

    const course = await prisma.course.create({
      data: {
        title: body.title,
        slug: body.slug || slug,
        description: body.description,
        price: parseFloat(body.price),
        thumbnail: body.thumbnail,
        seoTitle: body.seoTitle,
        seoDescription: body.seoDescription,
      }
    })

    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 })
  }
}
