<script setup lang="ts">
import { RotateCcw, Shuffle, Image, Play, Undo2, Lightbulb } from 'lucide-vue-next'
import { useGameStore } from '@/stores/gameStore'

const gameStore = useGameStore()

function handleStart() {
  gameStore.startGame()
}

function handleReset() {
  gameStore.resetPuzzle()
}

function handleRestart() {
  gameStore.restartGame()
}

function handleChangeImage() {
  gameStore.showImageSelector = true
}

function handleUndo() {
  gameStore.undo()
}

function handleHint() {
  gameStore.showHint()
}
</script>

<template>
  <div class="control-buttons flex flex-wrap gap-3 justify-center">
    <button
      v-if="!gameStore.isPlaying && !gameStore.isCompleted"
      class="control-btn control-btn-primary flex items-center gap-2 px-6 py-3 rounded-xl font-medium"
      @click="handleStart"
    >
      <Play :size="18" />
      开始游戏
    </button>

    <button
      class="control-btn control-btn-secondary flex items-center gap-2 px-5 py-3 rounded-xl font-medium"
      :disabled="!gameStore.canUndo"
      :class="{ 'opacity-50 cursor-not-allowed': !gameStore.canUndo }"
      @click="handleUndo"
    >
      <Undo2 :size="18" />
      撤销
    </button>

    <button
      class="control-btn control-btn-hint flex items-center gap-2 px-5 py-3 rounded-xl font-medium"
      :disabled="!gameStore.isPlaying || gameStore.isCompleted"
      :class="{ 'opacity-50 cursor-not-allowed': !gameStore.isPlaying || gameStore.isCompleted }"
      @click="handleHint"
    >
      <Lightbulb :size="18" />
      提示
    </button>

    <button
      class="control-btn control-btn-secondary flex items-center gap-2 px-5 py-3 rounded-xl font-medium"
      @click="handleReset"
    >
      <RotateCcw :size="18" />
      重置
    </button>

    <button
      class="control-btn control-btn-secondary flex items-center gap-2 px-5 py-3 rounded-xl font-medium"
      @click="handleRestart"
    >
      <Shuffle :size="18" />
      重新开始
    </button>

    <button
      class="control-btn control-btn-accent flex items-center gap-2 px-5 py-3 rounded-xl font-medium"
      @click="handleChangeImage"
    >
      <Image :size="18" />
      换图
    </button>
  </div>
</template>

<style scoped>
.control-btn {
  transition: all 0.2s ease;
}

.control-btn-primary {
  @apply bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30;
}

.control-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.4);
}

.control-btn-secondary {
  @apply bg-white/10 text-white border border-white/20 hover:bg-white/20;
}

.control-btn-secondary:hover {
  transform: translateY(-2px);
}

.control-btn-accent {
  @apply bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30;
}

.control-btn-accent:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(249, 115, 22, 0.4);
}

.control-btn-hint {
  @apply bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-lg shadow-amber-500/30;
}

.control-btn-hint:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(245, 158, 11, 0.4);
}

.control-btn:active {
  transform: translateY(0);
}
</style>
