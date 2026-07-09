import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

// POST - user enrolls in a course: free courses register instantly, paid courses submit payment proof
export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { courseId, proofUrl, paymentId, name, phone } = body

    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    // Check if already has a pending/approved payment
    const existing = await prisma.payment.findFirst({
      where: {
        userId: session.user.id,
        courseId,
        status: { in: ["PENDING", "VERIFIED"] }
      }
    })

    if (existing) {
      return NextResponse.json({ error: "Already registered for this course" }, { status: 400 })
    }

    if (course.price === 0) {
      if (!name || !phone) {
        return NextResponse.json({ error: "Name and phone number are required" }, { status: 400 })
      }

      const [, payment] = await prisma.$transaction([
        prisma.user.update({
          where: { id: session.user.id },
          data: { name, phone }
        }),
        prisma.payment.create({
          data: {
            userId: session.user.id,
            courseId,
            amount: 0,
            status: "VERIFIED"
          }
        })
      ])

      return NextResponse.json(payment, { status: 201 })
    }

    if (!proofUrl || !paymentId) {
      return NextResponse.json({ error: "Payment proof and transaction ID are required" }, { status: 400 })
    }

    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        courseId,
        proofUrl,
        paymentId,
        amount: course.price,
        status: "PENDING"
      }
    })

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to submit payment" }, { status: 500 })
  }
}

// GET - admin fetches all payments
export async function GET(req: Request) {
  try {
    const session = await auth()
    console.log("Admin Payments API Session:", {
      id: session?.user?.id,
      email: session?.user?.email,
      role: (session?.user as any)?.role
    })

    if (!session || (session.user as any)?.role !== "ADMIN") {
      console.warn("Unauthorized access attempt to Admin Payments API")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payments = await prisma.payment.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, image: true } },
        course: { select: { id: true, title: true, slug: true } }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(payments)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
  }
}
