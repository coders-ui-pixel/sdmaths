import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET() {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const blogs = await prisma.blogPost.findMany({
      orderBy: { createdAt: "desc" }
    })
    return NextResponse.json(blogs)
  } catch (e) {
    console.error("[BLOGS_GET_ERROR]", e)
    return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { id, title, summary, content, imageUrl, authorName, published } = body

    if (!title || !summary || !content) {
      return NextResponse.json({ error: "Title, Summary, and Content are required" }, { status: 400 })
    }

    // Generate clean base slug from title
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")

    if (id) {
      // Update existing blog - NEVER mutate the slug on edit to preserve URL integrity and avoid unique constraint conflicts!
      const updatedBlog = await prisma.blogPost.update({
        where: { id },
        data: {
          title,
          summary,
          content,
          imageUrl: imageUrl || null,
          authorName: authorName || "Admin",
          published: published !== undefined ? published : true
        }
      })
      return NextResponse.json(updatedBlog)
    } else {
      // Check if a post with baseSlug already exists to determine if we can use the pristine slug or if we need a suffix
      const existing = await prisma.blogPost.findUnique({
        where: { slug: baseSlug }
      })
      const finalSlug = existing 
        ? `${baseSlug}-${Math.random().toString(36).substring(2, 6)}` 
        : baseSlug

      // Create new blog
      const newBlog = await prisma.blogPost.create({
        data: {
          title,
          slug: finalSlug,
          summary,
          content,
          imageUrl: imageUrl || null,
          authorName: authorName || "Admin",
          published: published !== undefined ? published : true
        }
      })
      return NextResponse.json(newBlog)
    }
  } catch (e) {
    console.error("[BLOGS_POST_ERROR]", e)
    return NextResponse.json({ error: "Failed to save blog post" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })

    await prisma.blogPost.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("[BLOGS_DELETE_ERROR]", e)
    return NextResponse.json({ error: "Failed to delete blog post" }, { status: 500 })
  }
}
