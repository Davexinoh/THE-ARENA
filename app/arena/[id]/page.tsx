'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useParams, useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type ArenaStatus = 'open' | 'active' | 'deliberating' | 'resolved'

export default function ArenaPage() {
  const { id } = useParams()
  const router = useRouter()
  const [arena, setArena] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [submission, setSubmission] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [status, setStatus] = useState<ArenaStatus>('open')
  const [verdict, setVerdict] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deliberating, setDeliberating] = useState(false)
  const [stages, setStages] = useState<string[]>([])

  const STAGES = [
    'Parsing submissions...',
    'Scoring evidence density...',
    'Analyzing argument structure...',
    'Cross-referencing logical chains...',
    'Calculating confidence threshold...',
    'Anchoring verdict on Hedera...',
  ]

  useEffect(() => {
    async function load() {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) return router.push('/login')

        let { data: profile } = await supabase.from('users').select('*').eq('id', authUser.id).single()
        if (!profile) {
          await supabase.from('users').insert({
            id: authUser.id,
            username: authUser.email?.split('@')[0],
            balance: 100,
          })
          profile = { id: authUser.id, username: authUser.email?.split('@')[0], balance: 100 }
        }
        setUser(profile)

        const { data: arenaData } = await supabase.from('arenas').select('*').eq('id', id).single()
        if (!arenaData) return setError('Arena not found')
        setArena(arenaData)
        setStatus(arenaData.status)

        if (arenaData.status === 'resolved') {
          setVerdict({
            winnerId: arenaData.winner_id,
            confidence: arenaData.confidence,
            reasoning: arenaData.verdict,
            txHash: arenaData.tx_hash,
          })
        }

        const { data: existingSub } = await supabase
          .from('submissions').select('*')
          .eq('arena_id', id).eq('user_id', authUser.id).single()
        if (existingSub) setSubmitted(true)
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  async function joinArena() {
    if (!user || !arena) return
    const res = await fetch('/api/arena/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ arenaId: id, userId: user.id }),
    })
    const data = await res.json()
    if (data.error) return setError(data.error)
    setStatus('active')
    setArena({ ...arena, status: 'active', opponent_id: user.id })
  }

  async function submitArgument() {
    if (!user || !submission.trim()) return
    const res = await fetch('/api/submission', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ arenaId: id, userId: user.id, content: submission }),
    })
    const data = await res.json()
    if (data.error) return setError(data.error)
    setSubmitted(true)
    if (data.readyToJudge) startDeliberation()
  }

  async function startDeliberation() {
    setStatus('deliberating')
    setDeliberating(true)
    setStages([])

    for (let i = 0; i < STAGES.length; i++) {
      await new Promise(r => setTimeout(r, 1200 + i * 200))
      setStages(prev => [...prev, STAGES[i]])
    }

    await new Promise(r => setTimeout(r, 800))

    const res = await fetch('/api/judge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ arenaId: id }),
    })
    const data = await res.json()
    if (data.error) return setError(data.error)
    setVerdict(data)
    setStatus('resolved')
    setDeliberating(false)
  }

  if (loading) return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <p className="font-mono text-xs text-gray-600 animate-pulse">LOADING...</p>
    </main>
  )

  if (error) return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center flex-col gap-4">
      <p className="font-mono text-xs text-red-400">ERROR: {error}</p>
      <button onClick={() => router.push('/dashboard')} className="font-mono text-xs text-gray-500">
        BACK TO DASHBOARD
      </button>
    </main>
  )

  if (!arena) return null

  const won = verdict?.winnerId === user?.id

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-xl mx-auto">
        <button onClick={() => router.push('/dashboard')} className="font-mono text-xs text-gray-600 mb-6 block">
          ← BACK
        </button>
        <p className="font-mono text-xs text-cyan-400 tracking-widest mb-2">THE ARENA</p>
        <h1 className="font-mono font-black text-2xl mb-1">{arena.title}</h1>
        <p className="font-mono text-xs text-gray-500 mb-2">{arena.prompt}</p>
        <p className="font-mono text-xs text-gray-600 mb-8">STAKE: {arena.stake_amount} HBAR EACH</p>

        {status === 'open' && arena.creator_id !== user?.id && (
          <button onClick={joinArena} className="w-full bg-cyan-400 text-black font-black font-mono text-sm py-3 tracking-widest hover:bg-white transition-colors mb-6">
            JOIN ARENA — STAKE {arena.stake_amount} HBAR
          </button>
        )}

        {status === 'open' && arena.creator_id === user?.id && (
          <div className="border border-gray-800 p-4 mb-6">
            <p className="font-mono text-xs text-gray-500 mb-2">Waiting for opponent to join...</p>
            <p className="font-mono text-xs text-gray-700">Share this URL with your opponent</p>
          </div>
        )}

        {status === 'active' && !submitted && (
          <div className="flex flex-col gap-4">
            <p className="font-mono text-xs text-gray-400 tracking-widest">SUBMIT YOUR ARGUMENT</p>
            <textarea
              value={submission}
              onChange={e => setSubmission(e.target.value)}
              rows={6}
              placeholder="Make your case. Use evidence. Be specific."
              className="bg-gray-900 border border-gray-700 px-4 py-3 font-mono text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 resize-none"
            />
            <button onClick={submitArgument} className="bg-cyan-400 text-black font-black font-mono text-sm py-3 tracking-widest hover:bg-white transition-colors">
              SUBMIT TO JUDGE
            </button>
          </div>
        )}

        {status === 'active' && submitted && (
          <div className="border border-gray-800 p-4">
            <p className="font-mono text-xs text-gray-500">Argument submitted. Waiting for opponent...</p>
          </div>
        )}

        {status === 'deliberating' && (
          <div className="flex flex-col items-center gap-6 py-12">
            <div className="w-16 h-16 border-2 border-cyan-400 rounded-full animate-spin" />
            <div className="font-mono text-sm text-cyan-300 space-y-2 w-72">
              {stages.map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-cyan-300">
                  <span className="text-cyan-500">✓</span>
                  {s}
                </div>
              ))}
              {deliberating && stages.length < STAGES.length && (
                <div className="flex items-center gap-2 text-cyan-400">
                  <span>{'>'}</span>
                  <span className="animate-pulse">{STAGES[stages.length]}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {status === 'resolved' && verdict && (
          <div className="flex flex-col gap-6">
            <div className={`text-center text-4xl font-black font-mono ${won ? 'text-cyan-400' : 'text-red-500'}`}>
              {won ? 'YOU WIN' : 'YOU LOSE'}
            </div>

            {won && (
              <div className="text-center font-mono text-green-400 text-sm">
                +{arena.stake_amount * 2} HBAR credited to your balance
              </div>
            )}

            <div className="w-full">
              <div className="flex justify-between text-xs font-mono text-gray-400 mb-1">
                <span>CONFIDENCE</span>
                <span>{verdict.confidence}%</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 rounded-full transition-all duration-1000"
                  style={{ width: `${verdict.confidence}%` }}
                />
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 p-4 font-mono text-xs text-gray-300 whitespace-pre-wrap leading-relaxed">
              {verdict.reasoning}
            </div>

            <div className="border border-gray-800 p-3">
              <p className="font-mono text-xs text-gray-500 mb-1">VERDICT ANCHORED ON HEDERA</p>
              <p className="font-mono text-xs text-cyan-400 break-all">{verdict.txHash}</p>
            </div>

            <button onClick={() => router.push('/dashboard')} className="w-full border border-gray-700 font-mono text-xs text-gray-400 py-3 hover:border-cyan-400 hover:text-cyan-400 transition-colors">
              BACK TO DASHBOARD
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
