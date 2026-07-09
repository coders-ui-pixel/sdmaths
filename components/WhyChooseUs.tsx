"use client"

import { motion } from "framer-motion"
import { CheckCircle, ShieldCheck, Trophy, Zap } from "lucide-react"

const features = [
  {
    icon: Trophy,
    title: "Expert Instruction",
    desc: "Learn from top-tier educators with years of experience in making math intuitive.",
    color: "blue"
  },
  {
    icon: ShieldCheck,
    title: "Proven Results",
    desc: "Join thousands of successful students who have mastered complex concepts with us.",
    color: "green"
  },
  {
    icon: Zap,
    title: "Flexible Learning",
    desc: "Study at your own pace with lifetime access to high-quality video content.",
    color: "purple"
  }
]

export function WhyChooseUs() {
  return (
    <section className="py-16 md:py-24 bg-transparent">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12 md:mb-16">
          <span className="section-eyebrow mb-4 inline-flex">Our Edge</span>
          <div className="text-3xl sm:text-4xl md:text-5xl font-black mb-4" style={{ color: 'var(--foreground)' }}>
            Why Choose Us
          </div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 dark:text-slate-400 text-base sm:text-lg max-w-2xl mx-auto"
          >
            We provide a unique learning environment that combines excellence with accessibility.
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-blue-500/5 hover:shadow-2xl transition-all flex flex-col h-full overflow-hidden min-w-0"
            >
              <div className={`w-14 h-14 bg-${f.color}-50 dark:bg-${f.color}-900/30 text-${f.color}-600 dark:text-${f.color}-400 rounded-2xl flex items-center justify-center mb-6 shrink-0`}>
                <f.icon size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 break-words" style={{ color: 'var(--foreground)' }}>{f.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed flex-grow text-sm break-words">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
