<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import PuzzlePiece from './PuzzlePiece.vue'
import { useGameStore } from '@/stores/gameStore'

const gameStore = useGameStore()

let timerInterval: number | null = null

const boardRef = ref<HTMLDivElement | null>(null)

const boardSize = computed(() => gameStore.difficulty)

const sortedPieces = computed(() => {
  return [...gameStore.pieces].sort((a, b) => {
    if (a.isEmpty) return 1
    if (b.isEmpty) return -1
    return 0
  })
})

onMounted(() => {
  const loaded = gameStore.loadFromStorage()
  if (!loaded) {
    gameStore.initGame()
  }
  timerInterval = window.setInterval(() => {
    gameStore.incrementTime()
  }, 1000)
})

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
})
</script>

<template>
  <div class="puzzle-board-wrapper">
    <div
      ref="boardRef"
      class="puzzle-board relative w-full aspect-square rounded-2xl overflow-hidden"
      :class="{ 'board-glow': gameStore.isCompleted }"
      style="background: var(--card-bg);"
    >
      <div class="absolute inset-0 backdrop-blur-sm" style="background: var(--bg-secondary); opacity: 0.5;">
      </div>
      <div class="absolute inset-2 rounded-xl overflow-hidden">
        <PuzzlePiece
          v-for="piece in sortedPieces"
          :key="piece.id"
          :piece="piece"
          :board-size="boardSize"
          :image-url="gameStore.currentImage"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.puzzle-board-wrapper {
  perspective: 1000px;
}

.puzzle-board {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px var(--border-default);
  transform-style: preserve-3d;
  border: 1px solid var(--border-default);
}

.board-glow {
  animation: boardGlow 1.5s ease-in-out infinite;
}

@keyframes boardGlow {
  0%, 100% {
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px var(--border-default), 0 0 40px var(--glow-primary);
  }
  50% {
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px var(--border-hover), 0 0 60px var(--glow-secondary);
  }
}
</style>
