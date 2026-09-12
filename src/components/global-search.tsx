"use client"

import { useState, useEffect } from "react"
import { Search, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export function GlobalSearch() {
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Debounce the query input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)
    return () => clearTimeout(handler)
  }, [query])

  // Fetch results when debounced query changes
  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedQuery.trim()) {
        setResults([])
        return
      }
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
        if (res.ok) {
          const data = await res.json()
          setResults(data.results || [])
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchResults()
  }, [debouncedQuery])

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search transcripts across all meetings..." 
          className="w-full bg-slate-100/50 hover:bg-slate-100 border-slate-200 pl-10 pr-10 text-sm focus-visible:ring-sky-500 focus-visible:bg-white transition-all text-slate-900 placeholder:text-slate-500 h-10 shadow-sm"
        />
        {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 animate-spin" />}
      </div>
      
      {query.trim() !== "" && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden z-50 flex flex-col">
          <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
            {results.length === 0 && !loading ? (
              <div className="p-8 text-center flex flex-col items-center">
                <Search className="w-8 h-8 text-slate-300 mb-3" />
                <p className="text-sm font-medium text-slate-900">No results found</p>
                <p className="text-xs text-slate-500 mt-1">Try adjusting your search terms.</p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {results.map(meeting => (
                  <Link key={meeting.id} href={`/meeting/${meeting.id}`} className="block p-3 hover:bg-slate-50 rounded-md transition-colors group">
                    <h4 className="text-sm font-semibold text-slate-900 group-hover:text-sky-600 transition-colors mb-2">{meeting.title}</h4>
                    <div className="space-y-2">
                      {meeting.transcripts.map((t: any) => (
                        <p key={t.id} className="text-xs text-slate-600 bg-slate-100/50 p-2 rounded line-clamp-2 leading-relaxed">
                          <span className="font-semibold text-slate-900 mr-1">{t.speaker}:</span>{t.text}
                        </p>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
