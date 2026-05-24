'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit() {
    setError('')
    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) return setError(error.message)
      const userId = data.user?.id
      if (userId) {
        await supabase.from('users').insert({
          id: userId,
          username: email.split('@')[0],
          balance: 100,
        })
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return setError(error.message)
    }
    router.push('/dashboard')
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="w-full max-w-sm px-6">
        <h1 className="font-mono text-2xl font-black mb-8 text-cyan-400">
          {isSignUp ? 'CREATE ACCOUNT' : 'ENTER ARENA'}
        </h1>
        <div className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="EMAIL"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="bg-gray-900 border border-gray-700 px-4 py-3 font-mono text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400"
          />
          <input
            type="password"
            placeholder="PASSWORD"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="bg-gray-900 border border-gray-700 px-4 py-3 font-mono text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400"
          />
          {error && <p className="font-mono text-xs text-red-400">{error}</p>}
          <button
            onClick={handleSubmit}
            className="bg-cyan-400 text-black font-black font-mono text-sm py-3 tracking-widest hover:bg-white transition-colors"
          >
            {isSignUp ? 'SIGN UP' : 'SIGN IN'}
          </button>
          <button
            onClick={() => setIsSignUp(s => !s)}
            className="font-mono text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            {isSignUp ? 'Already have an account? Sign in' : 'No account? Sign up'}
          </button>
        </div>
      </div>
    </main>
  )
}
