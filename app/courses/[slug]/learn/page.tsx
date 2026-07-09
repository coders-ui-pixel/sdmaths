import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/auth"
import { 
  PlayCircle, 
  FileText, 
  HelpCircle, 
  AlertCircle, 
  Sparkles, 
  ArrowRight, 
  Lock, 
  Compass, 
  BookOpen
} from "lucide-react"
import Link from "next/link"
import { VideoPlayerClient } from "@/components/VideoPlayerClient"

export default async function LearnPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ slug: string }>,
  searchParams: Promise<{ lesson?: string }>
}) {
  const { slug } = await params
  const { lesson: lessonId } = await searchParams
  const session = await auth()
  
  const course = await prisma.course.findUnique({
    where: { slug },
    include: { 
      playlists: {
        include: { lessons: { orderBy: { order: "asc" } } },
        orderBy: { createdAt: "asc" }
      },
      notes: true,
      mcqExams: { select: { id: true, title: true } },
      importantQuestions: true,
    }
  })

  if (!course) notFound()

  // Flatten lessons from all playlists
  const allLessons = course.playlists.flatMap((p: any) => p.lessons)

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

  // Determine active lesson
  let activeLesson = lessonId 
    ? allLessons.find((l: any) => l.id === lessonId)
    : allLessons[0]

  if (!activeLesson) {
    return (
      <div className="max-w-4xl mx-auto py-8 flex flex-col gap-8 animate-fade-in">
        <div
          className="rounded-3xl p-8 md:p-10 text-white relative overflow-hidden shadow-xl"
          style={{ background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)" }}
        >
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 blur-[90px] rounded-full translate-x-1/4 -translate-y-1/4 pointer-events-none" />
          <div className="absolute inset-0 -z-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(#fff 1.5px, transparent 1.5px)", backgroundSize: "22px 22px" }} />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-white/15 border border-white/25 backdrop-blur-sm mb-4">
              <Sparkles size={10} className="animate-pulse text-amber-300" /> Video Lectures
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black outfit tracking-tight mb-4 leading-tight">
              Welcome to {course.title}
            </h1>
            <p className="text-white/80 text-sm md:text-base max-w-xl">
              Video lectures for this course will appear here once they're published.
            </p>
          </div>
          {/* Large Abstract Icon Decoration */}
          <div className="absolute right-4 bottom-0 opacity-[0.12] pointer-events-none transform translate-y-10">
            <Compass size={280} />
          </div>
        </div>

        {/* Curriculum Outline Block */}
        {course.playlists.length > 0 && (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold outfit text-xl text-slate-800 dark:text-slate-100 mb-1 flex items-center gap-2">
              <span className="w-9 h-9 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center shrink-0">
                <BookOpen size={18} />
              </span>
              Upcoming Curriculum
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 ml-12">Here is an overview of the video playlists that will be unlocked for this course.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {course.playlists.map((playlist: any) => (
                <div key={playlist.id} className="p-4 rounded-xl bg-gradient-to-br from-[var(--primary)]/5 to-[var(--secondary)]/5 border border-[var(--primary)]/10">
                  <h4 className="font-bold text-[10px] text-[var(--primary)] uppercase tracking-wider mb-2.5">{playlist.title}</h4>
                  <div className="flex flex-col gap-2">
                    {playlist.lessons.map((lesson: any, idx: number) => (
                      <div key={lesson.id} className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                        <span className="truncate pr-4">{idx + 1}. {lesson.title}</span>
                        <Lock size={12} className="text-slate-400 flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Access check
  if (!isSubscribed && !activeLesson.isFreeSample) {
    redirect(`/courses/${course.slug}`)
  }

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-8 py-4">
      {/* Video Player Placeholder */}
      <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center relative border border-blue-500/20 shadow-blue-500/5">
        {activeLesson.videoUrl ? (
          <VideoPlayerClient lessonId={activeLesson.id} videoUrl={activeLesson.videoUrl} />
        ) : (
          <div className="text-center text-white/50">
            <PlayCircle size={64} className="mx-auto mb-4 opacity-30 text-[var(--primary)] animate-pulse" />
            <p className="text-sm font-semibold">Video processing or not available.</p>
          </div>
        )}
        
        {activeLesson.isFreeSample && !isSubscribed && (
          <div className="absolute top-4 left-4 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg border border-green-400">
            Free Sample
          </div>
        )}
      </div>

      <div className="bg-[var(--card)] rounded-3xl p-6 md:p-8 shadow-md border border-[var(--border)]">
        <h1 className="text-2xl md:text-3xl font-black outfit mb-4 text-slate-800 dark:text-slate-100 tracking-tight leading-tight">{activeLesson.title}</h1>
        {activeLesson.content ? (
          <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed text-sm md:text-base">
            {activeLesson.content}
          </div>
        ) : (
          <p className="text-slate-500 italic text-sm">No description provided for this lesson.</p>
        )}
      </div>
    </div>
  )
}
