"use client"

import { useState, useEffect, startTransition } from "react"
import { BarChart3, TrendingUp, Users, CreditCard, RefreshCw } from "lucide-react"

interface PopularCourse {
  name: string
  sales: number
}

interface AnalyticsData {
  totalStudents: number
  studentGrowthPercent: number
  totalRevenue: number
  revenueGrowthPercent: number
  avgCompletion: number
  newEnrollmentsToday: number
  finalHeights: number[]
  finalPopularCourses: PopularCourse[]
}

interface AnalyticsClientProps {
  initialData: AnalyticsData
}

export default function AnalyticsClient({ initialData }: AnalyticsClientProps) {
  const [data, setData] = useState<AnalyticsData>(initialData)
  const [lastSynced, setLastSynced] = useState<string>("")
  const [isSyncing, setIsSyncing] = useState<boolean>(false)

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
            setData({
              totalStudents: latest.totalStudents,
              studentGrowthPercent: latest.studentGrowthPercent,
              totalRevenue: latest.totalRevenue,
              revenueGrowthPercent: latest.revenueGrowthPercent,
              avgCompletion: latest.avgCompletion,
              newEnrollmentsToday: latest.newEnrollmentsToday,
              finalHeights: latest.finalHeights,
              finalPopularCourses: latest.finalPopularCourses
            })
            setLastSynced(new Date().toLocaleTimeString())
          })
        }
      } catch (err) {
        console.error("Error polling platform analytics:", err)
      } finally {
        setIsSyncing(false)
      }
    }

    // Poll every 10 seconds
    const interval = setInterval(fetchLatestData, 10000)
    return () => clearInterval(interval)
  }, [])

  const formattedRevenue = data.totalRevenue >= 1000 
    ? `Rs. ${(data.totalRevenue / 1000).toFixed(1)}k` 
    : `Rs. ${data.totalRevenue}`

  const finalMaxSales = Math.max(...data.finalPopularCourses.map(c => c.sales), 1)
  const colors = ["bg-[var(--admin-accent)]", "bg-purple-500", "bg-orange-500", "bg-green-500"]

  return (
    <div>
      {/* Header with Live Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold outfit">Platform Analytics</h2>
          <p className="text-slate-500 mt-1">Detailed insights into your platform's performance and growth.</p>
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
            <span>Live Monitoring</span>
            <RefreshCw size={12} className={`text-emerald-500/70 ml-0.5 ${isSyncing ? "animate-spin text-emerald-500" : ""}`} />
          </div>
        </div>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Active Students */}
        <div className="card bg-white dark:bg-slate-900 border-[var(--border)] relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#dbeafe", color: "#2563eb" }}><Users size={24} /></div>
            <span className="text-xs px-2.5 py-1 rounded-full font-bold" style={{ backgroundColor: "#dbeafe", color: "#1e3a8a" }}>+{data.studentGrowthPercent}% MoM</span>
          </div>
          <h3 className="text-3xl font-bold mb-1 tracking-tight text-slate-900 dark:text-white">{data.totalStudents.toLocaleString()}</h3>
          <p className="font-medium text-sm text-slate-600 dark:text-slate-400">Total Active Students</p>
        </div>

        {/* Total Revenue */}
        <div className="card bg-white dark:bg-slate-900 border-[var(--border)] relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#f3e8ff", color: "#9333ea" }}><CreditCard size={24} /></div>
            <span className="text-xs px-2.5 py-1 rounded-full font-bold" style={{ backgroundColor: "#f3e8ff", color: "#581c87" }}>+{data.revenueGrowthPercent}% MoM</span>
          </div>
          <h3 className="text-3xl font-bold mb-1 tracking-tight text-slate-900 dark:text-white">{formattedRevenue}</h3>
          <p className="font-medium text-sm text-slate-600 dark:text-slate-400">Total Revenue Generated</p>
        </div>

        {/* Average Course Completion */}
        <div className="card bg-white dark:bg-slate-900 border-[var(--border)] relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#ffedd5", color: "#ea580c" }}><TrendingUp size={24} /></div>
            <span className="text-xs px-2.5 py-1 rounded-full font-bold" style={{ backgroundColor: "#ffedd5", color: "#7c2d12" }}>Progress Rate</span>
          </div>
          <h3 className="text-3xl font-bold mb-1 tracking-tight text-slate-900 dark:text-white">{data.avgCompletion}%</h3>
          <p className="font-medium text-sm text-slate-600 dark:text-slate-400">Average Course Completion</p>
        </div>

        {/* New Enrollments Today */}
        <div className="card bg-white dark:bg-slate-900 border-[var(--border)] relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#dcfce3", color: "#16a34a" }}><BarChart3 size={24} /></div>
            <span className="text-xs px-2.5 py-1 rounded-full font-bold" style={{ backgroundColor: "#dcfce3", color: "#064e3b" }}>Today</span>
          </div>
          <h3 className="text-3xl font-bold mb-1 tracking-tight text-slate-900 dark:text-white">{data.newEnrollmentsToday}</h3>
          <p className="font-medium text-sm text-slate-600 dark:text-slate-400">New Enrollments Today</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 card bg-white dark:bg-slate-900 border-[var(--border)]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">Revenue Overview</h3>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Verified Income (Monthly)</span>
          </div>
          {data.finalHeights.every(h => h === 0) ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-850 rounded-lg px-4 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="text-3xl mb-2">📊</div>
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">No revenue recorded yet</div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 max-w-[240px]">Verified student payments will automatically compile into monthly revenue bars here.</p>
            </div>
          ) : (
            <div className="h-64 flex items-end justify-between gap-2.5 pt-2">
              {data.finalHeights.map((height, i) => (
                <div key={i} className="w-full bg-blue-50 dark:bg-blue-950/20 rounded-t-lg relative group transition-all duration-300" style={{ height: `100%` }}>
                  <div 
                    className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[var(--admin-accent)] to-[var(--admin-accent)] rounded-t-lg transition-all duration-500 shadow-lg shadow-[var(--admin-accent)]/10 group-hover:brightness-110" 
                    style={{ height: `${height}%` }} 
                  />
                  {/* Tooltip on Hover */}
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded shadow pointer-events-none transition-all duration-200 font-bold whitespace-nowrap z-20">
                    {height}%
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-500 mt-4 font-semibold uppercase tracking-wider px-1">
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
            <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
          </div>
        </div>

        {/* Popular Courses */}
        <div className="card bg-white dark:bg-slate-900 border-[var(--border)]">
          <h3 className="font-bold text-lg mb-6 text-slate-800 dark:text-slate-200">Popular Courses</h3>
          <div className="space-y-6">
            {data.finalPopularCourses.length === 0 || data.finalPopularCourses.every(c => c.sales === 0) ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                <div className="text-3xl mb-2">📚</div>
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">No popular courses yet</div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 max-w-[180px]">Add courses and verify purchases to view sales charts here.</p>
              </div>
            ) : (
              data.finalPopularCourses.map((course, i) => (
                <div key={i} className="group">
                  <div className="flex justify-between text-sm mb-2 font-medium">
                    <span className="truncate pr-3 max-w-[200px] text-slate-700 dark:text-slate-300 font-semibold group-hover:text-[var(--admin-accent)] transition-colors">{course.name}</span>
                    <span className="text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap font-bold">{course.sales} Students</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${colors[i % colors.length]} rounded-full transition-all duration-1000 ease-out`} 
                      style={{ width: `${(course.sales / finalMaxSales) * 100}%` }} 
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
