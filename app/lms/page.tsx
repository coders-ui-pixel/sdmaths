import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import DashboardOverviewClient from "./DashboardOverviewClient"

export const dynamic = "force-dynamic"

async function getAnalytics() {
  try {
    const [totalUsers, totalCourses, verifiedPayments, pendingPayments, recentPayments] = await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.payment.aggregate({ where: { status: "VERIFIED" }, _sum: { amount: true } }),
      prisma.payment.count({ where: { status: "PENDING" } }),
      prisma.payment.findMany({
        take: 8, orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          course: { select: { title: true } }
        }
      })
    ])
    return {
      totalUsers,
      totalCourses,
      totalRevenue: verifiedPayments._sum.amount || 0,
      pendingPayments,
      recentPayments
    }
  } catch (error) {
    console.error("Failed to load initial admin analytics:", error)
    return { totalUsers: 0, totalCourses: 0, totalRevenue: 0, pendingPayments: 0, recentPayments: [] }
  }
}

export default async function AdminOverviewPage() {
  const session = await auth()
  if (!session || (session.user as any)?.role !== "ADMIN") redirect("/login")

  const initialData = await getAnalytics()

  return <DashboardOverviewClient initialData={initialData} />
}
