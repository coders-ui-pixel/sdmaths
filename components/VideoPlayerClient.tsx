"use client"

import { useEffect, useRef } from "react"
import "plyr/dist/plyr.css"

// Unlisted YouTube videos embed exactly like public ones via the standard
// oEmbed/IFrame API — "unlisted" only affects search visibility, not embedding
// or playback, so no special handling is needed beyond extracting the video ID.
function extractYouTubeId(url: string): string | null {
  const cleanUrl = url.trim()

  if (/^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) return cleanUrl

  const shortsMatch = cleanUrl.match(/youtube\.com\/shorts\/([^"&?/\s]{11})/i)
  if (shortsMatch) return shortsMatch[1]

  const embedMatch = cleanUrl.match(/youtube\.com\/embed\/([^"&?/\s]{11})/i)
  if (embedMatch) return embedMatch[1]

  const ytMatch = cleanUrl.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i)
  if (ytMatch) return ytMatch[1]

  return null
}

export function VideoPlayerClient({ lessonId, videoUrl }: { lessonId: string; videoUrl: string }) {
  const pingInterval = 15 // Ping every 15 seconds
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<import("plyr") | null>(null)

  useEffect(() => {
    // Only track if there's a valid lesson and video
    if (!lessonId || !videoUrl) return

    const intervalId = setInterval(async () => {
      try {
        await fetch("/api/progress/watch-time", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lessonId, seconds: pingInterval })
        })
      } catch (e) {
        // Silently fail if tracking request drops
        console.error("Watch tracking ping failed", e)
      }
    }, pingInterval * 1000)

    return () => clearInterval(intervalId)
  }, [lessonId, videoUrl])

  const isDirectVideo = /\.(mp4|webm|ogg|mov|m4v)($|\?)/i.test(videoUrl) || videoUrl.includes("blob:") || videoUrl.includes("/uploads/") || videoUrl.includes(".blob.core.windows.net")
  const youtubeId = !isDirectVideo ? extractYouTubeId(videoUrl) : null

  useEffect(() => {
    if (!containerRef.current) return
    let cancelled = false

    import("plyr").then(({ default: Plyr }) => {
      if (cancelled || !containerRef.current) return
      const target = containerRef.current.querySelector<HTMLElement>("video, .plyr-youtube-target")
      if (!target) return
      playerRef.current = new Plyr(target, {
        youtube: { rel: 0, showinfo: 0, iv_load_policy: 3, modestbranding: 1 }
      })
    })

    return () => {
      cancelled = true
      playerRef.current?.destroy()
      playerRef.current = null
    }
  }, [videoUrl, isDirectVideo])

  if (isDirectVideo) {
    return (
      <div ref={containerRef} className="w-full h-full">
        <video src={videoUrl} playsInline controls className="w-full h-full" />
      </div>
    )
  }

  if (youtubeId) {
    return (
      <div ref={containerRef} className="w-full h-full">
        <div className="plyr-youtube-target" data-plyr-provider="youtube" data-plyr-embed-id={youtubeId} />
      </div>
    )
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-black text-white/60 text-sm">
      Unable to load this video.
    </div>
  )
}
