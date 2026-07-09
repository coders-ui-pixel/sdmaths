import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const entries = await prisma.syllabus.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] }).catch(() => [])
  return NextResponse.json(entries)
}
