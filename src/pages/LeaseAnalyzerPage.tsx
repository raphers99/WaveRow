import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, AlertTriangle, CheckCircle2, Zap, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface LeaseResult {
  score: number
  summary: string
  red_flags: string[]
  green_flags: string[]
  clauses: { title: string; text: string; severity: 'ok' | 'warning' | 'danger' }[]
  recommendations: string[]
}

export default function LeaseAnalyzerPage() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<LeaseResult | null>(null)
  const [fileName, setFileName] = useState('')

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    const content = await file.text()
    setText(content.slice(0, 8000)) // limit for edge function
  }

  const handleAnalyze = async () => {
    if (!text.trim()) { toast.error('Paste or upload your lease first'); return }
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('ai', {
        body: { action: 'analyze_lease', lease_text: text },
      })
      if (error) throw error
      setResult(data)
    } catch {
      toast.error('Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-6" style={{ background: 'linear-gradient(160deg, #1A3A2A 0%, #0E2218 100%)' }}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: '#C8F5A0' }}>
            <Zap size={18} style={{ color: '#1A3A2A' }} />
          </div>
          <div>
            <h1 className="font-display font-bold text-[22px] text-white">Lease Analyzer</h1>
            <p className="text-white/50 text-[12px]">Powered by Claude AI</p>
          </div>
        </div>
        <p className="text-white/60 text-[14px] leading-relaxed">
          Paste or upload your lease and get an instant plain-English analysis of red flags, hidden fees, and key clauses.
        </p>
      </div>

      <div className="px-4 py-5 space-y-4">
        {!result ? (
          <>
            {/* File upload */}
            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-border rounded-2xl cursor-pointer bg-white hover:bg-gray-50 transition-colors">
              <Upload size={20} className="text-gray-300 mb-1.5" />
              <p className="text-[13px] font-medium text-gray-400">{fileName || 'Upload lease (.txt, .pdf)'}</p>
              <input type="file" accept=".txt,.pdf" className="hidden" onChange={handleFile} />
            </label>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[12px] text-gray-400">or paste text</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <textarea
              className="input resize-none text-[13px]"
              rows={8}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Paste your lease agreement text here..."
            />

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleAnalyze}
              disabled={loading || !text.trim()}
              className="btn-primary w-full py-4 text-[16px] flex items-center justify-center gap-2 disabled:opacity-40"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing…
                </>
              ) : (
                <><Zap size={17} /> Analyze Lease</>
              )}
            </motion.button>

            <p className="text-[11px] text-gray-400 text-center">
              Your lease text is processed securely and never stored.
            </p>
          </>
        ) : (
          <AnimatePresence>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Score */}
              <div className="card p-5 text-center">
                <div className="relative w-20 h-20 mx-auto mb-3">
                  <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                    <circle cx="40" cy="40" r="34" fill="none" stroke="#E8E8E0" strokeWidth="8" />
                    <circle cx="40" cy="40" r="34" fill="none"
                      stroke={result.score >= 70 ? '#1A3A2A' : result.score >= 50 ? '#F59E0B' : '#EF4444'}
                      strokeWidth="8"
                      strokeDasharray={`${2 * Math.PI * 34 * result.score / 100} ${2 * Math.PI * 34}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-display font-bold text-[22px]">{result.score}</span>
                  </div>
                </div>
                <p className="font-display font-bold text-[17px]">Lease Score</p>
                <p className="text-[13px] text-gray-400 mt-1">{result.summary}</p>
              </div>

              {/* Red flags */}
              {result.red_flags.length > 0 && (
                <div className="card p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle size={16} className="text-red-500" />
                    <h3 className="font-display font-bold text-[16px]">Red Flags</h3>
                    <span className="text-[11px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">{result.red_flags.length}</span>
                  </div>
                  <ul className="space-y-2">
                    {result.red_flags.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-[13px] text-gray-700">
                        <span className="text-red-500 mt-0.5 flex-shrink-0">✕</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Green flags */}
              {result.green_flags.length > 0 && (
                <div className="card p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 size={16} className="text-green-500" />
                    <h3 className="font-display font-bold text-[16px]">Tenant Friendly</h3>
                  </div>
                  <ul className="space-y-2">
                    {result.green_flags.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-[13px] text-gray-700">
                        <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Key clauses */}
              {result.clauses.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-display font-bold text-[16px] px-1">Key Clauses</h3>
                  {result.clauses.map((c, i) => (
                    <div key={i} className={`card p-4 border-l-4 ${c.severity === 'danger' ? 'border-red-400' : c.severity === 'warning' ? 'border-amber-400' : 'border-green-400'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-[14px]">{c.title}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${c.severity === 'danger' ? 'bg-red-100 text-red-600' : c.severity === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                          {c.severity.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[12px] text-gray-500 leading-relaxed">{c.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Recommendations */}
              {result.recommendations.length > 0 && (
                <div className="card p-4" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                  <h3 className="font-display font-bold text-[16px] text-green-800 mb-3">Recommendations</h3>
                  <ul className="space-y-2">
                    {result.recommendations.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-[13px] text-green-700">
                        <span className="mt-0.5 flex-shrink-0">→</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button onClick={() => { setResult(null); setText(''); setFileName('') }}
                className="w-full py-3.5 text-[14px] font-semibold text-gray-500 border border-border rounded-2xl bg-white">
                Analyze Another Lease
              </button>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
