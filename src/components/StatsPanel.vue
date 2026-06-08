<script setup lang="ts">
import { Clock, Footprints, Trophy, Target } from 'lucide-vue-next'
import { useGameStore } from '@/stores/gameStore'
import { DIFFICULTIES } from '@/types'
import { computed } from 'vue'

const gameStore = useGameStore()

const difficultyLabel = computed(() => {
  const config = DIFFICULTIES.find(d => d.size === gameStore.difficulty)
  return config?.label || ''
})
</script>

<template>
  <div class="stats-panel grid grid-cols-2 md:grid-cols-4 gap-3">
    <div class="stat-card">
      <div class="stat-icon-wrapper bg-blue-500/20 text-blue-400">
        <Footprints :size="20" />
      </div>
      <div class="stat-content">
        <span class="stat-label">步数</span>
        <span class="stat-value">{{ gameStore.moves }}</span>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon-wrapper bg-emerald-500/20 text-emerald-400">
        <Clock :size="20" />
      </div>
      <div class="stat-content">
        <span class="stat-label">用时</span>
        <span class="stat-value font-mono">{{ gameStore.formattedTime }}</span>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon-wrapper bg-amber-500/20 text-amber-400">
        <Target :size="20" />
      </div>
      <div class="stat-content">
        <span class="stat-label">难度</span>
        <span class="stat-value text-sm">{{ difficultyLabel }}</span>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon-wrapper bg-fuchsia-500/20 text-fuchsia-400">
        <Trophy :size="20" />
      </div>
      <div class="stat-content">
        <span class="stat-label">最高分</span>
        <span class="stat-value">{{ gameStore.bestScore ?? '--' }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stat-card {
  @apply flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10;
  transition: all 0.3s ease;
}

.stat-card:hover {
  @apply bg-white/10 border-white/20;
  transform: translateY(-2px);
}

.stat-icon-wrapper {
  @apply w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0;
}

.stat-content {
  @apply flex flex-col;
}

.stat-label {
  @apply text-xs text-white/60;
}

.stat-value {
  @apply text-lg font-bold text-white;
  background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>
