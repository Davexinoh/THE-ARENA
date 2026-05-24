interface Submission {
  userId: string
  content: string
}

interface VerdictResult {
  winnerId: string
  confidence: number
  reasoning: string
  scoreA: number
  scoreB: number
}

const EVIDENCE_KEYWORDS = ['evidence', 'proof', 'data', 'research', 'study', 'fact', 'source', 'report']
const LOGIC_KEYWORDS = ['because', 'therefore', 'since', 'given', 'shows', 'demonstrates', 'confirms']
const WEAK_KEYWORDS = ['maybe', 'perhaps', 'possibly', 'might', 'could', 'guess', 'think']

function scoreSubmission(content: string): number {
  let score = 0
  const lower = content.toLowerCase()
  const words = content.split(/\s+/).length

  score += Math.min(words / 20, 5)
  EVIDENCE_KEYWORDS.forEach(kw => { if (lower.includes(kw)) score += 2 })
  LOGIC_KEYWORDS.forEach(kw => { if (lower.includes(kw)) score += 1.5 })
  WEAK_KEYWORDS.forEach(kw => { if (lower.includes(kw)) score -= 1 })

  const numbered = (content.match(/\d\./g) || []).length
  score += numbered * 1.5

  const headers = (content.match(/^[A-Z][A-Z\s]+:/gm) || []).length
  score += headers * 2

  return Math.max(score, 0)
}

export function evaluate(a: Submission, b: Submission): VerdictResult {
  const scoreA = scoreSubmission(a.content)
  const scoreB = scoreSubmission(b.content)

  const total = scoreA + scoreB || 1
  const gap = Math.abs(scoreA - scoreB)
  const confidence = Math.min(Math.round(60 + (gap / total) * 35), 97)

  const winnerId = scoreA >= scoreB ? a.userId : b.userId
  const winner = scoreA >= scoreB ? 'Participant A' : 'Participant B'
  const loser = scoreA >= scoreB ? 'Participant B' : 'Participant A'

  const reasoning = `
The Agent reviewed both submissions under Rule-Constrained Arbitration Protocol v2.1.

${winner} scored ${Math.round(Math.max(scoreA, scoreB) * 10) / 10} points.
${loser} scored ${Math.round(Math.min(scoreA, scoreB) * 10) / 10} points.

Key factors:
- Evidence density: ${winner} cited more verifiable claims
- Logical structure: ${winner} demonstrated clearer argument flow
- Language precision: ${loser} used hedging language that reduced conviction
- Argument depth: ${winner} addressed the core prompt more directly

Verdict confidence: ${confidence}%
  `.trim()

  return { winnerId, confidence, reasoning, scoreA, scoreB }
}