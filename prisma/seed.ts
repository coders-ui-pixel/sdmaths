import { prisma } from "../lib/prisma"
import { SITE_NAME } from "../lib/site"
import bcrypt from "bcryptjs"
import dotenv from "dotenv"

dotenv.config()

async function main() {
  console.log("🚀 Starting Production Cleanup...")

  try {
    // 1. Delete existing data (Reverse order of dependencies)
    console.log("🧹 Clearing test data...")
    await prisma.notification.deleteMany()
    await prisma.notificationTemplate.deleteMany()
    await prisma.message.deleteMany()
    await prisma.mCQResult.deleteMany()
    await prisma.mCQQuestion.deleteMany()
    await prisma.mCQExam.deleteMany()
    await prisma.progress.deleteMany()
    await prisma.payment.deleteMany()
    await prisma.importantQuestion.deleteMany()
    await prisma.note.deleteMany()
    await prisma.lesson.deleteMany()
    await prisma.course.deleteMany()
    await prisma.session.deleteMany()
    await prisma.account.deleteMany()
    await prisma.user.deleteMany()

    console.log("✅ Database cleared.")

    // 2. Create Initial Admin
    const adminEmail = "admin@mathschool.com"
    const adminPassword = "AdminPassword2026!"
    const hashedPassword = await bcrypt.hash(adminPassword, 10)

    console.log(`👤 Creating production admin: ${adminEmail}`)
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Administrator",
        password: hashedPassword,
        role: "ADMIN",
      }
    })

    // 3. Initialize Branding
    const brandingCount = await prisma.branding.count()
    if (brandingCount === 0) {
      console.log("🎨 Initializing default branding...")
      await prisma.branding.create({
        data: {
          id: "global",
          siteName: SITE_NAME,
          primaryColor: "#3b82f6",
          secondaryColor: "#1e40af",
          heroHeadline: "Experience Mathematics",
          heroHighlight: "Like Never Before",
          heroSubtitle: "Join the most advanced online platform for mathematical excellence in Nepal."
        }
      })
    }

    console.log("✨ Site is now ready for production!")
    console.log("----------------------------------")
    console.log(`Email: ${adminEmail}`)
    console.log(`Password: ${adminPassword}`)
    console.log("----------------------------------")
    console.log("IMPORTANT: Please change the admin password immediately after logging in.")

  } catch (error) {
    console.error("❌ Cleanup failed:", error)
    process.exit(1)
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect()
  })
