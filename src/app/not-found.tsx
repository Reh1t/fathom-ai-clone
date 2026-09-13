import Link from 'next/link'
import { FileQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FileQuestion className="w-8 h-8 text-slate-400" />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Page not found</h1>
        <p className="text-slate-500 mb-8 leading-relaxed">
          We couldn't find the page or meeting you're looking for. It may have been deleted, or you might not have access to it.
        </p>
        
        <div className="flex flex-col gap-3">
          <Link href="/">
            <Button className="w-full bg-sky-600 hover:bg-sky-700 text-white font-medium">
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
