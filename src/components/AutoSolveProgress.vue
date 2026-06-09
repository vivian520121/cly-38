<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { Bot, Gauge, Clock } from 'lucide-vue-next'

const gameStore = useGameStore()

const speedLabel = computed(() => {
  const speed = gameStore.autoSolveSpeed
  if (speed <= 200) return '极快'
  if (speed <= 400) return '快速'
  if (speed <= 600) return '正常'
  if (speed <= 1000) return '慢速'
  return '极慢'
})

function handleSpeedChange(event: Event) {
  const target = event.target as HTMLInputElement
  gameStore.setAutoSolveSpeed(Number(target.value))
}
</script>

<template>
  <Transition name="slide">
    <div
      v-if="gameStore.isAutoSolving"
      class="auto-solve-panel bg-slate-800/90 backdrop-blur-sm rounded-xl p-4 border border-violet-500/30 shadow-lg shadow-violet-500/10"
    >
      <div class="flex items-center gap-3 mb-3">
        <div class="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
          <Bot class="text-violet-400" :size="20" />
        </div>
        <div class="flex-1">
          <div class="flex items-center justify-between">
            <span class="text-white font-medium">自动拼图进行中</span>
            <span
              class="text-sm font-medium px-2 py-0.5 rounded-full"
              :class="gameStore.isAutoPaused ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'"
            >
              {{ gameStore.isAutoPaused ? '已暂停' : '运行中' }}
            </span>
          </div>
          <div class="flex items-center gap-4 text-sm text-slate-400 mt-1">
            <span class="flex items-center gap-1">
              <Clock :size="14" />
              步数: {{ gameStore.autoSolveIndex }} / {{ gameStore.autoSolveSteps.length }}
            </span>
            <span>进度: {{ gameStore.autoSolveProgress }}%</span>
          </div>
        </div>
      </div>

      <div class="relative h-2 bg-slate-700 rounded-full overflow-hidden mb-3">
        <div
          class="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-300"
          :style="{ width: `${gameStore.autoSolveProgress}%` }"
        ></div>
        <div
          v-if="!gameStore.isAutoPaused"
          class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine"
        ></div>
      </div>

      <div class="flex items-center gap-3">
        <Gauge class="text-slate-400 flex-shrink-0" :size="16" />
        <span class="text-sm text-slate-400 whitespace-nowrap">速度:</span>
        <input
          type="range"
          min="100"
          max="2000"
          step="100"
          :value="gameStore.autoSolveSpeed"
          class="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
          @input="handleSpeedChange"
        />
        <span class="text-sm font-medium text-violet-400 w-12 text-right">{{ speedLabel }}</span>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.slider::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b5cf6, #a855f7);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.5);
  transition: transform 0.2s;
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b5cf6, #a855f7);
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.5);
}

@keyframes shine {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shine {
  animation: shine 1.5s ease-in-out infinite;
}
</style>
