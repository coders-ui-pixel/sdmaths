import { NextResponse } from "next/server"
import { BlobServiceClient } from "@azure/storage-blob"
import { auth } from "@/auth"

// ─── Azure Blob Storage ────────────────────────────────────────────────────
// All uploads (images, videos, PDFs) go straight to Azure Blob Storage rather
// than the app server's own disk — sidesteps cPanel disk quotas entirely and
// avoids the Passenger .htaccess / subdomain complexity local-disk storage
// needed. The container must have public (anonymous) read access on blobs
// for the returned URLs to be viewable without a SAS token.
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING
const AZURE_STORAGE_CONTAINER_NAME = process.env.AZURE_STORAGE_CONTAINER_NAME || "uploads"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!AZURE_STORAGE_CONNECTION_STRING) {
      return NextResponse.json({ error: "Azure storage is not configured (AZURE_STORAGE_CONNECTION_STRING missing)" }, { status: 500 })
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

    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING)
    const containerClient = blobServiceClient.getContainerClient(AZURE_STORAGE_CONTAINER_NAME)
    const blockBlobClient = containerClient.getBlockBlobClient(filename)

    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: file.type }
    })

    return NextResponse.json({ url: blockBlobClient.url })
  } catch (error) {
    console.error("CRITICAL UPLOAD ERROR:", error)
    return NextResponse.json({ error: (error as Error).message || "Failed to upload file" }, { status: 500 })
  }
}
