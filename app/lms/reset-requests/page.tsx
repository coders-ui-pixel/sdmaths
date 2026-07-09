"use client"

import { useState, useEffect, useCallback } from "react"
import { KeyRound, Search, Trash2, Lock, RefreshCw, CheckCircle, Clock, Mail, User, Hash, ChevronDown } from "lucide-react"
import { toast } from "react-hot-toast"

interface ResetRequest {
  id: string
  name: string
  studentId: string
  email: string
  status: string
  createdAt: string
  updatedAt: string
}

export default function PasswordResetsPage() {
  const [requests, setRequests] = useState<ResetRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<"ALL" | "PENDING" | "COMPLETED">("ALL")

  // Reset modal state
  const [resetModal, setResetModal] = useState<ResetRequest | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/reset-requests")
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setRequests(data)
    } catch {
      toast.error("Failed to load password reset requests.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const handleReset = async (req: ResetRequest) => {
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.")
      return
    }
    setActionLoading(req.id + "_reset")
    try {
      const res = await fetch(`/api/admin/reset-requests/${req.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "RESET", newPassword })
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Failed to reset password.")
      } else {
        toast.success(`Password reset for ${req.name} successfully!`)
        setResetModal(null)
        setNewPassword("")
        fetchRequests()
      }
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setActionLoading(null)
    }
  }

  const handleResend = async (req: ResetRequest) => {
    setActionLoading(req.id + "_resend")
    try {
      const res = await fetch(`/api/admin/reset-requests/${req.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "RESEND" })
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Failed to resend.")
      } else {
        toast.success(`Confirmation resent to ${req.email}!`)
      }
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (req: ResetRequest) => {
    if (!confirm(`Delete request from ${req.name}? This cannot be undone.`)) return
    setActionLoading(req.id + "_delete")
    try {
      const res = await fetch(`/api/admin/reset-requests/${req.id}`, {
        method: "DELETE"
      })
      if (!res.ok) {
        toast.error("Failed to delete request.")
      } else {
        toast.success("Request deleted.")
        fetchRequests()
      }
    } catch {
      toast.error("Network error.")
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = requests.filter((r) => {
    const matchSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase()) ||
      r.studentId.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === "ALL" || r.status === filterStatus
    return matchSearch && matchStatus
  })

  const pendingCount = requests.filter((r) => r.status === "PENDING").length
  const completedCount = requests.filter((r) => r.status === "COMPLETED").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold outfit flex items-center gap-2">
            <KeyRound size={24} className="text-[var(--admin-accent)]" />
            Password Reset Requests
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage student password recovery submissions and reset credentials
          </p>
        </div>
        <button
          onClick={fetchRequests}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-[var(--border)] rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center">
            <KeyRound size={20} className="text-[var(--admin-accent)]" />
          </div>
          <div>
            <p className="text-2xl font-bold">{requests.length}</p>
            <p className="text-slate-500 text-sm">Total Requests</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center">
            <Clock size={20} className="text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{pendingCount}</p>
            <p className="text-slate-500 text-sm">Pending</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-950/30 flex items-center justify-center">
            <CheckCircle size={20} className="text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{completedCount}</p>
            <p className="text-slate-500 text-sm">Completed</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or student ID..."
            className="w-full pl-9 pr-4 py-2.5 border border-[var(--border)] rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)] text-sm"
            style={{ color: "#000000" }}
          />
        </div>
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="appearance-none pl-4 pr-10 py-2.5 border border-[var(--border)] rounded-lg bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)] text-sm font-medium cursor-pointer"
            style={{ color: "#000000" }}
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <RefreshCw size={24} className="animate-spin mr-3" />
            Loading requests...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <KeyRound size={40} className="opacity-30" />
            <p className="font-medium">
              {requests.length === 0 ? "No password reset requests yet" : "No requests match your search"}
            </p>
            <p className="text-sm opacity-70">
              {requests.length === 0
                ? "When students submit recovery requests, they'll appear here."
                : "Try adjusting your search or filter."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: "820px" }}>
              <thead>
                <tr className="border-b border-[var(--border)] bg-slate-50 dark:bg-slate-800/50">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">ID / Phone</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Submitted</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider" style={{ minWidth: "200px" }}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filtered.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--admin-accent)] to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {req.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-sm">{req.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                        <Hash size={13} className="opacity-60" />
                        {req.studentId}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                        <Mail size={13} className="opacity-60" />
                        {req.email}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {req.status === "PENDING" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                          <Clock size={11} /> Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400">
                          <CheckCircle size={11} /> Completed
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500">
                      {new Date(req.createdAt).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Reset Password */}
                        <button
                          onClick={() => { setResetModal(req); setNewPassword("") }}
                          disabled={actionLoading !== null}
                          title="Reset Password"
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-white hover:opacity-90 disabled:opacity-50 transition-all"
                          style={{ backgroundColor: "#2563eb" }}
                        >
                          <Lock size={13} />
                          Set Password
                        </button>
                        {/* Resend Confirmation */}
                        <button
                          onClick={() => handleResend(req)}
                          disabled={actionLoading !== null}
                          title="Resend Confirmation"
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[var(--border)] hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-all"
                          style={{ color: "#000000" }}
                        >
                          {actionLoading === req.id + "_resend" ? (
                            <RefreshCw size={13} className="animate-spin" />
                          ) : (
                            <RefreshCw size={13} />
                          )}
                          Resend
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(req)}
                          disabled={actionLoading !== null}
                          title="Delete Request"
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 disabled:opacity-50 transition-all"
                        >
                          {actionLoading === req.id + "_delete" ? (
                            <RefreshCw size={13} className="animate-spin" />
                          ) : (
                            <Trash2 size={13} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reset Password Modal */}
      {resetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setResetModal(null); setNewPassword("") }} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-7 space-y-5 z-10">
            {/* Modal Header */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center shrink-0">
                <Lock size={22} className="text-[var(--admin-accent)]" />
              </div>
              <div>
                <h3 className="text-lg font-bold" style={{ color: "#000000" }}>Reset Password</h3>
                <p className="text-slate-500 text-sm mt-0.5">Set a new password for this student account</p>
              </div>
            </div>

            {/* Student Info */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User size={14} className="text-slate-400" />
                <span className="font-semibold" style={{ color: "#000000" }}>{resetModal.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail size={14} className="text-slate-400" />
                <span className="text-slate-600 dark:text-slate-400">{resetModal.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Hash size={14} className="text-slate-400" />
                <span className="text-slate-600 dark:text-slate-400">{resetModal.studentId}</span>
              </div>
            </div>

            {/* New Password Input */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "#475569" }}>New Password</label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min. 6 chars)"
                  className="w-full px-4 pr-12 py-2.5 border border-[var(--border)] rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)] text-sm"
                  style={{ color: "#000000" }}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showNewPassword ? "🙈" : "👁️"}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1.5">Password will be securely hashed before saving to the database.</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => { setResetModal(null); setNewPassword("") }}
                className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                style={{ color: "#000000" }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleReset(resetModal)}
                disabled={actionLoading === resetModal.id + "_reset" || !newPassword}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: "#2563eb" }}
              >
                {actionLoading === resetModal.id + "_reset" ? (
                  <><RefreshCw size={14} className="animate-spin" /> Resetting...</>
                ) : (
                  <><Lock size={14} /> Confirm Reset</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
