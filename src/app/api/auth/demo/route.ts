import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { provisionDemoWorkspace } from '@/lib/provision'
import { randomUUID } from 'crypto'

export async function GET(request: Request) {
  try {
    let demoUser = await prisma.user.findUnique({ where: { email: 'evaluator@demo.local' } })
    
    if (!demoUser) {
      demoUser = await prisma.user.create({ 
        data: { 
          name: 'Evaluator', 
          email: 'evaluator@demo.local' 
        } 
      })
      await provisionDemoWorkspace(demoUser.id)
    } else {
      // Check if we need to re-provision because of incomplete transcripts (from before we expanded the fixtures)
      const existingDemoMeeting = await prisma.meeting.findFirst({
        where: { userId: demoUser.id, isDemo: true },
        include: {
          transcripts: {
            orderBy: { endTime: 'desc' },
            take: 1
          }
        }
      })

      if (existingDemoMeeting) {
        const hasM5 = await prisma.meeting.findFirst({
          where: { userId: demoUser.id, title: 'Q4 Product Launch Kickoff' }
        })

        if (!hasM5) {
          // Wipe old demo data to force re-provisioning with m5
          console.log('Missing m5 meeting detected. Wiping and re-provisioning...')
          await prisma.meeting.deleteMany({ where: { userId: demoUser.id, isDemo: true } })
          await provisionDemoWorkspace(demoUser.id)
        }
      } else {
        await provisionDemoWorkspace(demoUser.id)
      }
    }

    const sessionToken = randomUUID()
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    
    await prisma.session.create({
      data: {
        sessionToken,
        userId: demoUser.id,
        expires
      }
    })

    const url = new URL(request.url)
    const callbackUrl = url.searchParams.get('callbackUrl') || '/'
    
    const response = NextResponse.redirect(new URL(callbackUrl, request.url))
    
    // Set NextAuth session cookie
    const isSecure = request.url.startsWith('https://') || process.env.NODE_ENV === 'production'
    const cookieName = isSecure ? '__Secure-next-auth.session-token' : 'next-auth.session-token'
    
    response.cookies.set(cookieName, sessionToken, {
      expires,
      path: '/',
      sameSite: 'lax',
      httpOnly: true,
      secure: isSecure
    })
    
    return response
  } catch (error) {
    console.error("Demo login error:", error)
    return NextResponse.redirect(new URL('/login?error=DemoLoginFailed', request.url))
  }
}
