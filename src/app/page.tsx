import { Metadata } from "next"
import { Play, Calendar, Video, Clock, Search, Bot, LogIn, LogOut, RefreshCcw, PlusCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import prisma from "@/lib/db"
import Link from "next/link"
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-50">
        {/* Navigation */}
        <nav className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Bot className="w-8 h-8 text-indigo-500" />
            <span className="text-xl font-bold">Fathom AI Clone</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-sm text-zinc-400 hover:text-white">Privacy</Link>
            <Link href="/terms" className="text-sm text-zinc-400 hover:text-white">Terms</Link>
            <a href="/api/auth/signin">
              <Button className="bg-indigo-600 hover:bg-indigo-700">Sign In</Button>
            </a>
          </div>
        </nav>

        {/* Hero Section */}
        <main className="flex flex-col items-center justify-center py-24 px-4 text-center">
          <Badge variant="outline" className="mb-6 border-indigo-500/30 text-indigo-400">
            Autonomous Meeting Intelligence
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight max-w-4xl">
            Never take meeting notes manually again.
          </h1>
          <p className="text-xl text-zinc-400 mb-10 max-w-2xl">
            Connect your Google Calendar. Our autonomous bots join your Zoom and Google Meet calls, transcribe the conversation, and generate AI action items instantly.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="/api/auth/signin">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 h-14 px-8 text-lg">
                <LogIn className="w-5 h-5 mr-2" />
                Connect Google Calendar
              </Button>
            </a>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mt-24 text-left">
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
              <Calendar className="w-10 h-10 text-indigo-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Calendar Sync</h3>
              <p className="text-zinc-400">We request calendar.readonly access to monitor your schedule and find upcoming video conferences automatically.</p>
            </div>
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
              <Bot className="w-10 h-10 text-indigo-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Autonomous Bots</h3>
              <p className="text-zinc-400">MeetingBaas agents join your calls seamlessly to capture high-quality audio without any desktop software.</p>
            </div>
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
              <Video className="w-10 h-10 text-indigo-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">AI Summaries</h3>
              <p className="text-zinc-400">Powered by Gemini 2.5 Flash, get instant executive summaries and extracted action items right after the call ends.</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const allMeetings = await prisma.meeting.findMany({
    where: { userId: (session.user as any).id },
    include: { attendees: true },
    orderBy: { date: 'desc' }
  })
  
  const now = new Date()
  const upcomingMeetings = allMeetings
    .filter(m => m.status === "upcoming")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
  const recordedMeetings = allMeetings.filter(m => m.status === "recorded")

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-50">Meetings</h1>
          <p className="text-zinc-400 mt-1">Welcome back, {session.user.name}</p>
        </div>
        <div className="flex items-center gap-4">
          <form action={async () => {
            "use server"
            const { syncUserCalendar } = await import('@/lib/google-calendar')
            const { revalidatePath } = await import('next/cache')
            await syncUserCalendar((session.user as any).id)
            revalidatePath('/')
          }}>
            <Button type="submit" variant="outline" className="border-zinc-800 hover:bg-zinc-800 text-zinc-300">
              <RefreshCcw className="w-4 h-4 mr-2" /> Sync Calendar
            </Button>
          </form>
          <a href="/api/auth/signout">
            <Button variant="ghost" className="text-zinc-400 hover:text-zinc-100">
              <LogOut className="w-4 h-4 mr-2" /> Sign out
            </Button>
          </a>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-zinc-900 border-zinc-800 col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Meetings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mt-4">
              {upcomingMeetings.map((meeting) => {
                const isPassed = new Date(meeting.date).getTime() < now.getTime() - 30 * 60 * 1000;
                return (
                  <div key={meeting.id} className={`flex items-center p-3 rounded-lg bg-zinc-800/50 border ${isPassed ? 'border-red-500/30' : 'border-zinc-800/50 hover:border-indigo-500/30'} transition-colors`}>
                    <div className="flex-1 space-y-1">
                      <p className={`text-sm font-medium leading-none ${isPassed ? 'text-zinc-400 line-through' : ''}`}>{meeting.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(meeting.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'Asia/Karachi' })} at {new Date(meeting.date).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit', timeZone: 'Asia/Karachi'})} • {meeting.duration}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isPassed ? (
                        <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20">
                          Missed
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                          Starts Soon
                        </Badge>
                      )}
                      {!isPassed && (
                        <Link href={`/meeting/${meeting.id}?live=true`} className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-700 transition-colors">
                          <Bot className="h-4 w-4 text-white" />
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}
              {upcomingMeetings.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center">No upcoming meetings today.</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-900 border-zinc-800 col-span-2 lg:col-span-2 row-span-2">
          <CardHeader>
            <CardTitle>Recent Recordings</CardTitle>
            <CardDescription>Your latest captured meetings and insights.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recordedMeetings.map((meeting) => (
                <Link key={meeting.id} href={`/meeting/${meeting.id}`} className="block">
                  <div className="flex items-center p-4 rounded-xl bg-zinc-800/30 border border-zinc-800 hover:bg-zinc-800/60 transition-all cursor-pointer group">
                    <div className="w-12 h-12 rounded-lg bg-zinc-950 flex items-center justify-center border border-zinc-800 group-hover:border-indigo-500/50 transition-colors">
                      <Video className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div className="ml-4 flex-1 space-y-1">
                      <p className="text-sm font-semibold leading-none">{meeting.title}</p>
                      <div className="flex items-center text-xs text-muted-foreground mt-1 gap-3">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {meeting.duration}</span>
                        <span>{new Date(meeting.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex -space-x-2 mr-2">
                      {meeting.attendees.slice(0,3).map((a, i) => (
                        <Avatar key={i} className="w-7 h-7 border-2 border-zinc-900">
                          <AvatarFallback className="text-[10px] bg-zinc-700">{a.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      ))}
                      {meeting.attendees.length > 3 && (
                        <div className="w-7 h-7 rounded-full bg-zinc-800 border-2 border-zinc-900 flex items-center justify-center text-[10px] text-zinc-400 font-medium z-10">
                          +{meeting.attendees.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
