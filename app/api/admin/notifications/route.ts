import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

// Admin fetches templates and sent notifications
export async function GET() {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const templates = await prisma.notificationTemplate.findMany({
      orderBy: { updatedAt: "desc" }
    })

    return NextResponse.json({ templates })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

// Admin sends a notification to all students
export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { title, message, saveAsTemplate } = body

    if (!title || !message) {
      return NextResponse.json({ error: "Title and message are required" }, { status: 400 })
    }

    // 1. Get all students
    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      select: { id: true }
    })

    // 2. Create notifications for all students
    await prisma.notification.createMany({
      data: students.map(s => ({
        userId: s.id,
        title,
        message
      }))
    })

    // 3. Save as template if requested
    if (saveAsTemplate) {
      await prisma.notificationTemplate.create({
        data: { title, message }
      })
    }

    return NextResponse.json({ message: `Notification sent to ${students.length} students.` })
  } catch (error) {
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Template ID is required" }, { status: 400 })
    }

    await prisma.notificationTemplate.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Template deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete template" }, { status: 500 })
  }
}

