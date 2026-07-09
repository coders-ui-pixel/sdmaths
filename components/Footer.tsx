"use client"

import { useState, useEffect, type CSSProperties } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Mail, MapPin, Phone, Send } from "lucide-react"
import { SITE_NAME } from "@/lib/site"

// Custom SVG Icons for Brands as Lucide removed them in recent versions
const FacebookIcon = (props: any) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
)

const InstagramIcon = (props: any) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
)

const YoutubeIcon = (props: any) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.11 1 12 1 12s0 3.89.42 5.58a2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.89 23 12 23 12s0-3.89-.42-5.58z" />
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
  </svg>
)

export function Footer() {
  const pathname = usePathname()
  const currentYear = new Date().getFullYear()
  const [branding, setBranding] = useState({
    contactEmail: "info@schoolofmath.com",
    contactPhone: "+977 98XXXXXXXX",
    logoUrl: "",
    facebookUrl: "#",
    instagramUrl: "#",
    youtubeUrl: "#",
    telegramUrl: "#"
  })

  useEffect(() => {
    fetch("/api/branding")
      .then(r => r.json())
      .then(data => {
        setBranding({
          contactEmail: data.contactEmail || "info@schoolofmath.com",
          contactPhone: data.contactPhone || "+977 98XXXXXXXX",
          logoUrl: data.logoUrl || "",
          facebookUrl: data.facebookUrl || "#",
          instagramUrl: data.instagramUrl || "#",
          youtubeUrl: data.youtubeUrl || "#",
          telegramUrl: data.telegramUrl || "#"
        })
      })
      .catch(() => {})
  }, [])

  if (pathname.startsWith('/lms') || pathname === '/login' || (pathname.startsWith('/courses/') && pathname.includes('/learn'))) {
    return null
  }

  const socialLinks = [
    { icon: FacebookIcon, href: branding.facebookUrl, color: "hover:bg-blue-600" },
    { icon: InstagramIcon, href: branding.instagramUrl, color: "hover:bg-pink-600" },
    { icon: YoutubeIcon, href: branding.youtubeUrl, color: "hover:bg-red-600" },
    { icon: Send, href: branding.telegramUrl, color: "hover:bg-sky-500" }
  ]

  return (
    <footer
      className="relative bg-[#020617] text-slate-300 pt-24 pb-12 overflow-hidden border-t border-slate-800/50"
      style={pathname === "/" ? { "--primary": "var(--home-primary)", "--secondary": "var(--home-secondary)", "--primary-glow": "var(--home-primary-glow)" } as CSSProperties : undefined}
    >
      {/* Background Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--primary)]/50 to-transparent" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[var(--primary)]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-[350px] h-[350px] bg-[var(--secondary)]/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="container max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">

          {/* Brand & About */}
          <div className="space-y-8">
            <Link href="/" className="text-3xl font-black outfit text-white flex items-center gap-3">
              {branding.logoUrl ? (
                <img src={branding.logoUrl} alt={SITE_NAME} className="h-10 w-auto object-contain" />
              ) : (
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xl shadow-lg"
                  style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))", boxShadow: "0 8px 20px -4px var(--primary-glow)" }}
                >
                  ∑
                </div>
              )}
              {SITE_NAME}
            </Link>
            <p className="text-base leading-relaxed text-slate-400 font-medium">
              Empowering minds through the beautiful and universal language of mathematics. Join our community of passionate learners today.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-12 h-12 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-center justify-center transition-all duration-300 text-slate-400 hover:text-white hover:-translate-y-1 ${social.color} shadow-sm`}
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-black outfit text-xl mb-8 uppercase tracking-widest text-sm">Explore</h3>
            <ul className="space-y-5 text-base font-semibold">
              <li><Link href="/" className="hover:text-[var(--primary)] transition-colors flex items-center gap-3 group"><span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] transform scale-0 group-hover:scale-100 transition-transform" /> Home</Link></li>
              <li><Link href="/courses" className="hover:text-[var(--primary)] transition-colors flex items-center gap-3 group"><span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] transform scale-0 group-hover:scale-100 transition-transform" /> Our Courses</Link></li>
              <li><Link href="/blog" className="hover:text-[var(--primary)] transition-colors flex items-center gap-3 group"><span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] transform scale-0 group-hover:scale-100 transition-transform" /> Math Blog</Link></li>
              <li><Link href="/about" className="hover:text-[var(--primary)] transition-colors flex items-center gap-3 group"><span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] transform scale-0 group-hover:scale-100 transition-transform" /> About Us</Link></li>
              <li><Link href="/login" className="hover:text-[var(--primary)] transition-colors flex items-center gap-3 group"><span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] transform scale-0 group-hover:scale-100 transition-transform" /> Student Portal</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-black outfit text-xl mb-8 uppercase tracking-widest text-sm">Support</h3>
            <ul className="space-y-5 text-base font-semibold">
              <li><Link href="/faq" className="hover:text-[var(--primary)] transition-colors">FAQ & Help Center</Link></li>
              <li><Link href="/terms" className="hover:text-[var(--primary)] transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-[var(--primary)] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/refund" className="hover:text-[var(--primary)] transition-colors">Refund Policy</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="bg-slate-900/30 p-8 rounded-[2.5rem] border border-slate-800/50">
            <h3 className="text-white font-black outfit text-xl mb-8 uppercase tracking-widest text-sm">Contact Us</h3>
            <ul className="space-y-6 text-sm">
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center shrink-0">
                  <MapPin size={20} />
                </div>
                <span className="text-slate-400 font-medium leading-relaxed">Kathmandu, Bagmati Province, Nepal</span>
              </li>
              <li className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center shrink-0">
                  <Phone size={20} />
                </div>
                <a href={`tel:${branding.contactPhone}`} className="text-slate-400 hover:text-[var(--primary)] transition-colors font-medium">{branding.contactPhone}</a>
              </li>
              <li className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center shrink-0">
                  <Mail size={20} />
                </div>
                <a href={`mailto:${branding.contactEmail}`} className="text-slate-400 hover:text-[var(--primary)] transition-colors font-medium break-all">{branding.contactEmail}</a>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-12 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 text-center md:text-left">
          <p className="break-words">© {currentYear} {SITE_NAME}. All rights reserved.</p>
          <div className="flex flex-wrap justify-center md:justify-end items-center gap-4 md:gap-8">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <p className="text-[var(--primary)]/60">Designed for Excellence</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
