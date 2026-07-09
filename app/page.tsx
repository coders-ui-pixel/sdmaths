import { Header } from "@/components/Header"
import { ArrowRight, Users, BookOpen, PlayCircle, GraduationCap, Video, ClipboardCheck, FileText, Radio } from "lucide-react"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { CourseSection } from "@/components/CourseSection"
import { WhyChooseUs } from "@/components/WhyChooseUs"
import { OurApproach } from "@/components/OurApproach"
import { getBranding } from "@/lib/branding"
import { FeaturedVideoSection } from "@/components/FeaturedVideoSection"
import { FreeMCQSection } from "@/components/FreeMCQSection"
import { HeroVisual } from "@/components/HeroVisual"
import { auth } from "@/auth"
import { generateOrganizationSchema } from "@/lib/seo"
import type { CSSProperties } from "react"

export const dynamic = "force-dynamic"

export default async function Home() {
  const [courses, branding, dbFeaturedVideos, sampleLessons, session, freeExams] = await Promise.all([
    prisma.course.findMany({ take: 3 }).catch(() => []),
    getBranding(),
    prisma.featuredVideo.findMany({ orderBy: { order: "asc" } }).catch(() => []),
    prisma.lesson.findMany({
      where: { isFreeSample: true },
      include: {
        playlist: {
          include: {
            courses: {
              select: {
                thumbnail: true
              }
            }
          }
        }
      },
      take: 6
    }).catch(() => []),
    auth(),
    prisma.mCQExam.findMany({
      where: { isFree: true, isFeaturedOnHome: true },
      take: 3,
      include: {
        courses: { select: { title: true, slug: true } },
        _count: { select: { questions: true } }
      }
    }).catch(() => []),
  ])

  const mappedSampleVideos = sampleLessons.map((l: any) => ({
    id: l.id,
    title: l.title,
    videoUrl: l.videoUrl,
    thumbnailUrl: l.playlist?.courses?.[0]?.thumbnail || null
  }))

  const featuredVideos = dbFeaturedVideos.length > 0 ? dbFeaturedVideos : mappedSampleVideos

  const organizationSchema = generateOrganizationSchema()

  // Fixed marketing figures — intentionally not tied to live DB counts.
  const stats = [
    { label: "Students Enrolled", value: 500, icon: Users },
    { label: "Courses", value: 7, icon: BookOpen },
    { label: "Video Lessons", value: 150, icon: PlayCircle },
    { label: "MCQ Exams", value: 70, icon: GraduationCap },
  ]

  const highlights = [
    { label: "Live Classes", icon: Radio, color: "bg-red-50 text-red-600" },
    { label: "HD Video Lectures", icon: Video, color: "bg-blue-50 text-blue-600" },
    { label: "MCQ Practice Tests", icon: ClipboardCheck, color: "bg-emerald-50 text-emerald-600" },
    { label: "Downloadable Notes", icon: FileText, color: "bg-purple-50 text-purple-600" },
  ]

  return (
    <main
      className="overflow-hidden scroll-smooth flex flex-col bg-white dark:bg-slate-950"
      style={{ "--primary": "var(--home-primary)", "--secondary": "var(--home-secondary)", "--primary-glow": "var(--home-primary-glow)" } as CSSProperties}
    >
      <Header />

      {/* ============ HERO — bright, bold, conversion-first ============ */}
      <section className="relative pt-20 sm:pt-24 md:pt-28 pb-16 sm:pb-20 md:pb-24 overflow-hidden bg-gradient-to-b from-amber-50 via-orange-50/40 to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-950">
        <div className="absolute inset-0 -z-10 opacity-[0.5] dark:opacity-[0.15]" style={{ backgroundImage: "radial-gradient(rgba(0,0,0,0.06) 1.5px, transparent 1.5px)", backgroundSize: "26px 26px" }} />
        <div className="absolute top-[-15%] right-[-8%] w-[550px] h-[550px] bg-[var(--primary)]/30 blur-[110px] rounded-full -z-10" />
        <div className="absolute top-[20%] left-[-10%] w-[350px] h-[350px] bg-sky-400/20 blur-[100px] rounded-full -z-10" />
        <div className="absolute bottom-[-15%] left-[10%] w-[400px] h-[400px] bg-pink-400/15 blur-[110px] rounded-full -z-10" />
        <div className="absolute bottom-[-10%] right-[15%] w-[300px] h-[300px] bg-[var(--secondary)]/10 blur-[100px] rounded-full -z-10" />

        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-14 lg:gap-10 items-center">

            {/* Left: copy */}
            <div className="animate-fade-in">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black outfit leading-[1.05] mb-6 tracking-tight text-slate-900 dark:text-white">
                {branding.heroHeadline}{" "}
                <span className="relative inline-block whitespace-nowrap">
                  <span className="absolute inset-x-0 bottom-1 sm:bottom-2 h-3 sm:h-4 -z-10" style={{ backgroundColor: "var(--primary)", opacity: 0.5 }} />
                  {branding.heroHighlight}
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed max-w-xl font-medium">
                {branding.heroSubtitle}
              </p>

              <div className="flex flex-wrap gap-3 mb-8">
                {highlights.map((h, i) => (
                  <span key={i} className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs sm:text-sm font-bold ${h.color} dark:bg-white/5 dark:text-slate-300`}>
                    <h.icon size={14} /> {h.label}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 mb-10">
                {session ? (
                  <Link
                    href={(session.user as any)?.role === "ADMIN" ? "http://lms.sdmaths.com" : "/dashboard"}
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-black text-base text-slate-900 shadow-[0_8px_0_0_rgba(0,0,0,0.15)] hover:shadow-[0_4px_0_0_rgba(0,0,0,0.15)] hover:translate-y-1 transition-all"
                    style={{ backgroundColor: "var(--primary)" }}
                  >
                    Go to Dashboard <ArrowRight size={20} />
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/courses"
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-black text-base text-slate-900 shadow-[0_8px_0_0_rgba(0,0,0,0.15)] hover:shadow-[0_4px_0_0_rgba(0,0,0,0.15)] hover:translate-y-1 transition-all"
                      style={{ backgroundColor: "var(--primary)" }}
                    >
                      Explore Courses <ArrowRight size={20} />
                    </Link>
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-black text-base border-2 border-slate-900 dark:border-white text-slate-900 dark:text-white hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-colors"
                    >
                      Student Login
                    </Link>
                  </>
                )}
              </div>

              {/* Trust stats row */}
              <div className="flex flex-wrap gap-x-8 gap-y-3">
                {stats.slice(0, 3).map((stat, i) => (
                  <div key={i} className="flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-black outfit text-slate-900 dark:text-white">{stat.value}+</span>
                    <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: hero photo (falls back to a mockup card if the image is missing) */}
            <HeroVisual />
          </div>
        </div>

        {/* Wave divider into the stats band */}
        <svg className="absolute bottom-0 left-0 w-full h-16 md:h-24" viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path d="M0,40 C240,90 480,0 720,30 C960,60 1200,90 1440,40 L1440,100 L0,100 Z" fill="var(--secondary)" />
        </svg>
      </section>

      {/* ============ STATS STRIP — bold colored band ============ */}
      <section className="relative py-12 overflow-hidden" style={{ backgroundColor: "var(--secondary)" }}>
        <div className="absolute top-0 left-1/4 w-[300px] h-[300px] rounded-full -translate-y-1/2 -z-0" style={{ backgroundColor: "var(--primary)", opacity: 0.15 }} />
        <div className="absolute bottom-0 right-1/4 w-[250px] h-[250px] rounded-full translate-y-1/2 -z-0" style={{ backgroundColor: "var(--primary)", opacity: 0.1 }} />
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="flex items-center gap-3 justify-center md:justify-start">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 text-slate-900 shadow-lg" style={{ backgroundColor: "var(--primary)" }}>
                  <stat.icon size={20} />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black outfit text-white">{stat.value}+</div>
                  <div className="text-[10px] sm:text-xs font-bold text-white/60 uppercase tracking-wide">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Course Section */}
      <CourseSection courses={courses} />

      {/* Featured Videos Section */}
      <FeaturedVideoSection videos={featuredVideos} />

      {/* Free MCQ Practice Section */}
      <FreeMCQSection exams={freeExams} />

      <div className="relative overflow-hidden bg-gradient-to-br from-amber-50/60 via-slate-50 to-sky-50/50 dark:from-slate-900/40 dark:via-slate-900/20 dark:to-slate-900/40 py-10">
        <div className="absolute top-0 right-0 w-[350px] h-[350px] bg-[var(--primary)]/10 blur-[100px] rounded-full -z-0" />
        <WhyChooseUs />
      </div>

      <OurApproach />

      {/* Final CTA Band */}
      <section className="container py-16">
        <div className="relative overflow-hidden rounded-[2.5rem] md:rounded-[3rem] px-6 sm:px-10 md:px-16 py-16 md:py-20 text-center" style={{ backgroundColor: "var(--secondary)" }}>
          <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full translate-x-1/3 -translate-y-1/3" style={{ backgroundColor: "var(--primary)", opacity: 0.15 }} />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full -translate-x-1/3 translate-y-1/3" style={{ backgroundColor: "var(--primary)", opacity: 0.1 }} />
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black outfit mb-5 leading-tight text-white">
              Ready to master mathematics?
            </h2>
            <p className="text-base sm:text-lg text-white/70 mb-10 leading-relaxed">
              Join students across Nepal learning with live classes, HD video lectures, and expert-designed MCQ practice.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/courses"
                className="px-8 sm:px-10 py-4 sm:py-5 rounded-full font-black text-base sm:text-lg text-slate-900 shadow-xl hover:scale-105 transition-transform inline-flex items-center gap-2"
                style={{ backgroundColor: "var(--primary)" }}
              >
                Browse Courses <ArrowRight size={20} />
              </Link>
              <Link href="/register" className="px-8 sm:px-10 py-4 sm:py-5 border-2 border-white/30 hover:border-white/60 rounded-full font-black text-base sm:text-lg text-white transition-colors">
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
    </main>
  )
}
