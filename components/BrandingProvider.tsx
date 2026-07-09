"use client"

import React, { createContext, useContext, useEffect } from "react"

interface BrandingData {
  siteName: string
  logoUrl?: string | null
  faviconUrl?: string | null
  primaryColor: string
  secondaryColor: string
}

const BrandingContext = createContext<BrandingData | null>(null)

export const useBranding = () => {
  const context = useContext(BrandingContext)
  if (!context) throw new Error("useBranding must be used within a BrandingProvider")
  return context
}

export const BrandingProvider = ({ 
  children, 
  data 
}: { 
  children: React.ReactNode, 
  data: BrandingData 
}) => {
  useEffect(() => {
    // Apply branding colors to CSS variables
    const root = document.documentElement
    root.style.setProperty("--primary", data.primaryColor)
    root.style.setProperty("--secondary", data.secondaryColor)
    
    // Update document title and favicon if needed
    // (Title is usually handled by Next.js Metadata API, but this is a fallback or for real-time updates)
    if (data.faviconUrl) {
      const link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']") || document.createElement('link')
      link.type = 'image/x-icon'
      link.rel = 'shortcut icon'
      link.href = data.faviconUrl
      document.getElementsByTagName('head')[0].appendChild(link)
    }
  }, [data])

  return (
    <BrandingContext.Provider value={data}>
      {children}
    </BrandingContext.Provider>
  )
}
