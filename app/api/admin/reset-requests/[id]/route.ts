import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import bcrypt from "bcryptjs"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { action, newPassword } = await req.json()

    // Fetch the reset request first
    const resetRequest = await prisma.passwordResetRequest.findUnique({
      where: { id }
    })

    if (!resetRequest) {
      return NextResponse.json({ error: "Request not found." }, { status: 404 })
    }

    if (action === "RESET") {
      if (!newPassword || newPassword.length < 6) {
        return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 })
      }

      // Find the user by request email
      const user = await prisma.user.findUnique({
        where: { email: resetRequest.email }
      })

      if (!user) {
        return NextResponse.json({ error: "Associated user account not found." }, { status: 404 })
      }

      // Hash and update the password
      const hashedPassword = await bcrypt.hash(newPassword, 10)
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      })

      // Mark the request as COMPLETED
      const updatedRequest = await prisma.passwordResetRequest.update({
        where: { id },
        data: { status: "COMPLETED" }
      })

      return NextResponse.json({ success: true, request: updatedRequest })
    } else if (action === "RESEND") {
      // Simulate sending manual notification/email confirmation
      await new Promise((r) => setTimeout(r, 800)) // slight delay for loading state feel
      return NextResponse.json({ success: true, message: "Reset confirmation successfully resent!" })
    } else {
      return NextResponse.json({ error: "Invalid action." }, { status: 400 })
    }
  } catch (error: any) {
    console.error("Failed to process action:", error)
    return NextResponse.json({ error: "Failed to process request action." }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    await prisma.passwordResetRequest.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete request:", error)
    return NextResponse.json({ error: "Failed to delete request." }, { status: 500 })
  }
}
