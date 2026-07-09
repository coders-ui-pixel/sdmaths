import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/auth"
import { Minus, Plus } from "lucide-react"
import LatexRenderer from "@/components/LatexRenderer"
import { NoteReaderInline } from "@/components/NoteReaderInline"

export default async function NoteDetailPage({
  params
}: {
  params: Promise<{ slug: string; noteId: string }>
}) {
  const { slug, noteId } = await params
  const session = await auth()
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/courses/${slug}/learn/notes/${noteId}`)
  }

  const course = await prisma.course.findUnique({
    where: { slug },
    include: { notes: true }
  })
  if (!course) notFound()

  const note = course.notes.find(n => n.id === noteId)
  if (!note) notFound()

  let isSubscribed = false
  if ((session.user as any).role === "ADMIN") {
    isSubscribed = true
  } else {
    const payment = await prisma.payment.findFirst({
      where: { userId: session.user.id, courseId: course.id, status: "VERIFIED" }
    })
    isSubscribed = !!payment
  }

  if (!isSubscribed) {
    redirect(`/courses/${slug}`)
  }

  // PDF notes: shown as-is via the browser's native viewer, no extra chrome.
  if (note.fileUrl) {
    return (
      <div className="w-full h-[85vh] rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 shadow">
        <NoteReaderInline content={note.content} fileUrl={note.fileUrl} />
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-6">
      <div className="rounded-lg overflow-hidden border border-slate-700 shadow-xl">
        {/* Viewer toolbar */}
        <div className="flex items-center justify-between gap-3 bg-[#2b2b2e] text-slate-200 px-4 py-2.5">
          <div className="flex items-center gap-3 min-w-0">
            <span className="truncate text-[13px] font-medium text-slate-100">{note.title}</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[13px] text-slate-300 shrink-0">
            <span className="bg-[#1f1f21] px-2 py-1 rounded w-8 text-center">1</span>
            <span className="text-slate-500">/</span>
            <span>1</span>
            <div className="w-px h-4 bg-slate-700 mx-2" />
            <Minus size={16} className="text-slate-400" />
            <span className="bg-[#1f1f21] px-2 py-1 rounded text-xs">100%</span>
            <Plus size={16} className="text-slate-400" />
          </div>
        </div>

        {/* Viewer canvas */}
        <div className="bg-[#525659] px-4 py-8 md:px-10 md:py-12 flex justify-center">
          <div className="bg-white rounded-sm shadow-2xl w-full max-w-2xl p-6 md:p-10">
            <h1 className="text-xl md:text-2xl font-black outfit text-slate-900 tracking-tight leading-snug mb-6">
              <LatexRenderer content={note.title} />
            </h1>

            <NoteReaderInline content={note.content} fileUrl={note.fileUrl} />
          </div>
        </div>
      </div>
    </div>
  )
}
