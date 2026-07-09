import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { auth } from "@/auth"

// ─── Asset CDN ─────────────────────────────────────────────────────────────
// Uploaded files are served from a separate domain/subdomain (Apache serving
// static files directly) rather than through the Next.js app, so large video
// uploads don't burn Node/Passenger resources. UPLOAD_DIR must point OUTSIDE
// the app's own folder — if it's nested inside the Passenger app root, cPanel's
// Passenger .htaccess (which applies by filesystem path, not by domain) ends up
// routing static asset requests through Node too. Locally, both default to the
// app's own public/uploads folder + relative URLs so dev works with no setup.
const ASSET_BASE_URL = process.env.ASSET_BASE_URL || ""
const UPLOAD_DIR = process.env.UPLOAD_DIR || join(process.cwd(), "public", "uploads")

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

    try {
      await mkdir(UPLOAD_DIR, { recursive: true })
    } catch (e) {
      // Ignore if dir exists
    }

    try {
      const path = join(UPLOAD_DIR, filename)
      await writeFile(path, buffer)
      console.log("File saved to:", path)
    } catch (writeError: any) {
      console.error("Write file error:", writeError)
      return NextResponse.json({ error: `File system error: ${writeError.message}` }, { status: 500 })
    }

    // ASSET_BASE_URL unset (local dev) → relative URL served by Next's own public/ folder.
    // ASSET_BASE_URL set (production) → absolute URL served by the separate static-file domain.
    const url = ASSET_BASE_URL ? `${ASSET_BASE_URL}/uploads/${filename}` : `/uploads/${filename}`
    return NextResponse.json({ url })
  } catch (error) {
    console.error("CRITICAL UPLOAD ERROR:", error)
    return NextResponse.json({ error: (error as Error).message || "Failed to upload file" }, { status: 500 })
  }
}
