import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PuzzlePiece, GameResult } from '@/types'
import { BUILTIN_IMAGES } from '@/types'
import { createPuzzle, shufflePuzzle, isAdjacent, swapPieces, checkCompletion, getMovablePieces } from '@/utils/puzzle'
import { calculateScore, formatTime, getBestScore, saveBestScore } from '@/utils/score'

export const useGameStore = defineStore('game', () => {
  const difficulty = ref<3 | 4 | 5>(3)
  const pieces = ref<PuzzlePiece[]>([])
  const initialPieces = ref<PuzzlePiece[]>([])
  const moves = ref(0)
  const time = ref(0)
  const isPlaying = ref(false)
  const isCompleted = ref(false)
  const currentImage = ref(BUILTIN_IMAGES[0].url)
  const showImageSelector = ref(false)
  const gameResult = ref<GameResult | null>(null)

  const emptyPiece = computed(() => pieces.value.find(p => p.isEmpty)!)
  const movablePieceIds = computed(() => getMovablePieces(pieces.value).map(p => p.id))
  const formattedTime = computed(() => formatTime(time.value))
  const bestScoreKey = computed(() => `${difficulty.value}_${currentImage.value.substring(0, 30)}`)
  const bestScore = computed(() => getBestScore(bestScoreKey.value))

  function initGame() {
    const newPieces = createPuzzle(difficulty.value)
    pieces.value = newPieces
    initialPieces.value = JSON.parse(JSON.stringify(newPieces))
    moves.value = 0
    time.value = 0
    isPlaying.value = false
    isCompleted.value = false
    gameResult.value = null
  }

  function startGame() {
    if (!isPlaying.value && !isCompleted.value) {
      shuffle()
      isPlaying.value = true
    }
  }

  function shuffle() {
    const shuffled = shufflePuzzle(pieces.value, difficulty.value)
    pieces.value = shuffled
    initialPieces.value = JSON.parse(JSON.stringify(shuffled))
  }

  function movePiece(pieceId: number) {
    if (!isPlaying.value || isCompleted.value) return

    const piece = pieces.value.find(p => p.id === pieceId)
    if (!piece || piece.isEmpty) return

    const empty = emptyPiece.value
    if (!isAdjacent(piece, empty)) return

    pieces.value = swapPieces(pieces.value, pieceId, empty.id, difficulty.value)
    moves.value++

    if (checkCompletion(pieces.value)) {
      completeGame()
    }
  }

  function completeGame() {
    isCompleted.value = true
    isPlaying.value = false

    const result = calculateScore(moves.value, time.value, difficulty.value)
    gameResult.value = result

    const currentBest = bestScore.value
    if (currentBest === null || result.score > currentBest) {
      saveBestScore(bestScoreKey.value, result.score)
    }
  }

  function resetPuzzle() {
    pieces.value = JSON.parse(JSON.stringify(initialPieces.value))
    moves.value = 0
    time.value = 0
    isPlaying.value = false
    isCompleted.value = false
    gameResult.value = null
  }

  function restartGame() {
    shuffle()
    moves.value = 0
    time.value = 0
    isPlaying.value = true
    isCompleted.value = false
    gameResult.value = null
  }

  function changeImage(imageUrl: string) {
    currentImage.value = imageUrl
    initGame()
  }

  function changeDifficulty(size: 3 | 4 | 5) {
    difficulty.value = size
    initGame()
  }

  function incrementTime() {
    if (isPlaying.value && !isCompleted.value) {
      time.value++
    }
  }

  function isMovable(pieceId: number): boolean {
    return movablePieceIds.value.includes(pieceId)
  }

  return {
    difficulty,
    pieces,
    moves,
    time,
    isPlaying,
    isCompleted,
    currentImage,
    showImageSelector,
    gameResult,
    emptyPiece,
    movablePieceIds,
    formattedTime,
    bestScore,
    initGame,
    startGame,
    shuffle,
    movePiece,
    resetPuzzle,
    restartGame,
    changeImage,
    changeDifficulty,
    incrementTime,
    isMovable
  }
})
