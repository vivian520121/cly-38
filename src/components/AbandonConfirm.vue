<script setup lang="ts">
import { useGameStore } from '@/stores/gameStore'
import { AlertTriangle, X, LogOut } from 'lucide-vue-next'

const gameStore = useGameStore()

function handleMouseEnter(e: Event, property: string, value: string) {
  const target = e.target as HTMLElement
  target.style[property as any] = value
}

function handleMouseLeave(e: Event, property: string, value: string) {
  const target = e.target as HTMLElement
  target.style[property as any] = value
}

function handleCancel() {
  gameStore.closeAbandonConfirm()
}

function handleConfirm() {
  gameStore.abandonGame()
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="gameStore.showAbandonConfirm"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="handleCancel"></div>

        <div class="relative rounded-2xl shadow-2xl max-w-md w-full p-6"
          :style="{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border-default)'
          }"
        >
          <button
            class="absolute top-4 right-4 transition-colors"
            :style="{ color: 'var(--text-muted)' }"
            @mouseenter="handleMouseEnter($event, 'color', 'var(--text-primary)')"
            @mouseleave="handleMouseLeave($event, 'color', 'var(--text-muted)')"
            @click="handleCancel"
          >
            <X :size="20" />
          </button>

          <div class="flex flex-col items-center text-center">
            <div class="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              :style="{ backgroundColor: 'color-mix(in srgb, #ef4444 20%, transparent)' }"
            >
              <AlertTriangle :size="32" :style="{ color: '#ef4444' }" />
            </div>

            <h3 class="text-xl font-bold mb-2" :style="{ color: 'var(--text-primary)' }">确认放弃当前拼图？</h3>
            <p class="mb-6" :style="{ color: 'var(--text-muted)' }">
              放弃后当前进度将丢失，拼图将恢复到初始状态。您确定要放弃吗？
            </p>

            <div class="flex gap-3 w-full">
              <button
                class="flex-1 px-6 py-3 rounded-xl font-medium transition-colors"
                :style="{
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)'
                }"
                @mouseenter="handleMouseEnter($event, 'backgroundColor', 'color-mix(in srgb, var(--bg-secondary) 80%, var(--text-primary))')"
                @mouseleave="handleMouseLeave($event, 'backgroundColor', 'var(--bg-secondary)')"
                @click="handleCancel"
              >
                继续拼图
              </button>
              <button
                class="flex-1 px-6 py-3 rounded-xl font-medium transition-all shadow-lg flex items-center justify-center gap-2"
                :style="{
                  background: 'linear-gradient(to right, #ef4444, #f43f5e)',
                  color: 'var(--text-primary)',
                  boxShadow: '0 10px 30px var(--glow-secondary)'
                }"
                @mouseenter="handleMouseEnter($event, 'background', 'linear-gradient(to right, #dc2626, #e11d48)')"
                @mouseleave="handleMouseLeave($event, 'background', 'linear-gradient(to right, #ef4444, #f43f5e)')"
                @click="handleConfirm"
              >
                <LogOut :size="18" />
                确认放弃
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.9) translateY(20px);
}
</style>
