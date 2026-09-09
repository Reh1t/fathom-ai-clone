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

    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({
      access_token: account.access_token,
      refresh_token: account.refresh_token
    })

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
    
    // Fetch events for the next 24 hours
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: now.toISOString(),
      timeMax: tomorrow.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    })

    const events = response.data.items || []

    for (const event of events) {
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
    
    return { success: true, count: events.length }
  } catch (error) {
    console.error("Calendar sync error:", error)
    return { success: false, error }
  }
}
