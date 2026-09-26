"use client"

import { useState, useEffect, useRef } from "react"
import { Search, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export function GlobalSearch() {
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  const inputRef = useRef<HTMLInputElement>(null)

  // Cmd+K global shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

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

  // Helper to highlight matching substrings
  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const safeHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${safeHighlight})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={i} className="bg-amber-200 text-slate-900 rounded-sm px-0.5">{part}</mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  }

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input 
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search transcripts across all meetings..." 
          className="w-full bg-slate-100/50 hover:bg-slate-100 border-slate-200 pl-10 pr-16 text-sm focus-visible:ring-sky-500 focus-visible:bg-white transition-all text-slate-900 placeholder:text-slate-500 h-10 shadow-sm"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
          {loading && <Loader2 className="h-4 w-4 text-slate-400 animate-spin" />}
          {!loading && !query && (
            <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 font-mono text-[10px] font-medium text-slate-500">
              <span className="text-xs">⌘</span>K
            </kbd>
          )}
        </div>
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
                  <div key={meeting.id} className="block p-3 hover:bg-slate-50 rounded-md transition-colors group">
                    <h4 className="text-sm font-semibold text-slate-900 mb-2 group-hover:text-sky-600 transition-colors">
                      <Link href={`/meeting/${meeting.id}`} className="hover:underline">{meeting.title}</Link>
                    </h4>
                    <div className="space-y-2">
                      {meeting.transcripts.map((t: any) => (
                        <Link 
                          key={t.id} 
                          href={`/meeting/${meeting.id}?t=${Math.floor(t.startTime)}`}
                          className="block text-xs text-slate-600 bg-slate-100/50 p-2 rounded leading-relaxed border border-transparent hover:border-sky-200 hover:bg-sky-50 transition-colors"
                          onClick={() => setQuery("")}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-slate-900">{t.speaker}</span>
                            <span className="text-[10px] font-medium text-slate-400 bg-slate-200/50 px-1.5 py-0.5 rounded-sm">
                              {Math.floor(t.startTime / 60).toString().padStart(2, '0')}:{(Math.floor(t.startTime % 60)).toString().padStart(2, '0')}
                            </span>
                          </div>
                          <span className="line-clamp-2">{highlightText(t.text, debouncedQuery)}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
