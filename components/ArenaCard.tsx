import Link from 'next/link'

interface Arena {
  id: string
  title: string
  stake_amount: number
  status: string
  created_at: number
}

export default function ArenaCard({ arena }: { arena: Arena }) {
  const statusColor = {
    open: 'text-green-400',
    active: 'text-yellow-400',
    resolved: 'text-gray-500',
  }[arena.status] ?? 'text-gray-400'

  return (
    <Link href={`/arena/${arena.id}`}>
      <div className="border border-gray-800 bg-gray-950 hover:border-cyan-800 transition-colors p-4 cursor-pointer">
        <div className="flex justify-between items-start mb-2">
          <p className="font-mono text-white text-sm font-bold">{arena.title}</p>
          <span className={`font-mono text-xs ${statusColor}`}>{arena.status.toUpperCase()}</span>
        </div>
        <p className="font-mono text-xs text-gray-500">STAKE: {arena.stake_amount} HBAR</p>
      </div>
    </Link>
  )
}