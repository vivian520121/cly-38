<script setup lang="ts">
import { computed } from 'vue'
import type { PuzzlePiece } from '@/types'
import { useGameStore } from '@/stores/gameStore'

const props = defineProps<{
  piece: PuzzlePiece
  boardSize: number
  imageUrl: string
}>()

const gameStore = useGameStore()

const isMovable = computed(() => gameStore.isMovable(props.piece.id))
const isHinted = computed(() => gameStore.isHinted(props.piece.id))
const isAutoMoving = computed(() => {
  if (!gameStore.isAutoSolving || gameStore.autoSolveSteps.length === 0) return false
  const currentStep = gameStore.autoSolveSteps[gameStore.autoSolveIndex - 1]
  return currentStep && currentStep[0] === props.piece.id
})

const pieceStyle = computed(() => {
  const size = 100 / props.boardSize
  const bgSize = props.boardSize * 100
  const bgX = (props.piece.correctIndex % props.boardSize) * 100
  const bgY = Math.floor(props.piece.correctIndex / props.boardSize) * 100

  return {
    width: `${size}%`,
    height: `${size}%`,
    left: `${props.piece.x * size}%`,
    top: `${props.piece.y * size}%`,
    backgroundImage: `url(${props.imageUrl})`,
    backgroundSize: `${bgSize}% ${bgSize}%`,
    backgroundPosition: `-${bgX}% -${bgY}%`
  }
})

function handleClick() {
  if (gameStore.isAutoSolving) return
  if (!props.piece.isEmpty) {
    if (!gameStore.isPlaying && !gameStore.isCompleted) {
      gameStore.startGame()
    }
    gameStore.movePiece(props.piece.id)
  }
}
</script>

<template>
  <div
    v-if="!piece.isEmpty"
    class="puzzle-piece absolute cursor-pointer select-none"
    :class="{
      'puzzle-piece-movable': isMovable && gameStore.isPlaying && !gameStore.isAutoSolving,
      'puzzle-piece-correct': piece.currentIndex === piece.correctIndex && gameStore.isCompleted,
      'puzzle-piece-hinted': isHinted,
      'puzzle-piece-auto-moving': isAutoMoving
    }"
    :style="pieceStyle"
    @click="handleClick"
  >
    <div class="puzzle-piece-inner absolute inset-0">
    </div>
    <div v-if="isHinted" class="puzzle-hint-overlay absolute inset-0 rounded-lg">
      <div class="hint-arrow absolute -top-8 left-1/2 transform -translate-x-1/2 text-amber-400 text-2xl animate-bounce">
        ↑
      </div>
    </div>
  </div>
  <div
    v-else
    class="puzzle-empty absolute rounded-lg bg-white/5"
    :style="{
      width: `${100 / boardSize}%`,
      height: `${100 / boardSize}%`,
      left: `${piece.x * (100 / boardSize)}%`,
      top: `${piece.y * (100 / boardSize)}%`
    }"
  >
  </div>
</template>

<style scoped>
.puzzle-piece {
  transition: left 0.2s ease-out, top 0.2s ease-out, transform 0.15s ease;
  border: 2px solid var(--border-hover);
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  overflow: hidden;
}

.puzzle-piece-inner {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(0, 0, 0, 0.1) 100%);
  pointer-events: none;
}

.puzzle-piece-movable:hover {
  transform: scale(1.02);
  z-index: 10;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3), 0 0 20px var(--glow-primary), inset 0 0 20px rgba(0, 0, 0, 0.2);
  border-color: var(--accent-primary);
}

.puzzle-piece-movable:active {
  transform: scale(0.98);
}

.puzzle-piece-correct {
  animation: correctPulse 0.5s ease-out;
}

@keyframes correctPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.puzzle-piece-hinted {
  animation: hintGlow 1s ease-in-out infinite;
  z-index: 20;
  border: 3px solid #fbbf24;
  box-shadow: 0 0 30px rgba(251, 191, 36, 0.8), inset 0 0 20px rgba(0, 0, 0, 0.2);
}

@keyframes hintGlow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(251, 191, 36, 0.6), inset 0 0 20px rgba(0, 0, 0, 0.2);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 40px rgba(251, 191, 36, 1), inset 0 0 20px rgba(0, 0, 0, 0.2);
    transform: scale(1.03);
  }
}

.puzzle-hint-overlay {
  background: radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, transparent 70%);
  pointer-events: none;
}

.hint-arrow {
  text-shadow: 0 0 10px rgba(251, 191, 36, 0.8);
  animation: bounce 0.6s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-5px); }
}

.puzzle-empty {
  animation: emptyPulse 2s ease-in-out infinite;
  border: 2px dashed var(--border-default);
  background: var(--card-bg);
}

@keyframes emptyPulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}

.puzzle-piece-auto-moving {
  z-index: 30;
  animation: autoMoveGlow 0.5s ease-in-out;
  border: 3px solid var(--accent-primary);
  box-shadow: 0 0 30px var(--glow-primary), inset 0 0 20px rgba(0, 0, 0, 0.2);
}

@keyframes autoMoveGlow {
  0% {
    box-shadow: 0 0 20px var(--glow-primary), inset 0 0 20px rgba(0, 0, 0, 0.2);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 40px var(--glow-primary), inset 0 0 20px rgba(0, 0, 0, 0.2);
    transform: scale(1.05);
  }
  100% {
    box-shadow: 0 0 20px var(--glow-primary), inset 0 0 20px rgba(0, 0, 0, 0.2);
    transform: scale(1);
  }
}
</style>
