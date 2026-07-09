import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import { Header } from "@/components/Header"
import { SITE_URL } from "@/lib/site"
import { generateCourseSchema, generateBreadcrumbSchema } from "@/lib/seo"
import Link from "next/link"
import { BookOpen, FileText, Lock, CheckCircle, PlayCircle } from "lucide-react"
import { EnrollButton } from "./EnrollButton"
import { CourseNotesList } from "./CourseNotesList"
import { auth } from "@/auth"

export const dynamic = "force-dynamic"

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  try {
    const courses = await prisma.course.findMany({ select: { slug: true } })
    return courses.map((c: { slug: string }) => ({ slug: c.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  let course: Awaited<ReturnType<typeof prisma.course.findUnique>> = null
  try {
    course = await prisma.course.findUnique({ where: { slug } })
  } catch {}
  
  if (!course) return { title: "Course Not Found" }

  return {
    title: course.seoTitle ? { absolute: course.seoTitle } : course.title,
    description: course.seoDescription || course.description,
    alternates: { canonical: `${SITE_URL}/courses/${slug}` },
    openGraph: {
      title: course.seoTitle || course.title,
      description: course.seoDescription || course.description,
      images: course.thumbnail ? [{ url: course.thumbnail }] : [],
    },
  }
}

async function getCourse(slug: string) {
  try {
    return await prisma.course.findUnique({
      where: { slug },
      include: {
        playlists: {
          include: {
            lessons: { orderBy: { order: "asc" } }
          },
          orderBy: { createdAt: "asc" }
        },
        notes: true,
        _count: { select: { payments: true } }
      }
    })
  } catch {
    return null
  }
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params
  const course = await getCourse(slug)
  if (!course) notFound()

  const totalLessons = course.playlists?.reduce((acc: number, p: any) => acc + (p.lessons?.length || 0), 0) || 0

  const session = await auth()
  let isSubscribed = false

  if (session?.user?.id) {
    if ((session.user as any).role === "ADMIN") {
      isSubscribed = true
    } else {
      try {
        const payment = await prisma.payment.findFirst({
          where: { 
            userId: session.user.id, 
            courseId: course.id, 
            status: "VERIFIED" 
          }
        })
        isSubscribed = !!payment
      } catch (e) {
        console.warn("DB error checking subscription")
      }
    }
  }

  // Calculate promotional pricing
  const verifiedPaymentsCount = await prisma.payment.count({
    where: { courseId: course.id, status: "VERIFIED" }
  })
  const isPromoActive = course.discountAmount > 0 && course.discountLimit > 0 && verifiedPaymentsCount < course.discountLimit
  const displayPrice = isPromoActive ? course.price - course.discountAmount : course.price

  const courseSchema = generateCourseSchema({
    title: course.title,
    description: course.description,
    price: displayPrice,
    slug: course.slug,
    thumbnail: course.thumbnail
  })

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", item: SITE_URL },
    { name: "Courses", item: `${SITE_URL}/courses` },
    { name: course.title, item: `${SITE_URL}/courses/${course.slug}` },
  ])

  return (
    <main>
      <Header />

      {/* Breadcrumb + Hero */}
      <section className="relative pt-32 pb-16 bg-slate-950 text-white overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-70" />
        <div className="container relative z-10">
          <nav className="flex items-center gap-2 text-slate-400 text-sm mb-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href="/courses" className="hover:text-white transition-colors">Courses</Link>
            <span>/</span>
            <span className="text-white font-medium">{course.title}</span>
          </nav>

          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <h1 className="text-3xl md:text-4xl font-extrabold outfit mb-4">{course.title}</h1>
              <p className="text-slate-300 text-lg mb-6">{course.description}</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
                  <BookOpen size={14} /> {totalLessons} lessons
                </span>
                <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
                  <FileText size={14} /> {course.notes.length} notes
                </span>
              </div>
            </div>

            {/* Enrollment Card */}
            <div className="bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-2xl p-6 shadow-2xl">
              {course.thumbnail && (
                <div className="aspect-video rounded-lg overflow-hidden mb-4">
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                </div>
              )}
              
              {isPromoActive ? (
                <div className="mb-4">
                  <div className="text-xs font-bold text-slate-400 dark:text-slate-300 uppercase tracking-widest ml-0.5 line-through">
                    Regular: Rs. {course.price.toLocaleString()}
                  </div>
                  <div className="text-3xl font-black text-red-600 dark:text-red-500 mb-2">
                    Rs. {displayPrice.toLocaleString()}
                  </div>
                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/20 rounded-2xl p-4 text-left">
                    <div className="text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                      🎁 Special Early Bird Offer
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 font-bold mt-1.5 leading-relaxed">
                      Save Rs. {course.discountAmount.toLocaleString()} today! Only <strong className="text-red-500">{course.discountLimit - verifiedPaymentsCount} promotional seats left</strong>!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-3xl font-extrabold text-[var(--primary)] mb-2">
                  {course.price === 0 ? "Free" : `Rs. ${course.price.toLocaleString()}`}
                </div>
              )}
              
              {isSubscribed ? (
                <div className="mb-4">
                  <div className="bg-green-100 text-green-700 p-3 rounded-lg flex items-center gap-2 mb-3 text-sm font-semibold">
                    <CheckCircle size={18} /> You are enrolled in this course
                  </div>
                  <Link href={`/courses/${course.slug}/learn`} className="btn-primary w-full text-center block py-3">
                    Go to Learning Portal
                  </Link>
                </div>
              ) : (
                <EnrollButton course={{ id: course.id, title: course.title, price: displayPrice, isFree: course.price === 0, slug: course.slug, paymentQrUrl: course.paymentQrUrl }} />
              )}
              
              <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> Full course access</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> Downloadable notes</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> Live class access</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Lessons Curriculum */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-2xl font-bold outfit mb-8">Course Curriculum</h2>
          
          <div className="max-w-3xl space-y-10">
            {/* Playlists */}
            {course.playlists.map((playlist: any) => (
              <div key={playlist.id}>
                <h3 className="text-lg font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-3">
                  <PlayCircle size={18} className="text-[var(--primary)]" />
                  {playlist.title}
                </h3>
                <div className="space-y-3">
                  {playlist.lessons.map((lesson: any, i: number) => (
                    <div key={lesson.id} className="flex items-center gap-4 p-4 border border-[var(--border)] rounded-lg hover:border-[var(--primary)] transition-colors">
                      <span className="w-8 h-8 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {i + 1}
                      </span>
                      <div className="flex-1">
                        <div className="font-medium">{lesson.title}</div>
                        {lesson.isFreeSample && (
                          <span className="text-xs font-bold text-green-600 uppercase tracking-wider">Free Sample</span>
                        )}
                      </div>
                      
                      {lesson.isFreeSample || isSubscribed ? (
                        <Link href={`/courses/${course.slug}/learn?lesson=${lesson.id}`} className="text-[var(--primary)] hover:scale-110 transition-transform">
                          <PlayCircle size={24} />
                        </Link>
                      ) : (
                        <Lock size={16} className="text-slate-400" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

          </div>

          <CourseNotesList notes={course.notes} isSubscribed={isSubscribed} slug={course.slug} />
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
    </main>
  )
}
