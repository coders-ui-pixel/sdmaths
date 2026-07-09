"use client"

import { motion } from "framer-motion"
import { Target, Lightbulb, BarChart, MessageSquare, Repeat, Award } from "lucide-react"

const points = [
  {
    icon: Lightbulb,
    title: "Conceptual Clarity",
    desc: "We focus on deep understanding rather than rote memorization, ensuring you grasp the 'why' behind every formula.",
    color: "blue"
  },
  {
    icon: Target,
    title: "Personalized Focus",
    desc: "Our teaching adapts to your learning pace, making even the most complex topics accessible and engaging.",
    color: "green"
  },
  {
    icon: Repeat,
    title: "Interactive Practice",
    desc: "Engage with real-world problems and interactive MCQ sessions to reinforce your learning continuously.",
    color: "purple"
  },
  {
    icon: MessageSquare,
    title: "Doubt Resolution",
    desc: "Get your questions answered by experts through our dedicated support channels and community forums.",
    color: "orange"
  },
  {
    icon: BarChart,
    title: "Progress Tracking",
    desc: "Monitor your growth with detailed analytics and regular assessments designed to highlight your strengths.",
    color: "indigo"
  },
  {
    icon: Award,
    title: "Excellence Guaranteed",
    desc: "Our structured methodology is proven to build confidence and deliver outstanding academic results.",
    color: "pink"
  }
]

export function OurApproach() {
  return (
    <section className="relative py-16 md:py-24 bg-gradient-to-b from-white via-[var(--secondary)]/[0.04] to-white dark:from-[#020617] dark:via-[var(--secondary)]/[0.05] dark:to-[#020617] overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--secondary)]/[0.06] blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3 -z-10" />
      <div className="container mx-auto px-6">
        <div className="text-center mb-14 md:mb-20">
          <span className="section-eyebrow mb-4 inline-flex">Methodology</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6 text-black dark:text-white" style={{ opacity: 1, color: 'var(--foreground)' }}>
            Our Approach
          </h2>
          <div className="h-2 w-16 rounded-full mx-auto" style={{ background: "linear-gradient(90deg, var(--primary), var(--secondary))" }} />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {points.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -12, scale: 1.02 }}
              className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-[var(--primary)]/10 transition-all duration-500 group flex flex-col h-full overflow-hidden min-w-0"
            >
              <div className="w-14 h-14 bg-[var(--primary)]/10 text-[var(--primary)] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[var(--primary)] group-hover:text-white transition-all duration-500 shadow-inner shrink-0">
                <p.icon size={28} />
              </div>
              
              <h3 className="text-xl font-bold mb-3 break-words" style={{ color: 'var(--foreground)' }}>
                {p.title}
              </h3>
              
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed flex-grow text-sm break-words">
                {p.desc}
              </p>
              
              <div className="mt-6 h-1 w-12 bg-slate-100 dark:bg-slate-800 rounded-full group-hover:w-20 group-hover:bg-[var(--primary)] transition-all duration-500 shrink-0" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
