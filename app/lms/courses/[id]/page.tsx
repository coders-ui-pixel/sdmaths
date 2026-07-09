"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import {
  ChevronLeft, Save, Play, ListChecks, Plus, X, Loader2,
  Trash2, BookOpen, ExternalLink, QrCode, HelpCircle, Video,
  Edit, Upload
} from "lucide-react"
import { toast } from "react-hot-toast"
import Link from "next/link"
import LatexRenderer from "@/components/LatexRenderer"
import LatexEditor from "@/components/LatexEditor"

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [course, setCourse] = useState<any>(null)
  const [allExams, setAllExams] = useState([])
  const [allPlaylists, setAllPlaylists] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [uploadingPaymentQr, setUploadingPaymentQr] = useState(false)

  const [questions, setQuestions] = useState<any[]>([])
  const [questionsLoading, setQuestionsLoading] = useState(true)
  const [newQuestionText, setNewQuestionText] = useState("")
  const [newTextAnswer, setNewTextAnswer] = useState("")
  const [newVideoAnswerUrl, setNewVideoAnswerUrl] = useState("")
  const [addingQuestion, setAddingQuestion] = useState(false)
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
  const [isVvi, setIsVvi] = useState(false)
  const [parsingWord, setParsingWord] = useState(false)
  const [uploadingQAVideo, setUploadingQAVideo] = useState(false)

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      const [courseRes, examsRes, playlistsRes, questionsRes] = await Promise.all([
        fetch(`/api/admin/courses/${id}`),
        fetch(`/api/admin/exams`),
        fetch(`/api/admin/playlists`),
        fetch(`/api/admin/courses/${id}/questions`)
      ])

      const courseData = await courseRes.json()
      setCourse(courseData)
      setAllExams(await examsRes.json())
      setAllPlaylists(await playlistsRes.json())
      setQuestions(await questionsRes.json())
    } catch (e) {
      toast.error("Failed to load course details")
    } finally {
      setLoading(false)
      setQuestionsLoading(false)
    }
  }

  const fetchQuestions = async () => {
    setQuestionsLoading(true)
    try {
      const res = await fetch(`/api/admin/courses/${id}/questions`)
      if (res.ok) {
        setQuestions(await res.json())
      }
    } catch (e) {
      toast.error("Failed to refresh Q&As")
    } finally {
      setQuestionsLoading(false)
    }
  }

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newQuestionText) {
      toast.error("Question text is required")
      return
    }
    setAddingQuestion(true)
    try {
      const isEditing = !!editingQuestionId
      const url = `/api/admin/courses/${id}/questions`
      const method = isEditing ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: editingQuestionId,
          question: newQuestionText,
          textAnswer: newTextAnswer,
          videoAnswerUrl: newVideoAnswerUrl,
          isVvi: !!isVvi
        })
      })

      let errorMsg = isEditing ? "Failed to update Q&A" : "Failed to save Q&A"
      try {
        const data = await res.json()
        if (data && data.error) errorMsg = data.error
      } catch (_) {}

      if (!res.ok) {
        throw new Error(errorMsg)
      }

      toast.success(isEditing ? "Question & Answer updated!" : "Important Question & Answer added!")
      
      setNewQuestionText("")
      setNewTextAnswer("")
      setNewVideoAnswerUrl("")
      setIsVvi(false)
      setEditingQuestionId(null)

      await fetchQuestions()
    } catch (error: any) {
      toast.error(error.message || "Failed to save Q&A")
    } finally {
      setAddingQuestion(false)
    }
  }

  const handleEditQuestionStart = (q: any) => {
    setEditingQuestionId(q.id)
    setNewQuestionText(q.question)
    setNewTextAnswer(q.textAnswer || "")
    setNewVideoAnswerUrl(q.videoAnswerUrl || "")
    setIsVvi(!!q.isVvi)
    
    const element = document.getElementById("qa-creation-form")
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  const handleImportWordQA = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setParsingWord(true)
    const toastId = toast.loading("Reading and parsing Word document...")
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/admin/parse-docx", {
        method: "POST",
        body: formData
      })
      const data = await res.json()
      if (res.ok) {
        setNewQuestionText(data.question || "")
        setNewTextAnswer(data.answer || "")
        toast.success("Word file parsed and imported successfully!", { id: toastId })
      } else {
        toast.error(data.error || "Failed to parse Word document", { id: toastId })
      }
    } catch (err: any) {
      toast.error("Failed to parse Word file: Network error", { id: toastId })
    } finally {
      setParsingWord(false)
      e.target.value = ""
    }
  }

  const handleQAVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingQAVideo(true)
    const toastId = toast.loading("Uploading video solution... (Max 2GB)")
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      })
      const data = await res.json()
      if (res.ok) {
        setNewVideoAnswerUrl(data.url)
        toast.success("Video solution uploaded successfully!", { id: toastId })
      } else {
        toast.error(data.error || "Upload failed", { id: toastId })
      }
    } catch (err: any) {
      toast.error("Upload failed: Network or server error", { id: toastId })
    } finally {
      setUploadingQAVideo(false)
    }
  }

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("Are you sure you want to delete this Q&A?")) return
    try {
      const res = await fetch(`/api/admin/courses/${id}/questions?questionId=${questionId}`, {
        method: "DELETE"
      })
      if (res.ok) {
        toast.success("Q&A deleted successfully")
        await fetchQuestions()
      } else {
        toast.error("Failed to delete Q&A")
      }
    } catch (e) {
      toast.error("Failed to delete Q&A")
    }
  }

  const handlePaymentQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingPaymentQr(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData })
      if (!uploadRes.ok) {
        const err = await uploadRes.json()
        throw new Error(err.error || "Upload failed")
      }
      const { url } = await uploadRes.json()
      setCourse({ ...course, paymentQrUrl: url })
      toast.success("QR code uploaded — click Save Changes to apply")
    } catch (error: any) {
      toast.error(error.message || "Failed to upload QR code")
    } finally {
      setUploadingPaymentQr(false)
      e.target.value = ""
    }
  }

  const handleUpdate = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/courses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(course)
      })
      if (res.ok) {
        toast.success("Course updated!")
      } else {
        toast.error("Update failed")
      }
    } catch (e) {
      toast.error("Update failed")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteCourse = async () => {
    if (!confirm("Are you sure you want to delete this course? This action cannot be undone and will delete all associated payments and assets.")) return
    try {
      const res = await fetch(`/api/admin/courses/${id}`, {
        method: "DELETE"
      })
      if (res.ok) {
        toast.success("Course deleted successfully")
        router.push("/lms/courses")
      } else {
        const err = await res.json()
        toast.error(err.error || "Failed to delete course")
      }
    } catch (e) {
      toast.error("Failed to delete course")
    }
  }

  const toggleAssignment = (type: 'mcqExams' | 'playlists', itemId: string) => {
    const current = course[type] || []
    const exists = current.find((i: any) => i.id === itemId)
    
    let updated
    if (exists) {
      updated = current.filter((i: any) => i.id !== itemId)
    } else {
      updated = [...current, { id: itemId }]
    }
    
    setCourse({ ...course, [type]: updated })
  }

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[var(--admin-accent)]" /></div>
  if (!course) return <div>Course not found</div>

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/lms/courses" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </Link>
          <div>
            <h2 className="text-2xl font-bold outfit">{course.title}</h2>
            <p className="text-slate-500 text-sm">Manage assets and curriculum for this course.</p>
          </div>
        </div>
        <button 
          onClick={handleUpdate}
          disabled={saving}
          className="btn-admin-primary flex items-center gap-2 px-6"
        >
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          Save Changes
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Metadata Section */}
          <section className="card p-8">
            <h3 className="text-lg font-bold outfit mb-6 border-b pb-4">Basic Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Title</label>
                  <input 
                    value={course.title}
                    onChange={e => setCourse({...course, title: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-[var(--admin-accent)]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Slug</label>
                  <input 
                    value={course.slug}
                    onChange={e => setCourse({...course, slug: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-[var(--admin-accent)]"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Price (NPR)</label>
                <input 
                  type="number"
                  value={course.price}
                  onChange={e => setCourse({...course, price: parseFloat(e.target.value)})}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-[var(--admin-accent)]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Early Bird Discount (NPR) - Optional</label>
                  <input 
                    type="number"
                    value={course.discountAmount === 0 ? "" : (course.discountAmount || "")}
                    onChange={e => setCourse({...course, discountAmount: e.target.value ? parseFloat(e.target.value) : 0})}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-[var(--admin-accent)]"
                    placeholder="e.g. 300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Usage Seat Limit (Students) - Optional</label>
                  <input 
                    type="number"
                    value={course.discountLimit === 0 ? "" : (course.discountLimit || "")}
                    onChange={e => setCourse({...course, discountLimit: e.target.value ? parseInt(e.target.value) : 0})}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-[var(--admin-accent)]"
                    placeholder="e.g. 20"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Description</label>
                <textarea 
                  rows={4}
                  value={course.description}
                  onChange={e => setCourse({...course, description: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-[var(--admin-accent)] resize-none"
                />
              </div>
              <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Enabled Sections (Modules)</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={!!course.hasMcqs}
                      onChange={(e) => setCourse({...course, hasMcqs: e.target.checked})}
                      className="w-4 h-4 rounded border-slate-300 text-[var(--admin-accent)] focus:ring-[var(--admin-accent)]"
                    />
                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">MCQs</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={!!course.hasVideos}
                      onChange={(e) => setCourse({...course, hasVideos: e.target.checked})}
                      className="w-4 h-4 rounded border-slate-300 text-[var(--admin-accent)] focus:ring-[var(--admin-accent)]"
                    />
                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Videos</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={!!course.hasNotes}
                      onChange={(e) => setCourse({...course, hasNotes: e.target.checked})}
                      className="w-4 h-4 rounded border-slate-300 text-[var(--admin-accent)] focus:ring-[var(--admin-accent)]"
                    />
                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Notes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={!!course.hasLiveClasses}
                      onChange={(e) => setCourse({...course, hasLiveClasses: e.target.checked})}
                      className="w-4 h-4 rounded border-slate-300 text-[var(--admin-accent)] focus:ring-[var(--admin-accent)]"
                    />
                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Live Classes</span>
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Asset Assignment Section */}
          <section className="card p-8">
            <div className="flex items-center justify-between mb-6 border-b pb-4">
              <h3 className="text-lg font-bold outfit">Assigned Playlists</h3>
              <span className="text-xs font-bold text-[var(--admin-accent)] bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md">
                {course.playlists?.length || 0} Selected
              </span>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {allPlaylists.map((p: any) => {
                const isSelected = course.playlists?.some((ap: any) => ap.id === p.id)
                return (
                  <button
                    key={p.id}
                    onClick={() => toggleAssignment('playlists', p.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      isSelected 
                        ? 'border-[var(--admin-accent)] bg-blue-50/50 dark:bg-blue-900/10' 
                        : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-[var(--admin-accent)] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                      <Play size={14} />
                    </div>
                    <div>
                      <div className="text-sm font-bold truncate max-w-[150px]">{p.title}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">{p._count.lessons} Videos</div>
                    </div>
                    {isSelected && <X size={14} className="ml-auto text-[var(--admin-accent)]" />}
                  </button>
                )
              })}
            </div>
          </section>

          <section className="card p-8">
            <div className="flex items-center justify-between mb-6 border-b pb-4">
              <h3 className="text-lg font-bold outfit">Assigned MCQ Sets</h3>
              <span className="text-xs font-bold text-purple-600 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded-md">
                {course.mcqExams?.length || 0} Selected
              </span>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {allExams.map((e: any) => {
                const isSelected = course.mcqExams?.some((ae: any) => ae.id === e.id)
                return (
                  <button
                    key={e.id}
                    onClick={() => toggleAssignment('mcqExams', e.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      isSelected 
                        ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-900/10' 
                        : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-purple-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                      <ListChecks size={14} />
                    </div>
                    <div>
                      <div className="text-sm font-bold truncate max-w-[150px]">{e.title}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">{e._count.questions} Qs</div>
                    </div>
                    {isSelected && <X size={14} className="ml-auto text-purple-500" />}
                  </button>
                )
              })}
            </div>
          </section>

          {/* Important Q&A Section */}
          <section className="card p-8">
            <h3 className="text-lg font-bold outfit mb-6 border-b pb-4 flex items-center gap-2">
              <HelpCircle size={20} className="text-orange-500" />
              Course Q&As (Important Questions)
            </h3>

            {/* Q&A Creation Form */}
            <form id="qa-creation-form" onSubmit={handleAddQuestion} className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 mb-8 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-200/50 dark:border-slate-800 pb-2">
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {editingQuestionId ? `Edit Q&A (Editing Question)` : "Create New Q&A"}
                </h4>
                <label className="cursor-pointer text-xs font-bold text-[var(--admin-accent)] dark:text-blue-400 hover:underline flex items-center gap-1">
                  {parsingWord ? (
                    <>
                      <Loader2 size={12} className="animate-spin" />
                      <span>Parsing Word File...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={12} />
                      <span>Import from Word (.docx)</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    accept=".docx" 
                    className="hidden" 
                    disabled={parsingWord} 
                    onChange={handleImportWordQA} 
                  />
                </label>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <LatexEditor
                    label="Question"
                    value={newQuestionText}
                    onChange={setNewQuestionText}
                    placeholder="e.g. Prove that the derivative of $\sin(x)$ is $\cos(x)$."
                    rows={2}
                    accentClass="focus:border-orange-500"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1 sm:col-span-2">
                    <LatexEditor
                      label="Written Solution"
                      value={newTextAnswer}
                      onChange={setNewTextAnswer}
                      placeholder={"Write the detailed step-by-step mathematical proof or solution...\nExample: Using the chain rule, $\\frac{d}{dx}[\\sin(x)] = \\cos(x)$"}
                      rows={5}
                      large
                      accentClass="focus:border-orange-500"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Video Explanation URL (Optional, YouTube/Direct)</label>
                      <label className="cursor-pointer text-xs font-bold text-orange-500 hover:underline flex items-center gap-1">
                        {uploadingQAVideo ? (
                          <>
                            <Loader2 size={12} className="animate-spin" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload size={12} />
                            <span>Upload Video (Max 2GB)</span>
                          </>
                        )}
                        <input 
                          type="file" 
                          accept="video/*" 
                          className="hidden" 
                          disabled={uploadingQAVideo} 
                          onChange={handleQAVideoUpload} 
                        />
                      </label>
                    </div>
                    <input
                      type="text"
                      value={newVideoAnswerUrl}
                      onChange={e => setNewVideoAnswerUrl(e.target.value)}
                      placeholder="e.g. https://www.youtube.com/embed/dQw4w9WgXcQ or uploaded path"
                      className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:border-orange-500 text-sm"
                    />
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 sm:col-span-2">
                    <input 
                      type="checkbox"
                      checked={isVvi}
                      onChange={e => setIsVvi(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-xs font-bold text-slate-650 dark:text-slate-350 flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-black tracking-widest uppercase">VVI</span>
                      Tag as Very Very Important (VVI) Question
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3">
                {editingQuestionId && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setEditingQuestionId(null)
                      setNewQuestionText("")
                      setNewTextAnswer("")
                      setNewVideoAnswerUrl("")
                      setIsVvi(false)
                    }} 
                    className="flex-1 py-3 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold"
                  >
                    Cancel Edit
                  </button>
                )}
                <button
                  type="submit"
                  disabled={addingQuestion}
                  className="flex-1 py-3 bg-orange-100 hover:bg-orange-200 text-orange-950 dark:bg-orange-950/30 dark:hover:bg-orange-900/50 dark:text-orange-300 border border-orange-200/50 dark:border-orange-900/30 rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all hover:scale-[1.01]"
                >
                  {addingQuestion ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      {editingQuestionId ? <Save size={16} /> : <Plus size={16} />}
                      {editingQuestionId ? "Update Q&A" : "Add Q&A to Course"}
                    </>
                  )}
                </button>
              </div>
            </form>

             {/* Q&A List */}
            {questionsLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="animate-spin text-orange-500" /></div>
            ) : questions.length === 0 ? (
              <p className="text-center text-slate-400 py-6 text-sm">No Q&As uploaded for this course yet.</p>
            ) : (
              <div className="space-y-6">
                {questions.map((q: any, index: number) => (
                  <div key={q.id} className="p-6 border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-orange-500/30 transition-colors bg-slate-50/50 dark:bg-slate-900/10">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-3 min-w-0 flex-1">
                        <span className="text-lg font-black text-orange-500 opacity-60">Q{index + 1}.</span>
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-800 dark:text-slate-200 pt-0.5 inline-flex items-center gap-2 flex-wrap">
                            <LatexRenderer content={q.question} />
                            {q.isVvi && (
                              <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[9px] font-black tracking-widest uppercase shadow-md shadow-red-500/20 animate-pulse inline-block">
                                VVI
                              </span>
                            )}
                          </h4>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleEditQuestionStart(q)}
                          className="p-2 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-[var(--admin-accent)] hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg transition-all cursor-pointer"
                          title="Edit Q&A"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-2 border border-red-100 dark:border-red-900/20 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all cursor-pointer"
                          title="Delete Q&A"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {q.textAnswer && (
                      <div className="mt-4 pl-8">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Written Solution</div>
                        <div className="text-slate-600 dark:text-slate-400 text-sm whitespace-pre-wrap bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl">
                          {q.textAnswer}
                        </div>
                      </div>
                    )}

                    {q.videoAnswerUrl && (
                      <div className="mt-4 pl-8">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                          <Video size={12} className="text-orange-500" />
                          <span>Video Explanation URL</span>
                        </div>
                        <a href={q.videoAnswerUrl} target="_blank" rel="noreferrer" className="text-orange-500 hover:underline text-xs font-bold truncate max-w-md block">
                          {q.videoAnswerUrl}
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar Status / Preview */}
        <div className="space-y-6">
          <div className="card p-6 bg-slate-900 text-white">
            <h4 className="font-bold mb-4 flex items-center gap-2">
              <ExternalLink size={16} /> Course Preview
            </h4>
            {course.thumbnail && (
              <img src={course.thumbnail} className="w-full aspect-video object-cover rounded-lg mb-4" />
            )}
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Total Lessons</span>
                <span className="font-bold">{course.playlists?.reduce((acc: number, p: any) => acc + (p._count?.lessons || 0), 0) || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">MCQ Sets</span>
                <span className="font-bold">{course.mcqExams?.length || 0}</span>
              </div>
              <Link 
                href={`/courses/${course.slug}`} 
                target="_blank"
                className="block text-center py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-all"
              >
                View Public Page
              </Link>
            </div>
          </div>

          <div className="card p-6">
            <h4 className="font-bold mb-4 flex items-center gap-2">
              <QrCode size={16} className="text-[var(--admin-accent)]" /> Payment QR Code
            </h4>
            <p className="text-sm text-slate-500 mb-4">Shown to students paying for this specific course. Falls back to the site-wide QR (Branding settings) if not set.</p>
            <div className="relative group h-40 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex flex-col items-center justify-center overflow-hidden">
              {course.paymentQrUrl ? (
                <>
                  <img src={course.paymentQrUrl} alt="Course payment QR" className="w-full h-full object-contain p-2" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm gap-2">
                    <label className="p-2.5 bg-white text-slate-900 rounded-xl cursor-pointer shadow-xl font-bold text-xs flex items-center gap-1.5">
                      {uploadingPaymentQr ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} Replace
                      <input type="file" className="hidden" accept="image/*" onChange={handlePaymentQrUpload} />
                    </label>
                    <button
                      type="button"
                      onClick={() => { setCourse({ ...course, paymentQrUrl: null }); toast.success("QR removed — click Save Changes to apply") }}
                      className="p-2.5 bg-white text-red-600 rounded-xl shadow-xl"
                      title="Remove QR"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </>
              ) : (
                <label className="flex flex-col items-center gap-2 cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    {uploadingPaymentQr ? <Loader2 className="animate-spin" size={18} /> : <QrCode size={18} />}
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Click to Upload</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handlePaymentQrUpload} />
                </label>
              )}
            </div>
          </div>

          <div className="card p-6">
            <h4 className="font-bold mb-4">MCQ Question Bank</h4>
            <p className="text-sm text-slate-500 mb-4">The question bank is shared across all courses, organized by subject — build sets for this course from any subject's questions.</p>
            <Link
              href="/lms/question-bank"
              className="btn-admin-secondary w-full justify-center"
            >
              Manage Question Bank
            </Link>
          </div>

          <div className="card p-6">
            <h4 className="font-bold mb-4">Notes</h4>
            <p className="text-sm text-slate-500 mb-4">Notes are managed centrally and can be assigned to multiple courses at once.</p>
            <Link
              href="/lms/notes"
              className="btn-admin-secondary w-full justify-center"
            >
              Manage Notes
            </Link>
          </div>

          <div className="card p-6">
            <h4 className="font-bold mb-4 text-red-600">Danger Zone</h4>
            <button
              onClick={handleDeleteCourse}
              className="w-full py-3 border border-red-200 text-red-600 rounded-xl text-sm font-bold hover:bg-red-50 transition-all flex items-center justify-center gap-2"
            >
              <Trash2 size={16} /> Delete Course
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
