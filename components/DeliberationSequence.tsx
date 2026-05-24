'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const STAGES = [
  { label: 'Parsing submissions...', duration: 1200 },
  { label: 'Scoring evidence density...', duration: 1400 },
  { label: 'Analyzing argument structure...', duration: 1300 },
  { label: 'Cross-referencing logical chains...', duration: 1500 },
  { label: 'Calculating confidence threshold...', duration: 1000 },
  { label: 'Anchoring verdict on Hedera...', duration: 1800 },
]

export default function DeliberationSequence({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState(0)

  useEffect(() => {
    if (stage >= STAGES.length) {
      onComplete()
      return
    }
    const t = setTimeout(() => setStage(s => s + 1), STAGES[stage].duration)
    return () => clearTimeout(t)
  }, [stage])

  return (
    <div className="flex flex-col items-center gap-6 py-12">
      <motion.div
        className="w-16 h-16 border-2 border-cyan-400 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
      />
      <div className="font-mono text-sm text-cyan-300 space-y-2 w-72">
        {STAGES.slice(0, stage + 1).map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: i < stage ? 0.4 : 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <span className="text-cyan-500">{i < stage ? '✓' : '>'}</span>
            {s.label}
          </motion.div>
        ))}
      </div>
    </div>
  )
}