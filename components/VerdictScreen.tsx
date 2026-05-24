'use client'
import ConfidenceMeter from './ConfidenceMeter'
import { motion } from 'framer-motion'

interface Props {
  winnerId: string
  currentUserId: string
  confidence: number
  reasoning: string
  txHash: string
  payout: number
}

export default function VerdictScreen({ winnerId, currentUserId, confidence, reasoning, txHash, payout }: Props) {
  const won = winnerId === currentUserId

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 p-6"
    >
      <div className={`text-center text-4xl font-black font-mono ${won ? 'text-cyan-400' : 'text-red-500'}`}>
        {won ? 'YOU WIN' : 'YOU LOSE'}
      </div>

      {won && (
        <div className="text-center font-mono text-green-400 text-sm">
          +{payout} HBAR credited to your balance
        </div>
      )}

      <ConfidenceMeter value={confidence} />

      <div className="bg-gray-900 border border-gray-800 p-4 font-mono text-xs text-gray-300 whitespace-pre-wrap leading-relaxed">
        {reasoning}
      </div>

      <div className="border border-gray-800 p-3">
        <p className="font-mono text-xs text-gray-500 mb-1">VERDICT ANCHORED ON HEDERA</p>
        <p className="font-mono text-xs text-cyan-400 break-all">{txHash}</p>
      </div>
    </motion.div>
  )
}