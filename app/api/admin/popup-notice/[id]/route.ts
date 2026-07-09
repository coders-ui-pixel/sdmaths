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

  const body = await req.json()
  const { title, message, linkUrl, linkLabel, imageUrl, isActive } = body

  // Only one notice can be active at a time — deactivate any other active notice first.
  if (isActive) {
    await prisma.popupNotice.updateMany({ where: { isActive: true, id: { not: id } }, data: { isActive: false } })
  }

  const updated = await prisma.popupNotice.update({
    where: { id },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(message !== undefined ? { message } : {}),
      ...(linkUrl !== undefined ? { linkUrl: linkUrl || null } : {}),
      ...(linkLabel !== undefined ? { linkLabel: linkLabel || null } : {}),
      ...(imageUrl !== undefined ? { imageUrl: imageUrl || null } : {}),
      ...(isActive !== undefined ? { isActive: !!isActive } : {}),
    }
  })
  return NextResponse.json(updated)
}
