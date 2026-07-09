"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, PlayCircle, CheckCircle2, HelpCircle, FileText, MessageCircleQuestion, ArrowRight, BookOpen } from "lucide-react"

export function CourseSwitcher({ courses, completedLessons }: { courses: any[]; completedLessons: string[] }) {
  const [selectedId, setSelectedId] = useState<string>(courses[0]?.id)
  const selected = courses.find(c => c.id === selectedId) || courses[0]
  if (!selected) return null

  const allLessons = selected.playlists?.flatMap((p: any) => p.lessons) || []
  const totalLessons = allLessons.length
  const completed = allLessons.filter((l: any) => completedLessons.includes(l.id)).length
  const percent = totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0

  const quickLinks = [
    { label: "Videos", href: `/courses/${selected.slug}/learn`, icon: PlayCircle, color: "text-[var(--primary)] bg-[var(--primary)]/10" },
    { label: "MCQs", href: `/courses/${selected.slug}/learn/mcq`, icon: HelpCircle, color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20" },
    { label: "Notes", href: `/courses/${selected.slug}/learn/notes`, icon: FileText, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" },
    { label: "Q&As", href: `/courses/${selected.slug}/learn/questions`, icon: MessageCircleQuestion, color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20" },
  ]

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
        <h2 className="text-xl font-bold outfit text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen size={20} className="text-[var(--primary)]" /> My Learning
        </h2>
        {courses.length > 1 && (
          <div className="relative">
            <select
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-[var(--primary)] shadow-sm cursor-pointer"
            >
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="relative p-6 md:p-8 text-white overflow-hidden" style={{ background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)" }}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full translate-x-1/4 -translate-y-1/4 pointer-events-none" />
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <h3 className="text-xl md:text-2xl font-black outfit mb-1 truncate">{selected.title}</h3>
              <p className="text-white/70 text-sm">{completed} / {totalLessons} lessons completed &middot; {percent}%</p>
            </div>
            <Link href={`/courses/${selected.slug}/learn`} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[var(--primary)] text-sm font-bold hover:scale-105 transition-transform shadow-lg shrink-0">
              Continue <ArrowRight size={16} />
            </Link>
          </div>
          <div className="relative z-10 w-full bg-white/20 rounded-full h-2 overflow-hidden mt-5">
            <div className="h-full bg-white rounded-full transition-all" style={{ width: `${percent}%` }} />
          </div>
        </div>

        <div className="p-6 md:p-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {quickLinks.map(item => (
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-[var(--primary)]/40 hover:shadow-md transition-all text-center"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color}`}>
                  <item.icon size={18} />
                </div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{item.label}</span>
              </Link>
            ))}
          </div>

          {selected.playlists?.length > 0 ? (
            <div className="space-y-5">
              {selected.playlists.map((playlist: any) => (
                <div key={playlist.id}>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">{playlist.title}</h4>
                  <div className="space-y-1">
                    {playlist.lessons.map((lesson: any, i: number) => {
                      const done = completedLessons.includes(lesson.id)
                      return (
                        <Link
                          key={lesson.id}
                          href={`/courses/${selected.slug}/learn?lesson=${lesson.id}`}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          {done ? <CheckCircle2 size={16} className="text-emerald-500 shrink-0" /> : <PlayCircle size={16} className="text-slate-300 dark:text-slate-600 shrink-0" />}
                          <span className={`text-sm truncate ${done ? "text-slate-400 dark:text-slate-500 line-through" : "text-slate-700 dark:text-slate-300"}`}>
                            {i + 1}. {lesson.title}
                          </span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-6">No lessons published yet for this course.</p>
          )}
        </div>
      </div>
    </div>
  )
}
