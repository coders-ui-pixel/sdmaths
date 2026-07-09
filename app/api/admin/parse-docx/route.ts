import { NextResponse } from "next/server"
import { auth } from "@/auth"
import mammoth from "mammoth"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Parse DOCX to raw text using mammoth
    const { value: rawText } = await mammoth.extractRawText({ buffer })
    
    let question = ""
    let answer = ""

    // Match Question: / Answer: or Q: / A: (case insensitive)
    const qMatch = rawText.match(/(?:Question|Q)\s*:\s*([\s\S]*?)(?=(?:Answer|A)\s*:|$)/i)
    const aMatch = rawText.match(/(?:Answer|A)\s*:\s*([\s\S]*)$/i)

    if (qMatch && qMatch[1]) {
      question = qMatch[1].trim()
    }
    if (aMatch && aMatch[1]) {
      answer = aMatch[1].trim()
    }

    // Fallback if parsing fails to find the prefixes
    if (!question && !answer) {
      const lines = rawText.split("\n").map(l => l.trim()).filter(Boolean)
      if (lines.length > 0) {
        question = lines[0]
        answer = lines.slice(1).join("\n")
      }
    }

    return NextResponse.json({ question, answer, rawText })
  } catch (error: any) {
    console.error("DOCX PARSING ERROR:", error)
    return NextResponse.json({ error: error.message || "Failed to parse Word file" }, { status: 500 })
  }
}
