"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useBranding } from "./BrandingProvider"
import type { CSSProperties } from "react"
import { Menu, X, User, LogIn, LogOut, LayoutDashboard } from "lucide-react"
import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { NotificationBell } from "./NotificationBell"

export const Header = () => {
  const { siteName, logoUrl } = useBranding()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { data: session } = useSession()
  const [enrolledCourses, setEnrolledCourses] = useState<{ title: string; slug: string }[]>([])
  const [profileOpen, setProfileOpen] = useState(false)

  useEffect(() => {
    if (!profileOpen) return
    const closeProfile = () => setProfileOpen(false)
    window.addEventListener("click", closeProfile)
    return () => window.removeEventListener("click", closeProfile)
  }, [profileOpen])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const close = () => setMobileOpen(false)
    window.addEventListener("resize", close)
    return () => window.removeEventListener("resize", close)
  }, [])

  useEffect(() => {
    if (session?.user) {
      const role = (session.user as any)?.role
      if (role === "ADMIN") {
        fetch("/api/courses")
          .then(res => res.json())
          .then(data => {
            if (data?.courses && data.courses.length > 0) {
              setEnrolledCourses(data.courses.map((c: any) => ({ title: c.title, slug: c.slug })))
            }
          })
          .catch(() => {})
      } else {
        fetch("/api/student/enrolled")
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data) && data.length > 0) {
              setEnrolledCourses(data.map((c: any) => ({ title: c.title, slug: c.slug })))
            } else {
              setEnrolledCourses([])
            }
          })
          .catch(() => {})
      }
    } else {
      setEnrolledCourses([])
    }
  }, [session])

  const pathname = usePathname()

  let currentCourseSlug: string | null = null
  const courseMatch = pathname?.match(/^\/courses\/([^/]+)/)
  if (courseMatch && courseMatch[1]) {
    currentCourseSlug = courseMatch[1]
  }

  const activeCourse = enrolledCourses.find(c => c.slug === currentCourseSlug) || enrolledCourses[0]

  const navLinks = [{ href: "/courses", label: "Courses" }]

  if (activeCourse) {
    navLinks.push(
      { href: `/courses/${activeCourse.slug}/learn`, label: "Videos" },
      { href: `/courses/${activeCourse.slug}/learn/mcq`, label: "MCQs" },
      { href: `/courses/${activeCourse.slug}/learn/notes`, label: "Notes" },
      { href: `/courses/${activeCourse.slug}/learn/questions`, label: "Q&As" }
    )
  }

  navLinks.push({ href: "/syllabus", label: "Syllabus" }, { href: "/blog", label: "Blog" }, { href: "/about", label: "About" })

  const isHome = pathname === "/"

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-300 border-b ${
        isScrolled
          ? "bg-white/95 dark:bg-slate-950/95 border-[var(--primary)]/15 shadow-[0_4px_24px_-4px_var(--primary-glow)]"
          : "bg-white/85 dark:bg-slate-950/80 border-slate-200/60 dark:border-slate-800/60"
      } backdrop-blur-xl`}
      style={isHome ? { "--primary": "var(--home-primary)", "--secondary": "var(--home-secondary)", "--primary-glow": "var(--home-primary-glow)" } as CSSProperties : undefined}
    >
      <div className={`container flex items-center justify-between transition-all duration-300 ${isScrolled ? "h-[60px]" : "h-[72px]"}`}>
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          {logoUrl ? (
            <img src={logoUrl} alt={siteName} className="h-9 w-auto object-contain" />
          ) : (
            <span className="text-2xl font-black outfit gradient-text tracking-tight">
              {siteName}
            </span>
          )}
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(({ href, label }) => (
            <Link
              key={label}
              href={href}
              className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:text-[var(--primary)] transition-colors whitespace-nowrap"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {session ? (
            <div className="hidden md:flex items-center gap-3">
              {(session.user as any)?.role === "ADMIN" ? (
                <Link
                  href="/lms"
                  className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-[var(--primary)] transition-colors whitespace-nowrap"
                >
                  <LayoutDashboard size={16} />
                  Admin Panel
                </Link>
              ) : (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-[var(--primary)] transition-colors whitespace-nowrap"
                >
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>
              )}

              <NotificationBell />

              <div className="w-px h-5 bg-slate-200 dark:bg-slate-800" />

              <div className="relative" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => setProfileOpen(v => !v)}
                  className="w-9 h-9 rounded-full text-white flex items-center justify-center font-extrabold text-sm shrink-0 border-2 border-[var(--primary)]/15 shadow-[0_4px_10px_var(--primary-glow)] transition-transform hover:scale-105"
                  style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))" }}
                >
                  {session.user?.name?.charAt(0).toUpperCase() || <User size={15} />}
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-[calc(100%+12px)] w-[280px] bg-white/98 dark:bg-slate-900/98 backdrop-blur-2xl border border-[var(--primary)]/15 rounded-2xl p-5 shadow-2xl z-[1010] flex flex-col gap-4 animate-fade-in">
                    <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3.5">
                      <div
                        className="w-11 h-11 rounded-full text-white flex items-center justify-center font-extrabold text-lg shrink-0"
                        style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))" }}
                      >
                        {session.user?.name?.charAt(0).toUpperCase() || <User size={18} />}
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 truncate">
                          {session.user?.name || "User"}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mb-1">
                          {session.user?.email || ""}
                        </p>
                        <span className={`inline-block text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                          (session.user as any)?.role === "ADMIN"
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                            : "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300"
                        }`}>
                          {(session.user as any)?.role || "STUDENT"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-0.5">
                      {(session.user as any)?.role === "ADMIN" ? (
                        <Link
                          href="/lms"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[var(--primary)] transition-colors"
                        >
                          <LayoutDashboard size={14} /> Admin Panel
                        </Link>
                      ) : (
                        <Link
                          href="/dashboard"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[var(--primary)] transition-colors"
                        >
                          <LayoutDashboard size={14} /> Student Dashboard
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800 pt-2.5">
                      <button
                        onClick={() => signOut()}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                      >
                        <LogOut size={14} /> Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Link href="/login" className="btn-primary hidden md:inline-flex !py-2.5 !px-5 text-sm">
              <LogIn size={15} />
              Login
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Toggle menu"
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 shrink-0 transition-colors"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/98 dark:bg-slate-950/98 backdrop-blur-xl px-6 py-4 flex flex-col gap-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800"
            >
              {label}
            </Link>
          ))}
          <div className="pt-3">
            {session ? (
              <div className="flex flex-col gap-2">
                {(session.user as any)?.role === "ADMIN" ? (
                  <Link href="/lms" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 font-semibold text-[var(--primary)]">
                    <LayoutDashboard size={16} /> Admin Panel
                  </Link>
                ) : (
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 font-semibold text-[var(--primary)]">
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                )}
                <button
                  onClick={() => { signOut(); setMobileOpen(false) }}
                  className="flex items-center gap-2 font-semibold text-red-500 hover:text-red-600"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            ) : (
              <Link href="/login" onClick={() => setMobileOpen(false)} className="btn-primary w-full justify-center">
                <LogIn size={16} /> Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
