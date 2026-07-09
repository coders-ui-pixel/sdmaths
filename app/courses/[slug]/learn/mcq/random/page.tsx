import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/auth"

export default async function RandomExamPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const session = await auth()
  if (!session) redirect(`/login?callbackUrl=/courses/${slug}/learn/mcq/random`)

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      mcqExams: { select: { id: true, isFree: true } }
    }
  })

  if (!course) notFound()

  const isSubscribed = (session?.user as any)?.role === "ADMIN" || !!(session?.user?.id && await prisma.payment.findFirst({
    where: { userId: session.user.id, courseId: course.id, status: "VERIFIED" }
  }))

  const eligibleExams = isSubscribed ? course.mcqExams : course.mcqExams.filter(e => e.isFree)

  if (eligibleExams.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-500">
            {isSubscribed ? "No exams assigned to this course yet." : "No free practice sets available yet — enroll to unlock the full set."}
          </h2>
        </div>
      </div>
    )
  }

  const randomIndex = Math.floor(Math.random() * eligibleExams.length)
  const randomExam = eligibleExams[randomIndex]

  redirect(`/courses/${course.slug}/learn/mcq/${randomExam.id}`)
}
