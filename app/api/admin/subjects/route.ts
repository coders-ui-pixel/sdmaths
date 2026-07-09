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

  const subjects = await prisma.subject.findMany({
    include: { _count: { select: { questions: true } } },
    orderBy: { name: "asc" }
  })
  return NextResponse.json(subjects)
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { name } = await req.json()
  if (!name || !name.trim()) {
    return NextResponse.json({ error: "Subject name is required" }, { status: 400 })
  }

  try {
    const subject = await prisma.subject.create({ data: { name: name.trim() } })
    return NextResponse.json(subject, { status: 201 })
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "A subject with this name already exists" }, { status: 409 })
    }
    return NextResponse.json({ error: "Failed to create subject" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })

  await prisma.subject.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
