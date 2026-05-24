import Link from 'next/link'

export default function Landing() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,200,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,200,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative z-10 text-center max-w-xl px-6">
        <p className="font-mono text-cyan-400 text-xs tracking-widest mb-6">
          HEDERA AI ARBITRATION PROTOCOL
        </p>
        <h1 className="text-7xl font-black tracking-tight mb-4 leading-none">
          THE<br />
          <span className="text-cyan-400">ARENA</span>
        </h1>
        <p className="text-gray-400 text-sm mb-10 font-mono leading-relaxed">
          Stake your conviction. AI judges the truth.<br />
          Verdict anchored on Hedera. Winner takes all.
        </p>
        <Link
          href="/dashboard"
          className="inline-block bg-cyan-400 text-black font-black text-sm px-8 py-3 tracking-widest hover:bg-white transition-colors"
        >
          ENTER ARENA
        </Link>
      </div>

      <div className="absolute bottom-6 font-mono text-[10px] text-gray-700 tracking-widest">
        POWERED BY HEDERA CONSENSUS SERVICE
      </div>
    </main>
  )
}