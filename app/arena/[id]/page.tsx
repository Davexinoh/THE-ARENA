'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import DeliberationSequence from '../../../components/DeliberationSequence'
import VerdictScreen from '../../../components/VerdictScreen'
import { useParams } from 'next/navigation'

type ArenaStatus = 'open' | 'active' | 'deliberating' | 'resolved'

export default function ArenaPage() {
  const { id } = useParams()
  const [arena, setArena] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [submission, setSubmission] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [status, setStatus] = useState<ArenaStatus>('open')
  const [verdict, setVerdict] = useState<any>(null)

  useEffect(() => {
    async function load() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return

      const { data: profile } = await supabase.from('users').select('*').eq('id', authUser.id).single()
      setUser(profile)

      const { data: arenaData } = await supabase.from('arenas').select('*').eq('id', id).single()
      setArena(arenaData)
      setStatus(arenaData?.status ?? 'open')

      if (arenaData?.status === 'resolved') {
        setVerdict({
          winnerId: arenaData.winner_id,
          confidence: arenaData.confidence,
          reasoning: arenaData.verdict,
          txHash: arenaData.tx_hash,
        })
      }

      const { data: existingSub } = await supabase
        .from('submissions')
        .select('*')
        .eq('arena_id', id)
        .eq('user_id', authUser.id)
        .single()

      if (existingSub) setSubmitted(true)
    }
    load()
  }, [id])

  async function joinArena() {
    if (!user || !arena) return
    await fetch('/api/arena/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ arenaId: id, userId: user.id }),
    })
    setStatus('active')
  }

  async function submitArgument() {
    if (!user || !submission.trim()) return
    const res = await fetch('/api/submission', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ arenaId: id, userId: user.id, content: submission }),
    })
    const data = await res.json()
    setSubmitted(true)
    if (data.readyToJudge) setStatus('deliberating')
  }

  async function handleDeliberationComplete() {
    const res = await fetch('/api/judge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ arenaId: id }),
    })
    const data = await res.json()
    setVerdict(data)
    setStatus('resolved')
  }

  if (!arena || !user) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="font-mono text-xs text-gray-600">LOADING...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-xl mx-auto">
        <p className="font-mono text-xs text-cyan-400 tracking-widest mb-2">THE ARENA</p>
        <h1 className="font-mono font-black text-2xl mb-1">{arena.title}</h1>
        <p className="font-mono text-xs text-gray-500 mb-6">{arena.prompt}</p>
        <p className="font-mono text-xs text-gray-600 mb-8">STAKE: {arena.stake_amount} HBAR EACH</p>

        {status === 'open' && arena.creator_id !== user.id && (
          <button
            onClick={joinArena}
            className="w-full bg-cyan-400 text-black font-black font-mono text-sm py-3 tracking-widest hover:bg-white transition-colors mb-6"
          >
            JOIN ARENA — STAKE {arena.stake_amount} HBAR
          </button>
        )}

        {status === 'open' && arena.creator_id === user.id && (
          <div className="border border-gray-800 p-4 mb-6">
            <p className="font-mono text-xs text-gray-500">Waiting for opponent to join...</p>
            <p className="font-mono text-xs text-gray-700 mt-2">Arena ID: {arena.id}</p>
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
            <button
              onClick={submitArgument}
              className="bg-cyan-400 text-black font-black font-mono text-sm py-3 tracking-widest hover:bg-white transition-colors"
            >
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
          <DeliberationSequence onComplete={handleDeliberationComplete} />
        )}

        {status === 'resolved' && verdict && (
          <VerdictScreen
            winnerId={verdict.winnerId}
            currentUserId={user.id}
            confidence={verdict.confidence}
            reasoning={verdict.reasoning}
            txHash={verdict.txHash}
            payout={arena.stake_amount * 2}
          />
        )}
      </div>
    </main>
  )
}