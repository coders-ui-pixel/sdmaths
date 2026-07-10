"use client"

import { useState, useEffect } from "react"
import { CheckCircle, XCircle, Clock, Eye } from "lucide-react"

type Payment = {
  id: string
  amount: number
  paymentId: string | null
  proofUrl: string
  status: "PENDING" | "VERIFIED" | "REJECTED"
  createdAt: string
  user: { name: string; email: string; phone: string | null }
  course: { title: string }
}

const statusConfig = {
  PENDING: { label: "Pending", className: "bg-yellow-100 text-yellow-700", icon: Clock },
  VERIFIED: { label: "Verified", className: "bg-green-100 text-green-700", icon: CheckCircle },
  REJECTED: { label: "Rejected", className: "bg-red-100 text-red-700", icon: XCircle },
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "VERIFIED" | "REJECTED">("PENDING")
  const [loading, setLoading] = useState(true)
  const [proofModal, setProofModal] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/payments")
      .then(r => r.json())
      .then(data => { 
        if (Array.isArray(data)) {
          setPayments(data)
        } else {
          console.error("Payments data is not an array:", data)
          setPayments([])
        }
        setLoading(false) 
      })
      .catch(err => {
        console.error("Fetch payments failed:", err)
        setLoading(false)
      })
  }, [])

  const handleVerdict = async (id: string, status: "VERIFIED" | "REJECTED") => {
    const res = await fetch(`/api/payments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    })
    if (res.ok) {
      setPayments(prev => prev.map(p => p.id === id ? { ...p, status } : p))
    }
  }

  const filtered = Array.isArray(payments) 
    ? (filter === "ALL" ? payments : payments.filter(p => p.status === filter))
    : []

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold outfit">Payment Verifications</h2>
        <p className="text-slate-500 mt-1">Review and approve student payment submissions.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-full sm:w-fit">
        {(["ALL", "PENDING", "VERIFIED", "REJECTED"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
              filter === f ? "bg-white dark:bg-slate-700 shadow-sm text-[var(--admin-accent)]" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            {f}
            {f === "PENDING" && payments.filter(p => p.status === "PENDING").length > 0 && (
              <span className="ml-2 bg-orange-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {payments.filter(p => p.status === "PENDING").length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <CheckCircle size={40} className="mx-auto mb-4 text-green-400" />
          <p className="text-slate-500">No {filter.toLowerCase()} payments.</p>
        </div>
      ) : (
        <>
          {/* Mobile: card list */}
          <div className="space-y-3 md:hidden">
            {filtered.map(p => {
              const config = statusConfig[p.status]
              return (
                <div key={p.id} className="card p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <div className="font-bold text-slate-800 dark:text-slate-100 truncate">{p.user.name || "—"}</div>
                      <div className="text-slate-400 text-xs truncate">{p.user.email}</div>
                      {p.user.phone && <div className="text-slate-400 text-xs">{p.user.phone}</div>}
                    </div>
                    <span className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${config.className}`}>
                      <config.icon size={12} />
                      {config.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3 pb-3 border-b border-[var(--border)]">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Course</div>
                      <div className="font-medium truncate">{p.course.title}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount</div>
                      <div className="font-bold">Rs. {p.amount.toLocaleString()}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Payment ID</div>
                      <div className="font-bold text-[var(--admin-accent)] break-all">{p.paymentId || "—"}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {p.proofUrl && (
                      <button
                        onClick={() => setProofModal(p.proofUrl)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <Eye size={14} /> View Proof
                      </button>
                    )}
                    {p.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => handleVerdict(p.id, "VERIFIED")}
                          className="flex-1 px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleVerdict(p.id, "REJECTED")}
                          className="flex-1 px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Desktop: table */}
          <div className="card p-0 overflow-hidden hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    <th className="text-left px-6 py-3 font-medium text-slate-500 whitespace-nowrap">Student</th>
                    <th className="text-left px-6 py-3 font-medium text-slate-500 whitespace-nowrap">Course</th>
                    <th className="text-left px-6 py-3 font-medium text-slate-500 whitespace-nowrap">Amount</th>
                    <th className="text-left px-6 py-3 font-medium text-slate-500 whitespace-nowrap">Payment ID</th>
                    <th className="text-left px-6 py-3 font-medium text-slate-500 whitespace-nowrap">Status</th>
                    <th className="text-left px-6 py-3 font-medium text-slate-500 whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filtered.map(p => {
                    const config = statusConfig[p.status]
                    return (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium">{p.user.name || "—"}</div>
                          <div className="text-slate-400 text-xs">{p.user.email}</div>
                          {p.user.phone && <div className="text-slate-400 text-xs">{p.user.phone}</div>}
                        </td>
                        <td className="px-6 py-4 font-medium">{p.course.title}</td>
                        <td className="px-6 py-4 font-bold whitespace-nowrap">Rs. {p.amount.toLocaleString()}</td>
                        <td className="px-6 py-4 font-bold text-[var(--admin-accent)]">
                          {p.paymentId || "—"}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${config.className}`}>
                            <config.icon size={12} />
                            {config.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {p.proofUrl && (
                              <button
                                onClick={() => setProofModal(p.proofUrl)}
                                className="p-1.5 text-slate-500 hover:text-[var(--admin-accent)] transition-colors"
                                title="View Proof"
                              >
                                <Eye size={16} />
                              </button>
                            )}
                            {p.status === "PENDING" && (
                              <>
                                <button
                                  onClick={() => handleVerdict(p.id, "VERIFIED")}
                                  className="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleVerdict(p.id, "REJECTED")}
                                  className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {proofModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setProofModal(null)}>
          <div className="max-w-lg w-full bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
              <span className="font-semibold">Payment Proof</span>
              <div className="flex items-center gap-4">
                <a 
                  href={proofModal} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-[var(--admin-accent)] hover:underline font-bold"
                >
                  Open in new tab
                </a>
                <button onClick={() => setProofModal(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
              </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center">
              <img 
                src={proofModal} 
                alt="Payment proof" 
                className="max-w-full h-auto max-h-[70vh] rounded shadow-sm border border-white/20"
                onError={(e) => {
                  console.error("Image failed to load:", proofModal)
                  // Fallback for relative paths if needed
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
