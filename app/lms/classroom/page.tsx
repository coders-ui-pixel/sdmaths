"use client"

import { useState, useEffect } from "react"
import {
  Users, BookOpen, Clock, Check, X, Eye, Loader2, RotateCcw,
  ShieldAlert, CheckCircle2, User, ChevronRight, Download
} from "lucide-react"
import { toast } from "react-hot-toast"

type StudentEnrollment = {
  id: string
  amount: number
  paymentId: string | null
  proofUrl: string
  status: "PENDING" | "VERIFIED" | "REJECTED"
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string | null
    email: string | null
    phone: string | null
    image: string | null
  }
}

type Course = {
  id: string
  title: string
  slug: string
  price: number
}

export default function ClassroomPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState<string>("")
  
  const [verifiedStudents, setVerifiedStudents] = useState<StudentEnrollment[]>([])
  const [unverifiedStudents, setUnverifiedStudents] = useState<StudentEnrollment[]>([])
  
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [submittingId, setSubmittingId] = useState<string | null>(null)
  
  const [activeTab, setActiveTab] = useState<"VERIFIED" | "UNVERIFIED">("UNVERIFIED")
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  const [showResetModal, setShowResetModal] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)

  // Fetch courses on mount
  useEffect(() => {
    fetchCourses()
  }, [])

  // Fetch student lists when selected course changes
  useEffect(() => {
    if (selectedCourseId) {
      fetchClassroomData(selectedCourseId)
    } else {
      setVerifiedStudents([])
      setUnverifiedStudents([])
    }
  }, [selectedCourseId])

  const fetchCourses = async () => {
    try {
      const res = await fetch("/api/admin/courses")
      if (!res.ok) throw new Error()
      const data = await res.json()
      // Make sure we handle potential pagination or raw array
      setCourses(Array.isArray(data) ? data : data.courses || [])
    } catch (error) {
      toast.error("Failed to load courses list")
    } finally {
      setLoadingCourses(false)
    }
  }

  const fetchClassroomData = async (courseId: string) => {
    setLoadingStudents(true)
    try {
      const res = await fetch(`/api/admin/classroom?courseId=${courseId}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setVerifiedStudents(data.verified || [])
      setUnverifiedStudents(data.unverified || [])
    } catch (error) {
      toast.error("Failed to load students for this classroom")
    } finally {
      setLoadingStudents(false)
    }
  }

  const handleIndividualAction = async (paymentId: string, action: "VERIFY_STUDENT" | "REJECT_STUDENT" | "UNVERIFY_STUDENT") => {
    setSubmittingId(paymentId)
    try {
      const res = await fetch("/api/admin/classroom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, action })
      })
      if (!res.ok) throw new Error()
      
      toast.success(
        action === "VERIFY_STUDENT" ? "Student successfully enrolled!" :
        action === "REJECT_STUDENT" ? "Enrollment verification rejected." :
        "Student enrollment set to unverified/pending."
      )

      // Refresh data for the current course
      await fetchClassroomData(selectedCourseId)
    } catch (error) {
      toast.error("Action execution failed")
    } finally {
      setSubmittingId(null)
    }
  }

  const handleResetAllVerified = async () => {
    setResetLoading(true)
    try {
      const res = await fetch("/api/admin/classroom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: selectedCourseId, action: "RESET_VERIFIED" })
      })
      if (!res.ok) throw new Error()
      
      toast.success("Successfully reset all verified students to unverified/pending!")
      setShowResetModal(false)
      
      // Refresh current data
      await fetchClassroomData(selectedCourseId)
    } catch (error) {
      toast.error("Bulk reset failed")
    } finally {
      setResetLoading(false)
    }
  }

  const selectedCourse = courses.find(c => c.id === selectedCourseId)

  return (
    <div className="p-1 sm:p-6 max-w-7xl mx-auto min-h-[85vh]">
      {/* Upper header panel */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold outfit tracking-tight bg-gradient-to-r from-[var(--admin-accent)] to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            Classroom Portal
          </h2>
          <p className="text-slate-500 mt-1 dark:text-slate-400 text-sm">
            Monitor course enrollment lists, verify payments, and reset enrollment records.
          </p>
        </div>

        {/* Course Select Dropdown */}
        <div className="w-full md:w-80">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
            Select Active Class/Course
          </label>
          {loadingCourses ? (
            <div className="h-12 w-full bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ) : (
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-[var(--admin-accent)] outline-none transition-all shadow-sm font-bold text-sm text-slate-800 dark:text-slate-100"
            >
              <option value="">-- Choose a course --</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Main body */}
      {!selectedCourseId ? (
        // Intro Landing Screen when no course is chosen
        <div className="card text-center py-20 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-sm flex flex-col items-center justify-center animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--admin-accent)] to-indigo-600 flex items-center justify-center text-white mb-6 shadow-xl shadow-[var(--admin-accent)]/20">
            <BookOpen size={36} className="animate-pulse" />
          </div>
          <h3 className="text-2xl font-black outfit text-slate-800 dark:text-slate-100 mb-2">
            Welcome to the Classroom Manager
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-sm leading-relaxed mb-6">
            Please pick a specific mathematics course from the select dropdown above to view student classroom dashboards, verify enrollment proofs, and reset verification states.
          </p>
          <div className="inline-flex items-center gap-1 text-xs font-black tracking-widest text-[var(--admin-accent)] dark:text-blue-400 uppercase bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-full">
            Ready to Manage <ChevronRight size={14} />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                Active Classroom
              </span>
              <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate">
                {selectedCourse?.title}
              </h4>
            </div>

            <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                Verified Enrolled Students
              </span>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-black text-green-500">
                  {verifiedStudents.length}
                </span>
                <span className="text-xs font-semibold text-slate-400">students active</span>
              </div>
            </div>

            <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                Applied For Verification
              </span>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-black text-orange-500">
                  {unverifiedStudents.length}
                </span>
                <span className="text-xs font-semibold text-slate-400">requests pending</span>
              </div>
            </div>
          </div>

          {/* Group Sections Selector Tabs */}
          <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-100 dark:bg-slate-800/80 p-2 rounded-2xl gap-3 border border-slate-200 dark:border-slate-700">
            {/* Tabs */}
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab("UNVERIFIED")}
                className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-xl text-xs font-extrabold transition-all uppercase tracking-widest flex items-center justify-center gap-2 ${
                  activeTab === "UNVERIFIED"
                    ? "bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                <Clock size={14} /> Unverified Applied ({unverifiedStudents.length})
              </button>
              <button
                onClick={() => setActiveTab("VERIFIED")}
                className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-xl text-xs font-extrabold transition-all uppercase tracking-widest flex items-center justify-center gap-2 ${
                  activeTab === "VERIFIED"
                    ? "bg-white dark:bg-slate-700 text-green-600 dark:text-green-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                <CheckCircle2 size={14} /> Verified Enrolled ({verifiedStudents.length})
              </button>
            </div>

            {/* Actions for active tab */}
            {activeTab === "VERIFIED" && verifiedStudents.length > 0 && (
              <button
                onClick={() => setShowResetModal(true)}
                className="w-full sm:w-auto px-5 py-2.5 bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-200 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
              >
                <RotateCcw size={14} className="animate-spin-slow" /> Make All Unverified
              </button>
            )}
          </div>

          {/* Student list content */}
          {loadingStudents ? (
            <div className="py-20 flex justify-center items-center">
              <Loader2 className="animate-spin text-[var(--admin-accent)]" size={36} />
            </div>
          ) : activeTab === "VERIFIED" ? (
            // Verified Classroom Section
            <div className="card p-0 overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-sm">
              {verifiedStudents.length === 0 ? (
                <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                  No verified students enrolled in this course yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                      <tr>
                        <th className="text-left px-8 py-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">Student</th>
                        <th className="text-left px-6 py-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">Payment ID</th>
                        <th className="text-left px-6 py-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">Amount</th>
                        <th className="text-left px-6 py-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">Verified On</th>
                        <th className="text-right px-8 py-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {verifiedStudents.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold shadow-sm shadow-emerald-500/20">
                                {item.user.image ? (
                                  <img src={item.user.image} alt="" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                  item.user.name?.charAt(0).toUpperCase() || <User size={16} />
                                )}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white">{item.user.name || "N/A"}</div>
                                <div className="text-slate-400 text-xs font-medium">{item.user.email}</div>
                                {item.user.phone && (
                                  <div className="text-slate-400 text-xs font-medium">{item.user.phone}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 font-mono text-xs font-bold text-[var(--admin-accent)] dark:text-blue-400">
                            {item.paymentId || "—"}
                          </td>
                          <td className="px-6 py-5 font-bold text-slate-700 dark:text-slate-300">
                            Rs. {item.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-5 text-slate-500 font-semibold text-xs">
                            {new Date(item.updatedAt).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </td>
                          <td className="px-8 py-5 text-right">
                            <button
                              disabled={submittingId !== null}
                              onClick={() => handleIndividualAction(item.id, "UNVERIFY_STUDENT")}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all disabled:opacity-50"
                            >
                              {submittingId === item.id ? (
                                <Loader2 className="animate-spin" size={12} />
                              ) : (
                                <RotateCcw size={12} />
                              )}
                              Unverify
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            // Unverified Classroom Section (Awaiting verification)
            <div className="card p-0 overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-sm">
              {unverifiedStudents.length === 0 ? (
                <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs flex flex-col items-center justify-center gap-3">
                  <CheckCircle2 size={36} className="text-green-500" />
                  No pending class enroll verification requests!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                      <tr>
                        <th className="text-left px-8 py-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">Student</th>
                        <th className="text-left px-6 py-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">Payment Details</th>
                        <th className="text-left px-6 py-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">Proof Screenshot</th>
                        <th className="text-left px-6 py-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">Applied Date</th>
                        <th className="text-right px-8 py-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">Verify Verdict</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {unverifiedStudents.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          {/* Student Details */}
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center text-white font-bold shadow-sm shadow-orange-500/20">
                                {item.user.image ? (
                                  <img src={item.user.image} alt="" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                  item.user.name?.charAt(0).toUpperCase() || <User size={16} />
                                )}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white">{item.user.name || "N/A"}</div>
                                <div className="text-slate-400 text-xs font-medium">{item.user.email}</div>
                                {item.user.phone && (
                                  <div className="text-slate-400 text-xs font-medium">{item.user.phone}</div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Payment details */}
                          <td className="px-6 py-5">
                            <div className="text-slate-700 dark:text-slate-300 font-bold">
                              Rs. {item.amount.toLocaleString()}
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">
                              ID: <span className="font-mono font-semibold text-[var(--admin-accent)] dark:text-blue-400">{item.paymentId || "—"}</span>
                            </div>
                          </td>

                          {/* Proof Screenshot */}
                          <td className="px-6 py-5">
                            {item.proofUrl ? (
                              <div className="relative group w-16 h-12 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 flex items-center justify-center shadow-sm">
                                <img
                                  src={item.proofUrl}
                                  alt="Receipt proof thumbnail"
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 cursor-pointer"
                                  onClick={() => setLightboxImage(item.proofUrl)}
                                  onError={(e) => {
                                    // Handle backup fallbacks if needed
                                    console.error("Failed to load thumbnail proof image")
                                  }}
                                />
                                <button
                                  onClick={() => setLightboxImage(item.proofUrl)}
                                  className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="View Proof"
                                >
                                  <Eye size={16} />
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] font-black uppercase text-red-500 bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded-full">
                                No Proof Uploaded
                              </span>
                            )}
                          </td>

                          {/* Applied date */}
                          <td className="px-6 py-5 text-slate-500 font-semibold text-xs">
                            {new Date(item.createdAt).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </td>

                          {/* Actions (inline verify verdict) */}
                          <td className="px-8 py-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                disabled={submittingId !== null}
                                onClick={() => handleIndividualAction(item.id, "VERIFY_STUDENT")}
                                className="px-3.5 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-green-500/10 disabled:opacity-50"
                              >
                                {submittingId === item.id ? (
                                  <Loader2 className="animate-spin" size={12} />
                                ) : (
                                  <Check size={12} />
                                )}
                                Approve
                              </button>
                              <button
                                disabled={submittingId !== null}
                                onClick={() => handleIndividualAction(item.id, "REJECT_STUDENT")}
                                className="px-3.5 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-red-500/10 disabled:opacity-50"
                              >
                                {submittingId === item.id ? (
                                  <Loader2 className="animate-spin" size={12} />
                                ) : (
                                  <X size={12} />
                                )}
                                Reject
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
          )}
        </div>
      )}

      {/* Lightbox Screenshot Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="font-extrabold outfit text-slate-800 dark:text-slate-200">
                Payment Proof Screenshot
              </span>
              <div className="flex items-center gap-4">
                <a
                  href={lightboxImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[var(--admin-accent)] hover:underline font-bold flex items-center gap-1"
                >
                  Open Original Tab
                </a>
                <button
                  onClick={() => setLightboxImage(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-300 font-bold transition-all text-xs"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-950 flex items-center justify-center min-h-[40vh] max-h-[70vh] overflow-y-auto">
              <img
                src={lightboxImage}
                alt="Payment proof screenshot"
                className="max-w-full h-auto max-h-[60vh] rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 object-contain"
                onError={(e) => {
                  console.error("Lightbox image failed to load:", lightboxImage)
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Bulk RESET_VERIFIED Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div
            className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-red-100 dark:border-red-950 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mb-4">
              <ShieldAlert size={28} />
            </div>
            <h3 className="text-xl font-bold outfit text-slate-900 dark:text-white mb-2">
              Reset All Enrolled Students?
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
              Are you sure you want to reset all verified students in <strong>{selectedCourse?.title}</strong> back to unverified? This will set all active enrollment records in this course to pending verification. Students will need to be approved again.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                disabled={resetLoading}
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2.5 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all"
              >
                Cancel Action
              </button>
              <button
                disabled={resetLoading}
                onClick={handleResetAllVerified}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-red-500/15"
              >
                {resetLoading ? (
                  <Loader2 className="animate-spin" size={12} />
                ) : (
                  <RotateCcw size={12} />
                )}
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
