import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'
import { evaluate } from '../../../lib/arbitration'
import { anchorVerdict } from '../../../lib/hedera'

export async function POST(req: NextRequest) {
  const { arenaId } = await req.json()

  const { data: arena } = await supabase
    .from('arenas')
    .select('*')
    .eq('id', arenaId)
    .single()

  if (!arena) return NextResponse.json({ error: 'Arena not found' }, { status: 404 })
  if (arena.status === 'resolved') return NextResponse.json({ error: 'Already resolved' }, { status: 400 })

  const { data: subs } = await supabase
    .from('submissions')
    .select('*')
    .eq('arena_id', arenaId)

  if (!subs || subs.length < 2) {
    return NextResponse.json({ error: 'Need 2 submissions' }, { status: 400 })
  }

  const result = evaluate(
    { userId: subs[0].user_id, content: subs[0].content },
    { userId: subs[1].user_id, content: subs[1].content }
  )

  let txHash = 'hedera-unavailable'
  try {
    txHash = await anchorVerdict({
      arenaId,
      winner: result.winnerId,
      confidence: result.confidence,
      timestamp: Date.now(),
    })
  } catch (e) {
    console.error('Hedera anchor failed:', e)
  }

  await supabase
    .from('arenas')
    .update({
      status: 'resolved',
      winner_id: result.winnerId,
      verdict: result.reasoning,
      confidence: result.confidence,
      tx_hash: txHash,
    })
    .eq('id', arenaId)

  const { data: winner } = await supabase
    .from('users')
    .select('*')
    .eq('id', result.winnerId)
    .single()

  if (winner) {
    await supabase
      .from('users')
      .update({ balance: winner.balance + arena.stake_amount * 2 })
      .eq('id', result.winnerId)
  }

  return NextResponse.json({ ...result, txHash })
}