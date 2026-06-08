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
      'puzzle-piece-movable': isMovable && gameStore.isPlaying,
      'puzzle-piece-correct': piece.currentIndex === piece.correctIndex && gameStore.isCompleted
    }"
    :style="pieceStyle"
    @click="handleClick"
  >
    <div class="puzzle-piece-inner absolute inset-0">
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
  border: 2px solid rgba(255, 255, 255, 0.3);
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
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3), inset 0 0 20px rgba(0, 0, 0, 0.2);
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

.puzzle-empty {
  animation: emptyPulse 2s ease-in-out infinite;
  border: 2px dashed rgba(255, 255, 255, 0.2);
}

@keyframes emptyPulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}
</style>
