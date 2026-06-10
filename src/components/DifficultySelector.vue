<script setup lang="ts">
import { useGameStore } from '@/stores/gameStore'
import { DIFFICULTIES } from '@/types'
import { Grid3X3, Grid2X2, LayoutGrid } from 'lucide-vue-next'

const gameStore = useGameStore()

const icons = {
  3: Grid2X2,
  4: Grid3X3,
  5: LayoutGrid
}

function selectDifficulty(size: 3 | 4 | 5) {
  if (gameStore.difficulty !== size) {
    gameStore.changeDifficulty(size)
  }
}
</script>

<template>
  <div class="difficulty-selector">
    <span class="text-sm text-[var(--text-muted)] mb-2 block">选择难度</span>
    <div class="flex gap-2">
      <button
        v-for="diff in DIFFICULTIES"
        :key="diff.size"
        class="difficulty-btn flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
        :class="{
          'difficulty-btn-active': gameStore.difficulty === diff.size,
          'difficulty-btn-inactive': gameStore.difficulty !== diff.size
        }"
        @click="selectDifficulty(diff.size as 3 | 4 | 5)"
      >
        <component :is="icons[diff.size as keyof typeof icons]" :size="16" />
        {{ diff.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.difficulty-btn-active {
  background: linear-gradient(135deg, var(--accent-gradient-1) 0%, var(--accent-gradient-2) 100%);
  color: white;
  box-shadow: 0 10px 25px var(--glow-primary);
  transform: scale(1.05);
}

.difficulty-btn-inactive {
  background: var(--card-bg);
  color: var(--text-secondary);
  border: 1px solid var(--border-default);
}

.difficulty-btn-inactive:hover {
  background: var(--accent-primary);
  color: var(--text-primary);
  border-color: var(--border-hover);
}

.difficulty-btn {
  transition: all 0.2s ease;
}

.difficulty-btn:hover:not(.difficulty-btn-active) {
  transform: translateY(-1px);
}
</style>
