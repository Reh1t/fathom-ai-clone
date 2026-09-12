import prisma from "@/lib/db"

export const meetingService = {
  async getUserMeetings(userId: string) {
    return prisma.meeting.findMany({
      where: { userId },
      include: { attendees: true },
      orderBy: { date: 'desc' }
    })
  },

  async getMeetingById(meetingId: string, userId: string) {
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: { attendees: true }
    })

    if (!meeting || (meeting.userId !== userId && !meeting.isPublic)) {
      return null;
    }

    const isOwner = meeting.userId === userId;

    const transcripts = await prisma.transcriptLine.findMany({
      where: { meetingId },
      orderBy: { startTime: 'asc' }
    })

    const summaries = await prisma.summary.findMany({
      where: { meetingId }
    })

    const actionItems = await prisma.actionItem.findMany({
      where: { meetingId },
      orderBy: { createdAt: 'asc' }
    })

    return {
      meeting,
      isOwner,
      transcripts,
      summaries,
      actionItems
    }
  },

  async toggleMeetingPrivacy(meetingId: string, userId: string) {
    const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } })
    if (!meeting || meeting.userId !== userId) throw new Error("Unauthorized")

    return prisma.meeting.update({
      where: { id: meetingId },
      data: { isPublic: !meeting.isPublic }
    })
  },

  async updateActionItem(itemId: string, isCompleted: boolean) {
    return prisma.actionItem.update({
      where: { id: itemId },
      data: { isCompleted }
    })
  },

  async toggleTranscriptHighlight(lineId: string, userId: string) {
    const line = await prisma.transcriptLine.findUnique({ 
      where: { id: lineId },
      include: { meeting: true }
    })
    
    if (!line || line.meeting.userId !== userId) {
      throw new Error("Not found or unauthorized");
    }

    return prisma.transcriptLine.update({
      where: { id: lineId },
      data: { isHighlighted: !line.isHighlighted }
    })
  }
}
