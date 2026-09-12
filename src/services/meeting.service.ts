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

    // Refresh expired Recall.ai S3 video URLs
    if (meeting.mediaUrl && meeting.recallId) {
      try {
        const url = new URL(meeting.mediaUrl);
        const expiresStr = url.searchParams.get('Expires');
        if (expiresStr) {
          const expiresTs = parseInt(expiresStr);
          // 10-minute buffer before actual expiration
          if (Date.now() / 1000 > expiresTs - 600) {
            const botRes = await fetch(`https://ap-northeast-1.recall.ai/api/v1/bot/${meeting.recallId}`, {
              headers: { 'Authorization': `Token ${process.env.RECALL_API_KEY || ''}` }
            });
            if (botRes.ok) {
              const botData = await botRes.json();
              let videoUrl = '';
              if (botData.bot_recordings && botData.bot_recordings.length > 0) {
                videoUrl = botData.bot_recordings[0]?.media_shortcuts?.video_mixed?.data?.download_url || '';
              } else if (botData.recordings && botData.recordings.length > 0) {
                videoUrl = botData.recordings[0]?.media_shortcuts?.video_mixed?.data?.download_url || '';
              }
              if (videoUrl) {
                await prisma.meeting.update({
                  where: { id: meeting.id },
                  data: { mediaUrl: videoUrl }
                });
                meeting.mediaUrl = videoUrl;
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to refresh expired media URL:', err);
      }
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
