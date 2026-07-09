import { Header } from "@/components/Header"
import { PageHero } from "@/components/ui/PageHero"

export const metadata = {
  title: "Privacy Policy",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] pb-32">
      <Header />

      <PageHero
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Privacy" }]}
        eyebrow="Legal"
        title="Privacy"
        highlight="Policy"
      />

      <div className="container max-w-4xl mx-auto px-6 -mt-12 relative z-10">
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-8 md:p-12 shadow-xl space-y-8 text-slate-600 dark:text-slate-400">

          <p className="text-sm">Last Updated: {new Date().toLocaleDateString()}</p>
          
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">1. Information We Collect</h2>
            <p className="leading-relaxed">We collect information you provide directly to us when you create an account, enroll in a course, participate in forums, or contact customer support. This may include your name, email address, phone number, and payment information.</p>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">2. How We Use Your Information</h2>
            <p className="leading-relaxed mb-4">We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide, maintain, and improve our educational services</li>
              <li>Process transactions and send related information</li>
              <li>Send technical notices, updates, security alerts, and support messages</li>
              <li>Respond to your comments, questions, and requests</li>
              <li>Monitor and analyze trends, usage, and activities in connection with our services</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">3. Data Security</h2>
            <p className="leading-relaxed">We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction. We use industry-standard encryption for sensitive data transmission.</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">4. Sharing of Information</h2>
            <p className="leading-relaxed">We do not share, sell, or rent your personal information to third parties for their marketing purposes. We may share information with vendors, consultants, and other service providers who need access to such information to carry out work on our behalf.</p>
          </div>

        </div>
      </div>
    </div>
  )
}
