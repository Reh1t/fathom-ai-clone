import { Bot, Calendar, Video, LogIn } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function LandingView() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Bot className="w-8 h-8 text-sky-600" />
          <span className="text-xl font-bold tracking-tight text-slate-900">Fathom AI</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/privacy" className="text-sm text-slate-500 hover:text-slate-900 font-medium transition-colors">Privacy</Link>
          <Link href="/terms" className="text-sm text-slate-500 hover:text-slate-900 font-medium transition-colors">Terms</Link>
          <Link href="/login">
            <Button className="bg-sky-600 hover:bg-sky-700 text-white font-medium shadow-sm">Sign In</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center py-24 px-4 text-center max-w-7xl mx-auto">
        <Badge variant="outline" className="mb-6 border-sky-200 text-sky-700 bg-sky-50 px-4 py-1.5 rounded-full text-sm font-medium">
          Autonomous Meeting Intelligence
        </Badge>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight max-w-4xl text-slate-900 leading-tight">
          Focus on the conversation.<br />We'll take the notes.
        </h1>
        <p className="text-xl text-slate-500 mb-10 max-w-2xl leading-relaxed">
          Never manually type meeting minutes again. Fathom AI autonomously joins your calendar events, captures the audio, and generates crisp, actionable intelligence.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/login">
            <Button size="lg" className="bg-sky-600 hover:bg-sky-700 text-white h-14 px-8 text-lg shadow-md font-medium">
              <LogIn className="w-5 h-5 mr-2" />
              Get Started with Google
            </Button>
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mt-24 text-left">
          <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center mb-6">
              <Calendar className="w-6 h-6 text-sky-600" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900">Calendar Sync</h3>
            <p className="text-slate-500 leading-relaxed">We securely monitor your schedule and find upcoming Google Meet and Zoom video conferences automatically.</p>
          </div>
          <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center mb-6">
              <Bot className="w-6 h-6 text-sky-600" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900">Autonomous Bots</h3>
            <p className="text-slate-500 leading-relaxed">Our AI agents join your calls seamlessly to capture high-quality audio without requiring any desktop software.</p>
          </div>
          <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center mb-6">
              <Video className="w-6 h-6 text-sky-600" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900">AI Summaries</h3>
            <p className="text-slate-500 leading-relaxed">Powered by Gemini 2.5 Flash, get instant executive summaries and extracted action items right after the call ends.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
