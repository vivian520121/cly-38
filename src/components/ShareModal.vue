<script setup lang="ts">
import { ref, watch, computed, onUnmounted } from 'vue'
import { Share2, Download, Copy, Check, X, RefreshCw, User, Image, AlertCircle } from 'lucide-vue-next'
import { useGameStore } from '@/stores/gameStore'
import { generatePoster } from '@/utils/poster'
import {
  PLATFORM_CONFIGS,
  buildShareData,
  shareToWeibo,
  shareToQQ,
  shareToWechat,
  copyImageToClipboard,
  downloadImage,
  nativeShare,
  dataUrlToFile,
  copyTextToClipboard,
  isMobileDevice
} from '@/utils/share'
import type { SharePlatform } from '@/types'

const gameStore = useGameStore()

const GENERATE_TIMEOUT = 15000
const SHARE_TIMEOUT = 10000

const isGenerating = ref(false)
const isSharing = ref(false)
const posterUrl = ref<string | null>(null)
const showUserEditor = ref(false)
const editingNickname = ref('')
const copySuccess = ref(false)
const shareSuccess = ref<SharePlatform | null>(null)
const generateError = ref<string | null>(null)
const lastGenerateTime = ref(0)
const MIN_GENERATE_INTERVAL = 1000

let generateTimeoutId: number | null = null
let shareTimeoutId: number | null = null

const result = computed(() => gameStore.gameResult)

function handleMouseEnter(e: Event, property: string, value: string) {
  const target = e.target as HTMLElement
  target.style[property as any] = value
}

function handleMouseLeave(e: Event, property: string, value: string) {
  const target = e.target as HTMLElement
  target.style[property as any] = value
}

function handleMouseEnterCurrent(e: Event, property: string, value: string) {
  const target = e.currentTarget as HTMLElement
  target.style[property as any] = value
}

function handleMouseLeaveCurrent(e: Event, property: string, value: string) {
  const target = e.currentTarget as HTMLElement
  target.style[property as any] = value
}

function handleFocus(e: Event, property: string, value: string) {
  const target = e.target as HTMLElement
  target.style[property as any] = value
}

function handleBlur(e: Event, property: string, value: string) {
  const target = e.target as HTMLElement
  target.style[property as any] = value
}

function resetAllStates() {
  if (generateTimeoutId) {
    clearTimeout(generateTimeoutId)
    generateTimeoutId = null
  }
  if (shareTimeoutId) {
    clearTimeout(shareTimeoutId)
    shareTimeoutId = null
  }
  isGenerating.value = false
  isSharing.value = false
}

function forceReset() {
  resetAllStates()
  posterUrl.value = null
  generateError.value = null
  copySuccess.value = false
  shareSuccess.value = null
}

watch(() => gameStore.showShareModal, async (show) => {
  if (show && result.value) {
    forceReset()
    await generatePosterImage()
  } else {
    forceReset()
  }
})

onUnmounted(() => {
  forceReset()
})

async function generatePosterImage(force: boolean = false) {
  if (!result.value) return

  const now = Date.now()
  if (!force && isGenerating.value) {
    console.warn('Generate already in progress, skipping')
    return
  }
  if (!force && now - lastGenerateTime.value < MIN_GENERATE_INTERVAL) {
    console.warn('Generate called too frequently, skipping')
    return
  }

  lastGenerateTime.value = now
  isGenerating.value = true
  generateError.value = null

  generateTimeoutId = window.setTimeout(() => {
    console.warn('Poster generation timed out')
    generateError.value = '生成超时，请重试'
    isGenerating.value = false
    generateTimeoutId = null
  }, GENERATE_TIMEOUT)

  try {
    const url = await generatePoster({
      userInfo: gameStore.userInfo,
      gameResult: result.value,
      puzzleImage: gameStore.currentImage
    })
    posterUrl.value = url
    gameStore.setPosterUrl(url)
    generateError.value = null
  } catch (error) {
    console.error('Failed to generate poster:', error)
    generateError.value = error instanceof Error ? error.message : '生成失败，请重试'
  } finally {
    if (generateTimeoutId) {
      clearTimeout(generateTimeoutId)
      generateTimeoutId = null
    }
    isGenerating.value = false
  }
}

async function handleShare(platform: SharePlatform) {
  if (!posterUrl.value || !result.value || isSharing.value) return

  isSharing.value = true
  shareSuccess.value = null

  shareTimeoutId = window.setTimeout(() => {
    console.warn('Share operation timed out')
    isSharing.value = false
    shareTimeoutId = null
  }, SHARE_TIMEOUT)

  try {
    const shareData = buildShareData(result.value, posterUrl.value)

    switch (platform) {
      case 'wechat':
        await shareToWechat(shareData)
        break
      case 'weibo':
        shareToWeibo(shareData)
        break
      case 'qq':
        shareToQQ(shareData)
        break
      case 'download':
        downloadImage(posterUrl.value, 'puzzle-victory')
        break
      case 'copy':
        const success = await copyImageToClipboard(posterUrl.value)
        if (success) {
          copySuccess.value = true
          setTimeout(() => {
            copySuccess.value = false
          }, 2000)
        } else {
          await copyTextToClipboard(shareData.description)
          copySuccess.value = true
          setTimeout(() => {
            copySuccess.value = false
          }, 2000)
        }
        break
    }

    if (isMobileDevice() && platform !== 'download' && platform !== 'copy') {
      try {
        const file = await dataUrlToFile(posterUrl.value, 'puzzle-victory.png')
        await nativeShare(shareData, [file])
      } catch {
        // Ignore native share errors
      }
    }

    shareSuccess.value = platform
  } catch (error) {
    console.error('Share failed:', error)
  } finally {
    if (shareTimeoutId) {
      clearTimeout(shareTimeoutId)
      shareTimeoutId = null
    }
    isSharing.value = false
    setTimeout(() => {
      shareSuccess.value = null
    }, 2000)
  }
}

function openUserEditor() {
  if (isGenerating.value) return
  editingNickname.value = gameStore.userInfo.nickname
  showUserEditor.value = true
}

function saveUserInfo() {
  if (editingNickname.value.trim()) {
    gameStore.setUserInfo({ nickname: editingNickname.value.trim() })
  }
  showUserEditor.value = false
  if (result.value && !isGenerating.value) {
    generatePosterImage(true)
  }
}

function randomizeAvatar() {
  if (isGenerating.value) return
  gameStore.randomizeUserInfo()
  if (result.value) {
    generatePosterImage(true)
  }
}

function close() {
  forceReset()
  gameStore.closeShareModal()
}

function handleRegenerate() {
  generatePosterImage(true)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="share-modal">
      <div v-if="gameStore.showShareModal" class="share-overlay fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
        <Transition name="share-content">
          <div v-if="gameStore.showShareModal" class="share-content relative w-full max-w-lg">
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

            <div class="rounded-3xl p-6 shadow-2xl relative overflow-hidden"
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
              ></div>

              <div class="flex items-center gap-3 mb-6">
                <div class="w-12 h-12 rounded-full flex items-center justify-center"
                  :style="{ background: 'linear-gradient(135deg, var(--accent-gradient-1), var(--accent-gradient-2))' }"
                >
                  <Share2 :size="24" :style="{ color: 'var(--text-primary)' }" />
                </div>
                <div>
                  <h2 class="text-2xl font-bold" :style="{ color: 'var(--text-primary)' }">分享战绩</h2>
                  <p class="text-sm" :style="{ color: 'var(--text-muted)' }">生成专属海报，秀出你的实力</p>
                </div>
              </div>

              <div class="flex items-center gap-3 mb-6 p-3 rounded-xl"
                :style="{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-default)'
                }"
              >
                <div class="relative">
                  <img
                    :src="gameStore.userInfo.avatar"
                    :alt="gameStore.userInfo.nickname"
                    class="w-14 h-14 rounded-full"
                    :style="{ border: '2px solid var(--border-default)' }"
                    @error="e => (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎮</text></svg>'"
                  />
                  <button
                    class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center transition-colors"
                    :style="{ backgroundColor: 'var(--accent-gradient-1)', color: 'var(--text-primary)' }"
                    @mouseenter="handleMouseEnter($event, 'backgroundColor', 'color-mix(in srgb, var(--accent-gradient-1) 80%, black)')"
                    @mouseleave="handleMouseLeave($event, 'backgroundColor', 'var(--accent-gradient-1)')"
                    @click="randomizeAvatar"
                    title="换一个头像"
                  >
                    <RefreshCw :size="12" />
                  </button>
                </div>
                <div class="flex-1">
                  <div class="font-medium" :style="{ color: 'var(--text-primary)' }">{{ gameStore.userInfo.nickname }}</div>
                  <button
                    class="text-sm transition-colors flex items-center gap-1"
                    :style="{ color: 'var(--accent-gradient-1)' }"
                    @mouseenter="handleMouseEnter($event, 'color', 'color-mix(in srgb, var(--accent-gradient-1) 80%, white)')"
                    @mouseleave="handleMouseLeave($event, 'color', 'var(--accent-gradient-1)')"
                    @click="openUserEditor"
                  >
                    <User :size="14" />
                    编辑昵称
                  </button>
                </div>
              </div>

              <div v-if="generateError" class="mb-4 p-3 rounded-xl flex items-center gap-2"
                :style="{
                  backgroundColor: 'color-mix(in srgb, #ef4444 20%, transparent)',
                  border: '1px solid color-mix(in srgb, #ef4444 30%, transparent)'
                }"
              >
                <AlertCircle :size="18" class="flex-shrink-0" :style="{ color: '#f87171' }" />
                <span class="text-sm" :style="{ color: '#f87171' }">{{ generateError }}</span>
              </div>

              <div class="poster-preview mb-6">
                <div class="relative rounded-2xl overflow-hidden aspect-[3/4]"
                  :style="{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-default)',
                    boxShadow: '0 0 60px var(--glow-primary)'
                  }"
                >
                  <div v-if="isGenerating" class="absolute inset-0 flex flex-col items-center justify-center">
                    <div class="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mb-3"
                      :style="{ borderColor: 'var(--accent-gradient-1)', borderTopColor: 'transparent' }"
                    ></div>
                    <p class="text-sm" :style="{ color: 'var(--text-muted)' }">正在生成海报...</p>
                    <button
                      class="mt-4 px-4 py-2 rounded-lg text-sm transition-colors"
                      :style="{
                        backgroundColor: 'color-mix(in srgb, #ef4444 20%, transparent)',
                        color: '#f87171'
                      }"
                      @mouseenter="handleMouseEnter($event, 'backgroundColor', 'color-mix(in srgb, #ef4444 30%, transparent)')"
                      @mouseleave="handleMouseLeave($event, 'backgroundColor', 'color-mix(in srgb, #ef4444 20%, transparent)')"
                      @click="forceReset"
                    >
                      取消
                    </button>
                  </div>
                  <img
                    v-else-if="posterUrl"
                    :src="posterUrl"
                    alt="分享海报"
                    class="w-full h-full object-contain"
                  />
                  <div v-else class="absolute inset-0 flex flex-col items-center justify-center" :style="{ color: 'var(--text-muted)', opacity: 0.4 }">
                    <Image :size="48" class="mb-2" />
                    <p>海报生成失败</p>
                    <button
                      class="mt-2 px-4 py-2 rounded-lg text-sm transition-colors"
                      :style="{
                        backgroundColor: 'color-mix(in srgb, var(--accent-gradient-1) 20%, transparent)',
                        color: 'var(--accent-gradient-1)'
                      }"
                      @mouseenter="handleMouseEnter($event, 'backgroundColor', 'color-mix(in srgb, var(--accent-gradient-1) 30%, transparent)')"
                      @mouseleave="handleMouseLeave($event, 'backgroundColor', 'color-mix(in srgb, var(--accent-gradient-1) 20%, transparent)')"
                      @click="handleRegenerate"
                    >
                      重新生成
                    </button>
                  </div>
                </div>
              </div>

              <div class="platforms-grid grid grid-cols-5 gap-3 mb-6">
                <button
                  v-for="platform in PLATFORM_CONFIGS"
                  :key="platform.id"
                  class="platform-btn flex flex-col items-center gap-2 p-3 rounded-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  :style="shareSuccess === platform.id ? {
                    backgroundColor: 'color-mix(in srgb, #10b981 30%, transparent)',
                    border: '1px solid color-mix(in srgb, #10b981 50%, transparent)'
                  } : {
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-default)'
                  }"
                  @mouseenter="shareSuccess !== platform.id && handleMouseEnterCurrent($event, 'backgroundColor', 'color-mix(in srgb, var(--bg-secondary) 80%, var(--text-primary))')"
                  @mouseleave="shareSuccess !== platform.id && handleMouseLeaveCurrent($event, 'backgroundColor', 'var(--bg-secondary)')"
                  :disabled="isGenerating || isSharing || !posterUrl"
                  @click="handleShare(platform.id)"
                >
                  <div
                    class="w-12 h-12 rounded-full flex items-center justify-center text-2xl relative"
                    :style="{ backgroundColor: platform.color + '30' }"
                  >
                    <div v-if="isSharing && shareSuccess === null" class="absolute inset-0 flex items-center justify-center">
                      <div class="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" :style="{ borderColor: 'var(--text-primary)', borderTopColor: 'transparent' }"></div>
                    </div>
                    <Check v-else-if="shareSuccess === platform.id" :size="24" :style="{ color: '#34d399' }" />
                    <span v-else>{{ platform.icon }}</span>
                  </div>
                  <span class="text-xs font-medium" :style="{ color: 'var(--text-primary)' }">{{ platform.name }}</span>
                </button>
              </div>

              <div v-if="copySuccess" class="text-center text-sm mb-4 animate-pulse" :style="{ color: '#34d399' }">
                ✓ 已复制到剪贴板
              </div>

              <div class="flex gap-3">
                <button
                  class="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  :style="{
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-default)'
                  }"
                  @mouseenter="!isGenerating && handleMouseEnter($event, 'backgroundColor', 'color-mix(in srgb, var(--bg-secondary) 80%, var(--text-primary))')"
                  @mouseleave="!isGenerating && handleMouseLeave($event, 'backgroundColor', 'var(--bg-secondary)')"
                  @click="handleRegenerate"
                  :disabled="isGenerating"
                >
                  <RefreshCw :size="18" :class="{ 'animate-spin': isGenerating }" />
                  重新生成
                </button>
                <button
                  class="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium shadow-lg transition-all hover:scale-105"
                  :style="{
                    background: 'linear-gradient(to right, var(--accent-gradient-1), var(--accent-gradient-2))',
                    color: 'var(--text-primary)',
                    boxShadow: '0 10px 30px var(--glow-primary)'
                  }"
                  @click="close"
                >
                  完成
                </button>
              </div>
            </div>
          </div>
        </Transition>

        <Transition name="user-editor">
          <div v-if="showUserEditor" class="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
            <div class="rounded-2xl p-6 w-full max-w-sm mx-4"
              :style="{
                backgroundColor: 'var(--card-bg)',
                border: '1px solid var(--border-default)'
              }"
            >
              <h3 class="text-xl font-bold mb-4" :style="{ color: 'var(--text-primary)' }">编辑昵称</h3>
              <input
                v-model="editingNickname"
                type="text"
                maxlength="12"
                class="w-full px-4 py-3 rounded-xl focus:outline-none transition-colors"
                :style="{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)'
                }"
                placeholder="请输入昵称"
                @focus="handleFocus($event, 'borderColor', 'var(--accent-gradient-1)')"
                @blur="handleBlur($event, 'borderColor', 'var(--border-default)')"
                @keyup.enter="saveUserInfo"
              />
              <p class="text-xs mt-2" :style="{ color: 'var(--text-muted)', opacity: 0.4 }">最多12个字符</p>
              <div class="flex gap-3 mt-6">
                <button
                  class="flex-1 px-4 py-3 rounded-xl transition-colors"
                  :style="{
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)'
                  }"
                  @mouseenter="handleMouseEnter($event, 'backgroundColor', 'color-mix(in srgb, var(--bg-secondary) 80%, var(--text-primary))')"
                  @mouseleave="handleMouseLeave($event, 'backgroundColor', 'var(--bg-secondary)')"
                  @click="showUserEditor = false"
                >
                  取消
                </button>
                <button
                  class="flex-1 px-4 py-3 rounded-xl transition-colors"
                  :style="{
                    backgroundColor: 'var(--accent-gradient-1)',
                    color: 'var(--text-primary)'
                  }"
                  @mouseenter="handleMouseEnter($event, 'backgroundColor', 'color-mix(in srgb, var(--accent-gradient-1) 80%, black)')"
                  @mouseleave="handleMouseLeave($event, 'backgroundColor', 'var(--accent-gradient-1)')"
                  @click="saveUserInfo"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.share-modal-enter-active,
.share-modal-leave-active {
  transition: all 0.3s ease;
}

.share-modal-enter-from,
.share-modal-leave-to {
  opacity: 0;
}

.share-content-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.share-content-enter-from {
  transform: scale(0.8) translateY(30px);
  opacity: 0;
}

.share-content-leave-active {
  transition: all 0.2s ease;
}

.share-content-leave-to {
  transform: scale(0.95);
  opacity: 0;
}

.user-editor-enter-active,
.user-editor-leave-active {
  transition: all 0.2s ease;
}

.user-editor-enter-from,
.user-editor-leave-to {
  opacity: 0;
}

.user-editor-enter-from > div,
.user-editor-leave-to > div {
  transform: scale(0.9);
}

.platform-btn:active {
  transform: scale(0.95);
}

.poster-preview {
  box-shadow: 0 0 60px var(--glow-primary);
}
</style>
