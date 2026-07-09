"use client"

import { useState, useEffect } from "react"
import { Palette, Upload, Loader2, Save, Image as ImageIcon } from "lucide-react"
import { toast } from "react-hot-toast"

export default function BrandingPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  
  const [branding, setBranding] = useState({
    logoUrl: "",
    faviconUrl: "",
    paymentQrUrl: "",
    contactEmail: "",
    contactPhone: "",
    facebookUrl: "",
    instagramUrl: "",
    youtubeUrl: "",
    telegramUrl: "",
    primaryColor: "#3b82f6",
    secondaryColor: "#1e40af",
    heroHeadline: "",
    heroHighlight: "",
    heroSubtitle: "",
    aboutImageUrl: ""
  })

  useEffect(() => {
    fetch("/api/branding")
      .then(res => res.json())
      .then(data => {
        if (data) {
          setBranding({
            logoUrl: data.logoUrl || "",
            faviconUrl: data.faviconUrl || "",
            paymentQrUrl: data.paymentQrUrl || "",
            contactEmail: data.contactEmail || "",
            contactPhone: data.contactPhone || "",
            facebookUrl: data.facebookUrl || "",
            instagramUrl: data.instagramUrl || "",
            youtubeUrl: data.youtubeUrl || "",
            telegramUrl: data.telegramUrl || "",
            primaryColor: data.primaryColor || "#3b82f6",
            secondaryColor: data.secondaryColor || "#1e40af",
            heroHeadline: data.heroHeadline || "",
            heroHighlight: data.heroHighlight || "",
            heroSubtitle: data.heroSubtitle || "",
            aboutImageUrl: data.aboutImageUrl || ""
          })
        }
        setLoading(false)
      })
  }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(field)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      })
      const data = await res.json()
      if (res.ok) {
        setBranding(prev => ({ ...prev, [field]: data.url }))
        toast.success("Uploaded successfully")
      } else {
        toast.error(data.error || "Upload failed")
      }
    } catch (e) {
      toast.error("Upload failed")
    } finally {
      setUploading(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch("/api/branding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(branding)
      })
      if (res.ok) {
        toast.success("Branding updated!")
      } else {
        toast.error("Failed to update")
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin inline mr-2" /> Loading branding settings...</div>

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 pb-20">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border-none">
        <div>
          <h2 className="text-3xl font-black outfit flex items-center gap-3">
            <Palette className="text-[var(--admin-accent)]" size={32} />
            Site Branding
          </h2>
          <p className="text-slate-500 mt-1 font-medium">Customize your site's identity and global assets.</p>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={saving}
          className="px-8 py-3.5 !bg-blue-600 hover:!bg-blue-700 !text-white rounded-2xl font-black flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          Save Changes
        </button>
      </div>

      <form className="space-y-8">
        {/* Core Identity */}
        <div className="card p-8 bg-white dark:bg-slate-900 shadow-xl rounded-[2.5rem] border-none">
          <h3 className="text-xl font-bold outfit mb-8 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[var(--admin-accent)]/10 text-[var(--admin-accent)] flex items-center justify-center">🏫</span>
            Core Identity
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Site Name</label>
              <div className="w-full px-5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold flex items-center gap-2">
                🔒 SOM <span className="text-xs font-medium text-slate-400 normal-case">(locked, cannot be changed)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <UploadField 
                label="Site Logo" 
                value={branding.logoUrl} 
                onUpload={(e) => handleUpload(e, "logoUrl")}
                isUploading={uploading === "logoUrl"}
              />
              <UploadField 
                label="Favicon" 
                value={branding.faviconUrl} 
                onUpload={(e) => handleUpload(e, "faviconUrl")}
                isUploading={uploading === "faviconUrl"}
              />
            </div>
          </div>
        </div>

        {/* Payment & Contact */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card p-8 bg-white dark:bg-slate-900 shadow-xl rounded-[2.5rem] border-none">
            <h3 className="text-xl font-bold outfit mb-8 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center">💳</span>
              Payment Settings
            </h3>
            <UploadField 
              label="Payment QR Code" 
              value={branding.paymentQrUrl} 
              onUpload={(e) => handleUpload(e, "paymentQrUrl")}
              isUploading={uploading === "paymentQrUrl"}
              large
            />
          </div>

          <div className="card p-8 bg-white dark:bg-slate-900 shadow-xl rounded-[2.5rem] border-none">
            <h3 className="text-xl font-bold outfit mb-8 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center">📞</span>
              Contact Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 ml-1">Contact Email</label>
                <input
                  type="email"
                  value={branding.contactEmail}
                  onChange={e => setBranding(p => ({ ...p, contactEmail: e.target.value }))}
                  className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-[var(--admin-accent)] transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 ml-1">Contact Phone</label>
                <input
                  type="text"
                  value={branding.contactPhone}
                  onChange={e => setBranding(p => ({ ...p, contactPhone: e.target.value }))}
                  className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-[var(--admin-accent)] transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="card p-8 bg-white dark:bg-slate-900 shadow-xl rounded-[2.5rem] border-none">
          <h3 className="text-xl font-bold outfit mb-8 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">🌐</span>
            Social Media Links
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {["facebookUrl", "instagramUrl", "youtubeUrl", "telegramUrl"].map(f => (
              <div key={f}>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 ml-1">{f.replace("Url", "").toUpperCase()} URL</label>
                <input
                  type="url"
                  value={(branding as any)[f]}
                  onChange={e => setBranding(p => ({ ...p, [f]: e.target.value }))}
                  className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-[var(--admin-accent)] transition-all"
                  placeholder={`https://${f.replace("Url", "")}.com/...`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Hero Section */}
        <div className="card p-8 bg-white dark:bg-slate-900 shadow-xl rounded-[2.5rem] border-none">
          <h3 className="text-xl font-bold outfit mb-8 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[var(--admin-accent)]/10 text-[var(--admin-accent)] flex items-center justify-center">✨</span>
            Homepage Hero Section
          </h3>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 ml-1">Main Headline</label>
                <input
                  type="text"
                  value={branding.heroHeadline}
                  onChange={e => setBranding(p => ({ ...p, heroHeadline: e.target.value }))}
                  className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-[var(--admin-accent)] transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 ml-1">Highlight Text</label>
                <input
                  type="text"
                  value={branding.heroHighlight}
                  onChange={e => setBranding(p => ({ ...p, heroHighlight: e.target.value }))}
                  className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-[var(--admin-accent)] transition-all"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 ml-1">Subtitle / Description</label>
              <textarea
                value={branding.heroSubtitle}
                onChange={e => setBranding(p => ({ ...p, heroSubtitle: e.target.value }))}
                rows={3}
                className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-[var(--admin-accent)] transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* About Page Image Section */}
        <div className="card p-8 bg-white dark:bg-slate-900 shadow-xl rounded-[2.5rem] border-none">
          <h3 className="text-xl font-bold outfit mb-8 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">🖼️</span>
            About Page Settings
          </h3>
          <div className="max-w-md">
            <UploadField 
              label="About Us Page Image" 
              value={branding.aboutImageUrl} 
              onUpload={(e: React.ChangeEvent<HTMLInputElement>) => handleUpload(e, "aboutImageUrl")}
              isUploading={uploading === "aboutImageUrl"}
              large
            />
          </div>
        </div>
      </form>
    </div>
  )
}

function UploadField({ label, value, onUpload, isUploading, large = false }: {
  label: string
  value: string
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  isUploading: boolean
  large?: boolean
}) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 ml-1">{label}</label>
      <div className={`relative group ${large ? 'h-48' : 'h-32'} rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-[var(--admin-accent)]/50`}>
        {value ? (
          <>
            <img src={value} alt={label} className="w-full h-full object-contain p-2" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
              <label className="p-3 bg-white text-slate-900 rounded-xl cursor-pointer shadow-xl font-bold text-xs flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                <Upload size={14} /> Replace
                <input type="file" className="hidden" accept="image/*" onChange={onUpload} />
              </label>
            </div>
          </>
        ) : (
          <label className="flex flex-col items-center gap-2 cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              {isUploading ? <Loader2 className="animate-spin" size={20} /> : <ImageIcon size={20} />}
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Click to Upload</span>
            <input type="file" className="hidden" accept="image/*" onChange={onUpload} />
          </label>
        )}
      </div>
    </div>
  )
}
