import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { notFound, redirect } from "next/navigation"
import { Header } from "@/components/Header"
import { CheckoutClient } from "./CheckoutClient"

export const dynamic = "force-dynamic"

export default async function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const session = await auth()

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/courses/${slug}/checkout`)
  }

  const course = await prisma.course.findUnique({ where: { slug } })
  if (!course) notFound()

  const isAdmin = (session.user as any)?.role === "ADMIN"

  const [verifiedPayment, pendingPayment, verifiedPaymentsCount] = await Promise.all([
    prisma.payment.findFirst({ where: { userId: session.user.id, courseId: course.id, status: "VERIFIED" } }),
    prisma.payment.findFirst({ where: { userId: session.user.id, courseId: course.id, status: "PENDING" } }),
    prisma.payment.count({ where: { courseId: course.id, status: "VERIFIED" } }),
  ])

  if (verifiedPayment || isAdmin) {
    redirect(`/courses/${course.slug}/learn`)
  }

  const isPromoActive = course.discountAmount > 0 && course.discountLimit > 0 && verifiedPaymentsCount < course.discountLimit
  const displayPrice = isPromoActive ? course.price - course.discountAmount : course.price

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header />
      <CheckoutClient
        course={{
          id: course.id,
          title: course.title,
          slug: course.slug,
          thumbnail: course.thumbnail,
          rawPrice: course.price,
          displayPrice,
          isFree: course.price === 0,
          isPromoActive,
          discountAmount: course.discountAmount,
          paymentQrUrl: course.paymentQrUrl,
        }}
        alreadyPending={!!pendingPayment}
        userName={session.user.name || ""}
      />
    </main>
  )
}
