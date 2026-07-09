import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { auth } from "@/auth"

// ─── Asset CDN base URL ───────────────────────────────────────────────────────
// All uploaded files are served from the CDN rather than the app's own domain.
const ASSET_BASE_URL = "https://assets.sdmaths.com"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    // Basic file type validation (including video formats)
    const allowedTypes = [
      "image/",
      "video/",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "application/zip",
      "application/x-zip-compressed"
    ]
    const isAllowed = allowedTypes.some(type => file.type.startsWith(type) || file.type === type)
    if (!isAllowed) {
      return NextResponse.json({ error: "File type not allowed. Please upload an image, video, PDF, Word document, text file, or zip file." }, { status: 400 })
    }

    // Size validation: Video up to 2GB, other files up to 25MB
    const maxVideoSize = 2 * 1024 * 1024 * 1024 // 2 GB
    const maxNormalSize = 25 * 1024 * 1024 // 25 MB
    
    const isVideo = file.type.startsWith("video/")
    const sizeLimit = isVideo ? maxVideoSize : maxNormalSize
    
    if (file.size > sizeLimit) {
      const errorMsg = isVideo 
        ? "Video file too large (max 2GB)" 
        : "File too large (max 25MB)"
      return NextResponse.json({ error: errorMsg }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Sanitize filename: remove all special characters except . and -
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "-")
    const filename = `${Date.now()}-${sanitizedName}`
    const uploadDir = join(process.cwd(), "public", "uploads")
    
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (e) {
      // Ignore if dir exists
    }

    try {
      const path = join(uploadDir, filename)
      await writeFile(path, buffer)
      console.log("File saved to:", path)
    } catch (writeError: any) {
      console.error("Write file error:", writeError)
      return NextResponse.json({ error: `File system error: ${writeError.message}` }, { status: 500 })
    }

    // Return the full CDN URL instead of a relative path
    const url = `${ASSET_BASE_URL}/uploads/${filename}`
    return NextResponse.json({ url })
  } catch (error) {
    console.error("CRITICAL UPLOAD ERROR:", error)
    return NextResponse.json({ error: (error as Error).message || "Failed to upload file" }, { status: 500 })
  }
}
