import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"
import Link from "next/link"
import { BookOpen, Clock, CheckCircle, ArrowRight, PlayCircle, Target, Sparkles, Trophy, Compass, Users, TrendingUp } from "lucide-react"
import { Header } from "@/components/Header"
import { CourseSwitcher } from "@/components/dashboard/CourseSwitcher"
import { StandingMeter } from "@/components/dashboard/StandingMeter"

async function getClassStanding(userId: string): Promise<{
  myAverage: number
  classAverage: number
  myRank: number | null
  totalRankedStudents: number
  percentile: number | null
}> {
  try {
    // Real-time: computed fresh from every MCQResult row on every page load,
    // not cached, so it always reflects the latest attempts across all students.
    const allResults = await prisma.mCQResult.findMany({ select: { userId: true, score: true, total: true } })

    const byUser = new Map<string, { sumScore: number; sumTotal: number }>()
    allResults.forEach(r => {
      const cur = byUser.get(r.userId) || { sumScore: 0, sumTotal: 0 }
      cur.sumScore += r.score
      cur.sumTotal += r.total
      byUser.set(r.userId, cur)
    })

    const averages = Array.from(byUser.entries())
      .map(([uid, v]) => ({ userId: uid, avgPercent: v.sumTotal > 0 ? (v.sumScore / v.sumTotal) * 100 : 0 }))
      .sort((a, b) => b.avgPercent - a.avgPercent)

    const totalRankedStudents = averages.length
    const myIndex = averages.findIndex(a => a.userId === userId)
    const myRank = myIndex >= 0 ? myIndex + 1 : null
    const myAverage = myIndex >= 0 ? averages[myIndex].avgPercent : 0
    const classAverage = totalRankedStudents > 0 ? averages.reduce((sum, a) => sum + a.avgPercent, 0) / totalRankedStudents : 0
    const percentile = myRank && totalRankedStudents > 0 ? Math.round(((totalRankedStudents - myRank) / totalRankedStudents) * 100) : null

    return { myAverage, classAverage, myRank, totalRankedStudents, percentile }
  } catch (error) {
    console.error(error)
    return { myAverage: 0, classAverage: 0, myRank: null, totalRankedStudents: 0, percentile: null }
  }
}

async function getStudentData(userId: string): Promise<{
  enrolledCourses: any[]
  completedLessons: string[]
  totalWatchHours: number
  mcqAttempts: number
  recentResults: any[]
}> {
  try {
    const [enrolledCourses, progress, mcqResults] = await Promise.all([
      prisma.payment.findMany({
        where: { userId, status: "VERIFIED" },
        include: {
          course: {
            include: {
              playlists: {
                include: { lessons: { orderBy: { order: "asc" } } },
                orderBy: { createdAt: "asc" }
              }
            }
          }
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.progress.findMany({ where: { userId } }),
      prisma.mCQResult.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 6,
        include: { exam: { include: { courses: { select: { slug: true, title: true } } } } }
      })
    ])

    const completedLessons = progress.filter((p: { completed: boolean }) => p.completed).map((p: { lessonId: string }) => p.lessonId)
    const totalWatchTimeSeconds = progress.reduce((acc: number, curr: { watchTime?: number }) => acc + (curr.watchTime || 0), 0)
    const totalWatchHours = Math.round((totalWatchTimeSeconds / 3600) * 10) / 10 // 1 decimal place

    const mcqAttemptsTotal = await prisma.mCQResult.count({ where: { userId } })

    return {
      enrolledCourses: enrolledCourses.map(e => e.course),
      completedLessons,
      totalWatchHours,
      mcqAttempts: mcqAttemptsTotal,
      recentResults: mcqResults
    }
  } catch (error) {
    console.error(error)
    return { enrolledCourses: [], completedLessons: [], totalWatchHours: 0, mcqAttempts: 0, recentResults: [] as any[] }
  }
}

const STAT_STYLES = {
  primary: "bg-[var(--primary)]/10 text-[var(--primary)]",
  purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
  green: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
  orange: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
} as const

export default async function StudentDashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { enrolledCourses, completedLessons, totalWatchHours, mcqAttempts, recentResults } = await getStudentData(session.user.id)
  const standing = await getClassStanding(session.user.id)

  let pendingPayments: any[] = []
  try {
    pendingPayments = await prisma.payment.findMany({
      where: { userId: session.user.id, status: "PENDING" },
      include: { course: { select: { title: true } } }
    })
  } catch {}

  const stats = [
    { label: "Active Hours", value: `${totalWatchHours}h`, icon: PlayCircle, tone: "primary" },
    { label: "Practice MCQs", value: mcqAttempts, icon: Target, tone: "purple" },
    { label: "Lessons Done", value: completedLessons.length, icon: CheckCircle, tone: "green" },
    { label: "Enrolled", value: enrolledCourses.length, icon: BookOpen, tone: "orange" },
  ] as const

  return (
    <main className="relative min-h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <Header />

      {/* Rich ambient background */}
      <div className="absolute inset-0 -z-0 opacity-[0.4] dark:opacity-[0.12] pointer-events-none" style={{ backgroundImage: "radial-gradient(var(--primary) 1px, transparent 1px)", backgroundSize: "28px 28px", maskImage: "linear-gradient(to bottom, black, transparent 70%)" }} />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--primary)]/[0.08] blur-[120px] rounded-full -z-0 pointer-events-none" />
      <div className="absolute top-[30%] left-0 w-[400px] h-[400px] bg-[var(--secondary)]/[0.07] blur-[110px] rounded-full -z-0 pointer-events-none -translate-x-1/2" />

      <div className="relative z-10 pt-24 pb-16">
        <div className="container">
          {/* Welcome banner */}
          <div className="mb-10 p-8 md:p-10 rounded-[2rem] text-white relative overflow-hidden shadow-xl" style={{ background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)" }}>
            <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 blur-[90px] rounded-full translate-x-1/4 -translate-y-1/4 pointer-events-none" />
            <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(#fff 1.5px, transparent 1.5px)", backgroundSize: "24px 24px" }} />
            <span className="inline-flex items-center gap-1.5 mb-3 px-3 py-1 rounded-full bg-white/15 border border-white/25 text-[11px] font-black uppercase tracking-widest backdrop-blur-sm relative z-10">
              <Sparkles size={12} /> Student Dashboard
            </span>
            <h1 className="text-3xl md:text-4xl font-black outfit mb-2 relative z-10">
              Welcome back, {session.user.name?.split(" ")[0] || "Student"}! 👋
            </h1>
            <p className="text-white/80 text-base md:text-lg relative z-10 mb-6">Here's an overview of your learning journey.</p>
            <div className="flex flex-wrap gap-3 relative z-10">
              <Link href="/courses" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-[var(--primary)] text-sm font-bold hover:scale-105 transition-transform shadow-lg">
                <Compass size={16} /> Browse Courses
              </Link>
              {enrolledCourses[0] && (
                <Link href={`/courses/${enrolledCourses[0].slug}/learn`} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 border border-white/25 text-white text-sm font-bold hover:bg-white/25 transition-colors backdrop-blur-sm">
                  <PlayCircle size={16} /> Continue Learning
                </Link>
              )}
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white dark:bg-slate-900 rounded-3xl p-5 md:p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 md:gap-5">
                <div className={`w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-2xl flex items-center justify-center ${STAT_STYLES[stat.tone]}`}>
                  <stat.icon size={24} />
                </div>
                <div className="min-w-0">
                  <div className="text-2xl md:text-3xl font-extrabold outfit tracking-tight text-slate-900 dark:text-white">{stat.value}</div>
                  <div className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* My Learning — course switcher + content panel */}
          {enrolledCourses.length === 0 ? (
            <div className="mb-10 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 text-center py-14 shadow-sm">
              <BookOpen size={40} className="mx-auto mb-4 text-slate-300 dark:text-slate-700" />
              <p className="text-slate-500 dark:text-slate-400 mb-4">You haven't enrolled in any courses yet.</p>
              <Link href="/courses" className="btn-primary inline-flex">
                Browse Courses <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <CourseSwitcher courses={enrolledCourses} completedLessons={completedLessons} />
          )}

          <div className="grid lg:grid-cols-2 gap-6 mb-10">
            {/* Your Standing — real-time class-wide comparison, computed fresh on every load */}
            <div>
              <h2 className="text-xl font-bold outfit mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                <Users size={20} className="text-[var(--primary)]" /> Your Standing
              </h2>
              {standing.myRank === null ? (
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 text-center py-12 shadow-sm h-full flex flex-col items-center justify-center">
                  <TrendingUp size={36} className="mx-auto mb-3 text-slate-300 dark:text-slate-700" />
                  <p className="text-slate-500 dark:text-slate-400 mb-4 px-6">Attempt an MCQ practice set to see how you rank among all students.</p>
                  <Link href="/courses" className="btn-primary inline-flex">
                    Find a Practice Set <ArrowRight size={16} />
                  </Link>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm p-6 md:p-8 flex flex-col sm:flex-row items-center gap-6 h-full">
                  <StandingMeter percent={standing.myAverage} label="Your Average" />
                  <div className="flex-1 space-y-4 w-full">
                    <div>
                      <div className="text-2xl font-black outfit text-slate-900 dark:text-white">Rank #{standing.myRank}</div>
                      <div className="text-xs text-slate-400 font-semibold">out of {standing.totalRankedStudents} student{standing.totalRankedStudents !== 1 ? "s" : ""}</div>
                    </div>
                    {standing.percentile !== null && (
                      <span className="inline-block text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 px-2.5 py-1 rounded-full">
                        {standing.percentile >= 50 ? `Top ${100 - standing.percentile}%` : `Better than ${standing.percentile}%`}
                      </span>
                    )}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                        <span>Class Average</span>
                        <span>{Math.round(standing.classAverage)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div className="h-full rounded-full bg-slate-400 dark:bg-slate-600" style={{ width: `${Math.min(100, Math.round(standing.classAverage))}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Pending Payments */}
            <div>
              <h2 className="text-xl font-bold outfit mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                <Clock size={20} className="text-amber-500" /> Pending Payments
              </h2>
              {pendingPayments.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 text-center py-12 shadow-sm h-full flex flex-col items-center justify-center">
                  <CheckCircle size={36} className="mx-auto mb-3 text-emerald-300 dark:text-emerald-800" />
                  <p className="text-slate-500 dark:text-slate-400 px-6">No pending payments — you're all caught up.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingPayments.map((p: { id: string; course: { title: string } }) => (
                    <div key={p.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 p-5">
                      <Clock size={20} className="text-amber-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-slate-800 dark:text-slate-100 truncate">{p.course.title}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Payment under review — Admin will verify shortly</p>
                      </div>
                      <span className="ml-auto text-xs bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 font-semibold px-3 py-1 rounded-full shrink-0">Pending</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Practice */}
          {recentResults.length > 0 && (
            <div>
              <h2 className="text-xl font-bold outfit mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                <Trophy size={20} className="text-[var(--primary)]" /> Recent Practice
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {recentResults.map((r: any) => {
                  const percent = r.total > 0 ? Math.round((r.score / r.total) * 100) : 0
                  const course = r.exam?.courses?.[0]
                  const good = percent >= 60
                  return (
                    <Link
                      key={r.id}
                      href={course ? `/courses/${course.slug}/learn/mcq` : "/courses"}
                      className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:border-[var(--primary)]/40 hover:shadow-lg transition-all p-6 flex flex-col"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center font-black text-sm ${
                          good ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" : "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
                        }`}>
                          {percent}%
                        </div>
                        <ArrowRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:translate-x-1 group-hover:text-[var(--primary)] transition-all shrink-0 mt-1" />
                      </div>
                      <p className="font-bold text-slate-800 dark:text-slate-100 leading-snug mb-1 line-clamp-2">{r.exam?.title || "Practice Set"}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 truncate mb-4">{course?.title || "Standalone"}</p>
                      <div className="mt-auto">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                          <span>Score</span>
                          <span>{r.score} / {r.total}</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div className={`h-full rounded-full ${good ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${Math.min(100, percent)}%` }} />
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
