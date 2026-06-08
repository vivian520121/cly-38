<script setup lang="ts">
import { ref } from 'vue'
import { Eye, EyeOff, Maximize2 } from 'lucide-vue-next'
import { useGameStore } from '@/stores/gameStore'

const gameStore = useGameStore()

const showReference = ref(true)
const isExpanded = ref(false)

function toggleReference() {
  showReference.value = !showReference.value
}

function toggleExpand() {
  isExpanded.value = !isExpanded.value
}
</script>

<template>
  <div class="reference-image-container">
    <div
      class="reference-card relative rounded-xl overflow-hidden transition-all duration-300"
      :class="{
        'w-24 h-24': !isExpanded && showReference,
        'w-48 h-48': isExpanded && showReference,
        'w-12 h-12': !showReference
      }"
    >
      <div v-if="showReference" class="reference-image-wrapper w-full h-full relative group">
        <img
          :src="gameStore.currentImage"
          alt="原图参考"
          class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        </div>
        <div class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            class="w-7 h-7 rounded-lg bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            @click.stop="toggleExpand"
          >
            <Maximize2 :size="14" />
          </button>
        </div>
        <div class="absolute bottom-2 left-2 right-2">
          <span class="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">原图参考</span>
        </div>
      </div>

      <div v-else class="w-full h-full flex items-center justify-center bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-colors" @click="toggleReference">
        <Eye :size="18" class="text-white/50" />
      </div>

      <button
        v-if="showReference"
        class="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-800 border border-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all hover:scale-110 z-10"
        @click="toggleReference"
      >
        <EyeOff :size="12" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.reference-card {
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.reference-image-wrapper {
  cursor: pointer;
}
</style>
