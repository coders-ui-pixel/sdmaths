import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

type Params = { params: Promise<{ id: string }> }

// Admin verify/reject payment
export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { status } = body

    if (!["VERIFIED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const payment = await prisma.payment.update({
      where: { id },
      data: { status }
    })

    return NextResponse.json(payment)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update payment" }, { status: 500 })
  }
}
