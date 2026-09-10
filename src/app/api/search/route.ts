import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')
    
    if (!q) return NextResponse.json({ results: [] })
    
    // Find all meetings for the user that have at least one transcript line containing the search query
    const meetings = await prisma.meeting.findMany({
      where: { 
        userId: userId,
        transcripts: {
          some: {
            text: { contains: q, mode: 'insensitive' }
          }
        }
      },
      include: {
        transcripts: {
          where: {
            text: { contains: q, mode: 'insensitive' }
          },
          take: 3 // Only bring back the top 3 matching snippets per meeting
        }
      },
      orderBy: { date: 'desc' }
    })

    return NextResponse.json({ results: meetings })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
