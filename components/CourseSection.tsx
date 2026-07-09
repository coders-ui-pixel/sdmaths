"use client"

import { motion } from "framer-motion"
import { ArrowRight, BookOpen, Clock, Users } from "lucide-react"
import Link from "next/link"

interface Course {
  id: string
  title: string
  description: string
  price: number
  slug: string
  thumbnail?: string | null
  hasVideos?: boolean
  hasMcqs?: boolean
  hasNotes?: boolean
  hasLiveClasses?: boolean
}

export function CourseSection({ courses }: { courses: Course[] }) {
  return (
    <section className="relative py-16 md:py-24 bg-white dark:bg-slate-950 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[1000px] h-[500px] bg-[var(--primary)]/[0.08] blur-[120px] rounded-full -z-10" />
      <div className="absolute -top-20 -left-20 w-[300px] h-[300px] bg-sky-400/10 blur-[100px] rounded-full -z-10" />
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <span className="section-eyebrow mb-4 inline-flex">Our Curriculum</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black outfit mb-4">Current Available Courses</h2>
          <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
            Choose from our expert-crafted courses designed to help you excel in your examinations.
          </p>
        </motion.div>

        {courses.length === 0 ? (
          <div className="max-w-lg mx-auto text-center py-16 px-8 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
            <div className="w-16 h-16 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center mx-auto mb-5">
              <BookOpen size={28} />
            </div>
            <h3 className="text-lg font-black outfit text-slate-700 dark:text-slate-200 mb-2">Courses Coming Soon</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              We're preparing our course catalog. Check back shortly to start your learning journey.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="relative bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-2xl hover:border-[var(--primary)]/40 transition-all group flex flex-col h-full"
              >
                <div className="aspect-video bg-slate-200 dark:bg-slate-700 relative shrink-0 overflow-hidden">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--primary) 15%, transparent), color-mix(in srgb, var(--secondary) 15%, transparent))" }}>
                      <BookOpen size={48} className="text-[var(--primary)]/30" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-4 py-2 rounded-xl font-bold text-[var(--primary)] shadow-sm">
                    {course.price === 0 ? "Free" : `Rs. ${course.price}`}
                  </div>
                </div>
                <div className="p-6 sm:p-8 flex flex-col flex-grow">
                  <div className="flex flex-wrap gap-2 mb-4 shrink-0">
                    {course.hasVideos && <span title="Video Lessons" className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">🎥</span>}
                    {course.hasMcqs && <span title="MCQ Exams" className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-600 flex items-center justify-center">📝</span>}
                    {course.hasNotes && <span title="PDF Notes" className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center">📚</span>}
                    {course.hasLiveClasses && <span title="Live Classes" className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center">🔴</span>}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold outfit mb-3 group-hover:text-[var(--primary)] transition-colors shrink-0">{course.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-6 line-clamp-2 text-sm flex-grow">
                    {course.description}
                  </p>
                  <Link href={`/courses/${course.slug}`} className="flex items-center justify-center gap-2 font-bold text-sm py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white border-2 border-transparent transition-all mt-auto shrink-0">
                    View Details
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
