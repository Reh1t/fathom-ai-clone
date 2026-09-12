import { Calendar, Video, Clock, Bot, LogOut, RefreshCcw, MoreVertical } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { GlobalSearch } from "@/components/global-search"

interface Meeting {
  id: string
  title: string
  date: Date
  duration: string
  status: string
  attendees: any[]
}

interface DashboardViewProps {
  userName: string
  userId: string
  upcomingMeetings: Meeting[]
  recordedMeetings: Meeting[]
}

export function DashboardView({ userName, userId, upcomingMeetings, recordedMeetings }: DashboardViewProps) {
  const now = new Date()

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="flex items-center justify-between px-6 py-4 max-w-[1600px] mx-auto">
          <div className="flex items-center gap-3 w-auto md:w-1/4 lg:w-[250px] shrink-0">
            <Bot className="w-7 h-7 text-sky-600" />
            <span className="font-bold text-lg tracking-tight hidden sm:inline">Fathom Dashboard</span>
          </div>
          
          <div className="flex-1 max-w-2xl px-4 md:px-8">
            <GlobalSearch />
          </div>

          <div className="flex items-center gap-2 md:gap-4 w-auto md:w-1/4 lg:w-[250px] shrink-0 justify-end">
            <form action={async () => {
              "use server"
              const { syncUserCalendar } = await import('@/lib/google-calendar')
              const { revalidatePath } = await import('next/cache')
              await syncUserCalendar(userId)
              revalidatePath('/')
            }}>
              <Button type="submit" variant="outline" className="border-slate-200 hover:bg-slate-50 text-slate-700 bg-white shadow-sm font-medium h-9 px-2 md:px-4">
                <RefreshCcw className="w-4 h-4 md:mr-2" /> <span className="hidden md:inline">Sync Calendar</span>
              </Button>
            </form>
            <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>
            <a href="/api/auth/signout">
              <Button variant="ghost" className="text-slate-500 hover:text-slate-900 font-medium h-9 px-2 md:px-3">
                <LogOut className="w-4 h-4 md:mr-2" /> <span className="hidden md:inline">Sign Out</span>
              </Button>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content: 70/30 Split */}
      <main className="flex-1 p-6 max-w-[1600px] w-full mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Meetings</h1>
          <p className="text-slate-500 mt-1">Welcome back, {userName}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 items-start">
          
          {/* Left Column (70%) - Recent Recordings */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                <CardTitle className="text-lg font-bold">Recent Recordings</CardTitle>
                <CardDescription className="text-slate-500">Your latest captured meetings and generated insights.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {recordedMeetings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <Video className="w-8 h-8 text-slate-300" />
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mb-1">Your workspace is empty</h4>
                      <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                        Once you connect your calendar and complete your first meeting, your automated transcript, summary, and action items will appear here.
                      </p>
                    </div>
                  ) : (
                    recordedMeetings.map((meeting) => (
                      <Link key={meeting.id} href={`/meeting/${meeting.id}`} className="block">
                        <div className="flex items-center p-5 hover:bg-slate-50 transition-colors cursor-pointer group">
                          <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center border border-sky-100 group-hover:bg-sky-100 transition-colors shrink-0">
                            <Video className="h-5 w-5 text-sky-600" />
                          </div>
                          <div className="ml-5 flex-1 min-w-0">
                            <p className="text-base font-bold text-slate-900 truncate">{meeting.title}</p>
                            <div className="flex items-center text-sm text-slate-500 mt-1.5 gap-4">
                              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5"/> {new Date(meeting.date).toLocaleDateString()}</span>
                              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> {meeting.duration}</span>
                            </div>
                          </div>
                          <div className="flex items-center ml-4 shrink-0">
                            <div className="flex -space-x-2 mr-6">
                              {meeting.attendees.slice(0,3).map((a, i) => (
                                <Avatar key={i} className="w-8 h-8 border-2 border-white bg-slate-100 text-slate-600">
                                  <AvatarFallback className="text-xs font-semibold">{a.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                              ))}
                              {meeting.attendees.length > 3 && (
                                <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-xs text-slate-600 font-semibold z-10">
                                  +{meeting.attendees.length - 3}
                                </div>
                              )}
                            </div>
                            <MoreVertical className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors" />
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column (30%) - Upcoming Meetings */}
          <div className="space-y-6">
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-bold">Upcoming</CardTitle>
                <Calendar className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {upcomingMeetings.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-sm text-slate-500">No upcoming meetings today.</p>
                    </div>
                  ) : (
                    upcomingMeetings.map((meeting) => {
                      const isPassed = new Date(meeting.date).getTime() < now.getTime() - 30 * 60 * 1000;
                      return (
                        <div key={meeting.id} className="p-4 hover:bg-slate-50 transition-colors flex items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-bold truncate mb-1 ${isPassed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{meeting.title}</p>
                            <p className="text-xs text-slate-500 font-medium">
                              {new Date(meeting.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, {new Date(meeting.date).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'})} • {meeting.duration}
                            </p>
                          </div>
                          <div>
                            {isPassed ? (
                              <Badge variant="outline" className="bg-slate-100 text-slate-500 border-slate-200 font-medium text-xs">
                                Missed
                              </Badge>
                            ) : (
                              <Link href={`/meeting/${meeting.id}?live=true`} className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors border border-sky-200 text-xs font-bold">
                                <Bot className="h-3.5 w-3.5" /> Join
                              </Link>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </main>
    </div>
  )
}
