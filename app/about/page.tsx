"use client"

import { Header } from "@/components/Header"
import { Send, CheckCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { SITE_NAME } from "@/lib/site"

export default function AboutPage() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [aboutImage, setAboutImage] = useState("/images/sunil.jpg")

  useEffect(() => {
    fetch("/api/branding")
      .then(res => res.json())
      .then(data => {
        if (data?.aboutImageUrl) {
          setAboutImage(data.aboutImageUrl)
        }
      })
      .catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      
      if (!res.ok) throw new Error("Failed to send message")
      
      setSuccess(true)
      setFormData({ name: "", email: "", phone: "", message: "" })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 gradient-mesh opacity-70" />
        <div className="absolute top-0 right-0 -z-10 w-[400px] h-[400px] bg-[var(--primary)] opacity-20 blur-[100px] rounded-full translate-x-1/2" />

        <div className="container text-center relative z-10">
          <span className="section-eyebrow mb-4 inline-flex">Our Story</span>
          <h1 className="text-4xl md:text-6xl font-extrabold outfit leading-tight mb-6">
            About <span className="gradient-text">Us</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
            Empowering minds through the beautiful and universal language of mathematics.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="container max-w-6xl">
          
          {/* Introduction Section: Image & Text Side-by-Side */}
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes wave {
              0% { transform: rotate(0.0deg) }
              10% { transform: rotate(14.0deg) }
              20% { transform: rotate(-8.0deg) }
              30% { transform: rotate(14.0deg) }
              40% { transform: rotate(-4.0deg) }
              50% { transform: rotate(10.0deg) }
              60% { transform: rotate(0.0deg) }
              100% { transform: rotate(0.0deg) }
            }
            .animate-wave {
              animation: wave 2.5s infinite;
              transform-origin: 70% 70%;
              display: inline-block;
            }
          `}} />
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center mb-24">
            
            {/* Text Side (Left) */}
            <div className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-lg md:text-xl leading-relaxed font-medium">
              <h2 className="text-4xl md:text-5xl font-extrabold outfit text-slate-900 dark:text-white flex items-center gap-3 mb-8 tracking-tight">
                Namaste <span className="animate-wave">🙏</span>
              </h2>
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                I am Suni Duwadi, the proud owner and lead instructor of {SITE_NAME}. My journey with numbers began years ago, driven by a profound belief that mathematics is not just about solving equations on a whiteboard—it's a fundamental way of understanding the universe around us.
              </p>
              <p>
                I established this platform with a clear mission: to demystify complex mathematical concepts and make high-quality, advanced education accessible to students everywhere. Whether you are struggling with the basics of algebra or diving deep into the beautiful intricacies of abstract calculus, my goal is to guide you step-by-step.
              </p>
              <p>
                I believe in a teaching philosophy that prioritizes deep conceptual understanding over rote memorization. Through my curated courses, comprehensive notes, and interactive practice exams, I strive to build a community of learners who are confident, analytical, and ready to tackle any academic challenge.
              </p>
              <div className="p-6 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border-l-4 border-[var(--primary)] mt-8">
                <p className="font-bold text-slate-900 dark:text-white text-xl md:text-2xl m-0 tracking-tight leading-snug">
                  Welcome to our digital classroom. Let's conquer mathematics together!
                </p>
              </div>
            </div>

            {/* Image Side (Right) */}
            <div className="w-full h-full flex justify-end">
              <div className="w-full max-w-md aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl relative ring-4 ring-white dark:ring-slate-800">
                <img 
                  src={aboutImage} 
                  alt="Suni Duwadi" 
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white transform transition-transform">
                  <h3 className="text-3xl font-extrabold outfit tracking-wide">Suni Duwadi</h3>
                  <p className="text-[var(--primary)] font-semibold text-lg tracking-wider uppercase mt-1" style={{ filter: "brightness(1.4)" }}>Founder & Lead Instructor</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form Section */}
          <div className="max-w-4xl mx-auto mb-24">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-14 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-slate-800 relative overflow-hidden">
              {/* Decorative blob */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary)] opacity-5 blur-[80px] rounded-full mix-blend-multiply dark:mix-blend-screen pointer-events-none" />

              <div className="mb-10 text-center relative z-10">
                <h3 className="text-3xl md:text-4xl font-extrabold outfit mb-4 tracking-tight">Get in Touch</h3>
                <p className="text-slate-500 text-lg">Have questions about our courses or need academic guidance? Drop a message.</p>
              </div>

              {success ? (
                <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 p-10 rounded-3xl text-center border border-green-200 dark:border-green-800 relative z-10">
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <CheckCircle size={40} />
                  </div>
                  <h4 className="text-2xl font-bold mb-3 outfit">Message Sent Successfully!</h4>
                  <p className="mb-8 text-lg">Thank you for reaching out. I will get back to you as soon as possible.</p>
                  <button onClick={() => setSuccess(false)} className="px-6 py-3 bg-white dark:bg-slate-800 rounded-xl text-sm font-bold text-green-600 dark:text-green-400 hover:shadow-md transition-all border border-green-200 dark:border-green-800">
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Your Name <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        required
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:outline-none focus:border-[var(--primary)] focus:bg-white dark:focus:bg-slate-800 transition-all font-medium placeholder-slate-400"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Email Address <span className="text-red-500">*</span></label>
                      <input 
                        type="email" 
                        required
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:outline-none focus:border-[var(--primary)] focus:bg-white dark:focus:bg-slate-800 transition-all font-medium placeholder-slate-400"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Phone Number <span className="text-slate-400 font-normal normal-case tracking-normal">(Optional)</span></label>
                    <input 
                      type="tel" 
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:outline-none focus:border-[var(--primary)] focus:bg-white dark:focus:bg-slate-800 transition-all font-medium placeholder-slate-400"
                      placeholder="+977 98XXXXXXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Your Message <span className="text-red-500">*</span></label>
                    <textarea 
                      required
                      rows={5}
                      value={formData.message}
                      onChange={e => setFormData({...formData, message: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:outline-none focus:border-[var(--primary)] focus:bg-white dark:focus:bg-slate-800 transition-all font-medium placeholder-slate-400 resize-none"
                      placeholder="How can we help you?"
                    />
                  </div>

                  {error && <p className="text-red-500 text-sm font-bold bg-red-50 p-4 rounded-xl border border-red-100">{error}</p>}

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="btn-primary w-full py-5 rounded-2xl text-lg font-bold flex justify-center items-center gap-3 group shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                  >
                    {loading ? "Sending securely..." : "Send Message"}
                    <Send size={20} className="group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-300" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section added below */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
        <div className="container max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold outfit mb-4">Our Core <span className="gradient-text">Values</span></h2>
            <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">The principles that guide our teaching and shape our community.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700 hover:bg-slate-800 transition-colors">
              <div className="w-14 h-14 bg-[var(--primary)]/20 text-[var(--primary)] rounded-2xl flex items-center justify-center mb-6" style={{ filter: "brightness(1.3)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m16 10-4 4-4-4"/></svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 outfit">Accessibility</h3>
              <p className="text-slate-400 leading-relaxed">Making advanced mathematical concepts easy to understand for everyone, regardless of their starting point.</p>
            </div>
            
            <div className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700 hover:bg-slate-800 transition-colors">
              <div className="w-14 h-14 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 outfit">Excellence</h3>
              <p className="text-slate-400 leading-relaxed">Maintaining the highest academic standards in all our curriculum, notes, and practice examinations.</p>
            </div>
            
            <div className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700 hover:bg-slate-800 transition-colors">
              <div className="w-14 h-14 bg-green-500/20 text-green-400 rounded-2xl flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 outfit">Community</h3>
              <p className="text-slate-400 leading-relaxed">Fostering a supportive network of passionate students and expert educators helping each other grow.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
