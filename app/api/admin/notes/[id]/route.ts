import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

type Params = { params: Promise<{ id: string }> }

async function requireAdmin() {
  const session = await auth()
  if (!session || (session.user as any)?.role !== "ADMIN") return null
  return session
}

// PATCH - update a note's title/content and/or replace its course assignments
export async function PATCH(req: Request, { params }: Params) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params

  const body = await req.json()
  const { title, content, courseIds, fileUrl } = body

  if (content !== undefined && fileUrl !== undefined && !content?.trim() && !fileUrl?.trim()) {
    return NextResponse.json({ error: "Provide either written content or a PDF file" }, { status: 400 })
  }

  const note = await prisma.note.update({
    where: { id },
    data: {
      ...(title !== undefined ? { title: title.trim() } : {}),
      ...(content !== undefined ? { content: content?.trim() || null } : {}),
      ...(fileUrl !== undefined ? { fileUrl: fileUrl?.trim() || null } : {}),
      ...(Array.isArray(courseIds) ? { courses: { set: courseIds.map((cid: string) => ({ id: cid })) } } : {}),
    },
    include: { courses: { select: { id: true, title: true, slug: true } } }
  })

  return NextResponse.json(note)
}

// DELETE - remove a note entirely
export async function DELETE(req: Request, { params }: Params) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params

  await prisma.note.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
