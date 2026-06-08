import { DIFFICULTIES } from '@/types'
import type { GameResult } from '@/types'

export function calculateScore(
  moves: number, time: number, difficulty: number): GameResult {
  const config = DIFFICULTIES.find(d => d.size === difficulty)!
  const baseScore = config.baseScore

  const timePenalty = time * 2
  const movesPenalty = moves * 1

  const score = Math.max(0, baseScore - timePenalty - movesPenalty)

  const percentage = score / baseScore
  let stars = 1
  if (percentage >= 0.9) {
    stars = 3
  } else if (percentage >= 0.7) {
    stars = 2
  } else if (percentage >= 0.5) {
    stars = 1
  }

  return {
    moves,
    time,
    score,
    stars,
    difficulty
  }
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function getBestScore(key: string): number | null {
  try {
    const stored = localStorage.getItem(`puzzle_best_${key}`)
    return stored ? parseInt(stored, 10) : null
  } catch {
    return null
  }
}

export function saveBestScore(key: string, score: number): void {
  try {
    localStorage.setItem(`puzzle_best_${key}`, score.toString())
  } catch {
    // ignore
  }
}
