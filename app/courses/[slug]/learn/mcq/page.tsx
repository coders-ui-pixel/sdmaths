import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { Metadata } from "next"
import { HelpCircle, Trophy, CheckCircle2, PlayCircle, AlertCircle, Lock, Sparkles, Percent, Radio, Clock } from "lucide-react"

function getLiveWindowStatus(exam: { startTime: Date | null; endTime: Date | null }): "upcoming" | "open" | "ended" | null {
  if (!exam.startTime || !exam.endTime) return null
  const now = Date.now()
  if (now < exam.startTime.getTime()) return "upcoming"
  if (now > exam.endTime.getTime()) return "ended"
  return "open"
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const course = await prisma.course.findUnique({ where: { slug }, select: { title: true } }).catch(() => null)
  if (!course) return { title: "MCQ Practice" }
  return {
    title: `MCQ Practice Sets — ${course.title}`,
    description: `Practice ${course.title} with structured MCQ sets, instant scoring, and detailed explanations. Free sample sets available to try before enrolling.`,
  }
}

export default async function MCQListingPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const session = await auth()
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/courses/${slug}/learn/mcq`)
  }

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      mcqExams: {
        include: {
          questions: { select: { id: true } },
          results: {
            where: { userId: session.user.id }
          }
        },
        orderBy: { createdAt: "asc" }
      }
    }
  })

  if (!course) {
    notFound()
  }

  const isSubscribed = (session.user as any).role === "ADMIN" || !!(await prisma.payment.findFirst({
    where: { userId: session.user.id, courseId: course.id, status: "VERIFIED" }
  }))

  const exams = course.mcqExams

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 pb-24">
      <div className="relative overflow-hidden rounded-[2rem] px-8 py-10 mb-10 text-white shadow-xl" style={{ background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)" }}>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-[0.08] font-black text-[8rem] pointer-events-none select-none tracking-tight font-serif">∑∫π∞</div>
        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 border border-white/25 text-[11px] font-bold uppercase tracking-widest backdrop-blur-sm mb-4">
            <HelpCircle size={12} /> Practice Exam Room
          </span>
          <h1 className="text-3xl font-black outfit tracking-tight mb-2">Mock Practice Sets</h1>
          <p className="text-white/85 text-sm leading-relaxed max-w-lg">
            Simulate real exam conditions with structured practice sets, instant scoring, and detailed step-by-step explanations.
          </p>
        </div>
      </div>

      {exams.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-14 text-center shadow-sm">
          <div className="w-14 h-14 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-lg font-black outfit text-slate-900 dark:text-white mb-2">No MCQs Available</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-6 leading-relaxed">
            The instructor has not uploaded any practice questions for this course yet.
          </p>
          <Link href={`/courses/${slug}/learn`} className="btn-primary inline-flex !py-2.5 !px-6 text-sm">
            Go to Lecture Videos
          </Link>
        </div>
      ) : (
        <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
          {exams.map((exam) => {
            const hasAttempted = exam.results.length > 0
            const result = hasAttempted ? exam.results[0] : null
            const scorePercent = result ? Math.max(0, Math.round((result.score / result.total) * 100)) : 0
            const liveStatus = exam.examType === "LIVE" ? getLiveWindowStatus(exam) : null
            const locked = (!isSubscribed && !exam.isFree) || liveStatus === "upcoming" || liveStatus === "ended"

            return (
              <div
                key={exam.id}
                className={`bg-white dark:bg-slate-900 rounded-3xl border p-6 flex flex-col justify-between min-h-[210px] shadow-sm transition-all ${
                  locked ? "border-slate-100 dark:border-slate-800 opacity-70" : "border-slate-100 dark:border-slate-800 hover:border-[var(--primary)]/40 hover:shadow-lg"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3 gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {exam.examType === "LIVE" && (
                        <span className="text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Radio size={10} /> Live
                        </span>
                      )}
                      {exam.isFree && (
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Sparkles size={10} /> Free
                        </span>
                      )}
                      {exam.negativeMarking && (
                        <span className="text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Percent size={10} /> -5%
                        </span>
                      )}
                    </div>
                    {locked ? (
                      <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 px-2 py-0.5 rounded-full flex items-center gap-1 uppercase">
                        <Lock size={9} /> Locked
                      </span>
                    ) : hasAttempted ? (
                      <span className="text-[10px] font-black bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 text-green-600 px-2 py-0.5 rounded-full flex items-center gap-1 uppercase">
                        <CheckCircle2 size={9} /> Completed
                      </span>
                    ) : (
                      <span className="text-[10px] font-black bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 text-[var(--primary)] px-2 py-0.5 rounded-full flex items-center gap-1 uppercase">
                        <PlayCircle size={9} /> Ready
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-black outfit text-slate-800 dark:text-slate-100 mb-2 leading-snug">{exam.title}</h3>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    <HelpCircle size={12} className="text-slate-400" />
                    <span>{exam.questions.length} Objective Questions</span>
                  </div>

                  {liveStatus && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold mt-1.5 text-slate-500 dark:text-slate-400">
                      <Clock size={12} className="text-slate-400" />
                      {liveStatus === "upcoming" && <span>Opens {exam.startTime && new Date(exam.startTime).toLocaleString()}</span>}
                      {liveStatus === "open" && <span className="text-red-600 dark:text-red-400">Closes {exam.endTime && new Date(exam.endTime).toLocaleString()}</span>}
                      {liveStatus === "ended" && <span>Closed {exam.endTime && new Date(exam.endTime).toLocaleString()}</span>}
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-5 flex items-center justify-between gap-3">
                  {hasAttempted && result ? (
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 text-amber-600 flex items-center justify-center shrink-0">
                        <Trophy size={16} />
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Best Score</div>
                        <div className="text-sm font-black text-slate-800 dark:text-slate-100">
                          {result.score.toFixed(2)}/{result.total} <span className="text-xs font-semibold text-slate-500">({scorePercent}%)</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 font-semibold">
                      {liveStatus === "upcoming" ? "Not open yet" : liveStatus === "ended" ? "Exam window closed" : locked ? "Enroll to unlock" : "No history recorded"}
                    </span>
                  )}

                  {liveStatus === "upcoming" || liveStatus === "ended" ? (
                    <span className="px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wide bg-slate-100 dark:bg-slate-800 text-slate-400">
                      {liveStatus === "upcoming" ? "Not Started" : "Ended"}
                    </span>
                  ) : locked ? (
                    <Link href={`/courses/${slug}`} className="px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wide bg-slate-100 dark:bg-slate-800 text-slate-500">
                      View Course
                    </Link>
                  ) : (
                    <Link href={`/courses/${slug}/learn/mcq/${exam.id}`} className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wide transition-all ${
                      hasAttempted ? "border border-[var(--primary)]/30 text-[var(--primary)]" : "text-white"
                    }`} style={!hasAttempted ? { backgroundColor: "var(--primary)" } : undefined}>
                      {hasAttempted ? "Retake Set" : "Start Test"}
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
