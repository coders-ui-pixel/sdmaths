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

  const notices = await prisma.popupNotice.findMany({ orderBy: { createdAt: "desc" } })
  return NextResponse.json(notices)
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { title, message, linkUrl, linkLabel, imageUrl, isActive } = await req.json()
  if (!title || !message) {
    return NextResponse.json({ error: "Title and message are required" }, { status: 400 })
  }

  // Only one notice can be active at a time — deactivate any existing active notice first.
  if (isActive) {
    await prisma.popupNotice.updateMany({ where: { isActive: true }, data: { isActive: false } })
  }

  const notice = await prisma.popupNotice.create({
    data: { title, message, linkUrl: linkUrl || null, linkLabel: linkLabel || null, imageUrl: imageUrl || null, isActive: !!isActive }
  })
  return NextResponse.json(notice, { status: 201 })
}

export async function DELETE(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })

  await prisma.popupNotice.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
