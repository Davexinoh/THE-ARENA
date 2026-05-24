import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { randomUUID } from 'crypto'

export async function POST(req: NextRequest) {
  const { arenaId, userId, content } = await req.json()

  const { data: existing } = await supabase
    .from('submissions')
    .select('*')
    .eq('arena_id', arenaId)
    .eq('user_id', userId)
    .single()

  if (existing) return NextResponse.json({ error: 'Already submitted' }, { status: 400 })

  await supabase.from('submissions').insert({
    id: randomUUID(),
    arena_id: arenaId,
    user_id: userId,
    content,
    created_at: Date.now(),
  })

  const { count } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('arena_id', arenaId)

  return NextResponse.json({ submitted: true, readyToJudge: (count ?? 0) >= 2 })
}