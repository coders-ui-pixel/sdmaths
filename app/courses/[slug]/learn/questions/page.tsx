import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { AlertCircle, PlayCircle } from "lucide-react"
import LatexRenderer from "@/components/LatexRenderer"

export default async function ImportantQuestionsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const course = await prisma.course.findUnique({
    where: { slug },
    include: { importantQuestions: { orderBy: { createdAt: "desc" } } }
  })

  if (!course) notFound()

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold outfit mb-2 flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
            <AlertCircle size={24} />
          </div>
          Important Q&amp;A
        </h1>
        <p className="text-slate-500">Crucial questions, concepts, and detailed video explanations to help you prepare for exams.</p>
      </div>

      {course.importantQuestions.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-2xl border border-[var(--border)]">
          <AlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-bold mb-2">No Important Questions Yet</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            The instructor hasn&apos;t added any important questions to this course yet. Check back closer to exam time!
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {course.importantQuestions.map((q: any, i: number) => (
            <div key={q.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm">
              <div className="p-6 border-b border-[var(--border)] bg-slate-50 dark:bg-slate-800/50 flex gap-4 items-start">
                <span className="text-2xl font-bold text-[var(--primary)] opacity-50">Q{i + 1}.</span>
                <div className="flex-1">
                  <h3 className="text-lg font-medium pt-1 text-slate-800 dark:text-slate-200 inline-flex items-center gap-2 flex-wrap">
                    {/* LatexRenderer renders $...$ and $$...$$ inline */}
                    <LatexRenderer content={q.question} />
                    {q.isVvi && (
                      <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[9px] font-black tracking-widest uppercase shadow-md shadow-red-500/20 animate-pulse inline-block">
                        VVI
                      </span>
                    )}
                  </h3>
                </div>
              </div>
              
              <div className="p-6">
                {q.videoAnswerUrl && (
                  <div className="mb-6">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <PlayCircle size={14} /> Video Explanation
                    </h4>
                    <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-md">
                      <iframe 
                        src={q.videoAnswerUrl} 
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}
                
                {q.textAnswer && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Written Solution</h4>
                    <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-6 rounded-xl border border-[var(--border)]">
                      {/* Full LaTeX rendering for the answer body */}
                      <LatexRenderer content={q.textAnswer} className="block whitespace-pre-wrap leading-relaxed" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
