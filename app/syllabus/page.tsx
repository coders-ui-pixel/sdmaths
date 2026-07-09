import { Header } from "@/components/Header"
import { PageHero } from "@/components/ui/PageHero"
import { prisma } from "@/lib/prisma"
import { GraduationCap } from "lucide-react"
import LatexRenderer from "@/components/LatexRenderer"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Syllabus",
}

async function getSyllabus() {
  try {
    return await prisma.syllabus.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] })
  } catch {
    return []
  }
}

export default async function SyllabusPage() {
  const entries = await getSyllabus()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] pb-32">
      <Header />

      <PageHero
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Syllabus" }]}
        eyebrow="Curriculum"
        title="Course"
        highlight="Syllabus"
        subtitle="A detailed breakdown of the topics and chapters covered across our courses."
      />

      <div className="container max-w-4xl mx-auto px-6 -mt-12 relative z-10">
        {entries.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-14 text-center shadow-xl">
            <GraduationCap size={40} className="mx-auto mb-4 text-slate-300 dark:text-slate-700" />
            <p className="text-slate-500 dark:text-slate-400">The syllabus hasn't been published yet. Please check back soon.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {entries.map((entry) => (
              <div key={entry.id} className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-8 md:p-10 shadow-xl">
                <h2 className="text-2xl font-bold outfit text-slate-900 dark:text-white mb-4">{entry.title}</h2>
                <div className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                  <LatexRenderer content={entry.content} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
