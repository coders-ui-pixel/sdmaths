import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET() {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return new Response("Unauthorized", { status: 401 })
    }

    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: { payments: { where: { status: "VERIFIED" } } }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    // Create CSV Header
    let csv = "ID,Name,Email,Role,Enrolled Courses,Joined Date\n"

    // Add Rows
    users.forEach(user => {
      const id = user.id
      const name = (user.name || "N/A").replace(/,/g, "")
      const email = user.email || "N/A"
      const role = user.role
      const enrolledCount = user._count.payments
      const joined = user.createdAt.toISOString().split("T")[0]

      csv += `${id},${name},${email},${role},${enrolledCount},${joined}\n`
    })

    // Return as downloadable file
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="students_details.csv"',
      },
    })
  } catch (error) {
    return new Response("Failed to export CSV", { status: 500 })
  }
}
