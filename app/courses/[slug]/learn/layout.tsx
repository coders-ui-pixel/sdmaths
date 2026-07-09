import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/auth"
import { ChevronLeft, BookOpen } from "lucide-react"
import { SidebarNav } from "@/components/SidebarNav"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { LearnBackgroundTexture } from "@/components/LearnBackgroundTexture"

export default async function LearnLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const session = await auth()

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      playlists: {
        include: { lessons: { orderBy: { order: "asc" } } },
        orderBy: { createdAt: "asc" }
      },
      notes: true,
      mcqExams: { select: { id: true, title: true, isFree: true } },
      importantQuestions: true,
    }
  })

  if (!course) notFound()

  // Verify Subscription
  let isSubscribed = false
  if (session?.user?.id) {
    if ((session.user as any).role === "ADMIN") {
      isSubscribed = true
    } else {
      try {
        const payment = await prisma.payment.findFirst({
          where: { userId: session.user.id, courseId: course.id, status: "VERIFIED" }
        })
        isSubscribed = !!payment
      } catch (e) {}
    }
  }

  // If not logged in and trying to access learn portal, redirect to login
  if (!session?.user && !course.playlists.some(p => p.lessons.some(l => l.isFreeSample))) {
    redirect(`/login?callbackUrl=/courses/${slug}/learn`)
  }

  // Flatten lessons from all playlists
  const allLessons = course.playlists.flatMap((p: any) => p.lessons)
  const totalLessons = allLessons.length

  // Real progress, computed the same way the dashboard does
  let completedCount = 0
  if (session?.user?.id && totalLessons > 0) {
    const lessonIds = allLessons.map((l: any) => l.id)
    completedCount = await prisma.progress.count({
      where: { userId: session.user.id, lessonId: { in: lessonIds }, completed: true }
    }).catch(() => 0)
  }
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[var(--background)] flex flex-col md:flex-row pt-[72px]">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-80 border-r border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl flex flex-col h-auto md:h-[calc(100vh-72px)] sticky top-[72px] shadow-sm z-30">
          {/* Sidebar Header with Back Button and Progress Bar */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-5">
            <Link
              href={`/courses/${course.slug}`}
              className="group w-full flex items-center justify-center gap-2 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md transition-all duration-200 transform hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))", boxShadow: "0 8px 16px -6px var(--primary-glow)" }}
            >
              <ChevronLeft size={14} className="transition-transform duration-300 group-hover:-translate-x-1" />
              <span>Back to Course Info</span>
            </Link>
            <h2 className="font-semibold outfit text-slate-900 dark:text-slate-100 text-lg md:text-xl tracking-tight leading-tight mt-1">{course.title}</h2>

            {/* Integrated Progress Indicator */}
            <div className="mt-1">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                <span className="flex items-center gap-1.5">
                  <BookOpen size={13} className="text-[var(--primary)]" />
                  {totalLessons} Lectures
                </span>
                <span className="text-[var(--primary)] font-bold">
                  {progressPercent}% Complete
                </span>
              </div>
              {/* Slim Accent Progress Bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%`, background: "linear-gradient(90deg, var(--primary), var(--secondary))" }}
                />
              </div>
            </div>
          </div>

          {/* Scrollable Sidebar Content */}
          <SidebarNav course={course} isSubscribed={isSubscribed} slug={course.slug} />

          {!isSubscribed && (
            <div className="p-4 bg-[var(--background)] border-t border-[var(--border)]">
              <p className="text-xs text-slate-500 mb-2">Unlock all content, notes, and exams.</p>
              <Link href={`/courses/${course.slug}`} className="btn-primary w-full block text-center py-2 text-sm shadow-md">
                Enroll Now
              </Link>
            </div>
          )}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 relative bg-slate-50/60 dark:bg-slate-950 md:overflow-y-auto md:h-[calc(100vh-72px)] h-auto overflow-y-visible p-6 md:p-8 flex flex-col">
          <LearnBackgroundTexture />
          <div className="flex-1 pb-16 relative z-10">
            {children}
          </div>
          <Footer />
        </main>
      </div>
    </>
  )
}
