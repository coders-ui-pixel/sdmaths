"use client"

import { useEffect, useRef } from "react"

function getEmbedUrl(url: string): string {
  if (!url) return ""
  
  const cleanUrl = url.trim()
  
  // If it's already a YouTube embed link, return it
  if (cleanUrl.includes("/embed/")) {
    return cleanUrl
  }
  
  // YouTube Shorts check
  const shortsMatch = cleanUrl.match(/youtube\.com\/shorts\/([^"&?\/\s]{11})/i)
  if (shortsMatch) {
    return `https://www.youtube.com/embed/${shortsMatch[1]}`
  }
  
  // Standard, Share, Mobile, and Playlist YouTube URL formats
  const ytMatch = cleanUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i)
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`
  }
  
  // If it's a raw 11 character ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) {
    return `https://www.youtube.com/embed/${cleanUrl}`
  }
  
  return cleanUrl
}

export function VideoPlayerClient({ lessonId, videoUrl }: { lessonId: string, videoUrl: string }) {
  const pingInterval = 15 // Ping every 15 seconds
  
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

  const isDirectVideo = /\.(mp4|webm|ogg|mov|m4v)($|\?)/i.test(videoUrl) || videoUrl.includes("blob:") || videoUrl.includes("/uploads/");

  if (isDirectVideo) {
    return (
      <video 
        src={videoUrl} 
        controls 
        className="w-full h-full bg-black"
      />
    )
  }

  // YouTube Shorts check
  let finalEmbedUrl = getEmbedUrl(videoUrl)
  if (videoUrl.includes("/shorts/")) {
    const shortsMatch = videoUrl.match(/youtube\.com\/shorts\/([^"&?\/\s]{11})/i)
    if (shortsMatch) {
      finalEmbedUrl = `https://www.youtube.com/embed/${shortsMatch[1]}`
    }
  }

  return (
    <iframe 
      src={finalEmbedUrl} 
      className="w-full h-full border-0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
      allowFullScreen
    />
  )
}
