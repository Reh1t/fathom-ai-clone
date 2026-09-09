export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 py-16 px-8 flex justify-center">
      <div className="max-w-3xl space-y-6">
        <h1 className="text-4xl font-bold">Terms of Service for Fathom AI Clone</h1>
        <p className="text-zinc-400">Last updated: {new Date().toLocaleDateString()}</p>
        
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
          <p className="text-zinc-300">
            By accessing and using Fathom AI Clone, you accept and agree to be bound by the terms and provision of this agreement.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">2. Service Description</h2>
          <p className="text-zinc-300">
            Fathom AI Clone provides an autonomous meeting recording and transcription service. It integrates with your Google Calendar to identify meetings and deploys bots to transcribe them.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">3. User Responsibilities</h2>
          <p className="text-zinc-300">
            You are responsible for obtaining necessary consent from all meeting participants before using this service to record or transcribe conversations.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">4. Limitation of Liability</h2>
          <p className="text-zinc-300">
            In no event shall Fathom AI Clone be liable for any indirect, incidental, special, consequential or punitive damages arising out of your use of the service.
          </p>
        </section>
      </div>
    </div>
  )
}
