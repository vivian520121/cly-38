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
      <div class="stat-icon-wrapper" style="background: color-mix(in srgb, var(--accent-primary) 20%, transparent); color: var(--accent-primary);">
        <Footprints :size="20" />
      </div>
      <div class="stat-content">
        <span class="stat-label">步数</span>
        <span class="stat-value">{{ gameStore.moves }}</span>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon-wrapper" style="background: color-mix(in srgb, var(--accent-secondary) 20%, transparent); color: var(--accent-secondary);">
        <Clock :size="20" />
      </div>
      <div class="stat-content">
        <span class="stat-label">用时</span>
        <span class="stat-value font-mono">{{ gameStore.formattedTime }}</span>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon-wrapper" style="background: color-mix(in srgb, var(--accent-primary) 20%, transparent); color: var(--accent-primary);">
        <Target :size="20" />
      </div>
      <div class="stat-content">
        <span class="stat-label">难度</span>
        <span class="stat-value text-sm">{{ difficultyLabel }}</span>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon-wrapper" style="background: color-mix(in srgb, var(--accent-secondary) 20%, transparent); color: var(--accent-secondary);">
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
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--card-bg);
  backdrop-filter: var(--card-blur);
  border-radius: 0.75rem;
  padding: 0.75rem;
  border: 1px solid var(--border-default);
  transition: all 0.3s ease;
}

.stat-card:hover {
  background: color-mix(in srgb, var(--card-bg) 100%, white 10%);
  border-color: var(--border-hover);
  transform: translateY(-2px);
}

.stat-icon-wrapper {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.stat-value {
  font-size: 1.125rem;
  font-weight: bold;
  background: linear-gradient(135deg, var(--text-primary) 0%, var(--accent-primary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>
