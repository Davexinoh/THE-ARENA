import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { randomUUID } from 'crypto'

export async function POST(req: NextRequest) {
  const { title, prompt, stakeAmount, creatorId } = await req.json()

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', creatorId)
    .single()

  if (!user || user.balance < stakeAmount) {
    return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
  }

  const id = randomUUID()

  await supabase.from('arenas').insert({
    id,
    title,
    creator_id: creatorId,
    prompt,
    stake_amount: stakeAmount,
    status: 'open',
    created_at: Date.now(),
  })

  await supabase
    .from('users')
    .update({ balance: user.balance - stakeAmount })
    .eq('id', creatorId)

  return NextResponse.json({ id })
}