import { prisma } from "@/lib/prisma"
import { Metadata } from "next"
import { Header } from "@/components/Header"
import Link from "next/link"
import { BookOpen, Play } from "lucide-react"
import { SITE_NAME, SITE_URL } from "@/lib/site"
import { PageHero } from "@/components/ui/PageHero"

export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Courses",
    description: `Browse all mathematics courses at ${SITE_NAME}. From calculus to algebra, we have expert-led content for every level.`,
    alternates: { canonical: `${SITE_URL}/courses` },
  }
}

async function getCourses() {
  try {
    return await prisma.course.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true, title: true, slug: true, description: true,
        price: true, thumbnail: true,
        discountAmount: true, discountLimit: true,
        _count: {
          select: {
            playlists: true,
            mcqExams: true,
            payments: { where: { status: "VERIFIED" } }
          }
        }
      }
    })
  } catch (error) {
    console.warn("Database connection failed, returning empty courses array.", error);
    return [];
  }
}

export default async function CoursesPage() {
  const courses = await getCourses()

  return (
    <main>
      <Header />

      <PageHero
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Courses" }]}
        eyebrow="Our Curriculum"
        title="All"
        highlight="Courses"
        subtitle="Discover our comprehensive library of mathematics courses crafted by expert educators — from foundational algebra to advanced calculus."
      />

      {/* Course Grid */}
      <section className="py-16">
        <div className="container">
          {courses.length === 0 ? (
            <div className="max-w-lg mx-auto text-center py-20 px-8 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
              <div className="w-16 h-16 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center mx-auto mb-5">
                <BookOpen size={28} />
              </div>
              <h3 className="text-lg font-black outfit text-slate-700 dark:text-slate-200 mb-2">No Courses Published Yet</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Our team is preparing the course catalog. Check back shortly — new courses will appear here as soon as they're published.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course: any) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": courses.map((c: { title: string; slug: string }, i: number) => ({
          "@type": "ListItem",
          "position": i + 1,
          "item": { "@type": "Course", "name": c.title, "url": `${SITE_URL}/courses/${c.slug}` }
        }))
      })}} />
    </main>
  )
}

function CourseCard({ course }: { course: any }) {
  const verifiedCount = course._count.payments || 0
  const isPromoActive = course.discountAmount > 0 && course.discountLimit > 0 && verifiedCount < course.discountLimit
  const displayPrice = isPromoActive ? course.price - course.discountAmount : course.price

  return (
    <Link href={`/courses/${course.slug}`} className="block group">
      <div className="card p-0 overflow-hidden group-hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem]">
        <div className="aspect-video relative overflow-hidden" style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--primary) 18%, transparent), color-mix(in srgb, var(--secondary) 18%, transparent))" }}>
          {course.thumbnail ? (
            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen size={48} className="text-[var(--primary)]/40" />
            </div>
          )}
          <div className="absolute top-3 right-3 flex flex-wrap gap-2 justify-end max-w-[90%]">
            {isPromoActive && (
              <span className="bg-red-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider animate-pulse shadow-md">
                🎉 Offer: Rs. {course.discountAmount} Off
              </span>
            )}
            <span className="bg-[var(--primary)] text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              {course._count.playlists} Playlists
            </span>
            <span className="bg-purple-600 text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              {course._count.mcqExams} Exams
            </span>
          </div>
        </div>
        <div className="p-6">
          <h2 className="text-lg font-bold mb-2 group-hover:text-[var(--primary)] transition-colors outfit text-slate-900 dark:text-white">{course.title}</h2>
          <p className="text-slate-500 text-sm mb-4 line-clamp-2">{course.description}</p>
          <div className="flex items-center justify-between gap-4">
            {isPromoActive ? (
              <div className="flex flex-col">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-black text-red-600">
                    Rs. {displayPrice.toLocaleString()}
                  </span>
                  <span className="text-xs line-through text-slate-400 font-semibold">
                    Rs. {course.price.toLocaleString()}
                  </span>
                </div>
                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-1 animate-pulse">
                  🔥 {course.discountLimit - verifiedCount} Promo seats left!
                </span>
              </div>
            ) : (
              <span className="text-2xl font-extrabold text-[var(--primary)] outfit">
                {course.price === 0 ? "Free" : `Rs. ${course.price.toLocaleString()}`}
              </span>
            )}
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white px-4 py-2.5 rounded-xl transition-all duration-300 group-hover:scale-105 flex-shrink-0"
                 style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', boxShadow: '0 4px 10px -2px var(--primary)' }}>
              <Play size={12} fill="white" />
              <span>Enroll now</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
