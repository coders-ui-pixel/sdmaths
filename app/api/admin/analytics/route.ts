import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const startOfThisMonth = new Date()
    startOfThisMonth.setDate(1)
    startOfThisMonth.setHours(0, 0, 0, 0)

    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    const currentYear = new Date().getFullYear()

    // Batch 1: Basic counts, recent payments, and course list (uses max 5 connections)
    const [
      totalUsers,
      totalCourses,
      pendingPayments,
      recentPayments,
      coursesWithPayments
    ] = await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.payment.count({ where: { status: "PENDING" } }),
      prisma.payment.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          course: { select: { title: true } }
        }
      }),
      prisma.course.findMany({
        select: {
          title: true,
          payments: {
            where: { status: "VERIFIED" },
            select: { id: true }
          }
        }
      })
    ])

    // Batch 2: Get student list (uses 1 connection)
    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      select: { createdAt: true }
    })

    // Batch 3: Get all verified payments with course and playlists (uses 1 connection)
    const verifiedPaymentsList = await prisma.payment.findMany({
      where: { status: "VERIFIED" },
      include: {
        course: {
          include: {
            playlists: {
              include: { lessons: { select: { id: true } } }
            }
          }
        }
      }
    })

    // Batch 4: Get progress list (uses 1 connection)
    const completedProgress = await prisma.progress.findMany({
      where: { completed: true },
      select: { userId: true, lessonId: true }
    })

    // Calculate student statistics
    const totalStudents = students.length
    const newStudentsThisMonth = students.filter((s:any) => new Date(s.createdAt) >= startOfThisMonth).length
    const studentsBeforeThisMonth = totalStudents - newStudentsThisMonth
    let studentGrowthPercent = 0
    if (studentsBeforeThisMonth > 0) {
      studentGrowthPercent = Math.round((newStudentsThisMonth / studentsBeforeThisMonth) * 100)
    }

    // Calculate revenue statistics
    const totalRevenue = verifiedPaymentsList.reduce((sum, p) => sum + p.amount, 0)
    const revenueThisMonth = verifiedPaymentsList
      .filter(p => new Date(p.createdAt) >= startOfThisMonth)
      .reduce((sum, p) => sum + p.amount, 0)
    const revenueBeforeThisMonth = totalRevenue - revenueThisMonth
    let revenueGrowthPercent = 0
    if (revenueBeforeThisMonth > 0) {
      revenueGrowthPercent = Math.round((revenueThisMonth / revenueBeforeThisMonth) * 100)
    }

    // Calculate average completion progress
    const completedSet = new Set(completedProgress.map(p => `${p.userId}_${p.lessonId}`))
    let totalProgressPercentageSum = 0
    let enrollmentCountWithLessons = 0

    for (const enrollment of verifiedPaymentsList) {
      const allLessons = enrollment.course.playlists.flatMap(p => p.lessons)
      if (allLessons.length === 0) continue
      
      const completedCount = allLessons.filter(lesson => completedSet.has(`${enrollment.userId}_${lesson.id}`)).length
      const percentage = (completedCount / allLessons.length) * 100
      totalProgressPercentageSum += percentage
      enrollmentCountWithLessons++
    }

    const avgCompletion = enrollmentCountWithLessons > 0 
      ? Math.round(totalProgressPercentageSum / enrollmentCountWithLessons) 
      : 0

    // Calculate new enrollments today
    const newEnrollmentsToday = verifiedPaymentsList.filter(p => new Date(p.createdAt) >= startOfToday).length

    // Calculate monthly revenue chart data
    const monthlyRevenue = Array(12).fill(0)
    for (const payment of verifiedPaymentsList) {
      const payDate = new Date(payment.createdAt)
      if (payDate.getFullYear() === currentYear) {
        const month = payDate.getMonth()
        monthlyRevenue[month] += payment.amount
      }
    }

    const maxRevenue = Math.max(...monthlyRevenue)
    const monthlyHeights = monthlyRevenue.map(rev => 
      maxRevenue > 0 ? Math.round((rev / maxRevenue) * 100) : 0
    )

    // Calculate popular courses from actual database courses
    const popularCourses = coursesWithPayments
      .map(course => ({
        name: course.title,
        sales: course.payments.length,
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 4)

    return NextResponse.json({
      totalUsers,
      totalCourses,
      totalRevenue,
      pendingPayments,
      recentPayments,
      totalStudents,
      studentGrowthPercent,
      revenueGrowthPercent,
      avgCompletion,
      newEnrollmentsToday,
      finalHeights: monthlyHeights, // 100% Real monthly heights
      finalPopularCourses: popularCourses // 100% Real popular courses
    })
  } catch (error) {
    console.error("Failed to fetch analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
