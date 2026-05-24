'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Dashboard() {
  const [arenas, setArenas] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [title, setTitle] = useState('')
  const [prompt, setPrompt] = useState('')
  const [stake, setStake] = useState(10)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    async function load() {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) {
          router.push('/login')
          return
        }

        let { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single()

        if (!profile) {
          await supabase.from('users').insert({
            id: authUser.id,
            username: authUser.email?.split('@')[0],
            balance: 100,
          })
          profile = { id: authUser.id, username: authUser.email?.split('@')[0], balance: 100 }
        }

        setUser(profile)

        const { data: arenaList } = await supabase
          .from('arenas')
          .select('*')
          .order('created_at', { ascending: false })

        setArenas(arenaList ?? [])
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function createArena() {
    if (!user || !title || !prompt) return
    try {
      const res = await fetch('/api/arena/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, prompt, stakeAmount: stake, creatorId: user.id }),
      })
      const data = await res.json()
      if (data.error) return setError(data.error)
      router.push(`/arena/${data.id}`)
    } catch (e: any) {
      setError(e.message)
    }
  }

  if (loading) return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <p className="font-mono text-xs text-gray-600 animate-pulse">LOADING...</p>
    </main>
  )

  if (error) return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <p className="font-mono text-xs text-red-400">ERROR: {error}</p>
    </main>
  )

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-mono font-black text-xl text-cyan-400">THE ARENA</h1>
          {user && (
            <span className="font-mono text-xs text-gray-400">
              {user.username} — {user.balance} HBAR
            </span>
          )}
        </div>

        <div className="border border-gray-800 p-4 mb-8">
          <p className="font-mono text-xs text-gray-500 mb-4 tracking-widest">CREATE ARENA</p>
          <div className="flex flex-col gap-3">
            <input
              placeholder="ARENA TITLE"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="bg-gray-900 border border-gray-700 px-4 py-2 font-mono text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400"
            />
            <input
              placeholder="DISPUTE PROMPT"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              className="bg-gray-900 border border-gray-700 px-4 py-2 font-mono text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400"
            />
            <div className="flex gap-3 items-center">
              <input
                type="number"
                value={stake}
                onChange={e => setStake(Number(e.target.value))}
                className="w-24 bg-gray-900 border border-gray-700 px-4 py-2 font-mono text-sm text-white focus:outline-none focus:border-cyan-400"
              />
              <span className="font-mono text-xs text-gray-500">HBAR STAKE</span>
            </div>
            <button
              onClick={createArena}
              className="bg-cyan-400 text-black font-black font-mono text-sm py-2 tracking-widest hover:bg-white transition-colors"
            >
              CREATE
            </button>
          </div>
        </div>

        <p className="font-mono text-xs text-gray-500 mb-4 tracking-widest">ACTIVE ARENAS</p>
        <div className="flex flex-col gap-2">
          {arenas.map(a => (
            <div
              key={a.id}
              onClick={() => router.push(`/arena/${a.id}`)}
              className="border border-gray-800 bg-gray-950 hover:border-cyan-800 p-4 cursor-pointer"
            >
              <div className="flex justify-between items-start mb-2">
                <p className="font-mono text-white text-sm font-bold">{a.title}</p>
                <span className="font-mono text-xs text-green-400">{a.status?.toUpperCase()}</span>
              </div>
              <p className="font-mono text-xs text-gray-500">STAKE: {a.stake_amount} HBAR</p>
            </div>
          ))}
          {arenas.length === 0 && (
            <p className="font-mono text-xs text-gray-700">No arenas yet. Create one above.</p>
          )}
        </div>
      </div>
    </main>
  )
}
