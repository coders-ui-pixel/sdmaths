"use client"

import { useState, useEffect, startTransition } from "react"
import { Users, BookOpen, CreditCard, TrendingUp, RefreshCw } from "lucide-react"
import Link from "next/link"

interface Payment {
  id: string
  amount: number
  status: string
  user: {
    name: string | null
    email: string | null
  }
  course: {
    title: string
  }
}

interface AnalyticsData {
  totalUsers: number
  totalCourses: number
  totalRevenue: number
  pendingPayments: number
  recentPayments: Payment[]
}

interface DashboardOverviewClientProps {
  initialData: AnalyticsData
}

export default function DashboardOverviewClient({ initialData }: DashboardOverviewClientProps) {
  const [data, setData] = useState<AnalyticsData>(initialData)
  const [lastSynced, setLastSynced] = useState<string>("")
  const [isSyncing, setIsSyncing] = useState<boolean>(false)

  // Initialize timestamp on mount
  useEffect(() => {
    setLastSynced(new Date().toLocaleTimeString())
  }, [])

  useEffect(() => {
    const fetchLatestData = async () => {
      setIsSyncing(true)
      try {
        const res = await fetch("/api/admin/analytics")
        if (res.ok) {
          const latest = await res.json()
          startTransition(() => {
            setData(latest)
            setLastSynced(new Date().toLocaleTimeString())
          })
        }
      } catch (err) {
        console.error("Error polling admin analytics:", err)
      } finally {
        setIsSyncing(false)
      }
    }

    // Poll every 10 seconds
    const interval = setInterval(fetchLatestData, 10000)
    return () => clearInterval(interval)
  }, [])

  const stats = [
    { label: "Total Users", value: data.totalUsers, icon: Users, color: "blue", href: "/lms/users" },
    { label: "Total Courses", value: data.totalCourses, icon: BookOpen, color: "purple", href: "/lms/courses" },
    { label: "Total Revenue", value: `Rs. ${data.totalRevenue.toLocaleString()}`, icon: TrendingUp, color: "green", href: "/lms/payments" },
    { label: "Pending Verifications", value: data.pendingPayments, icon: CreditCard, color: "orange", href: "/lms/payments" },
  ]

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    VERIFIED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    REJECTED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  }

  return (
    <div>
      {/* Header with Live indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold outfit">Dashboard Overview</h2>
          <p className="text-slate-500">Welcome back, Admin. Here's what's happening today.</p>
        </div>
        
        {/* Real-time Status Badge */}
        <div className="flex items-center gap-3 self-start sm:self-center">
          {lastSynced && (
            <span className="text-xs text-slate-400 font-medium">
              Last synced: {lastSynced}
            </span>
          )}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-100/50 dark:border-emerald-900/30 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Live Analysis</span>
            <RefreshCw size={12} className={`text-emerald-500/70 ml-0.5 ${isSyncing ? "animate-spin text-emerald-500" : ""}`} />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map(stat => {
          const colorStyles = {
            blue: { bg: "#dbeafe", text: "#2563eb" },
            purple: { bg: "#f3e8ff", text: "#9333ea" },
            green: { bg: "#dcfce3", text: "#16a34a" },
            orange: { bg: "#ffedd5", text: "#ea580c" }
          }[stat.color] || { bg: "#e2e8f0", text: "#475569" };

          return (
            <Link key={stat.label} href={stat.href}>
              <div className="card hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: colorStyles.bg, color: colorStyles.text }}
                >
                  <stat.icon size={20} />
                </div>
                <div className="text-2xl font-bold mb-1 tracking-tight text-slate-900 dark:text-white">{stat.value}</div>
                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">{stat.label}</div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-10">
        <h3 className="text-lg font-bold outfit mb-4 flex items-center gap-2 !text-slate-800 dark:!text-slate-200">
          <TrendingUp className="text-[var(--admin-accent)]" size={20} />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/lms/branding" className="group">
            <div className="card h-full p-8 hover:scale-[1.02] hover:shadow-lg transition-all duration-300 relative overflow-hidden border border-slate-100 dark:border-slate-850 bg-white dark:bg-slate-900">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--admin-accent)]/5 rounded-bl-full transition-all group-hover:scale-110"></div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[var(--admin-accent)] flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                📸
              </div>
              <h4 className="text-xl font-bold outfit !text-slate-800 dark:!text-slate-100">Upload Payment QR</h4>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium leading-relaxed">Update your site logo, favicon, and the payment QR code for students.</p>
            </div>
          </Link>
          <Link href="/lms/courses" className="group">
            <div className="card h-full p-8 hover:scale-[1.02] hover:shadow-lg transition-all duration-300 relative overflow-hidden border border-slate-100 dark:border-slate-850 bg-white dark:bg-slate-900">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-bl-full transition-all group-hover:scale-110"></div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                📚
              </div>
              <h4 className="text-xl font-bold outfit !text-slate-800 dark:!text-slate-100">Create New Course</h4>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium leading-relaxed">Add new educational content, upload thumbnails, and set pricing.</p>
            </div>
          </Link>
          <Link href="/lms/exams" className="group">
            <div className="card h-full p-8 hover:scale-[1.02] hover:shadow-lg transition-all duration-300 relative overflow-hidden border border-slate-100 dark:border-slate-850 bg-white dark:bg-slate-900">
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-bl-full transition-all group-hover:scale-110"></div>
              <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-950/50 text-orange-600 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                📝
              </div>
              <h4 className="text-xl font-bold outfit !text-slate-800 dark:!text-slate-100">Manage MCQ Exams</h4>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium leading-relaxed">Upload questions, set time limits, and review student results.</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Payments Table */}
      <div className="card p-0 overflow-hidden bg-white dark:bg-slate-900">
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <h3 className="font-bold text-slate-800 dark:text-slate-200">Recent Payments</h3>
          <Link href="/lms/payments" className="text-sm text-[var(--admin-accent)] hover:text-[var(--admin-accent)] dark:text-blue-400 dark:hover:text-blue-300 font-semibold hover:underline">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-[var(--border)]">
              <tr>
                <th className="text-left px-6 py-3 font-semibold text-slate-500 dark:text-slate-400">Student</th>
                <th className="text-left px-6 py-3 font-semibold text-slate-500 dark:text-slate-400">Course</th>
                <th className="text-left px-6 py-3 font-semibold text-slate-500 dark:text-slate-400">Amount</th>
                <th className="text-left px-6 py-3 font-semibold text-slate-500 dark:text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {data.recentPayments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-slate-400 font-medium">
                    No recent payments found
                  </td>
                </tr>
              ) : (
                data.recentPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{p.user.name || "Unknown"}</div>
                      <div className="text-slate-400 dark:text-slate-500 text-xs font-medium">{p.user.email}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">{p.course.title}</td>
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-100">Rs. {p.amount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusColors[p.status] || "bg-slate-100 text-slate-700"}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
