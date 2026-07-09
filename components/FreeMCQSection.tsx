import Link from "next/link"
import { HelpCircle, ArrowRight } from "lucide-react"

type FreeExam = {
  id: string
  title: string
  courses: { title: string; slug: string }[]
  _count: { questions: number }
}

export function FreeMCQSection({ exams }: { exams: FreeExam[] }) {
  const withCourse = exams.filter(e => e.courses.length > 0)
  if (withCourse.length === 0) return null

  return (
    <section className="relative py-16 md:py-24 bg-white dark:bg-slate-950 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[900px] h-[400px] bg-[var(--primary)]/[0.05] blur-[110px] rounded-full -z-10" />
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black outfit mb-4">Free MCQ Practice Sets</h2>
          <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
            Test your skills with these free practice sets — no purchase needed. Just log in and start solving.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {withCourse.slice(0, 3).map(exam => {
            const course = exam.courses[0]
            return (
              <Link
                key={exam.id}
                href={`/courses/${course.slug}/learn/mcq/${exam.id}`}
                className="group bg-slate-50 dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 hover:border-[var(--primary)]/40 hover:shadow-lg transition-all flex flex-col"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
                    <HelpCircle size={20} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 px-2.5 py-1 rounded-full">
                    Free
                  </span>
                </div>
                <h3 className="text-lg font-bold outfit text-slate-800 dark:text-slate-100 mb-1.5 group-hover:text-[var(--primary)] transition-colors">
                  {exam.title}
                </h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-4">{course.title}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 flex-grow">
                  {exam._count.questions} practice questions with instant scoring and detailed explanations.
                </p>
                <span className="flex items-center gap-2 font-bold text-[var(--primary)] text-sm mt-auto">
                  Start Practicing <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
