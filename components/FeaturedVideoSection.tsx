"use client"

import { motion } from "framer-motion"
import { Play, Video } from "lucide-react"
import { useState } from "react"

export function FeaturedVideoSection({ videos }: { videos: any[] }) {
  const [activeVideo, setActiveVideo] = useState<string | null>(null)

  if (!videos || videos.length === 0) return null

  return (
    <section className="relative py-16 md:py-24 bg-gradient-to-br from-[var(--secondary)]/[0.05] via-slate-50 to-[var(--primary)]/[0.05] dark:from-[var(--secondary)]/[0.06] dark:via-slate-900/30 dark:to-[var(--primary)]/[0.06] overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <span className="section-eyebrow mb-4 inline-flex">Free Preview</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black outfit mb-4">Sample Lectures</h2>
          <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
            Get a taste of our expert teaching style with these sample video lectures.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {videos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-slate-800 rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all group"
            >
              <div 
                className="aspect-video bg-slate-900 relative cursor-pointer"
                onClick={() => setActiveVideo(video.videoUrl)}
              >
                {video.thumbnailUrl ? (
                  <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20">
                    <Video size={48} />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <div
                     className="w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transform scale-75 group-hover:scale-100 transition-transform"
                     style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))" }}
                   >
                      <Play className="text-white fill-white" size={24} />
                   </div>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-xl font-bold outfit mb-2">{video.title}</h3>
                <p className="text-sm text-slate-500 uppercase font-black tracking-widest">Free Sample Lecture</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {activeVideo && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 md:p-10 bg-slate-950/90 backdrop-blur-md" onClick={() => setActiveVideo(null)}>
          <div className="w-full max-w-5xl aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setActiveVideo(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
               <Play className="rotate-45" size={20} />
            </button>
            {(() => {
              const isDirectVideo = /\.(mp4|webm|ogg|mov|m4v)($|\?)/i.test(activeVideo) || activeVideo.includes("blob:") || activeVideo.includes("/uploads/");
              if (isDirectVideo) {
                return (
                  <video 
                    src={activeVideo} 
                    controls 
                    autoPlay
                    className="w-full h-full"
                  />
                )
              }

              let embedUrl = activeVideo.trim()
              
              if (embedUrl.includes("/embed/")) {
                if (!embedUrl.includes("autoplay=1")) {
                  embedUrl += embedUrl.includes("?") ? "&autoplay=1" : "?autoplay=1"
                }
              } else {
                const shortsMatch = embedUrl.match(/youtube\.com\/shorts\/([^"&?\/\s]{11})/i)
                const ytMatch = embedUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i)
                
                if (shortsMatch) {
                  embedUrl = `https://www.youtube.com/embed/${shortsMatch[1]}?autoplay=1`
                } else if (ytMatch) {
                  embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`
                } else if (/^[a-zA-Z0-9_-]{11}$/.test(embedUrl)) {
                  embedUrl = `https://www.youtube.com/embed/${embedUrl}?autoplay=1`
                } else if (embedUrl.includes("vimeo.com")) {
                  const vimeoMatch = embedUrl.match(/vimeo\.com\/(?:video\/)?([0-9]+)/i)
                  if (vimeoMatch) {
                    embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`
                  }
                }
              }

              return (
                <iframe 
                  src={embedUrl} 
                  className="w-full h-full border-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )
            })()}
          </div>
        </div>
      )}
    </section>
  )
}
