import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PuzzlePiece, GameResult, GameState, UserInfo } from '@/types'
import { BUILTIN_IMAGES } from '@/types'
import { createPuzzle, shufflePuzzle, isAdjacent, swapPieces, checkCompletion, getMovablePieces } from '@/utils/puzzle'
import { calculateScore, formatTime, getBestScore, saveBestScore } from '@/utils/score'

const STORAGE_KEY = 'puzzle_game_state'
const USER_INFO_KEY = 'puzzle_user_info'
const MAX_UNDO_STEPS = 3

const DEFAULT_USER_INFO: UserInfo = {
  nickname: '拼图玩家',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=puzzle'
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
  const seeds = ['puzzle', 'game', 'player', 'winner', 'champion', 'master', 'pro', 'legend']
  const seed = seeds[Math.floor(Math.random() * seeds.length)] + Date.now()
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`
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

  const emptyPiece = computed(() => pieces.value.find(p => p.isEmpty)!)
  const movablePieceIds = computed(() => getMovablePieces(pieces.value).map(p => p.id))
  const formattedTime = computed(() => formatTime(time.value))
  const bestScoreKey = computed(() => `${difficulty.value}_${currentImage.value.substring(0, 30)}`)
  const bestScore = computed(() => getBestScore(bestScoreKey.value))
  const canUndo = computed(() => history.value.length > 0)

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
    setPosterUrl
  }
})
