import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

async function requireAdmin() {
  const session = await auth()
  if (!session || (session.user as any)?.role !== "ADMIN") return null
  return session
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const entries = await prisma.syllabus.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] })
  return NextResponse.json(entries)
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { title, content, order } = await req.json()
  if (!title || !content) {
    return NextResponse.json({ error: "Title and content are required" }, { status: 400 })
  }

  const entry = await prisma.syllabus.create({
    data: { title, content, order: typeof order === "number" ? order : 0 }
  })
  return NextResponse.json(entry, { status: 201 })
}

export async function DELETE(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })

  await prisma.syllabus.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
