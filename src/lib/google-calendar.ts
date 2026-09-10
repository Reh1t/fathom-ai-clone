import { google } from 'googleapis'
import prisma from '@/lib/db'

export async function syncUserCalendar(userId: string) {
  try {
    const account = await prisma.account.findFirst({
      where: { userId, provider: 'google' }
    })

    if (!account || !account.access_token) {
      throw new Error("No Google account linked")
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
    )
    oauth2Client.setCredentials({
      access_token: account.access_token,
      refresh_token: account.refresh_token
    })

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
    
    // Fetch events from 30 days ago to 30 days in the future
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const thirtyDaysFuture = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: thirtyDaysAgo.toISOString(),
      timeMax: thirtyDaysFuture.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    })

    const events = response.data.items || []

    const fetchedEventIds = new Set<string>()

    for (const event of events) {
      if (event.status === 'cancelled') continue

      // Find Google Meet or Zoom URL in the event description or location or hangoutLink
      let meetUrl = event.hangoutLink
      if (!meetUrl && event.description) {
        const urlMatch = event.description.match(/https:\/\/(zoom\.us|teams\.microsoft\.com|meet\.google\.com)\/[^\s]+/)
        if (urlMatch) meetUrl = urlMatch[0]
      }
      if (!meetUrl && event.location) {
        const urlMatch = event.location.match(/https:\/\/(zoom\.us|teams\.microsoft\.com|meet\.google\.com)\/[^\s]+/)
        if (urlMatch) meetUrl = urlMatch[0]
      }

      if (meetUrl && event.start?.dateTime) {
        fetchedEventIds.add(event.id!)
        // Upsert into DB
        await prisma.meeting.upsert({
          where: { id: event.id! },
          update: {
            title: event.summary || "Untitled Meeting",
            date: new Date(event.start.dateTime),
            meetUrl,
          },
          create: {
            id: event.id!,
            userId,
            title: event.summary || "Untitled Meeting",
            date: new Date(event.start.dateTime),
            duration: "30m", // Simplified
            status: "upcoming",
            meetUrl,
          }
        })
      }
    }

    // Delete any upcoming meetings in DB that no longer exist in this Google Calendar timeframe
    await prisma.meeting.deleteMany({
      where: {
        userId,
        status: 'upcoming',
        date: {
          gte: thirtyDaysAgo,
          lte: thirtyDaysFuture
        },
        id: { notIn: Array.from(fetchedEventIds) }
      }
    })
    
    return { success: true, count: events.length }
  } catch (error) {
    console.error("Calendar sync error:", error)
    return { success: false, error }
  }
}
