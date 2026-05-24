import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'

export async function POST(req: NextRequest) {
  const { arenaId, userId } = await req.json()

  const { data: arena } = await supabase
    .from('arenas')
    .select('*')
    .eq('id', arenaId)
    .single()

  if (!arena) return NextResponse.json({ error: 'Arena not found' }, { status: 404 })
  if (arena.status !== 'open') return NextResponse.json({ error: 'Arena not open' }, { status: 400 })
  if (arena.creator_id === userId) return NextResponse.json({ error: 'Cannot join your own arena' }, { status: 400 })

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (!user || user.balance < arena.stake_amount) {
    return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
  }

  await supabase
    .from('arenas')
    .update({ opponent_id: userId, status: 'active' })
    .eq('id', arenaId)

  await supabase
    .from('users')
    .update({ balance: user.balance - arena.stake_amount })
    .eq('id', userId)

  return NextResponse.json({ joined: true })
}