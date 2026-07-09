"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { PlayCircle, Lock, HelpCircle, AlertCircle, FileText } from "lucide-react"

interface SidebarNavProps {
  course: any
  isSubscribed: boolean
  slug: string
}

export function SidebarNav({ course, isSubscribed, slug }: SidebarNavProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeLessonId = searchParams.get("lesson")

  // Determine active section tab dynamically from current path
  const isMcq = pathname.includes("/learn/mcq")
  const isQuestions = pathname.includes("/learn/questions")
  const isNotes = pathname.includes("/learn/notes")
  const isVideos = !isMcq && !isQuestions && !isNotes

  // Flatten lessons to find the default first lesson if none is active
  const allLessons = course.playlists.flatMap((p: any) => p.lessons)
  const defaultLessonId = allLessons[0]?.id

  return (
    <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
      {/* Videos Section */}
      {isVideos && (
        <div className="flex flex-col gap-5">
          {course.playlists.length === 0 ? (
            <div className="text-center py-8 text-xs font-semibold text-slate-400">
              No video playlists active
            </div>
          ) : (
            course.playlists.map((playlist: any) => (
              <div key={playlist.id} className="flex flex-col gap-2.5">
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">
                  {playlist.title}
                </div>
                <div className="flex flex-col gap-1.5">
                  {playlist.lessons.map((lesson: any, i: number) => {
                    const canAccess = isSubscribed || lesson.isFreeSample
                    const isActive = canAccess && (
                      activeLessonId === lesson.id || (!activeLessonId && lesson.id === defaultLessonId && pathname.endsWith("/learn"))
                    )

                    return (
                      <Link
                        key={lesson.id}
                        href={canAccess ? `/courses/${slug}/learn?lesson=${lesson.id}` : "#"}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent transition-all duration-200 ${
                          isActive
                            ? "bg-[var(--primary)]/10 text-[var(--primary)] font-bold shadow-sm"
                            : canAccess
                            ? "hover:bg-slate-100 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300"
                            : "opacity-50 cursor-not-allowed text-slate-400 bg-slate-50/20 dark:bg-slate-950/10"
                        }`}
                      >
                        <div
                          className={`p-1.5 rounded-lg flex-shrink-0 transition-colors duration-200 ${
                            isActive
                              ? "bg-[var(--primary)]/15 text-[var(--primary)]"
                              : canAccess
                              ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                              : "bg-slate-100 dark:bg-slate-900 text-slate-400"
                          }`}
                        >
                          {canAccess ? <PlayCircle size={15} /> : <Lock size={15} />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs leading-snug line-clamp-2">
                            {i + 1}. {lesson.title}
                          </div>
                          {lesson.isFreeSample && !isSubscribed && (
                            <span className="inline-block text-[8px] font-extrabold bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded-full uppercase mt-1">
                              Free Sample
                            </span>
                          )}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* MCQ Section */}
      {isMcq && (
        <div className="flex flex-col gap-2.5">
          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">
            Mock Exams
          </div>
          {course.mcqExams.length === 0 ? (
            <div className="text-center py-8 text-xs font-semibold text-slate-400">
              No exams active
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {course.mcqExams.map((exam: any) => {
                const isActive = pathname.includes(`/learn/mcq/${exam.id}`)
                const canAccess = isSubscribed || exam.isFree
                return (
                  <Link
                    key={exam.id}
                    href={canAccess ? `/courses/${slug}/learn/mcq/${exam.id}` : "#"}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent transition-all duration-200 ${
                      isActive
                        ? "bg-[var(--primary)]/10 text-[var(--primary)] font-bold shadow-sm"
                        : canAccess
                        ? "hover:bg-slate-100 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300"
                        : "opacity-50 cursor-not-allowed text-slate-400 bg-slate-50/20 dark:bg-slate-950/10"
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-lg flex-shrink-0 transition-colors duration-200 ${
                        isActive
                          ? "bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-400"
                          : canAccess
                          ? "bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400"
                          : "bg-slate-100 dark:bg-slate-900 text-slate-400"
                      }`}
                    >
                      {canAccess ? <HelpCircle size={15} /> : <Lock size={15} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs leading-snug block truncate">{exam.title || "Practice Set"}</span>
                      {exam.isFree && !isSubscribed && (
                        <span className="inline-block text-[8px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded-full uppercase mt-1">
                          Free
                        </span>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Notes Section */}
      {isNotes && (
        <div className="flex flex-col gap-2.5">
          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">
            Notes
          </div>
          {course.notes.length === 0 ? (
            <div className="text-center py-8 text-xs font-semibold text-slate-400">
              No notes active
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {course.notes.map((note: any) => {
                const isActive = pathname.includes(`/learn/notes/${note.id}`)
                return (
                  <Link
                    key={note.id}
                    href={isSubscribed ? `/courses/${slug}/learn/notes/${note.id}` : "#"}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent transition-all duration-200 ${
                      isActive
                        ? "bg-[var(--primary)]/10 text-[var(--primary)] font-bold shadow-sm"
                        : isSubscribed
                        ? "hover:bg-slate-100 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300"
                        : "opacity-50 cursor-not-allowed text-slate-400 bg-slate-50/20 dark:bg-slate-950/10"
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-lg flex-shrink-0 transition-colors duration-200 ${
                        isActive
                          ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400"
                          : isSubscribed
                          ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
                          : "bg-slate-100 dark:bg-slate-900 text-slate-400"
                      }`}
                    >
                      {isSubscribed ? <FileText size={15} /> : <Lock size={15} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs leading-snug line-clamp-2">{note.title}</div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Q&As Section */}
      {isQuestions && (
        <div className="flex flex-col gap-2.5">
          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">
            Important Q&A
          </div>
          {course.importantQuestions.length === 0 ? (
            <div className="text-center py-8 text-xs font-semibold text-slate-400">
              No Q&As active
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {(() => {
                const isActive = pathname.includes("/learn/questions")
                return (
                  <Link
                    href={isSubscribed ? `/courses/${slug}/learn/questions` : "#"}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent transition-all duration-200 ${
                      isActive
                        ? "bg-[var(--primary)]/10 text-[var(--primary)] font-bold shadow-sm"
                        : isSubscribed
                        ? "hover:bg-slate-100 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300"
                        : "opacity-50 cursor-not-allowed text-slate-400 bg-slate-50/20 dark:bg-slate-950/10"
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-lg flex-shrink-0 transition-colors duration-200 ${
                        isActive
                          ? "bg-orange-100 dark:bg-orange-900/60 text-orange-600 dark:text-orange-400"
                          : isSubscribed
                          ? "bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400"
                          : "bg-slate-100 dark:bg-slate-900 text-slate-400"
                      }`}
                    >
                      {isSubscribed ? <AlertCircle size={15} /> : <Lock size={15} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs leading-snug block">Browse All Q&As</span>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 block mt-0.5">
                        {course.importantQuestions.length} conceptual problems
                      </span>
                    </div>
                  </Link>
                )
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
