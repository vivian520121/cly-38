<script setup lang="ts">
import PuzzleBoard from '@/components/PuzzleBoard.vue'
import StatsPanel from '@/components/StatsPanel.vue'
import DifficultySelector from '@/components/DifficultySelector.vue'
import ControlButtons from '@/components/ControlButtons.vue'
import ImageSelector from '@/components/ImageSelector.vue'
import SuccessModal from '@/components/SuccessModal.vue'
import ReferenceImage from '@/components/ReferenceImage.vue'
import AbandonConfirm from '@/components/AbandonConfirm.vue'
import AutoSolveProgress from '@/components/AutoSolveProgress.vue'
import { Puzzle } from 'lucide-vue-next'
import { useGameStore } from '@/stores/gameStore'

const gameStore = useGameStore()
</script>

<template>
  <div class="game-container min-h-screen relative overflow-hidden">
    <div class="background-effects absolute inset-0 pointer-events-none">
      <div class="bg-gradient-1 absolute -top-1/2 -left-1/4 w-[800px] h-[800px] rounded-full opacity-30 blur-3xl">
      </div>
      <div class="bg-gradient-2 absolute -bottom-1/2 -right-1/4 w-[800px] h-[800px] rounded-full opacity-30 blur-3xl">
      </div>
      <div class="grid-pattern absolute inset-0 opacity-[0.03]">
      </div>
    </div>

    <div class="content-wrapper relative z-10 max-w-5xl mx-auto px-4 py-8">
      <header class="text-center mb-8">
        <div class="inline-flex items-center gap-3 mb-4">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Puzzle :size="28" class="text-white" />
          </div>
          <div class="text-left">
            <h1 class="text-3xl font-bold text-white">
              滑块拼图游戏
            </h1>
            <p class="text-white/50 text-sm">滑动拼图，还原完整图片</p>
          </div>
        </div>
      </header>

      <div class="game-layout grid lg:grid-cols-[1fr_auto] gap-6 items-start">
        <div class="game-main space-y-6">
          <StatsPanel />

          <AutoSolveProgress />

          <div class="game-hint text-center">
            <p class="text-white/50 text-sm">
              <span v-if="!gameStore.isPlaying && !gameStore.isCompleted">
                💡 点击「开始游戏」打乱拼图，然后点击相邻空白格的滑块移动
              </span>
              <span v-else-if="gameStore.isPlaying">
                🎮 游戏进行中... 点击可移动的滑块
              </span>
              <span v-else>
                ✨ 恭喜完成！选择「再来一局」或「换图」继续挑战
              </span>
            </p>
          </div>

          <PuzzleBoard />

          <ControlButtons />
        </div>

        <div class="game-sidebar space-y-4">
          <div class="sidebar-card bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <h3 class="text-white font-medium mb-3">原图参考</h3>
            <div class="flex justify-center">
              <ReferenceImage />
            </div>
          </div>

          <div class="sidebar-card bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <DifficultySelector />
          </div>

          <div class="sidebar-card bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <h3 class="text-white font-medium mb-3">游戏说明</h3>
            <ul class="space-y-2 text-sm text-white/60">
              <li class="flex items-start gap-2">
                <span class="text-violet-400">•</span>
                点击与空白格相邻的滑块进行移动
              </li>
              <li class="flex items-start gap-2">
                <span class="text-fuchsia-400">•</span>
                将所有拼图块还原到正确位置即获胜
              </li>
              <li class="flex items-start gap-2">
                <span class="text-amber-400">•</span>
                用时越短、步数越少，得分越高
              </li>
              <li class="flex items-start gap-2">
                <span class="text-emerald-400">•</span>
                支持上传自定义图片作为拼图素材
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <ImageSelector />
    <SuccessModal />
    <AbandonConfirm />
  </div>
</template>

<style scoped>
.game-container {
  background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
}

.bg-gradient-1 {
  background: radial-gradient(circle, #8b5cf6 0%, transparent 70%);
  animation: float1 20s ease-in-out infinite;
}

.bg-gradient-2 {
  background: radial-gradient(circle, #ec4899 0%, transparent 70%);
  animation: float2 20s ease-in-out infinite;
}

@keyframes float1 {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(100px, 100px) scale(1.1);
  }
}

@keyframes float2 {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(-100px, -100px) scale(1.1);
  }
}

.grid-pattern {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
}

.sidebar-card {
  transition: all 0.3s ease;
}

.sidebar-card:hover {
  border-color: rgba(255, 255, 255, 0.2);
}

@media (max-width: 1023px) {
  .game-sidebar {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }
}
</style>
