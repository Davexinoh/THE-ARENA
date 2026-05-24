'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import ArenaCard from '../../components/ArenaCard'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [arenas, setArenas] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [title, setTitle] = useState('')
  const [prompt, setPrompt] = useState('')
  const [stake, setStake] = useState(10)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return router.push('/login')

      const { data: profile } = await supabase.from('users').select('*').eq('id', authUser.id).single()
      setUser(profile)

      const { data: arenaList } = await supabase
        .from('arenas')
        .select('*')
        .order('created_at', { ascending: false })
      setArenas(arenaList ?? [])
    }
    load()
  }, [])

  async function createArena() {
    if (!user || !title || !prompt) return
    const res = await fetch('/api/arena/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, prompt, stakeAmount: stake, creatorId: user.id }),
    })
    const { id } = await res.json()
    router.push(`/arena/${id}`)
  }

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
          {arenas.map(a => <ArenaCard key={a.id} arena={a} />)}
          {arenas.length === 0 && (
            <p className="font-mono text-xs text-gray-700">No arenas yet. Create one above.</p>
          )}
        </div>
      </div>
    </main>
  )
}