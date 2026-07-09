"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  LayoutDashboard, Users, BookOpen, CreditCard,
  Settings, BarChart3, Menu, X, LogOut, Palette, Mail, Play, ListChecks, Bell, Loader2, Newspaper, KeyRound, Database,
  BookMarked, Radio, GraduationCap, Megaphone, FileText
} from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { SITE_NAME } from "@/lib/site"
import { ThemeToggle } from "@/components/ThemeToggle"

const navItems = [
  { href: "/lms", label: "Overview", icon: LayoutDashboard },
  { href: "/lms/courses", label: "Courses", icon: BookOpen },
  { href: "/lms/classroom", label: "Classroom", icon: Users },
  { href: "/lms/payments", label: "Payments", icon: CreditCard },
  { href: "/lms/users", label: "Users", icon: Users },
  { href: "/lms/exams", label: "MCQ Exams", icon: ListChecks },
  { href: "/lms/live-exams", label: "Live Exams", icon: Radio },
  { href: "/lms/question-bank", label: "Question Bank", icon: Database },
  { href: "/lms/subjects", label: "Subjects", icon: BookMarked },
  { href: "/lms/playlists", label: "Video Playlists", icon: Play },
  { href: "/lms/notes", label: "Notes", icon: FileText },
  { href: "/lms/syllabus", label: "Syllabus", icon: GraduationCap },
  { href: "/lms/popup-notice", label: "Popup Notice", icon: Megaphone },
  { href: "/lms/notifications", label: "Notifications", icon: Bell },
  { href: "/lms/blogs", label: "Blogs", icon: Newspaper },
  { href: "/lms/branding", label: "Branding", icon: Palette },
  { href: "/lms/featured-videos", label: "Featured Videos", icon: Play },
  { href: "/lms/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/lms/messages", label: "Messages", icon: Mail },
  { href: "/lms/reset-requests", label: "Password Resets", icon: KeyRound },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (pathname.includes("/login")) return

    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated" && (session?.user as any)?.role !== "ADMIN") {
      router.push("/")
    }
  }, [status, session, router, pathname])

  if (status === "loading" || (status === "authenticated" && (session?.user as any)?.role !== "ADMIN")) {
    return <div className="h-screen flex items-center justify-center bg-slate-900 text-white"><Loader2 className="animate-spin" /></div>
  }

  if (status === "unauthenticated" && pathname.includes("/login")) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col
        transform transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="p-6 border-b border-slate-800">
          <Link href="/lms" className="text-xl font-bold outfit admin-gradient-text">
            {SITE_NAME} Admin
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.href === "/lms" ? pathname === "/lms" : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                  isActive
                    ? "text-white bg-white/10 shadow-inner"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
                style={isActive ? { borderLeft: "3px solid var(--admin-accent)" } : undefined}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white transition-colors text-sm">
            <LogOut size={16} /> Back to Site
          </Link>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-slate-100 rounded-lg">
            <Menu size={20} />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-slate-800 dark:text-slate-200">{SITE_NAME} — Management</h1>
          </div>
          <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
             <ThemeToggle />
             <div
               className="w-8 h-8 rounded-full flex items-center justify-center text-white"
               style={{ background: "linear-gradient(135deg, var(--admin-accent), var(--admin-accent-2))" }}
             >
                {session?.user?.name?.charAt(0) || "A"}
             </div>
             <span className="hidden sm:inline">{session?.user?.email}</span>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
