import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { name, studentId, email } = await req.json()

    if (!name || !studentId || !email) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 })
    }

    // Create the password reset request directly — admin will verify and handle
    const resetRequest = await prisma.passwordResetRequest.create({
      data: {
        name,
        studentId,
        email,
        status: "PENDING"
      }
    })

    return NextResponse.json({ success: true, request: resetRequest })
  } catch (error: any) {
    console.error("Password reset request error:", error)
    return NextResponse.json({ error: "Internal server error." }, { status: 500 })
  }
}
