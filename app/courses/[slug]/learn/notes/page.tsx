import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/auth"
import { FileText } from "lucide-react"

export default async function NotesEntryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const session = await auth()

  const course = await prisma.course.findUnique({
    where: { slug },
    include: { notes: true }
  })
  if (!course) notFound()

  if (course.notes.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-4">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-12 text-center">
          <FileText size={40} className="mx-auto text-slate-300 mb-4" />
          <h3 className="font-bold text-slate-700 dark:text-slate-300 text-base mb-1">No notes uploaded yet</h3>
          <p className="text-xs text-slate-400">Materials are being prepared and will be available soon.</p>
        </div>
      </div>
    )
  }

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

  if (!isSubscribed) {
    redirect(`/courses/${slug}`)
  }

  // Notes open straight to content — jump directly to the first note, no intermediate list/click.
  redirect(`/courses/${slug}/learn/notes/${course.notes[0].id}`)
}
