import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

// GET - fetch enrolled students by course
export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const courseId = searchParams.get("courseId")

    if (!courseId) {
      return NextResponse.json({ error: "courseId is required" }, { status: 400 })
    }

    const payments = await prisma.payment.findMany({
      where: { courseId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const verified = payments.filter((p) => p.status === "VERIFIED")
    const unverified = payments.filter((p) => p.status === "PENDING")
    const rejected = payments.filter((p) => p.status === "REJECTED")

    return NextResponse.json({ verified, unverified, rejected })
  } catch (error) {
    console.error("[CLASSROOM_GET_ERROR]", error)
    return NextResponse.json({ error: "Failed to fetch classroom data" }, { status: 500 })
  }
}

// POST - batch reset or single verify/reject/unverify
export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { courseId, action, paymentId } = body

    if (!action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 })
    }

    if (action === "RESET_VERIFIED") {
      if (!courseId) {
        return NextResponse.json({ error: "courseId is required for batch reset" }, { status: 400 })
      }

      // Bulk update all VERIFIED payments for this course to PENDING
      await prisma.payment.updateMany({
        where: {
          courseId,
          status: "VERIFIED",
        },
        data: {
          status: "PENDING",
        },
      })

      return NextResponse.json({ success: true, message: "All verified students reset to pending." })
    }

    // Individual action handlers
    if (!paymentId) {
      return NextResponse.json({ error: "paymentId is required for this action" }, { status: 400 })
    }

    if (action === "VERIFY_STUDENT") {
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: "VERIFIED" },
      })
      return NextResponse.json({ success: true, message: "Student enrollment verified." })
    }

    if (action === "REJECT_STUDENT") {
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: "REJECTED" },
      })
      return NextResponse.json({ success: true, message: "Student enrollment rejected." })
    }

    if (action === "UNVERIFY_STUDENT") {
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: "PENDING" },
      })
      return NextResponse.json({ success: true, message: "Student enrollment set to pending." })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("[CLASSROOM_POST_ERROR]", error)
    return NextResponse.json({ error: "Failed to perform classroom operation" }, { status: 500 })
  }
}
