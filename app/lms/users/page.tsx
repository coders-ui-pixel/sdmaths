"use client"

import { useState, useEffect } from "react"
import { Users, Shield, User, Search, Download, Loader2, Eye, EyeOff, X, UserPlus } from "lucide-react"
import { toast } from "react-hot-toast"

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("ALL")

  // Admin creation states
  const [showAddAdmin, setShowAddAdmin] = useState(false)
  const [adminName, setAdminName] = useState("")
  const [adminEmail, setAdminEmail] = useState("")
  const [adminPassword, setAdminPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users")
      const data = await res.json()
      setUsers(data)
    } catch (error) {
      toast.error("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    window.location.href = "/api/admin/users/export"
  }

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: adminName,
          email: adminEmail,
          password: adminPassword
        })
      })

      const data = await res.json()

      if (res.ok) {
        toast.success("New administrator created successfully!")
        setShowAddAdmin(false)
        setAdminName("")
        setAdminEmail("")
        setAdminPassword("")
        setShowPassword(false)
        fetchUsers() // Refresh list dynamically!
      } else {
        toast.error(data.error || "Failed to create administrator")
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.")
    } finally {
      setCreating(false)
    }
  }

  const filtered = users.filter((u: any) => {
    const matchesSearch = u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === "ALL" || u.role === filter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="p-6">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold outfit">User Management</h2>
          <p className="text-slate-500 mt-1">View and manage students and administrative accounts.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddAdmin(true)}
            className="px-5 py-2.5 bg-[var(--admin-accent)] hover:bg-[var(--admin-accent-hover)] text-white rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-lg"
          >
            <UserPlus size={18} /> Add New Admin
          </button>
          <button 
            onClick={handleExport}
            className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-lg"
          >
            <Download size={18} /> Export Students (.CSV)
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative max-w-sm w-full">
          <input 
            type="text" 
            placeholder="Search users by name or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-[var(--admin-accent)] outline-none transition-all shadow-sm"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        </div>
        <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
          {[
            { id: "ALL", label: "All" },
            { id: "STUDENT", label: "Students" },
            { id: "ADMIN", label: "Admins" }
          ].map((f) => (
            <button 
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${
                filter === f.id ? "bg-white dark:bg-slate-700 shadow-sm text-[var(--admin-accent)]" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-[var(--admin-accent)]" size={32} />
        </div>
      ) : (
        <div className="card p-0 overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-sm">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="text-left px-8 py-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">User</th>
                <th className="text-left px-6 py-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">Role</th>
                <th className="text-left px-6 py-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">Enrolled Courses</th>
                <th className="text-left px-6 py-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">Joined</th>
                <th className="text-right px-8 py-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((user: any) => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-[var(--admin-accent)] to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                        {user.image ? <img src={user.image} className="w-full h-full rounded-full" /> : user.name?.charAt(0).toUpperCase() || <User size={18} />}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{user.name || "N/A"}</div>
                        <div className="text-slate-400 text-xs font-medium">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {user.role === "ADMIN" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-purple-600 bg-purple-50 dark:bg-purple-900/20 px-3 py-1 rounded-lg">
                        <Shield size={12} /> Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-600 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-lg">
                        <Users size={12} /> Student
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-[var(--admin-accent)] flex items-center justify-center font-black text-xs">
                        {user._count.payments}
                      </div>
                      <span className="text-xs font-bold text-slate-500">Courses</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-slate-500 font-bold text-xs uppercase">
                    {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className="text-green-500 font-black text-[10px] uppercase tracking-widest flex items-center justify-end gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" /> Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          {filtered.length === 0 && (
            <div className="py-20 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">
              No users found matching your criteria.
            </div>
          )}
        </div>
      )}

      {/* Add New Admin Modal */}
      {showAddAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl p-8 relative max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button 
              onClick={() => {
                setShowAddAdmin(false)
                setAdminName("")
                setAdminEmail("")
                setAdminPassword("")
                setShowPassword(false)
              }}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="mb-6 text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-[var(--admin-accent)] dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <UserPlus size={24} />
              </div>
              <h3 className="text-xl font-bold outfit" style={{ color: "#000000" }}>Add New Administrator</h3>
              <p className="text-slate-500 text-sm mt-1">Register a new admin with full system permissions.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateAdmin} className="space-y-5">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest block mb-2 ml-1" style={{ color: "#475569" }}>Admin Name</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-[var(--admin-accent)] transition-all text-sm font-semibold"
                  style={{ color: "#000000" }}
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest block mb-2 ml-1" style={{ color: "#475569" }}>Email Address</label>
                <input 
                  type="email"
                  required
                  placeholder="e.g. john@mathschool.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-[var(--admin-accent)] transition-all text-sm font-semibold"
                  style={{ color: "#000000" }}
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest block mb-2 ml-1" style={{ color: "#475569" }}>Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full pl-5 pr-12 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:border-[var(--admin-accent)] transition-all text-sm font-semibold font-mono"
                    style={{ color: "#000000" }}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => {
                    setShowAddAdmin(false)
                    setAdminName("")
                    setAdminEmail("")
                    setAdminPassword("")
                    setShowPassword(false)
                  }}
                  className="flex-1 py-3.5 border rounded-2xl font-bold transition-all text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                  style={{ color: "#000000", borderColor: "#cbd5e1", backgroundColor: "#ffffff" }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-3.5 rounded-2xl font-bold transition-all text-sm flex items-center justify-center gap-2 shadow-lg hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: "#2563eb", color: "#ffffff", border: "none" }}
                >
                  {creating ? <Loader2 className="animate-spin" size={16} /> : "Create Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
