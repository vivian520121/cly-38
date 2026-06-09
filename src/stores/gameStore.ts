import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PuzzlePiece, GameResult, GameState, UserInfo } from '@/types'
import { BUILTIN_IMAGES } from '@/types'
import { createPuzzle, shufflePuzzle, isAdjacent, swapPieces, checkCompletion, getMovablePieces, solvePuzzle } from '@/utils/puzzle'
import { calculateScore, formatTime, getBestScore, saveBestScore } from '@/utils/score'

const STORAGE_KEY = 'puzzle_game_state'
const USER_INFO_KEY = 'puzzle_user_info'
const MAX_UNDO_STEPS = 3

function createAvatarSVG(name: string): string {
  const colors = [
    ['#8b5cf6', '#ec4899'],
    ['#06b6d4', '#3b82f6'],
    ['#10b981', '#06b6d4'],
    ['#f59e0b', '#ef4444'],
    ['#ec4899', '#f43f5e'],
    ['#6366f1', '#8b5cf6'],
    ['#14b8a6', '#0ea5e9'],
    ['#eab308', '#f97316'],
  ]
  const colorIndex = name.charCodeAt(0) % colors.length
  const [c1, c2] = colors[colorIndex]
  const initial = name.charAt(0).toUpperCase()

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${c1}"/>
          <stop offset="100%" style="stop-color:${c2}"/>
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#g)"/>
      <text x="50" y="58" text-anchor="middle" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="white">${initial}</text>
    </svg>
  `
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

const DEFAULT_USER_INFO: UserInfo = {
  nickname: '拼图玩家',
  avatar: createAvatarSVG('拼图玩家')
}

function loadUserInfo(): UserInfo {
  try {
    const saved = localStorage.getItem(USER_INFO_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch {
    // Ignore
  }
  return DEFAULT_USER_INFO
}

function saveUserInfo(info: UserInfo) {
  try {
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(info))
  } catch {
    // Ignore
  }
}

function generateRandomNickname(): string {
  const adjectives = ['快乐的', '聪明的', '勇敢的', '可爱的', '神秘的', '帅气的', '优雅的', '活力的']
  const nouns = ['小狐狸', '小熊猫', '小兔子', '小老虎', '小企鹅', '小海豚', '小松鼠', '小猫咪']
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  return adj + noun
}

function generateRandomAvatar(): string {
  const randomName = Math.random().toString(36).substring(2, 8)
  return createAvatarSVG(randomName)
}

interface HistoryState {
  pieces: PuzzlePiece[]
  moves: number
}

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
  const history = ref<HistoryState[]>([])
  const hintedPieceId = ref<number | null>(null)

  const userInfo = ref<UserInfo>(loadUserInfo())
  const showShareModal = ref(false)
  const generatedPosterUrl = ref<string | null>(null)

  const isAutoSolving = ref(false)
  const isAutoPaused = ref(false)
  const isCalculating = ref(false)
  const autoSolveSteps = ref<number[][]>([])
  const autoSolveIndex = ref(0)
  const autoSolveSpeed = ref(500)
  const showAbandonConfirm = ref(false)
  let autoSolveTimer: number | null = null

  const emptyPiece = computed(() => pieces.value.find(p => p.isEmpty)!)
  const movablePieceIds = computed(() => getMovablePieces(pieces.value).map(p => p.id))
  const formattedTime = computed(() => formatTime(time.value))
  const bestScoreKey = computed(() => `${difficulty.value}_${currentImage.value.substring(0, 30)}`)
  const bestScore = computed(() => getBestScore(bestScoreKey.value))
  const canUndo = computed(() => history.value.length > 0)
  const autoSolveProgress = computed(() => {
    if (autoSolveSteps.value.length === 0) return 0
    return Math.round((autoSolveIndex.value / autoSolveSteps.value.length) * 100)
  })

  function saveToStorage() {
    const state: GameState = {
      difficulty: difficulty.value,
      pieces: pieces.value,
      initialPieces: initialPieces.value,
      moves: moves.value,
      time: time.value,
      isPlaying: isPlaying.value,
      isCompleted: isCompleted.value,
      currentImage: currentImage.value,
      history: history.value
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }

  function loadFromStorage() {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const state: GameState = JSON.parse(saved)
        difficulty.value = state.difficulty
        pieces.value = state.pieces
        initialPieces.value = state.initialPieces
        moves.value = state.moves
        time.value = state.time
        isPlaying.value = state.isPlaying
        isCompleted.value = state.isCompleted
        currentImage.value = state.currentImage
        history.value = state.history || []
        return true
      } catch (e) {
        console.error('Failed to load game state:', e)
      }
    }
    return false
  }

  function clearStorage() {
    localStorage.removeItem(STORAGE_KEY)
  }

  function initGame() {
    const newPieces = createPuzzle(difficulty.value)
    pieces.value = newPieces
    initialPieces.value = JSON.parse(JSON.stringify(newPieces))
    moves.value = 0
    time.value = 0
    isPlaying.value = false
    isCompleted.value = false
    gameResult.value = null
    history.value = []
    hintedPieceId.value = null
    saveToStorage()
  }

  function startGame() {
    if (!isPlaying.value && !isCompleted.value) {
      shuffle()
      isPlaying.value = true
      saveToStorage()
    }
  }

  function shuffle() {
    const shuffled = shufflePuzzle(pieces.value, difficulty.value)
    pieces.value = shuffled
    initialPieces.value = JSON.parse(JSON.stringify(shuffled))
    history.value = []
    hintedPieceId.value = null
  }

  function saveHistory() {
    history.value.push({
      pieces: JSON.parse(JSON.stringify(pieces.value)),
      moves: moves.value
    })
    if (history.value.length > MAX_UNDO_STEPS) {
      history.value.shift()
    }
  }

  function undo() {
    if (history.value.length === 0 || !isPlaying.value) return

    const lastState = history.value.pop()!
    pieces.value = lastState.pieces
    moves.value = lastState.moves
    hintedPieceId.value = null
    saveToStorage()
  }

  function movePiece(pieceId: number) {
    if (!isPlaying.value || isCompleted.value) return

    const piece = pieces.value.find(p => p.id === pieceId)
    if (!piece || piece.isEmpty) return

    const empty = emptyPiece.value
    if (!isAdjacent(piece, empty)) return

    saveHistory()

    pieces.value = swapPieces(pieces.value, pieceId, empty.id, difficulty.value)
    moves.value++
    hintedPieceId.value = null

    if (checkCompletion(pieces.value)) {
      completeGame()
    } else {
      saveToStorage()
    }
  }

  function completeGame() {
    isCompleted.value = true
    isPlaying.value = false
    history.value = []
    hintedPieceId.value = null

    const result = calculateScore(moves.value, time.value, difficulty.value)
    gameResult.value = result

    const currentBest = bestScore.value
    if (currentBest === null || result.score > currentBest) {
      saveBestScore(bestScoreKey.value, result.score)
    }

    clearStorage()
  }

  function resetPuzzle() {
    pieces.value = JSON.parse(JSON.stringify(initialPieces.value))
    moves.value = 0
    time.value = 0
    isPlaying.value = false
    isCompleted.value = false
    gameResult.value = null
    history.value = []
    hintedPieceId.value = null
    saveToStorage()
  }

  function restartGame() {
    shuffle()
    moves.value = 0
    time.value = 0
    isPlaying.value = true
    isCompleted.value = false
    gameResult.value = null
    history.value = []
    hintedPieceId.value = null
    saveToStorage()
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
      saveToStorage()
    }
  }

  function isMovable(pieceId: number): boolean {
    return movablePieceIds.value.includes(pieceId)
  }

  function showHint() {
    if (!isPlaying.value || isCompleted.value) return

    const correctPieces = pieces.value.filter(p => !p.isEmpty && p.currentIndex === p.correctIndex)

    if (correctPieces.length === 0) return

    const randomPiece = correctPieces[Math.floor(Math.random() * correctPieces.length)]
    hintedPieceId.value = randomPiece.id

    setTimeout(() => {
      hintedPieceId.value = null
    }, 3000)
  }

  function isHinted(pieceId: number): boolean {
    return hintedPieceId.value === pieceId
  }

  function setUserInfo(info: Partial<UserInfo>) {
    userInfo.value = { ...userInfo.value, ...info }
    saveUserInfo(userInfo.value)
  }

  function randomizeUserInfo() {
    userInfo.value = {
      nickname: generateRandomNickname(),
      avatar: generateRandomAvatar()
    }
    saveUserInfo(userInfo.value)
  }

  function openShareModal() {
    showShareModal.value = true
  }

  function closeShareModal() {
    showShareModal.value = false
  }

  function setPosterUrl(url: string | null) {
    generatedPosterUrl.value = url
  }

  function openAbandonConfirm() {
    if (!isPlaying.value && !isCompleted.value) return
    stopAutoSolve()
    showAbandonConfirm.value = true
  }

  function closeAbandonConfirm() {
    showAbandonConfirm.value = false
  }

  function abandonGame() {
    stopAutoSolve()
    pieces.value = createPuzzle(difficulty.value)
    initialPieces.value = JSON.parse(JSON.stringify(pieces.value))
    moves.value = 0
    time.value = 0
    isPlaying.value = false
    isCompleted.value = false
    gameResult.value = null
    history.value = []
    hintedPieceId.value = null
    showAbandonConfirm.value = false
    saveToStorage()
  }

  function startAutoSolve() {
    if (!isPlaying.value || isCompleted.value || isAutoSolving.value || isCalculating.value) return

    isCalculating.value = true

    setTimeout(() => {
      const steps = solvePuzzle(pieces.value, difficulty.value)
      isCalculating.value = false

      if (steps.length === 0) return

      autoSolveSteps.value = steps
      autoSolveIndex.value = 0
      isAutoSolving.value = true
      isAutoPaused.value = false
      runAutoSolveStep()
    }, 50)
  }

  function runAutoSolveStep() {
    if (!isAutoSolving.value || isAutoPaused.value) return
    if (autoSolveIndex.value >= autoSolveSteps.value.length) {
      stopAutoSolve()
      return
    }

    const step = autoSolveSteps.value[autoSolveIndex.value]
    const [pieceId, emptyId] = step

    pieces.value = swapPieces(pieces.value, pieceId, emptyId, difficulty.value)
    moves.value++
    autoSolveIndex.value++

    if (checkCompletion(pieces.value)) {
      stopAutoSolve()
      completeGame()
      return
    }

    saveToStorage()

    autoSolveTimer = window.setTimeout(() => {
      runAutoSolveStep()
    }, autoSolveSpeed.value)
  }

  function pauseAutoSolve() {
    isAutoPaused.value = true
    if (autoSolveTimer) {
      clearTimeout(autoSolveTimer)
      autoSolveTimer = null
    }
  }

  function resumeAutoSolve() {
    if (!isAutoSolving.value || !isAutoPaused.value) return
    isAutoPaused.value = false
    runAutoSolveStep()
  }

  function stopAutoSolve() {
    isAutoSolving.value = false
    isAutoPaused.value = false
    autoSolveSteps.value = []
    autoSolveIndex.value = 0
    if (autoSolveTimer) {
      clearTimeout(autoSolveTimer)
      autoSolveTimer = null
    }
  }

  function setAutoSolveSpeed(speed: number) {
    autoSolveSpeed.value = Math.max(100, Math.min(2000, speed))
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
    canUndo,
    hintedPieceId,
    userInfo,
    showShareModal,
    generatedPosterUrl,
    isAutoSolving,
    isAutoPaused,
    isCalculating,
    autoSolveSteps,
    autoSolveIndex,
    autoSolveSpeed,
    autoSolveProgress,
    showAbandonConfirm,
    initGame,
    startGame,
    shuffle,
    movePiece,
    resetPuzzle,
    restartGame,
    changeImage,
    changeDifficulty,
    incrementTime,
    isMovable,
    undo,
    showHint,
    isHinted,
    loadFromStorage,
    saveToStorage,
    setUserInfo,
    randomizeUserInfo,
    openShareModal,
    closeShareModal,
    setPosterUrl,
    openAbandonConfirm,
    closeAbandonConfirm,
    abandonGame,
    startAutoSolve,
    pauseAutoSolve,
    resumeAutoSolve,
    stopAutoSolve,
    setAutoSolveSpeed
  }
})
