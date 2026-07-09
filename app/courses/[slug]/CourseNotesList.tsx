import Link from "next/link"
import { FileText, Lock, Eye, File, Type } from "lucide-react"
import LatexRenderer from "@/components/LatexRenderer"

export function CourseNotesList({ notes, isSubscribed, slug }: { notes: any[], isSubscribed: boolean, slug: string }) {
  if (notes.length === 0) return null

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold outfit mb-6">Course Notes</h2>
      <div className="grid md:grid-cols-2 gap-6 max-w-3xl">
        {notes.map((note: any) => (
          <div
            key={note.id}
            className={`flex flex-col justify-between p-5 border rounded-2xl transition-all duration-300 ${
              isSubscribed
                ? "border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10 hover:border-[var(--primary)]/50"
                : "border-slate-100 dark:border-slate-800 opacity-80"
            }`}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className={`p-3 rounded-xl ${isSubscribed ? "bg-blue-50 dark:bg-blue-900/20 text-[var(--primary)]" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>
                <FileText size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm leading-snug truncate">
                  <LatexRenderer content={note.title} />
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 flex items-center gap-1">
                  {note.fileUrl ? <><File size={9} /> PDF note</> : <><Type size={9} /> On-screen note</>}
                </p>
              </div>
            </div>

            {isSubscribed ? (
              <Link
                href={`/courses/${slug}/learn/notes/${note.id}`}
                className="mt-auto flex items-center justify-center gap-2 py-2.5 px-4 text-white rounded-xl text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                style={{ background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)" }}
              >
                <Eye size={14} /> Read Note
              </Link>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-slate-400 dark:text-slate-500 text-xs font-semibold mt-auto border border-dashed border-slate-200 dark:border-slate-800">
                <Lock size={12} className="text-slate-400" />
                <span>Enrolled students only.</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
