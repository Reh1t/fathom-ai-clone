import Link from "next/link"
import { ArrowLeft, Scale } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TermsOfService() {
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
            <Scale className="w-5 h-5 text-sky-600" />
            <span>Fathom AI</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto py-16 px-6">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Terms of Service</h1>
            <p className="text-slate-500 font-medium">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
          
          <div className="space-y-12">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight">1. Acceptance of Terms</h2>
              <p className="text-slate-600 leading-relaxed text-lg">
                By accessing and using Fathom AI, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight">2. Service Description</h2>
              <p className="text-slate-600 leading-relaxed text-lg">
                Fathom AI provides an autonomous meeting recording and transcription service. By connecting your Google Calendar, you authorize our AI agents to detect your video conferences and automatically join them as a participant to transcribe and generate meeting intelligence.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight">3. User Responsibilities & Consent</h2>
              <p className="text-slate-600 leading-relaxed text-lg">
                You are strictly responsible for obtaining necessary, legally required consent from all meeting participants before using this service to record or transcribe conversations. Fathom AI is a tool provided for your convenience, and you agree to use it in compliance with all applicable local, state, and federal wiretapping and recording laws.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight">4. Limitation of Liability</h2>
              <p className="text-slate-600 leading-relaxed text-lg">
                In no event shall Fathom AI, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
