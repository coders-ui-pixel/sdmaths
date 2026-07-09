import { Header } from "@/components/Header"
import { BookOpen, Search } from "lucide-react"

export const metadata = {
  title: "Notes & Materials",
  description: "Download premium PDF notes, cheat sheets, and study materials.",
}

export default function NotesPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-white">
        <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-white opacity-10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="container relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-extrabold outfit mb-4">
              Study <span className="text-blue-200">Notes</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8">
              Premium cheat sheets, formula guides, and chapter-wise study materials.
            </p>
            
            <div className="relative max-w-md">
              <input 
                type="text" 
                placeholder="Search notes..." 
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm transition-all"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-200" size={20} />
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20">
        <div className="container">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 text-[var(--primary)] rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <BookOpen size={40} />
            </div>
            <h2 className="text-2xl font-bold outfit mb-3">No Notes Published Yet</h2>
            <p className="text-slate-500 max-w-md">
              Our expert instructors are currently preparing high-quality study materials. Check back soon for premium PDF notes and guides!
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
