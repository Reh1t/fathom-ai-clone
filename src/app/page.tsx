import { Metadata } from "next"
import { Play, Calendar, Video, Clock, Search, Bot } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { meetings } from "@/fixtures/meetings"
import Link from "next/link"

export default function DashboardPage() {
  const upcomingMeetings = meetings.filter(m => m.status === "upcoming")
  const recordedMeetings = meetings.filter(m => m.status === "recorded")

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search meetings..." className="pl-8 bg-zinc-900 border-zinc-800" />
          </div>
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
              {upcomingMeetings.map((meeting) => (
                <div key={meeting.id} className="flex items-center p-3 rounded-lg bg-zinc-800/50 border border-zinc-800/50 hover:border-indigo-500/30 transition-colors">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{meeting.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(meeting.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {meeting.duration}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                      Starts Soon
                    </Badge>
                    <Link href={`/meeting/${meeting.id}?live=true`} className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-700 transition-colors">
                      <Bot className="h-4 w-4 text-white" />
                    </Link>
                  </div>
                </div>
              ))}
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
