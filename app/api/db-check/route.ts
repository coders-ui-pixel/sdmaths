import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const userCount = await prisma.user.count()
    return NextResponse.json({ 
      status: "connected", 
      userCount,
      dbUrl: process.env.DATABASE_URL?.split("@")[1] // show only host/port for safety
    })
  } catch (e: any) {
    return NextResponse.json({ 
      status: "error", 
      message: e.message,
      dbUrl: process.env.DATABASE_URL?.split("@")[1]
    }, { status: 500 })
  }
}
