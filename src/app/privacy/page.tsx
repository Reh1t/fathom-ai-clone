import Link from "next/link"
import { ArrowLeft, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-sky-500/30">
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 hover:text-slate-900 hover:bg-slate-100 bg-slate-50 border border-slate-200">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2 text-slate-900 font-semibold">
            <Shield className="w-5 h-5 text-sky-600" />
            <span>Fathom AI</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto py-16 px-6">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Privacy Policy</h1>
            <p className="text-slate-500 font-medium">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
          
          <div className="space-y-12">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight">1. Information We Collect</h2>
              <p className="text-slate-600 leading-relaxed text-lg">
                When you use Fathom AI, we collect information you provide directly to us, including your name, email address, and Google Calendar data. We request the <code className="bg-slate-100 px-1.5 py-0.5 rounded text-sky-700 font-mono text-sm">calendar.readonly</code> scope exclusively to detect and sync your upcoming video meetings.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight">2. How We Use Your Information</h2>
              <p className="text-slate-600 leading-relaxed text-lg">
                We use your Google Calendar data strictly for the purpose of identifying upcoming video conference meetings (e.g., Zoom, Google Meet). This allows our autonomous agents to join, securely record, and transcribe the meeting on your behalf to generate actionable insights. We do not read your personal emails or modify your calendar events.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight">3. Information Sharing</h2>
              <p className="text-slate-600 leading-relaxed text-lg">
                Your data is yours. We do not sell, trade, or otherwise transfer your personally identifiable information, transcripts, or AI-generated summaries to any outside parties. All meeting artifacts are kept strictly confidential and are accessible only to you and those you explicitly share them with.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight">4. Data Storage and Security</h2>
              <p className="text-slate-600 leading-relaxed text-lg">
                Your data is encrypted at rest and in transit. Our infrastructure is designed to be SOC2 compliant, utilizing enterprise-grade Postgres databases. We implement a strict variety of security measures to maintain the safety of your personal information.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight">5. Contact Us</h2>
              <p className="text-slate-600 leading-relaxed text-lg">
                If there are any questions regarding this privacy policy, or if you wish to exercise your data deletion rights, please contact our privacy team.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
