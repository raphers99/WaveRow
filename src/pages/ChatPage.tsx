import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Send, Home } from 'lucide-react'
import { getMessages, sendMessage } from '@/lib/queries/messages'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import type { Message } from '@/types/app.types'
import { format, parseISO } from 'date-fns'

export default function ChatPage() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!conversationId) return
    getMessages(conversationId)
      .then(setMessages)
      .finally(() => setLoading(false))

    // Realtime subscription
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, payload => {
        setMessages(prev => [...prev, payload.new as Message])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [conversationId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!text.trim() || !user || !conversationId || sending) return
    const content = text.trim()
    setText('')
    setSending(true)
    try {
      await sendMessage(conversationId, user.id, content)
    } catch {
      setText(content)
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border flex-shrink-0"
        style={{ background: 'rgba(247,247,242,0.95)', backdropFilter: 'blur(16px)', paddingTop: 'calc(0.75rem + env(safe-area-inset-top))' }}>
        <button onClick={() => navigate(-1)}
          className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1">
          <h1 className="font-display font-bold text-[17px]">Chat</h1>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                <div className="h-10 w-48 bg-gray-200 rounded-2xl animate-pulse" />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center bg-forest/10">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A3A2A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <p className="font-display font-bold text-[17px] mb-1">Start the conversation</p>
            <p className="text-gray-400 text-[13px]">Say hello and ask about the listing</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.sender_id === user?.id
            const showTime = i === 0 || (i > 0 && new Date(msg.created_at).getTime() - new Date(messages[i-1].created_at).getTime() > 5 * 60 * 1000)
            return (
              <div key={msg.id}>
                {showTime && (
                  <p className="text-center text-[11px] text-gray-400 my-2">
                    {format(parseISO(msg.created_at), 'h:mm a')}
                  </p>
                )}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed ${
                      isMe
                        ? 'text-white rounded-br-sm'
                        : 'bg-white border border-border text-charcoal rounded-bl-sm'
                    }`}
                    style={isMe ? { background: '#1A3A2A' } : {}}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-border"
        style={{ background: 'rgba(247,247,242,0.95)', backdropFilter: 'blur(16px)', paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}>
        <div className="flex items-center gap-2 bg-white rounded-2xl border border-border px-4 py-2.5">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message..."
            className="flex-1 text-[15px] outline-none bg-transparent"
            style={{ fontSize: '16px' }}
          />
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className="w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-30 transition-opacity"
            style={{ background: '#1A3A2A' }}
          >
            <Send size={14} className="text-white" />
          </motion.button>
        </div>
      </div>
    </div>
  )
}
