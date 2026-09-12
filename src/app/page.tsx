import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { meetingService } from '@/services/meeting.service'
import { LandingView } from '@/features/marketing/LandingView'
import { DashboardView } from '@/features/dashboard/DashboardView'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return <LandingView />
  }

  const allMeetings = await meetingService.getUserMeetings(session.user.id)
  
  const upcomingMeetings = allMeetings
    .filter(m => m.status === "upcoming")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
  const recordedMeetings = allMeetings.filter(m => m.status === "recorded")

  return (
    <DashboardView 
      userName={session.user.name || "User"}
      userId={session.user.id}
      upcomingMeetings={upcomingMeetings}
      recordedMeetings={recordedMeetings}
    />
  )
}
