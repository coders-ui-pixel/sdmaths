import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AnalyticsClient from "./AnalyticsClient"

export const dynamic = "force-dynamic"

export default async function AdminAnalyticsPage() {
  const session = await auth()
  if (!session || (session.user as any)?.role !== "ADMIN") redirect("/login")

  // 1. Growth in students
  const startOfThisMonth = new Date()
  startOfThisMonth.setDate(1)
  startOfThisMonth.setHours(0, 0, 0, 0)

  const totalStudents = await prisma.user.count({
    where: { role: "STUDENT" }
  })

  const newStudentsThisMonth = await prisma.user.count({
    where: {
      role: "STUDENT",
      createdAt: { gte: startOfThisMonth }
    }
  })

  const studentsBeforeThisMonth = totalStudents - newStudentsThisMonth
  let studentGrowthPercent = 0 // Real-time fallback
  if (studentsBeforeThisMonth > 0) {
    studentGrowthPercent = Math.round((newStudentsThisMonth / studentsBeforeThisMonth) * 100)
  }

  // 2. Revenue calculations
  const revenueAggregate = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: { status: "VERIFIED" }
  })
  const totalRevenue = revenueAggregate._sum.amount || 0

  const revenueThisMonthAggregate = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: {
      status: "VERIFIED",
      createdAt: { gte: startOfThisMonth }
    }
  })
  const revenueThisMonth = revenueThisMonthAggregate._sum.amount || 0
  const revenueBeforeThisMonth = totalRevenue - revenueThisMonth

  let revenueGrowthPercent = 0 // Real-time fallback
  if (revenueBeforeThisMonth > 0) {
    revenueGrowthPercent = Math.round((revenueThisMonth / revenueBeforeThisMonth) * 100)
  }

  // 3. Average Course Completion calculations
  const enrollments = await prisma.payment.findMany({
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

  const completedProgress = await prisma.progress.findMany({
    where: { completed: true },
    select: { userId: true, lessonId: true }
  })

  const completedSet = new Set(completedProgress.map(p => `${p.userId}_${p.lessonId}`))

  let totalProgressPercentageSum = 0
  let enrollmentCountWithLessons = 0

  for (const enrollment of enrollments) {
    const allLessons = enrollment.course.playlists.flatMap(p => p.lessons)
    if (allLessons.length === 0) continue
    
    const completedCount = allLessons.filter(lesson => completedSet.has(`${enrollment.userId}_${lesson.id}`)).length
    const percentage = (completedCount / allLessons.length) * 100
    totalProgressPercentageSum += percentage
    enrollmentCountWithLessons++
  }

  const avgCompletion = enrollmentCountWithLessons > 0 
    ? Math.round(totalProgressPercentageSum / enrollmentCountWithLessons) 
    : 0 // Real-time fallback if no progress is made yet

  // 4. New Enrollments Today
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const newEnrollmentsToday = await prisma.payment.count({
    where: {
      status: "VERIFIED",
      createdAt: { gte: startOfToday }
    }
  })

  // 5. Monthly Revenue Chart calculations
  const currentYear = new Date().getFullYear()
  const monthlyRevenue = Array(12).fill(0)

  const paymentsThisYear = await prisma.payment.findMany({
    where: {
      status: "VERIFIED",
      createdAt: {
        gte: new Date(`${currentYear}-01-01`),
        lte: new Date(`${currentYear}-12-31T23:59:59.999Z`)
      }
    },
    select: {
      amount: true,
      createdAt: true
    }
  })

  for (const payment of paymentsThisYear) {
    const month = new Date(payment.createdAt).getMonth()
    monthlyRevenue[month] += payment.amount
  }

  const maxRevenue = Math.max(...monthlyRevenue)
  const monthlyHeights = monthlyRevenue.map(rev => 
    maxRevenue > 0 ? Math.round((rev / maxRevenue) * 100) : 0
  )

  const finalHeights = monthlyHeights

  // 6. Popular Courses
  const coursesList = await prisma.course.findMany({
    include: {
      payments: {
        where: { status: "VERIFIED" }
      }
    }
  })

  const popularCourses = coursesList
    .map(course => ({
      name: course.title,
      sales: course.payments.length,
    }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 4)

  const finalPopularCourses = popularCourses

  const initialData = {
    totalStudents,
    studentGrowthPercent,
    totalRevenue,
    revenueGrowthPercent,
    avgCompletion,
    newEnrollmentsToday,
    finalHeights,
    finalPopularCourses
  }

  return <AnalyticsClient initialData={initialData} />
}
