<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import {
  X, Check, RotateCcw, Sun, Contrast, Droplets, Palette, Camera, Sliders, ZoomIn, ZoomOut, Move, Square
} from 'lucide-vue-next'
import type { ImageFilterConfig, CropConfig } from '@/types'
import { DEFAULT_FILTER, FILTER_PRESETS } from '@/types'
import {
  loadImage,
  getSquareCrop,
  getFilterCSS,
  processImage,
  resetFilter,
  adjustFilter
} from '@/utils/imageProcessor'

const props = defineProps<{
  imageFile: File | null
  show: boolean
}>()

const emit = defineEmits<{
  close: []
  confirm: [dataUrl: string]
}>()

const originalImage = ref<HTMLImageElement | null>(null)
const currentFilter = ref<ImageFilterConfig>({ ...DEFAULT_FILTER })
const crop = ref<CropConfig>({ x: 0, y: 0, width: 0, height: 0 })
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const cropStart = ref({ x: 0, y: 0 })
const activeTab = ref<'crop' | 'filters'>('crop')
const isProcessing = ref(false)
const containerRef = ref<HTMLDivElement | null>(null)
const imageDisplayRef = ref<HTMLDivElement | null>(null)

const previewContainerSize = 400
const imageScale = ref(1)
const imageOffset = ref({ x: 0, y: 0 })

const filterStyle = computed(() => getFilterCSS(currentFilter.value))

const handleFilterChange = (key: keyof ImageFilterConfig, value: number) => {
  currentFilter.value = adjustFilter(currentFilter.value, { [key]: value })
}

const applyPreset = (preset: typeof FILTER_PRESETS[0]) => {
  currentFilter.value = { ...preset.config }
}

const resetAll = () => {
  currentFilter.value = resetFilter()
  if (originalImage.value) {
    crop.value = getSquareCrop(originalImage.value.width, originalImage.value.height)
    const fitScale = Math.min(1, previewContainerSize / Math.max(originalImage.value.width, originalImage.value.height))
    imageScale.value = fitScale
  }
  imageOffset.value = { x: 0, y: 0 }
}

const handleMouseDown = (e: MouseEvent) => {
  if (!containerRef.value || !originalImage.value) return

  const rect = containerRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  const scaledWidth = originalImage.value.width * imageScale.value
  const scaledHeight = originalImage.value.height * imageScale.value
  const offsetX = (previewContainerSize - scaledWidth) / 2 + imageOffset.value.x
  const offsetY = (previewContainerSize - scaledHeight) / 2 + imageOffset.value.y

  const cropLeft = offsetX + crop.value.x * imageScale.value
  const cropTop = offsetY + crop.value.y * imageScale.value
  const cropRight = cropLeft + crop.value.width * imageScale.value
  const cropBottom = cropTop + crop.value.height * imageScale.value

  if (x >= cropLeft && x <= cropRight && y >= cropTop && y <= cropBottom) {
    isDragging.value = true
    dragStart.value = { x: e.clientX, y: e.clientY }
    cropStart.value = { x: crop.value.x, y: crop.value.y }
  }
}

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value || !originalImage.value) return

  const dx = (e.clientX - dragStart.value.x) / imageScale.value
  const dy = (e.clientY - dragStart.value.y) / imageScale.value

  const newX = Math.max(0, Math.min(originalImage.value.width - crop.value.width, cropStart.value.x + dx))
  const newY = Math.max(0, Math.min(originalImage.value.height - crop.value.height, cropStart.value.y + dy))

  crop.value = { ...crop.value, x: newX, y: newY }
}

const handleMouseUp = () => {
  isDragging.value = false
}

const adjustZoom = (delta: number) => {
  const newScale = Math.max(0.5, Math.min(3, imageScale.value + delta))
  imageScale.value = newScale
}

const handleCropSizeChange = (delta: number) => {
  if (!originalImage.value) return

  const currentSize = crop.value.width
  const minSize = 100
  const maxSize = Math.min(originalImage.value.width, originalImage.value.height)
  const newSize = Math.max(minSize, Math.min(maxSize, currentSize + delta))

  const sizeDiff = newSize - currentSize
  crop.value = {
    x: Math.max(0, Math.min(originalImage.value.width - newSize, crop.value.x - sizeDiff / 2)),
    y: Math.max(0, Math.min(originalImage.value.height - newSize, crop.value.y - sizeDiff / 2)),
    width: newSize,
    height: newSize
  }
}

const confirmImage = async () => {
  if (!props.imageFile) return

  isProcessing.value = true

  try {
    const result = await processImage(
      props.imageFile,
      currentFilter.value,
      crop.value,
      800
    )
    emit('confirm', result.dataUrl)
  } catch (err) {
    console.error('Image processing failed:', err)
  } finally {
    isProcessing.value = false
  }
}

const closeEditor = () => {
  emit('close')
}

watch(() => props.imageFile, async (file) => {
  if (file) {
    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string
        originalImage.value = await loadImage(dataUrl)
        const fitScale = Math.min(1, previewContainerSize / Math.max(originalImage.value.width, originalImage.value.height))
        imageScale.value = fitScale
        imageOffset.value = { x: 0, y: 0 }
        crop.value = getSquareCrop(originalImage.value.width, originalImage.value.height)
        currentFilter.value = resetFilter()
      }
      reader.readAsDataURL(file)
    } catch (err) {
      console.error('Failed to load image:', err)
    }
  } else {
    originalImage.value = null
  }
})

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', handleMouseUp)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', handleMouseUp)
})

const displayedImageStyle = computed(() => {
  if (!originalImage.value) return {}

  const scaledWidth = originalImage.value.width * imageScale.value
  const scaledHeight = originalImage.value.height * imageScale.value

  return {
    width: `${scaledWidth}px`,
    height: `${scaledHeight}px`,
    transform: `translate(${imageOffset.value.x}px, ${imageOffset.value.y}px)`,
    filter: filterStyle.value
  }
})

const cropOverlayStyle = computed(() => {
  if (!originalImage.value) return {}

  const scaledWidth = originalImage.value.width * imageScale.value
  const scaledHeight = originalImage.value.height * imageScale.value

  const offsetX = (previewContainerSize - scaledWidth) / 2 + imageOffset.value.x
  const offsetY = (previewContainerSize - scaledHeight) / 2 + imageOffset.value.y

  return {
    left: `${offsetX + crop.value.x * imageScale.value}px`,
    top: `${offsetY + crop.value.y * imageScale.value}px`,
    width: `${crop.value.width * imageScale.value}px`,
    height: `${crop.value.height * imageScale.value}px`
  }
})

const filterSliders = [
  { key: 'brightness' as const, label: '亮度', icon: Sun, min: 50, max: 150 },
  { key: 'contrast' as const, label: '对比度', icon: Contrast, min: 50, max: 150 },
  { key: 'saturation' as const, label: '饱和度', icon: Droplets, min: 0, max: 200 },
  { key: 'grayscale' as const, label: '灰度', icon: Palette, min: 0, max: 100 },
  { key: 'sepia' as const, label: '复古', icon: Camera, min: 0, max: 100 },
  { key: 'blur' as const, label: '模糊', icon: Sliders, min: 0, max: 10 }
]
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        @click.self="closeEditor"
      >
        <div class="modal-content relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-default)] shadow-2xl">
          <div class="flex items-center justify-between p-4 border-b border-[var(--border-default)]">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-accent-gradient flex items-center justify-center">
                <Sliders :size="20" class="text-white" />
              </div>
              <div>
                <h3 class="text-lg font-bold text-[var(--text-primary)]">图片编辑</h3>
                <p class="text-sm text-[var(--text-muted)]">裁剪并调整图片效果</p>
              </div>
            </div>
            <button
              class="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              @click="closeEditor"
            >
              <X :size="20" />
            </button>
          </div>

          <div class="flex flex-col lg:flex-row h-[calc(90vh-100px)]">
            <div class="flex-1 p-4 flex flex-col items-center justify-center bg-black/30">
              <div
                v-if="!originalImage"
                class="flex flex-col items-center justify-center text-[var(--text-muted)]"
              >
                <div class="w-12 h-12 border-4 border-[var(--border-default)] border-t-[var(--accent-primary)] rounded-full animate-spin mb-4" />
                <p class="text-sm">加载图片中...</p>
              </div>
              <div
                v-else
                ref="containerRef"
                class="relative w-[400px] h-[400px] bg-black/50 rounded-xl overflow-hidden cursor-move select-none"
                @mousedown="handleMouseDown"
              >
                <div
                  ref="imageDisplayRef"
                  class="absolute inset-0 flex items-center justify-center overflow-hidden"
                >
                  <img
                    v-if="originalImage"
                    :src="originalImage.src"
                    alt="Preview"
                    class="object-contain"
                    :style="displayedImageStyle"
                    draggable="false"
                  />
                </div>

                <div
                  v-if="activeTab === 'crop'"
                  class="absolute inset-0 pointer-events-none"
                >
                  <div class="absolute inset-0 bg-black/50" />
                  <div
                    class="absolute border-2 border-white shadow-lg pointer-events-auto cursor-move"
                    :style="cropOverlayStyle"
                  >
                    <div class="absolute -inset-[3px] border-2 border-white/30" />
                    <div class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent opacity-50" />
                    <div class="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent opacity-50" />
                    <div class="absolute top-0 bottom-0 left-0 w-[2px] bg-gradient-to-b from-transparent via-white to-transparent opacity-50" />
                    <div class="absolute top-0 bottom-0 right-0 w-[2px] bg-gradient-to-b from-transparent via-white to-transparent opacity-50" />
                    <div class="absolute top-1 left-1 px-2 py-1 bg-black/70 rounded text-white text-xs font-mono">
                      {{ Math.round(crop.width) }} × {{ Math.round(crop.height) }}
                    </div>
                  </div>
                </div>

                <div
                  v-if="activeTab === 'crop' && isDragging"
                  class="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/70 rounded-full text-white text-xs flex items-center gap-1"
                >
                  <Move :size="12" />
                  拖动调整位置
                </div>
              </div>

              <div class="flex items-center gap-2 mt-4">
                <button
                  class="w-10 h-10 rounded-xl bg-[var(--card-bg)] border border-[var(--border-default)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  @click="adjustZoom(-0.1)"
                  title="缩小"
                >
                  <ZoomOut :size="18" />
                </button>
                <span class="text-sm text-[var(--text-muted)] w-16 text-center">
                  {{ Math.round(imageScale * 100) }}%
                </span>
                <button
                  class="w-10 h-10 rounded-xl bg-[var(--card-bg)] border border-[var(--border-default)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  @click="adjustZoom(0.1)"
                  title="放大"
                >
                  <ZoomIn :size="18" />
                </button>

                <div class="w-px h-8 bg-[var(--border-default)] mx-2" />

                <button
                  class="w-10 h-10 rounded-xl bg-[var(--card-bg)] border border-[var(--border-default)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  @click="handleCropSizeChange(-50)"
                  title="减小裁剪"
                >
                  <Square :size="16" />
                </button>
                <span class="text-sm text-[var(--text-muted)] w-20 text-center">
                  {{ Math.round(crop.width) }}px
                </span>
                <button
                  class="w-10 h-10 rounded-xl bg-[var(--card-bg)] border border-[var(--border-default)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  @click="handleCropSizeChange(50)"
                  title="增大裁剪"
                >
                  <Square :size="20" />
                </button>

                <div class="w-px h-8 bg-[var(--border-default)] mx-2" />

                <button
                  class="px-4 h-10 rounded-xl bg-[var(--card-bg)] border border-[var(--border-default)] flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  @click="resetAll"
                >
                  <RotateCcw :size="16" />
                  重置
                </button>
              </div>
            </div>

            <div class="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-[var(--border-default)] flex flex-col">
              <div class="flex border-b border-[var(--border-default)]">
                <button
                  class="flex-1 py-3 px-4 text-sm font-medium transition-colors"
                  :class="activeTab === 'crop'
                    ? 'text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 border-b-2 border-[var(--accent-primary)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'"
                  :disabled="!originalImage"
                  @click="activeTab = 'crop'"
                >
                  裁剪
                </button>
                <button
                  class="flex-1 py-3 px-4 text-sm font-medium transition-colors"
                  :class="activeTab === 'filters'
                    ? 'text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 border-b-2 border-[var(--accent-primary)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'"
                  :disabled="!originalImage"
                  @click="activeTab = 'filters'"
                >
                  滤镜
                </button>
              </div>

              <div class="flex-1 overflow-y-auto p-4">
                <div v-if="activeTab === 'crop'" class="space-y-4">
                  <div>
                    <h4 class="text-sm font-medium text-[var(--text-primary)] mb-2">操作提示</h4>
                    <ul class="space-y-1 text-xs text-[var(--text-muted)]">
                      <li class="flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
                        拖动图片调整裁剪位置
                      </li>
                    </ul>
                  </div>
                </div>

                <div v-if="activeTab === 'filters'" class="space-y-4">
                  <div>
                    <h4 class="text-sm font-medium text-[var(--text-primary)] mb-3">预设滤镜</h4>
                    <div class="grid grid-cols-4 gap-2 mb-4">
                      <button
                        v-for="preset in FILTER_PRESETS"
                        :key="preset.name"
                        class="aspect-square rounded-lg overflow-hidden border-2 transition-all relative group disabled:opacity-50 disabled:cursor-not-allowed"
                        :class="JSON.stringify(currentFilter) === JSON.stringify(preset.config)
                          ? 'border-[var(--accent-primary)]'
                          : 'border-transparent hover:border-[var(--border-hover)]'"
                        :disabled="!originalImage"
                        @click="applyPreset(preset)"
                      >
                        <img
                          v-if="originalImage"
                          :src="originalImage.src"
                          :alt="preset.name"
                          class="w-full h-full object-cover"
                          :style="{ filter: getFilterCSS(preset.config) }"
                        />
                        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end p-1">
                          <span class="text-[10px] text-white font-medium truncate w-full">{{ preset.name }}</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 class="text-sm font-medium text-[var(--text-primary)] mb-3">手动调整</h4>
                    <div class="space-y-4">
                      <div
                        v-for="slider in filterSliders"
                        :key="slider.key"
                        class="space-y-1"
                      >
                        <div class="flex items-center justify-between">
                          <label class="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                            <component :is="slider.icon" :size="14" />
                            {{ slider.label }}
                          </label>
                          <span class="text-xs text-[var(--text-muted)] font-mono">
                            {{ currentFilter[slider.key] }}
                          </span>
                        </div>
                        <input
                          type="range"
                          :min="slider.min"
                          :max="slider.max"
                          :value="currentFilter[slider.key]"
                          class="w-full h-2 rounded-full appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          :style="{
                            background: `linear-gradient(to right, var(--accent-gradient-1) 0%, var(--accent-gradient-2) ${((currentFilter[slider.key] - slider.min) / (slider.max - slider.min)) * 100}%, var(--border-default) ${((currentFilter[slider.key] - slider.min) / (slider.max - slider.min)) * 100}%)`
                          }"
                          :disabled="!originalImage"
                          @input="(e) => handleFilterChange(slider.key, Number((e.target as HTMLInputElement).value))"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="p-4 border-t border-[var(--border-default)]">
                <button
                  class="w-full py-3 px-4 rounded-xl bg-accent-gradient text-white font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
                  :style="{ boxShadow: '0 10px 25px var(--glow-primary)' }"
                  :disabled="isProcessing || !originalImage"
                  @click="confirmImage"
                >
                  <Check :size="18" />
                  {{ isProcessing ? '处理中...' : '确认使用' }}
                </button>
              </div>
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

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.95) translateY(20px);
  opacity: 0;
}

input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}
</style>
