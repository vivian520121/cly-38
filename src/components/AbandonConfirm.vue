<script setup lang="ts">
import { useGameStore } from '@/stores/gameStore'
import { AlertTriangle, X, LogOut } from 'lucide-vue-next'

const gameStore = useGameStore()

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

        <div class="relative bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-700">
          <button
            class="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            @click="handleCancel"
          >
            <X :size="20" />
          </button>

          <div class="flex flex-col items-center text-center">
            <div class="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
              <AlertTriangle class="text-red-500" :size="32" />
            </div>

            <h3 class="text-xl font-bold text-white mb-2">确认放弃当前拼图？</h3>
            <p class="text-slate-400 mb-6">
              放弃后当前进度将丢失，拼图将恢复到初始状态。您确定要放弃吗？
            </p>

            <div class="flex gap-3 w-full">
              <button
                class="flex-1 px-6 py-3 rounded-xl font-medium bg-slate-700 text-white hover:bg-slate-600 transition-colors"
                @click="handleCancel"
              >
                继续拼图
              </button>
              <button
                class="flex-1 px-6 py-3 rounded-xl font-medium bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600 transition-all shadow-lg shadow-red-500/30 flex items-center justify-center gap-2"
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
