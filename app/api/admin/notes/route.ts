import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

async function requireAdmin() {
  const session = await auth()
  if (!session || (session.user as any)?.role !== "ADMIN") return null
  return session
}

// GET - list all notes, with their assigned courses
export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const notes = await prisma.note.findMany({
    include: { courses: { select: { id: true, title: true, slug: true } } },
    orderBy: { createdAt: "desc" }
  })

  return NextResponse.json(notes)
}

// POST - create a note and assign it to one or more courses
export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { title, content, courseIds, fileUrl } = await req.json()
  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 })
  }
  if (!content?.trim() && !fileUrl?.trim()) {
    return NextResponse.json({ error: "Provide either written content or a PDF file" }, { status: 400 })
  }

  const note = await prisma.note.create({
    data: {
      title: title.trim(),
      content: content?.trim() || null,
      fileUrl: fileUrl?.trim() || null,
      ...(Array.isArray(courseIds) && courseIds.length > 0 ? { courses: { connect: courseIds.map((id: string) => ({ id })) } } : {})
    },
    include: { courses: { select: { id: true, title: true, slug: true } } }
  })

  return NextResponse.json(note, { status: 201 })
}
