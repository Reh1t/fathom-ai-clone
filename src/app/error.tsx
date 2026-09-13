"use client"

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Error({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Something went wrong</h1>
        <p className="text-slate-500 mb-8 leading-relaxed">
          An unexpected error occurred while loading this page. Please try again.
        </p>
        
        <div className="flex flex-col gap-3">
          <Button onClick={() => reset()} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium">
            Try again
          </Button>
          <Link href="/">
            <Button variant="outline" className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 font-medium">
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
