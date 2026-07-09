import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

type Params = { params: Promise<{ id: string }> }

async function requireAdmin() {
  const session = await auth()
  if (!session || (session.user as any)?.role !== "ADMIN") return null
  return session
}

export async function PATCH(req: Request, { params }: Params) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params

  const { name } = await req.json()
  if (!name || !name.trim()) {
    return NextResponse.json({ error: "Subject name is required" }, { status: 400 })
  }

  try {
    const updated = await prisma.subject.update({ where: { id }, data: { name: name.trim() } })
    return NextResponse.json(updated)
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "A subject with this name already exists" }, { status: 409 })
    }
    return NextResponse.json({ error: "Failed to update subject" }, { status: 500 })
  }
}
