import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { meetingService } from '@/services/meeting.service'
import { MeetingClient } from '@/features/meeting/MeetingClient'

export const dynamic = 'force-dynamic'

export default async function MeetingPage(props: { params: Promise<{ id: string }>, searchParams: Promise<{ live?: string }> }) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const id = params.id
  const isLive = searchParams.live === 'true'

  const session = await getServerSession(authOptions)
  const userId = session?.user ? (session.user as any).id : null

  // Pass userId as 'anonymous' if not logged in; the service will handle public links
  const initialData = await meetingService.getMeetingById(id, userId || 'anonymous')

  if (!initialData) {
    notFound()
  }

  return <MeetingClient initialData={initialData} isLive={isLive} />
}
