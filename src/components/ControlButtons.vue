<script setup lang="ts">
import { RotateCcw, Shuffle, Image, Play, Undo2, Lightbulb, LogOut, Bot, Pause, PlayCircle, StopCircle } from 'lucide-vue-next'
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

function handleAbandon() {
  gameStore.openAbandonConfirm()
}

function handleAutoSolve() {
  if (gameStore.isAutoSolving) {
    if (gameStore.isAutoPaused) {
      gameStore.resumeAutoSolve()
    } else {
      gameStore.pauseAutoSolve()
    }
  } else {
    gameStore.startAutoSolve()
  }
}

function handleStopAutoSolve() {
  gameStore.stopAutoSolve()
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

    <button
      class="control-btn control-btn-auto flex items-center gap-2 px-5 py-3 rounded-xl font-medium"
      :disabled="!gameStore.isPlaying || gameStore.isCompleted || gameStore.isCalculating"
      :class="{ 'opacity-50 cursor-not-allowed': !gameStore.isPlaying || gameStore.isCompleted || gameStore.isCalculating }"
      @click="handleAutoSolve"
    >
      <Bot v-if="!gameStore.isAutoSolving && !gameStore.isCalculating" :size="18" />
      <div v-else-if="gameStore.isCalculating" class="w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      <Pause v-else-if="!gameStore.isAutoPaused" :size="18" />
      <PlayCircle v-else :size="18" />
      {{ gameStore.isCalculating ? '计算中...' : !gameStore.isAutoSolving ? '自动拼图' : gameStore.isAutoPaused ? '继续' : '暂停' }}
    </button>

    <button
      v-if="gameStore.isAutoSolving"
      class="control-btn control-btn-secondary flex items-center gap-2 px-5 py-3 rounded-xl font-medium"
      @click="handleStopAutoSolve"
    >
      <StopCircle :size="18" />
      停止
    </button>

    <button
      class="control-btn control-btn-danger flex items-center gap-2 px-5 py-3 rounded-xl font-medium"
      :disabled="!gameStore.isPlaying && !gameStore.isCompleted"
      :class="{ 'opacity-50 cursor-not-allowed': !gameStore.isPlaying && !gameStore.isCompleted }"
      @click="handleAbandon"
    >
      <LogOut :size="18" />
      放弃
    </button>
  </div>
</template>

<style scoped>
.control-btn {
  transition: all 0.2s ease;
}

.control-btn-primary {
  background: linear-gradient(135deg, var(--accent-gradient-1) 0%, var(--accent-gradient-2) 100%);
  color: white;
  box-shadow: 0 10px 25px var(--glow-primary);
}

.control-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 35px var(--glow-primary);
}

.control-btn-secondary {
  background: var(--card-bg);
  color: var(--text-primary);
  border: 1px solid var(--border-default);
}

.control-btn-secondary:hover {
  background: var(--accent-primary);
  color: var(--text-primary);
  border-color: var(--border-hover);
  transform: translateY(-2px);
}

.control-btn-accent {
  background: linear-gradient(135deg, var(--accent-gradient-2) 0%, var(--accent-gradient-1) 100%);
  color: white;
  box-shadow: 0 10px 25px var(--glow-secondary);
}

.control-btn-accent:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 35px var(--glow-secondary);
}

.control-btn-hint {
  background: linear-gradient(135deg, var(--accent-gradient-1) 0%, var(--accent-gradient-2) 100%);
  color: white;
  box-shadow: 0 10px 25px var(--glow-primary);
}

.control-btn-hint:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 15px 35px var(--glow-primary);
}

.control-btn:active {
  transform: translateY(0);
}

.control-btn-auto {
  background: linear-gradient(135deg, var(--accent-gradient-1) 0%, var(--accent-gradient-2) 100%);
  color: white;
  box-shadow: 0 10px 25px var(--glow-primary);
}

.control-btn-auto:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 15px 35px var(--glow-primary);
}

.control-btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #f43f5e 100%);
  color: white;
  box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3);
}

.control-btn-danger:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 15px 35px rgba(239, 68, 68, 0.4);
}
</style>
