"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/Header"
import { Mail } from "lucide-react"
import { PageHero } from "@/components/ui/PageHero"
import { generateFAQSchema } from "@/lib/seo"

const faqs = [
  {
    question: "How do I access my courses?",
    answer: "Once you log in to the Student Portal, you can access all your enrolled courses from the Dashboard. Simply click on a course to continue where you left off."
  },
  {
    question: "Are the video lectures available offline?",
    answer: "Currently, video lectures require an active internet connection to stream. However, you can download the course notes and assignments for offline study."
  },
  {
    question: "How do I ask questions if I have doubts?",
    answer: "We provide a dedicated Q&A section for each course where you can post your questions. Our expert instructors and teaching assistants monitor the forums and usually respond within 24 hours."
  },
  {
    question: "Can I change my account details?",
    answer: "Yes, you can easily update your profile information, password, and communication preferences from the Settings menu in your Dashboard."
  },
  {
    question: "What happens when a course price is set to free?",
    answer: "Free courses only require you to register with your name and phone number — you're enrolled instantly with no payment or waiting for approval."
  },
]

export default function FAQPage() {
  const [email, setEmail] = useState("info@schoolofmath.com")
  const faqSchema = generateFAQSchema(faqs.map(f => ({ question: f.question, answer: f.answer })))

  useEffect(() => {
    fetch("/api/branding")
      .then(r => r.json())
      .then(data => {
        if (data.contactEmail) setEmail(data.contactEmail)
      })
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] pb-32">
      <Header />

      <PageHero
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "FAQ" }]}
        eyebrow="Help Center"
        title="Frequently Asked"
        highlight="Questions"
        subtitle="Everything you need to know about courses, enrollment, and your student account."
      />

      <div className="container max-w-4xl mx-auto px-6 -mt-12 relative z-10">
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-8 md:p-12 shadow-xl space-y-8 text-slate-600 dark:text-slate-400">
          {faqs.map((faq, i) => (
            <div key={i}>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{faq.question}</h3>
              <p className="leading-relaxed">{faq.answer}</p>
              {i < faqs.length - 1 && <hr className="border-slate-100 dark:border-slate-800 mt-8" />}
            </div>
          ))}
        </div>

        <div
          className="mt-12 p-8 rounded-[2rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl"
          style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))", boxShadow: "0 20px 40px -8px var(--primary-glow)" }}
        >
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Mail size={24} />
            </div>
            <div>
              <h4 className="text-xl font-bold">Still have questions?</h4>
              <p className="text-white/80 text-sm">We're here to help you succeed in your math journey.</p>
            </div>
          </div>
          <a
            href={`mailto:${email}`}
            className="px-8 py-3 bg-white rounded-xl font-bold hover:scale-105 transition-transform"
            style={{ color: "var(--primary)" }}
          >
            Contact Support
          </a>
        </div>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </div>
  )
}
