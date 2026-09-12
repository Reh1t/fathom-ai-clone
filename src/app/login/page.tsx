"use client"

import { LogIn, Calendar, Bot, Zap, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signIn } from "next-auth/react"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-slate-200">
        
        {/* Left Side: Value Prop */}
        <div className="flex-1 bg-slate-900 text-white p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-12">
              <Bot className="w-8 h-8 text-sky-400" />
              <span className="text-xl font-bold">Fathom AI</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight text-white leading-tight">
              Focus on the conversation.<br />We'll take the notes.
            </h1>
            
            <p className="text-slate-400 text-lg mb-10 leading-relaxed">
              Connect your Google Calendar once. Our autonomous agent joins your scheduled meetings to record, transcribe, and extract flawless action items.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <Calendar className="w-6 h-6 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-white text-base">Seamless Calendar Sync</h3>
                  <p className="text-slate-400 text-sm mt-1 leading-relaxed">We securely detect your upcoming Google Meet and Zoom calls. No manual scheduling required.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="w-6 h-6 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-white text-base">Instant Intelligence</h3>
                  <p className="text-slate-400 text-sm mt-1 leading-relaxed">Get highly accurate transcripts, executive summaries, and assigned action items the moment your call ends.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-slate-800">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-sky-400" />
              <span>SOC2 Compliant</span>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Action */}
        <div className="flex-1 p-10 flex flex-col items-center justify-center bg-white text-center">
          <div className="max-w-xs w-full space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Get Started</h2>
              <p className="text-sm text-slate-500 mt-2">Sign in to connect your calendar</p>
            </div>
            
            <Button 
              onClick={() => signIn('google', { callbackUrl: '/' })}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white h-12 text-base font-medium shadow-sm"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Continue with Google
            </Button>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              By continuing, you agree to our Terms of Service and Privacy Policy. We request calendar access strictly to automate your meeting notes.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
