export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 py-16 px-8 flex justify-center">
      <div className="max-w-3xl space-y-6">
        <h1 className="text-4xl font-bold">Privacy Policy for Fathom AI Clone</h1>
        <p className="text-zinc-400">Last updated: {new Date().toLocaleDateString()}</p>
        
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">1. Information We Collect</h2>
          <p className="text-zinc-300">
            When you use the Fathom AI Clone, we collect information you provide directly to us, including your name, email address, and Google Calendar data. We request the <code>calendar.readonly</code> scope to access your upcoming meetings.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">2. How We Use Your Information</h2>
          <p className="text-zinc-300">
            We use your Google Calendar data strictly for the purpose of identifying upcoming video conference meetings (e.g., Zoom, Google Meet) so that our autonomous MeetingBaas bots can join and transcribe the meeting on your behalf.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">3. Information Sharing</h2>
          <p className="text-zinc-300">
            We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties. Meeting URLs are securely passed to MeetingBaas to facilitate bot deployment.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">4. Data Storage and Security</h2>
          <p className="text-zinc-300">
            Your data is stored securely in our PostgreSQL database. We implement a variety of security measures to maintain the safety of your personal information.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">5. Contact Us</h2>
          <p className="text-zinc-300">
            If there are any questions regarding this privacy policy, you may contact us using your support email.
          </p>
        </section>
      </div>
    </div>
  )
}
