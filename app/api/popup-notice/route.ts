import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const notice = await prisma.popupNotice.findFirst({ where: { isActive: true }, orderBy: { updatedAt: "desc" } }).catch(() => null)
  return NextResponse.json(notice)
}
