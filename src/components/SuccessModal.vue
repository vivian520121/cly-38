<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Star, Clock, Footprints, Trophy, RotateCcw, Shuffle, X, Share2 } from 'lucide-vue-next'
import { useGameStore } from '@/stores/gameStore'
import { formatTime } from '@/utils/score'

const gameStore = useGameStore()

const showContent = ref(false)

function getCssVar(name: string, fallback: string = ''): string {
  if (typeof window !== 'undefined') {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
  }
  return fallback
}

function handleMouseEnter(e: Event, property: string, value: string) {
  const target = e.target as HTMLElement
  target.style[property as any] = value
}

function handleMouseLeave(e: Event, property: string, value: string) {
  const target = e.target as HTMLElement
  target.style[property as any] = value
}

const result = computed(() => gameStore.gameResult)

watch(() => gameStore.isCompleted, (completed) => {
  if (completed) {
    setTimeout(() => {
      showContent.value = true
    }, 300)
  } else {
    showContent.value = false
  }
})

function handleRestart() {
  showContent.value = false
  setTimeout(() => {
    gameStore.restartGame()
  }, 300)
}

function handleChangeImage() {
  showContent.value = false
  setTimeout(() => {
    gameStore.showImageSelector = true
    gameStore.isCompleted = false
    gameStore.gameResult = null
  }, 300)
}

function handleShare() {
  showContent.value = false
  setTimeout(() => {
    gameStore.openShareModal()
  }, 300)
}

function close() {
  showContent.value = false
  setTimeout(() => {
    gameStore.isCompleted = false
    gameStore.gameResult = null
  }, 300)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="success-modal">
      <div v-if="gameStore.isCompleted" class="success-overlay fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
        <div class="particles-container absolute inset-0 pointer-events-none overflow-hidden">
          <div
            v-for="i in 30"
            :key="i"
            class="particle absolute rounded-full"
            :style="{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
              backgroundColor: [getCssVar('--accent-gradient-1', '#8b5cf6'), getCssVar('--accent-gradient-2', '#ec4899'), '#f59e0b', '#10b981', '#3b82f6'][Math.floor(Math.random() * 5)],
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${Math.random() * 2 + 2}s`
            }"
          />
        </div>

        <Transition name="success-content">
          <div v-if="showContent" class="success-content relative w-full max-w-md">
            <button
              class="absolute -top-2 -right-2 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
              :style="{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-muted)'
              }"
              @mouseenter="handleMouseEnter($event, 'color', 'var(--text-primary)')"
              @mouseleave="handleMouseLeave($event, 'color', 'var(--text-muted)')"
              @click="close"
            >
              <X :size="18" />
            </button>

            <div class="rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden"
              :style="{
                background: 'var(--card-bg)',
                border: '1px solid var(--border-default)'
              }"
            >
              <div class="absolute inset-0 pointer-events-none"
                :style="{
                  background: 'linear-gradient(135deg, var(--accent-gradient-1) 0%, transparent 50%, var(--accent-gradient-2) 100%)',
                  opacity: 0.1
                }"
              >
              </div>

              <div class="trophy-wrapper mb-6">
                <div class="w-24 h-24 mx-auto rounded-full flex items-center justify-center shadow-lg"
                  :style="{
                    background: 'linear-gradient(135deg, var(--accent-gradient-1), var(--accent-gradient-2))',
                    boxShadow: '0 10px 40px var(--glow-primary)'
                  }"
                >
                  <Trophy :size="48" :style="{ color: 'var(--text-primary)' }" />
                </div>
              </div>

              <h2 class="text-3xl font-bold mb-2" :style="{ color: 'var(--text-primary)' }">
                🎉 恭喜完成！
              </h2>
              <p class="mb-6" :style="{ color: 'var(--text-muted)' }">你成功还原了拼图</p>

              <div class="stars-container flex justify-center gap-2 mb-6">
                <Star
                  v-for="i in 3"
                  :key="i"
                  class="star-icon transition-all duration-500"
                  :class="{
                    'star-filled': i <= (result?.stars ?? 0)
                  }"
                  :size="36"
                  :style="{
                    animationDelay: `${i * 0.2}s`,
                    fill: i <= (result?.stars ?? 0) ? 'currentColor' : 'none',
                    color: i <= (result?.stars ?? 0) ? 'var(--accent-gradient-1)' : 'var(--text-muted)',
                    opacity: i <= (result?.stars ?? 0) ? 1 : 0.2
                  }"
                />
              </div>

              <div class="grid grid-cols-3 gap-3 mb-6">
                <div class="stat-item rounded-xl p-3" :style="{ backgroundColor: 'var(--bg-secondary)' }">
                  <div class="w-8 h-8 mx-auto mb-2 rounded-lg flex items-center justify-center" :style="{ backgroundColor: 'color-mix(in srgb, var(--accent-gradient-1) 20%, transparent)' }">
                    <Footprints :size="16" :style="{ color: 'var(--accent-gradient-1)' }" />
                  </div>
                  <div class="text-2xl font-bold" :style="{ color: 'var(--text-primary)' }">{{ result?.moves }}</div>
                  <div class="text-xs" :style="{ color: 'var(--text-muted)' }">步数</div>
                </div>
                <div class="stat-item rounded-xl p-3" :style="{ backgroundColor: 'var(--bg-secondary)' }">
                  <div class="w-8 h-8 mx-auto mb-2 rounded-lg flex items-center justify-center" :style="{ backgroundColor: 'color-mix(in srgb, var(--accent-gradient-2) 20%, transparent)' }">
                    <Clock :size="16" :style="{ color: 'var(--accent-gradient-2)' }" />
                  </div>
                  <div class="text-2xl font-bold font-mono" :style="{ color: 'var(--text-primary)' }">{{ result ? formatTime(result.time) : '00:00' }}</div>
                  <div class="text-xs" :style="{ color: 'var(--text-muted)' }">用时</div>
                </div>
                <div class="stat-item rounded-xl p-3" :style="{ backgroundColor: 'var(--bg-secondary)' }">
                  <div class="w-8 h-8 mx-auto mb-2 rounded-lg flex items-center justify-center" :style="{ backgroundColor: 'color-mix(in srgb, var(--accent-gradient-1) 20%, transparent)' }">
                    <Trophy :size="16" :style="{ color: 'var(--accent-gradient-1)' }" />
                  </div>
                  <div class="text-2xl font-bold" :style="{ color: 'var(--text-primary)' }">{{ result?.score }}</div>
                  <div class="text-xs" :style="{ color: 'var(--text-muted)' }">得分</div>
                </div>
              </div>

              <div class="flex gap-3 mb-3">
                <button
                  class="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium transition-all hover:scale-105"
                  :style="{
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-default)'
                  }"
                  @mouseenter="handleMouseEnter($event, 'backgroundColor', 'color-mix(in srgb, var(--bg-secondary) 80%, var(--text-primary))')"
                  @mouseleave="handleMouseLeave($event, 'backgroundColor', 'var(--bg-secondary)')"
                  @click="handleRestart"
                >
                  <RotateCcw :size="18" />
                  再来一局
                </button>
                <button
                  class="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium shadow-lg transition-all hover:scale-105"
                  :style="{
                    background: 'linear-gradient(to right, var(--accent-gradient-1), var(--accent-gradient-2))',
                    color: 'var(--text-primary)',
                    boxShadow: '0 10px 30px var(--glow-primary)'
                  }"
                  @click="handleChangeImage"
                >
                  <Shuffle :size="18" />
                  换图
                </button>
              </div>
              <button
                class="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium shadow-lg transition-all hover:scale-[1.02]"
                :style="{
                  background: 'linear-gradient(to right, var(--accent-gradient-1), var(--accent-gradient-2))',
                  color: 'var(--text-primary)',
                  boxShadow: '0 10px 30px var(--glow-secondary)'
                }"
                @click="handleShare"
              >
                <Share2 :size="18" />
                分享战绩
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.success-modal-enter-active,
.success-modal-leave-active {
  transition: all 0.3s ease;
}

.success-modal-enter-from,
.success-modal-leave-to {
  opacity: 0;
}

.success-content-enter-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.success-content-enter-from {
  transform: scale(0.5) translateY(50px);
  opacity: 0;
}

.success-content-leave-active {
  transition: all 0.3s ease;
}

.success-content-leave-to {
  transform: scale(0.9);
  opacity: 0;
}

.particle {
  animation: floatUp 3s ease-out infinite;
}

@keyframes floatUp {
  0% {
    transform: translateY(100vh) scale(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
    transform: scale(1);
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) scale(0);
    opacity: 0;
  }
}

.star-icon {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.star-filled {
  animation: starPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  opacity: 0;
  transform: scale(0);
}

@keyframes starPop {
  0% {
    opacity: 0;
    transform: scale(0) rotate(-180deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

.trophy-wrapper {
  animation: trophyBounce 1s ease-out;
}

@keyframes trophyBounce {
  0% {
    transform: scale(0) rotate(-10deg);
  }
  50% {
    transform: scale(1.2) rotate(5deg);
  }
  70% {
    transform: scale(0.9) rotate(-3deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}
</style>
