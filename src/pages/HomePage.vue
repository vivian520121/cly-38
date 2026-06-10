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
import ThemeSelector from '@/components/ThemeSelector.vue'
import { Puzzle } from 'lucide-vue-next'
import { useGameStore } from '@/stores/gameStore'

const gameStore = useGameStore()
</script>

<template>
  <div class="game-container min-h-screen relative overflow-hidden bg-theme-gradient">
    <div class="background-effects absolute inset-0 pointer-events-none">
      <div
        class="bg-gradient-1 absolute -top-1/2 -left-1/4 w-[800px] h-[800px] rounded-full opacity-30 blur-3xl"
        style="background: radial-gradient(circle, var(--accent-gradient-1) 0%, transparent 70%);"
      >
      </div>
      <div
        class="bg-gradient-2 absolute -bottom-1/2 -right-1/4 w-[800px] h-[800px] rounded-full opacity-30 blur-3xl"
        style="background: radial-gradient(circle, var(--accent-gradient-2) 0%, transparent 70%);"
      >
      </div>
      <div class="grid-pattern absolute inset-0 opacity-[0.03]">
      </div>
    </div>

    <div class="content-wrapper relative z-10 max-w-5xl mx-auto px-4 py-8">
      <header class="mb-8">
        <div class="flex items-center justify-between">
          <div class="inline-flex items-center gap-3">
            <div
              class="w-14 h-14 rounded-2xl bg-accent-gradient flex items-center justify-center"
              style="box-shadow: 0 10px 25px var(--glow-primary);"
            >
              <Puzzle :size="28" class="text-white" />
            </div>
            <div class="text-left">
              <h1 class="text-3xl font-bold text-[var(--text-primary)]">
                滑块拼图游戏
              </h1>
              <p class="text-[var(--text-muted)] text-sm">滑动拼图，还原完整图片</p>
            </div>
          </div>
          <ThemeSelector />
        </div>
      </header>

      <div class="game-layout grid lg:grid-cols-[1fr_auto] gap-6 items-start">
        <div class="game-main space-y-6">
          <StatsPanel />

          <AutoSolveProgress />

          <div class="game-hint text-center">
            <p class="text-[var(--text-muted)] text-sm">
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
          <div class="sidebar-card bg-card rounded-2xl p-4 border border-[var(--border-default)] border-theme-hover">
            <h3 class="text-[var(--text-primary)] font-medium mb-3">原图参考</h3>
            <div class="flex justify-center">
              <ReferenceImage />
            </div>
          </div>

          <div class="sidebar-card bg-card rounded-2xl p-4 border border-[var(--border-default)] border-theme-hover">
            <DifficultySelector />
          </div>

          <div class="sidebar-card bg-card rounded-2xl p-4 border border-[var(--border-default)] border-theme-hover">
            <h3 class="text-[var(--text-primary)] font-medium mb-3">游戏说明</h3>
            <ul class="space-y-2 text-sm text-[var(--text-secondary)]">
              <li class="flex items-start gap-2">
                <span style="color: var(--accent-gradient-1);">•</span>
                点击与空白格相邻的滑块进行移动
              </li>
              <li class="flex items-start gap-2">
                <span style="color: var(--accent-gradient-2);">•</span>
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
.bg-gradient-1 {
  animation: float1 20s ease-in-out infinite;
}

.bg-gradient-2 {
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
    linear-gradient(var(--border-default) 1px, transparent 1px),
    linear-gradient(90deg, var(--border-default) 1px, transparent 1px);
  background-size: 50px 50px;
}

.sidebar-card {
  transition: all 0.3s ease;
}

.sidebar-card:hover {
  border-color: var(--border-hover);
}

@media (max-width: 1023px) {
  .game-sidebar {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }
}
</style>
