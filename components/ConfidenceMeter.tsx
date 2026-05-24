'use client'
import { motion } from 'framer-motion'

export default function ConfidenceMeter({ value }: { value: number }) {
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs font-mono text-gray-400 mb-1">
        <span>CONFIDENCE</span>
        <span>{value}%</span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-cyan-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
        />
      </div>
    </div>
  )
}