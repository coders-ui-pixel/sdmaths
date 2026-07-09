import { Header } from "@/components/Header"
import { PageHero } from "@/components/ui/PageHero"
import { SITE_NAME } from "@/lib/site"

export const metadata = {
  title: "Terms of Service",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] pb-32">
      <Header />

      <PageHero
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Terms" }]}
        eyebrow="Legal"
        title="Terms of"
        highlight="Service"
      />

      <div className="container max-w-4xl mx-auto px-6 -mt-12 relative z-10">
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-8 md:p-12 shadow-xl space-y-8 text-slate-600 dark:text-slate-400">

          <p className="text-sm">Last Updated: {new Date().toLocaleDateString()}</p>
          
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
            <p className="leading-relaxed">By accessing and using this website and our educational services, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.</p>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">2. Intellectual Property</h2>
            <p className="leading-relaxed">All content, including but not limited to video lectures, course materials, notes, graphics, and logos, is the property of {SITE_NAME} and is protected by copyright laws. You may not reproduce, distribute, or create derivative works without explicit written permission.</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">3. User Accounts</h2>
            <p className="leading-relaxed">To access our courses, you must create an account. You are responsible for maintaining the confidentiality of your account information and password. You agree to accept responsibility for all activities that occur under your account.</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">4. Code of Conduct</h2>
            <p className="leading-relaxed">We expect all students to maintain a respectful and positive learning environment. Harassment, cheating, or disruptive behavior in the forums or live classes will result in immediate suspension or termination of your account without a refund.</p>
          </div>

        </div>
      </div>
    </div>
  )
}
