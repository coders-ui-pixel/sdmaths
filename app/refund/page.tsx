"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/Header"
import { PageHero } from "@/components/ui/PageHero"

export default function RefundPage() {
  const [email, setEmail] = useState("info@schoolofmath.com")

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
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Refund Policy" }]}
        eyebrow="Legal"
        title="Refund"
        highlight="Policy"
      />

      <div className="container max-w-4xl mx-auto px-6 -mt-12 relative z-10">
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-8 md:p-12 shadow-xl space-y-8 text-slate-600 dark:text-slate-400">

          <p className="text-sm">Last Updated: {new Date().toLocaleDateString()}</p>
          
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">1. General Refund Policy</h2>
            <p className="leading-relaxed">We want you to be completely satisfied with your learning experience. If you are not satisfied with a course you have purchased, you may request a refund within 7 days of the purchase date, provided you meet our refund criteria.</p>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">2. Refund Criteria</h2>
            <p className="leading-relaxed mb-4">To be eligible for a refund, you must meet the following conditions:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The refund request is made within 7 days of the original purchase.</li>
              <li>You have not consumed more than 20% of the course content.</li>
              <li>You have not downloaded any course materials or resources.</li>
              <li>Your account has not been suspended for violations of our Code of Conduct.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">3. How to Request a Refund</h2>
            <p className="leading-relaxed">To initiate a refund, please contact our support team at <a href={`mailto:${email}`} className="text-[var(--primary)] font-bold hover:underline">{email}</a> with your account details and the reason for your request. Our team will review your request and process eligible refunds within 5-7 business days.</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">4. Exceptional Circumstances</h2>
            <p className="leading-relaxed">In cases where technical issues on our end prevent you from accessing the course, we will issue a full refund regardless of the timeframe or consumption criteria, provided the issue cannot be resolved by our technical support team.</p>
          </div>

        </div>
      </div>
    </div>
  )
}
