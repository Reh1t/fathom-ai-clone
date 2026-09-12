"use client"
import React, { useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Star, Bot, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { usePlayerStore } from "@/store/player-store"

interface ActionItem {
  id: string
  task: string
  assignee: string
  isCompleted: boolean
}

interface InsightsPanelProps {
  meetingId: string
  isLive: boolean
  transcripts: any[]
  actionItems: ActionItem[]
  currentSummary: any
  activeTemplate: string
  isGenerating: boolean
  onTemplateChange: (val: string) => void
  onActionItemToggle: (itemId: string, isCompleted: boolean) => void
}

export function InsightsPanel({
  meetingId,
  isLive,
  transcripts,
  actionItems,
  currentSummary,
  activeTemplate,
  isGenerating,
  onTemplateChange,
  onActionItemToggle
}: InsightsPanelProps) {
  
  const [chatInput, setChatInput] = useState("")
  const [chatMessages, setChatMessages] = useState<{role: 'user'|'ai', text: string}[]>([])
  const [isChatting, setIsChatting] = useState(false)

  const handleChat = async () => {
    if (!chatInput.trim()) return
    const msg = chatInput
    const currentHistory = [...chatMessages]
    
    setChatInput("")
    setChatMessages(prev => [...prev, { role: 'user', text: msg }])
    setIsChatting(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingId, question: msg, history: currentHistory })
      })
      if (res.ok) {
        const data = await res.json()
        setChatMessages(prev => [...prev, { role: 'ai', text: data.reply }])
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I encountered an error answering that.' }])
    } finally {
      setIsChatting(false)
    }
  }

  const handleActionToggle = async (itemId: string, checked: boolean) => {
    onActionItemToggle(itemId, checked)
    try {
      await fetch(`/api/action-items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: checked })
      })
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="w-full md:w-[480px] bg-slate-50 flex flex-col h-full shrink-0">
      <Tabs value={activeTemplate} onValueChange={onTemplateChange} className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-white shrink-0">
          <TabsList className="w-full bg-slate-100 border border-slate-200 p-1 h-11">
            <TabsTrigger value="Standard" className="flex-1 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-sky-700 data-[state=active]:shadow-sm">Summary</TabsTrigger>
            <TabsTrigger value="Executive" className="flex-1 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-sky-700 data-[state=active]:shadow-sm">Action Items</TabsTrigger>
            <TabsTrigger value="Highlights" className="flex-1 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-sky-700 data-[state=active]:shadow-sm flex items-center gap-1.5"><Star className="w-3.5 h-3.5" /> Highlights</TabsTrigger>
            <TabsTrigger value="Chat" className="flex-1 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-sky-700 data-[state=active]:shadow-sm">Ask AI</TabsTrigger>
          </TabsList>
        </div>
        
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
          <div className="p-8">
          {activeTemplate === 'Highlights' ? (
            <div className="space-y-4">
              {transcripts.filter(l => l.isHighlighted).length === 0 ? (
                 <div className="text-center mt-12 px-6">
                   <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Star className="w-8 h-8 text-amber-400" />
                   </div>
                   <p className="text-slate-900 font-bold mb-2">No highlights yet</p>
                   <p className="text-slate-500 text-sm leading-relaxed">Hover over important transcript lines and click the star to curate key moments here.</p>
                 </div>
              ) : (
                 transcripts.filter(l => l.isHighlighted).map((line, idx) => (
                    <div key={idx} className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-amber-300 hover:shadow-md transition-all" onClick={() => !isLive && usePlayerStore.getState().seekTo(line.startTime)}>
                      <p className="text-xs text-slate-500 mb-2 font-bold flex items-center gap-2">
                        <span className="text-slate-900">{line.speaker}</span>
                        <span>•</span>
                        <span>{Math.floor(line.startTime / 60).toString().padStart(2, '0')}:{(Math.floor(line.startTime % 60)).toString().padStart(2, '0')}</span>
                      </p>
                      <p className="text-[15px] text-slate-800 leading-relaxed font-medium">{line.text}</p>
                    </div>
                 ))
              )}
            </div>
          ) : activeTemplate === 'Chat' ? (
            <div className="flex flex-col h-[calc(100vh-200px)]">
              <div className="flex-1 space-y-6 mb-6 overflow-y-auto pr-2">
                {chatMessages.length === 0 ? (
                  <div className="text-center mt-12">
                    <div className="w-16 h-16 bg-sky-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Bot className="w-8 h-8 text-sky-600" />
                    </div>
                    <p className="text-slate-900 font-bold mb-2">Ask Gemini</p>
                    <p className="text-slate-500 text-sm">Ask any question about the meeting context.</p>
                  </div>
                ) : (
                  chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`px-5 py-3 rounded-2xl max-w-[85%] text-[15px] leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-sky-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))
                )}
                {isChatting && (
                  <div className="flex items-start">
                    <div className="px-5 py-3 rounded-2xl bg-white border border-slate-200 text-slate-500 text-[15px] flex items-center shadow-sm rounded-bl-none">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin text-sky-600" /> Analyzing transcript...
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm shrink-0">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                  placeholder="Ask about the meeting..."
                  className="flex-1 bg-transparent px-3 py-2 text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
                <Button onClick={handleChat} disabled={!chatInput.trim() || isChatting} className="bg-sky-600 hover:bg-sky-700 text-white font-medium px-6">Send</Button>
              </div>
            </div>
          ) : isGenerating ? (
            <div className="space-y-6 py-4">
              <div className="flex items-center space-x-3 mb-8 bg-sky-50 p-4 rounded-xl border border-sky-100">
                <Loader2 className="w-5 h-5 animate-spin text-sky-600" />
                <p className="text-sm font-bold text-sky-900">Gemini is analyzing the transcript...</p>
              </div>
              <div className="h-6 bg-slate-200 rounded animate-pulse w-1/3 mb-6"></div>
              <div className="space-y-4">
                <div className="h-4 bg-slate-100 rounded animate-pulse w-full"></div>
                <div className="h-4 bg-slate-100 rounded animate-pulse w-[92%]"></div>
                <div className="h-4 bg-slate-100 rounded animate-pulse w-[96%]"></div>
              </div>
              <div className="h-6 bg-slate-200 rounded animate-pulse w-1/4 mt-10 mb-6"></div>
              <div className="space-y-4">
                <div className="h-4 bg-slate-100 rounded animate-pulse w-full"></div>
                <div className="h-4 bg-slate-100 rounded animate-pulse w-[88%]"></div>
              </div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTemplate}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="prose prose-slate prose-sm max-w-none"
              >
                {isLive ? (
                  <div className="text-center mt-16 px-6">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Bot className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-900 font-bold mb-2">Capture in progress</p>
                    <p className="text-slate-500 text-sm leading-relaxed">The AI summary will generate automatically the moment the meeting ends.</p>
                  </div>
                ) : currentSummary ? (
                  <div className="space-y-4 whitespace-pre-wrap text-slate-700 leading-relaxed text-[15px]">
                    {currentSummary.contentMarkdown.split('\n').map((line: string, i: number) => {
                      if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold text-slate-900 mt-8 mb-4 tracking-tight">{line.replace('## ', '')}</h2>
                      if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-bold text-slate-900 mt-6 mb-3">{line.replace('### ', '')}</h3>
                      if (line.startsWith('- **')) return <li key={i} className="ml-5 list-disc mb-2"><span className="font-bold text-slate-900">{line.match(/\*\*(.*?)\*\*/)?.[1]}</span> {line.replace(/- \*\*(.*?)\*\*:/, '')}</li>
                      if (line.startsWith('- ')) return <li key={i} className="ml-5 list-disc mb-2">{line.replace('- ', '')}</li>
                      if (line.match(/^\d+\./)) return <li key={i} className="ml-5 list-decimal mb-2">{line.replace(/^\d+\.\s/, '')}</li>
                      if (line.trim() === '') return <div key={i} className="h-2" />
                      return <p key={i}>{line}</p>
                    })}
                  </div>
                ) : (
                  <div className="text-center mt-12">
                    <p className="text-slate-500 font-medium mb-6">No summary generated yet.</p>
                    {transcripts.length > 0 && (
                      <Button onClick={() => onTemplateChange(activeTemplate)} className="bg-sky-600 hover:bg-sky-700 text-white shadow-sm font-medium">Generate with Gemini</Button>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}

          {!isGenerating && activeTemplate !== 'Chat' && actionItems.length > 0 && (
            <div className="mt-12 pt-8 border-t border-slate-200">
              <h3 className="text-xs font-bold text-slate-400 mb-5 uppercase tracking-widest">Detected Action Items</h3>
              <div className="space-y-4">
                {actionItems.map((item: any) => (
                  <div key={item.id} className={`flex items-start space-x-4 p-4 rounded-xl border transition-all shadow-sm ${item.isCompleted ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-200 hover:border-sky-300'}`}>
                    <Checkbox 
                      id={item.id} 
                      checked={item.isCompleted} 
                      onCheckedChange={(c) => handleActionToggle(item.id, c === true)}
                      className="mt-1 border-slate-300 data-[state=checked]:bg-sky-600 data-[state=checked]:border-sky-600" 
                    />
                    <div className="grid gap-1.5 flex-1 pt-0.5">
                      <label htmlFor={item.id} className={`text-[15px] font-medium leading-snug cursor-pointer transition-colors ${item.isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                        {item.task}
                      </label>
                      <p className="text-xs text-sky-600 font-bold">{item.assignee}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          </div>
        </div>
      </Tabs>
    </div>
  )
}
