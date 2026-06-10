<script setup lang="ts">
import { ref } from 'vue'
import { X, Upload, Check, Image as ImageIcon, Sliders } from 'lucide-vue-next'
import { useGameStore } from '@/stores/gameStore'
import { BUILTIN_IMAGES } from '@/types'
import type { BuiltinImage } from '@/types'
import ImageEditor from '@/components/ImageEditor.vue'
import { validateImageFile } from '@/utils/imageProcessor'

const gameStore = useGameStore()

const fileInputRef = ref<HTMLInputElement | null>(null)
const selectedImageId = ref<string | null>(null)
const isDragging = ref(false)
const uploadError = ref<string | null>(null)
const showEditor = ref(false)
const pendingFile = ref<File | null>(null)

function selectBuiltinImage(image: BuiltinImage) {
  selectedImageId.value = image.id
  gameStore.changeImage(image.url)
  gameStore.showImageSelector = false
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    processFile(file)
  }
}

function processFile(file: File) {
  uploadError.value = null

  const validation = validateImageFile(file)
  if (!validation.valid) {
    uploadError.value = validation.error || '图片验证失败'
    return
  }

  pendingFile.value = file
  showEditor.value = true
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
  isDragging.value = true
}

function handleDragLeave() {
  isDragging.value = false
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  isDragging.value = false

  const file = event.dataTransfer?.files?.[0]
  if (file) {
    processFile(file)
  }
}

function triggerFileInput() {
  fileInputRef.value?.click()
}

function close() {
  gameStore.showImageSelector = false
  uploadError.value = null
  pendingFile.value = null
}

function handleEditorClose() {
  showEditor.value = false
  pendingFile.value = null
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

function handleEditorConfirm(dataUrl: string) {
  selectedImageId.value = null
  gameStore.changeImage(dataUrl)
  showEditor.value = false
  pendingFile.value = null
  gameStore.showImageSelector = false
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="gameStore.showImageSelector" class="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="close">
        <div class="modal-content relative w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl bg-[var(--bg-secondary)] backdrop-blur-xl border border-[var(--border-default)] shadow-2xl">
          <div class="flex items-center justify-between p-5 border-b border-[var(--border-default)]">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-accent-gradient flex items-center justify-center">
                <ImageIcon :size="20" class="text-white" />
              </div>
              <div>
                <h3 class="text-lg font-bold text-[var(--text-primary)]">选择图片</h3>
                <p class="text-sm text-[var(--text-muted)]">选择内置图片或上传您的图片</p>
              </div>
            </div>
            <button
              class="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              @click="close"
            >
              <X :size="20" />
            </button>
          </div>

          <div class="p-5 overflow-y-auto max-h-[calc(85vh-100px)]">
            <h4 class="text-sm font-medium text-[var(--text-secondary)] mb-3">内置图库</h4>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              <div
                v-for="image in BUILTIN_IMAGES"
                :key="image.id"
                class="builtin-image-card relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
                :class="{ 'ring-2 ring-[var(--accent-primary)] ring-offset-2 ring-offset-[var(--bg-secondary)]': gameStore.currentImage === image.url }"
                @click="selectBuiltinImage(image)"
              >
                <img
                  :src="image.thumb"
                  :alt="image.name"
                  class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent">
                </div>
                <div class="absolute bottom-0 left-0 right-0 p-3">
                  <span class="text-white text-sm font-medium">{{ image.name }}</span>
                </div>
                <div
                  v-if="gameStore.currentImage === image.url"
                  class="absolute top-2 right-2 w-6 h-6 rounded-full bg-[var(--accent-primary)] flex items-center justify-center"
                >
                  <Check :size="14" class="text-white" />
                </div>
              </div>
            </div>

            <h4 class="text-sm font-medium text-[var(--text-secondary)] mb-3">本地上传</h4>
            <div
              class="upload-area relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer"
              :class="{
                'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10': isDragging,
                'border-[var(--border-default)] hover:border-[var(--border-hover)] bg-[var(--card-bg)]': !isDragging
              }"
              @click="triggerFileInput"
              @dragover="handleDragOver"
              @dragleave="handleDragLeave"
              @drop="handleDrop"
            >
              <input
                ref="fileInputRef"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleFileSelect"
              />
              <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-accent-gradient flex items-center justify-center">
                <Upload :size="28" class="text-white" />
              </div>
              <p class="text-[var(--text-primary)] font-medium mb-1">点击或拖拽上传图片</p>
              <p class="text-[var(--text-muted)] text-sm">支持 JPG、PNG、GIF 格式，最大 10MB</p>
              <div class="mt-3 flex items-center justify-center gap-2 text-xs text-[var(--accent-primary)]">
                <Sliders :size="14" />
                <span>上传后可裁剪和调整滤镜</span>
              </div>
              <p v-if="uploadError" class="text-red-400 text-sm mt-2">{{ uploadError }}</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <ImageEditor
      :image-file="pendingFile"
      :show="showEditor"
      @close="handleEditorClose"
      @confirm="handleEditorConfirm"
    />
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

.builtin-image-card {
  transition: all 0.2s ease;
}

.builtin-image-card:hover {
  transform: translateY(-2px);
}
</style>
