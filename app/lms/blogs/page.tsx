"use client"

import { useState, useEffect } from "react"
import { 
  BookOpen, Plus, Trash2, Edit2, Loader2, Upload, 
  FileText, X, Eye, Bold, Italic, Heading2, Heading3, 
  Quote, List, Sparkles, BarChart, Clock, PenTool
} from "lucide-react"
import { toast } from "react-hot-toast"

export default function BlogsAdminPage() {
  const [blogs, setBlogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit")
  
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    summary: "",
    content: "",
    imageUrl: "",
    authorName: "Admin",
    published: true
  })

  useEffect(() => {
    fetchBlogs()
  }, [])

  const fetchBlogs = async () => {
    try {
      const res = await fetch("/api/admin/blogs")
      const data = await res.json()
      if (Array.isArray(data)) {
        setBlogs(data)
      } else {
        setBlogs([])
        if (data.error) toast.error(data.error)
      }
    } catch (e) {
      toast.error("Failed to fetch blogs")
      setBlogs([])
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const fd = new FormData()
    fd.append("file", file)

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd
      })
      const data = await res.json()
      if (res.ok) {
        setFormData(p => ({ ...p, imageUrl: data.url }))
        toast.success("Header image uploaded successfully!")
      } else {
        toast.error(data.error || "Upload failed")
      }
    } catch (e) {
      toast.error("Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/admin/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      
      if (res.ok) {
        toast.success(formData.id ? "Blog post updated!" : "New blog post published!")
        setIsModalOpen(false)
        fetchBlogs()
        resetForm()
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to save blog post")
      }
    } catch (err) {
      toast.error("Error saving blog post")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post permanently?")) return
    try {
      const res = await fetch(`/api/admin/blogs?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Blog post deleted")
        fetchBlogs()
      } else {
        toast.error("Failed to delete post")
      }
    } catch (err) {
      toast.error("Error deleting post")
    }
  }

  const handleEdit = (blog: any) => {
    setFormData({
      id: blog.id,
      title: blog.title,
      summary: blog.summary,
      content: blog.content,
      imageUrl: blog.imageUrl || "",
      authorName: blog.authorName || "Admin",
      published: blog.published
    })
    setActiveTab("edit")
    setIsModalOpen(true)
  }

  const resetForm = () => {
    setFormData({
      id: "",
      title: "",
      summary: "",
      content: "",
      imageUrl: "",
      authorName: "Admin",
      published: true
    })
    setActiveTab("edit")
  }

  // Formatting helpers
  const insertFormatting = (before: string, after: string = "") => {
    const textarea = document.getElementById("blog-content-textarea") as HTMLTextAreaElement
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value
    const selected = text.substring(start, end)
    const replacement = before + selected + after
    
    setFormData(p => ({
      ...p,
      content: text.substring(0, start) + replacement + text.substring(end)
    }))
    
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length)
    }, 50)
  }

  // Word metrics
  const wordCount = formData.content ? formData.content.trim().split(/\s+/).filter(Boolean).length : 0
  const characterCount = formData.content ? formData.content.length : 0
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))

  return (
    <div className="p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold outfit">Blog Management</h2>
          <p className="text-slate-500 mt-1">Write, edit, and publish mathematical articles or platform announcements.</p>
        </div>
        <button 
          onClick={() => {
            resetForm()
            setIsModalOpen(true)
          }} 
          className="btn-admin-primary flex items-center gap-2"
        >
          <Plus size={18} /> New Blog Post
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-[var(--admin-accent)]" size={32} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(blogs) && blogs.map((blog: any) => (
            <div key={blog.id} className="card p-0 overflow-hidden group border border-slate-200 dark:border-slate-800 flex flex-col justify-between h-full bg-white dark:bg-slate-900 shadow-sm relative">
              <div>
                <div className="h-44 bg-slate-900 relative">
                  {blog.imageUrl ? (
                    <img src={blog.imageUrl} className="w-full h-full object-cover" alt={blog.title} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-white/20">
                      <FileText size={48} />
                    </div>
                  )}
                  <span className={`absolute top-3 left-3 px-3 py-1 text-[10px] font-bold tracking-widest uppercase rounded-full shadow ${
                    blog.published 
                      ? "bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300 border border-green-200 dark:border-green-900/30" 
                      : "bg-slate-100 text-slate-700 dark:bg-slate-950/60 dark:text-slate-300 border border-slate-200 dark:border-slate-800/30"
                  }`}>
                    {blog.published ? "Published" : "Draft"}
                  </span>
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEdit(blog)}
                      className="p-2 bg-[var(--admin-accent)] text-white rounded-lg hover:bg-[var(--admin-accent-hover)] shadow"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => handleDelete(blog.id)}
                      className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-center text-xs text-slate-400 mb-3 font-semibold">
                    <span>By {blog.authorName}</span>
                    <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-2 outfit line-clamp-2">{blog.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">{blog.summary}</p>
                </div>
              </div>
              <div className="px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                <a 
                  href={`/blog`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-xs text-[var(--admin-accent)] hover:text-[var(--admin-accent-hover)] font-bold flex items-center gap-1.5"
                >
                  <Eye size={14} /> View On Site
                </a>
              </div>
            </div>
          ))}
          {(!Array.isArray(blogs) || blogs.length === 0) && (
            <div className="col-span-full py-24 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/10">
              <BookOpen size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4 animate-bounce" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-2">No blogs added yet</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">Get started by clicking the "New Blog Post" button above to publish your first math article!</p>
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-4xl p-8 shadow-2xl max-h-[95vh] overflow-y-auto border border-slate-100 dark:border-slate-800 flex flex-col">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-xl font-bold outfit flex items-center gap-2">
                <PenTool size={20} className="text-[var(--admin-accent)]" />
                {formData.id ? "Edit Blog Post" : "Create Blog Post"}
              </h3>
              
              {/* Tab Selector */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab("edit")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "edit" 
                      ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm" 
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  Edit Post
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    activeTab === "preview" 
                      ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm" 
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  <Eye size={12} /> Live Preview
                </button>
              </div>

              <button 
                onClick={() => {
                  setIsModalOpen(false)
                  resetForm()
                }}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            
            {activeTab === "edit" ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Blog Title</label>
                    <input 
                      required
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-[var(--admin-accent)] transition-all text-sm font-semibold"
                      placeholder="e.g. The Marvelous World of Abstract Algebra"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Author Name</label>
                    <input 
                      required
                      value={formData.authorName}
                      onChange={e => setFormData({...formData, authorName: e.target.value})}
                      className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-[var(--admin-accent)] transition-all text-sm font-semibold"
                      placeholder="e.g. Dr. Balkrishna"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Header Thumbnail Image</label>
                  <div className="relative h-[52px]">
                    <div className="absolute inset-0 flex items-center justify-between px-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-400 text-sm truncate pr-10">{formData.imageUrl || "Upload header banner image..."}</span>
                      <label className="cursor-pointer text-[var(--admin-accent)] font-bold text-xs flex items-center gap-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-1.5 rounded-lg border border-blue-200/40">
                        {uploading ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                        {formData.imageUrl ? "Change" : "Upload"}
                        <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Summary (Short Excerpt)</label>
                  <textarea 
                    required
                    rows={2}
                    value={formData.summary}
                    onChange={e => setFormData({...formData, summary: e.target.value})}
                    className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-[var(--admin-accent)] transition-all text-sm font-semibold leading-relaxed"
                    placeholder="Provide a concise one-to-two sentence description of the article's core takeaway."
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Article Body (Content)</label>
                    
                    {/* formatting bar */}
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-200/30">
                      <button 
                        type="button" 
                        title="Bold" 
                        onClick={() => insertFormatting("**", "**")} 
                        className="p-1.5 hover:bg-white dark:hover:bg-slate-900 rounded-md text-slate-600 dark:text-slate-300"
                      >
                        <Bold size={13} />
                      </button>
                      <button 
                        type="button" 
                        title="Italic" 
                        onClick={() => insertFormatting("*", "*")} 
                        className="p-1.5 hover:bg-white dark:hover:bg-slate-900 rounded-md text-slate-600 dark:text-slate-300"
                      >
                        <Italic size={13} />
                      </button>
                      <button 
                        type="button" 
                        title="Heading 2" 
                        onClick={() => insertFormatting("## ", "\n")} 
                        className="p-1.5 hover:bg-white dark:hover:bg-slate-900 rounded-md text-slate-600 dark:text-slate-300"
                      >
                        <Heading2 size={13} />
                      </button>
                      <button 
                        type="button" 
                        title="Heading 3" 
                        onClick={() => insertFormatting("### ", "\n")} 
                        className="p-1.5 hover:bg-white dark:hover:bg-slate-900 rounded-md text-slate-600 dark:text-slate-300"
                      >
                        <Heading3 size={13} />
                      </button>
                      <button 
                        type="button" 
                        title="Blockquote" 
                        onClick={() => insertFormatting("\n> ", "\n")} 
                        className="p-1.5 hover:bg-white dark:hover:bg-slate-900 rounded-md text-slate-600 dark:text-slate-300"
                      >
                        <Quote size={13} />
                      </button>
                      <button 
                        type="button" 
                        title="Bullet List" 
                        onClick={() => insertFormatting("\n- ", "\n")} 
                        className="p-1.5 hover:bg-white dark:hover:bg-slate-900 rounded-md text-slate-600 dark:text-slate-300"
                      >
                        <List size={13} />
                      </button>
                    </div>
                  </div>
                  
                  <textarea 
                    required
                    id="blog-content-textarea"
                    rows={8}
                    value={formData.content}
                    onChange={e => setFormData({...formData, content: e.target.value})}
                    className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-[var(--admin-accent)] transition-all text-sm font-semibold leading-relaxed font-mono"
                    placeholder="Write the full body of the mathematical blog post here. Standard paragraphs and headings are supported."
                  />
                  
                  {/* live metrics indicator */}
                  <div className="flex justify-between items-center mt-2 px-1 text-[11px] font-bold text-slate-400 tracking-wide uppercase">
                    <span className="flex items-center gap-1.5"><Clock size={12} className="text-[var(--admin-accent)]" /> {readingTime} Min read</span>
                    <span className="flex items-center gap-3">
                      <span>{wordCount} Words</span>
                      <span>{characterCount} Characters</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, published: !formData.published })}
                    className={`w-10 h-6 rounded-full transition-colors relative focus:outline-none flex items-center ${
                      formData.published ? "bg-green-600 hover:bg-green-700" : "bg-slate-300 dark:bg-slate-800 hover:bg-slate-400 dark:hover:bg-slate-700"
                    }`}
                  >
                    <span className={`w-4 h-4 bg-white rounded-full transition-transform absolute shadow ${
                      formData.published ? "translate-x-5" : "translate-x-1"
                    }`} />
                  </button>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Publish Immediately (Visible to site visitors)
                  </span>
                </div>

                <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsModalOpen(false)
                      resetForm()
                    }} 
                    className="flex-1 py-4 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl font-bold transition-all text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-admin-primary flex-1 py-4 rounded-2xl font-bold text-sm"
                  >
                    {formData.id ? "Update Post" : "Publish Post"}
                  </button>
                </div>
              </form>
            ) : (
              /* High-Fidelity Live Preview Mode */
              <div className="space-y-6 max-h-[70vh] overflow-y-auto p-4 md:p-6 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800 rounded-3xl">
                <article className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-10 shadow-sm">
                  {/* Header Metadata */}
                  <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <span className="flex items-center gap-1.5"><Eye size={12} className="text-amber-500 animate-pulse" /> Live Preview</span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">By {formData.authorName || "Admin"}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5"><Clock size={12} /> {readingTime} min read</span>
                  </div>

                  {/* Title */}
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-black outfit leading-tight text-slate-800 dark:text-slate-100 mb-6">
                    {formData.title || "Untitle Article"}
                  </h1>

                  {/* Excerpt Summary */}
                  {formData.summary && (
                    <p className="text-slate-500 dark:text-slate-400 text-base italic border-l-4 border-[var(--admin-accent)] pl-4 py-1 mb-8 leading-relaxed">
                      {formData.summary}
                    </p>
                  )}

                  {/* Cover Image */}
                  {formData.imageUrl && (
                    <div className="w-full aspect-[21/9] rounded-2xl overflow-hidden mb-8 shadow-sm">
                      <img src={formData.imageUrl} alt={formData.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Article Body Content */}
                  <div className="prose prose-slate dark:prose-invert max-w-none">
                    {formData.content ? (
                      formData.content.split("\n").map((para: string, i: number) => {
                        const trimmed = para.trim()
                        if (!trimmed) return <div key={i} className="h-4" />
                        
                        if (trimmed.startsWith("### ")) {
                          return <h3 key={i} className="text-lg font-bold outfit text-slate-800 dark:text-slate-100 mt-6 mb-3">{trimmed.replace("### ", "")}</h3>
                        }
                        if (trimmed.startsWith("## ")) {
                          return <h2 key={i} className="text-xl font-black outfit text-slate-800 dark:text-slate-100 mt-8 mb-4">{trimmed.replace("## ", "")}</h2>
                        }
                        
                        return (
                          <p key={i} className="text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed mb-4">
                            {trimmed}
                          </p>
                        )
                      })
                    ) : (
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest text-center py-10">Start writing to preview your article body...</p>
                    )}
                  </div>
                </article>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
