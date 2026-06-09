<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Star, Clock, Footprints, Trophy, RotateCcw, Shuffle, X, Share2 } from 'lucide-vue-next'
import { useGameStore } from '@/stores/gameStore'
import { formatTime } from '@/utils/score'

const gameStore = useGameStore()

const showContent = ref(false)

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
              backgroundColor: ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'][Math.floor(Math.random() * 5)],
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${Math.random() * 2 + 2}s`
            }"
          />
        </div>

        <Transition name="success-content">
          <div v-if="showContent" class="success-content relative w-full max-w-md">
            <button
              class="absolute -top-2 -right-2 z-10 w-10 h-10 rounded-full bg-slate-800 border border-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all hover:scale-110"
              @click="close"
            >
              <X :size="18" />
            </button>

            <div class="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 border border-white/10 shadow-2xl text-center relative overflow-hidden">
              <div class="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-fuchsia-500/10 pointer-events-none">
              </div>

              <div class="trophy-wrapper mb-6">
                <div class="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <Trophy :size="48" class="text-white" />
                </div>
              </div>

              <h2 class="text-3xl font-bold text-white mb-2">
                🎉 恭喜完成！
              </h2>
              <p class="text-white/60 mb-6">你成功还原了拼图</p>

              <div class="stars-container flex justify-center gap-2 mb-6">
                <Star
                  v-for="i in 3"
                  :key="i"
                  class="star-icon transition-all duration-500"
                  :class="{
                    'star-filled text-amber-400': i <= (result?.stars ?? 0),
                    'text-white/20': i > (result?.stars ?? 0)
                  }"
                  :size="36"
                  :style="{ animationDelay: `${i * 0.2}s`, fill: i <= (result?.stars ?? 0) ? 'currentColor' : 'none' }"
                />
              </div>

              <div class="grid grid-cols-3 gap-3 mb-6">
                <div class="stat-item bg-white/5 rounded-xl p-3">
                  <div class="w-8 h-8 mx-auto mb-2 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Footprints :size="16" class="text-blue-400" />
                  </div>
                  <div class="text-2xl font-bold text-white">{{ result?.moves }}</div>
                  <div class="text-xs text-white/50">步数</div>
                </div>
                <div class="stat-item bg-white/5 rounded-xl p-3">
                  <div class="w-8 h-8 mx-auto mb-2 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <Clock :size="16" class="text-emerald-400" />
                  </div>
                  <div class="text-2xl font-bold text-white font-mono">{{ result ? formatTime(result.time) : '00:00' }}</div>
                  <div class="text-xs text-white/50">用时</div>
                </div>
                <div class="stat-item bg-white/5 rounded-xl p-3">
                  <div class="w-8 h-8 mx-auto mb-2 rounded-lg bg-fuchsia-500/20 flex items-center justify-center">
                    <Trophy :size="16" class="text-fuchsia-400" />
                  </div>
                  <div class="text-2xl font-bold text-white">{{ result?.score }}</div>
                  <div class="text-xs text-white/50">得分</div>
                </div>
              </div>

              <div class="flex gap-3 mb-3">
                <button
                  class="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all hover:scale-105"
                  @click="handleRestart"
                >
                  <RotateCcw :size="18" />
                  再来一局
                </button>
                <button
                  class="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30 transition-all hover:scale-105"
                  @click="handleChangeImage"
                >
                  <Shuffle :size="18" />
                  换图
                </button>
              </div>
              <button
                class="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30 transition-all hover:scale-[1.02]"
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
