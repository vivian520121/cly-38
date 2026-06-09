<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Share2, Download, Copy, Check, X, RefreshCw, User, Image } from 'lucide-vue-next'
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

const isGenerating = ref(false)
const isSharing = ref(false)
const posterUrl = ref<string | null>(null)
const showUserEditor = ref(false)
const editingNickname = ref('')
const copySuccess = ref(false)
const shareSuccess = ref<SharePlatform | null>(null)

const result = computed(() => gameStore.gameResult)

watch(() => gameStore.showShareModal, async (show) => {
  if (show && result.value) {
    await generatePosterImage()
  } else {
    posterUrl.value = null
    copySuccess.value = false
    shareSuccess.value = null
  }
})

async function generatePosterImage() {
  if (!result.value) return

  isGenerating.value = true
  try {
    const url = await generatePoster({
      userInfo: gameStore.userInfo,
      gameResult: result.value,
      puzzleImage: gameStore.currentImage
    })
    posterUrl.value = url
    gameStore.setPosterUrl(url)
  } catch (error) {
    console.error('Failed to generate poster:', error)
  } finally {
    isGenerating.value = false
  }
}

async function handleShare(platform: SharePlatform) {
  if (!posterUrl.value || !result.value) return

  isSharing.value = true
  shareSuccess.value = null

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
      const file = await dataUrlToFile(posterUrl.value, 'puzzle-victory.png')
      await nativeShare(shareData, [file])
    }

    shareSuccess.value = platform
  } catch (error) {
    console.error('Share failed:', error)
  } finally {
    isSharing.value = false
    setTimeout(() => {
      shareSuccess.value = null
    }, 2000)
  }
}

function openUserEditor() {
  editingNickname.value = gameStore.userInfo.nickname
  showUserEditor.value = true
}

function saveUserInfo() {
  if (editingNickname.value.trim()) {
    gameStore.setUserInfo({ nickname: editingNickname.value.trim() })
  }
  showUserEditor.value = false
  if (result.value) {
    generatePosterImage()
  }
}

function randomizeAvatar() {
  gameStore.randomizeUserInfo()
  if (result.value) {
    generatePosterImage()
  }
}

function close() {
  gameStore.closeShareModal()
}
</script>

<template>
  <Teleport to="body">
    <Transition name="share-modal">
      <div v-if="gameStore.showShareModal" class="share-overlay fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
        <Transition name="share-content">
          <div v-if="gameStore.showShareModal" class="share-content relative w-full max-w-lg">
            <button
              class="absolute -top-2 -right-2 z-10 w-10 h-10 rounded-full bg-slate-800 border border-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all hover:scale-110"
              @click="close"
            >
              <X :size="18" />
            </button>

            <div class="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 border border-white/10 shadow-2xl relative overflow-hidden">
              <div class="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-fuchsia-500/10 pointer-events-none"></div>

              <div class="flex items-center gap-3 mb-6">
                <div class="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                  <Share2 :size="24" class="text-white" />
                </div>
                <div>
                  <h2 class="text-2xl font-bold text-white">分享战绩</h2>
                  <p class="text-white/60 text-sm">生成专属海报，秀出你的实力</p>
                </div>
              </div>

              <div class="flex items-center gap-3 mb-6 p-3 bg-white/5 rounded-xl border border-white/10">
                <div class="relative">
                  <img
                    :src="gameStore.userInfo.avatar"
                    :alt="gameStore.userInfo.nickname"
                    class="w-14 h-14 rounded-full border-2 border-white/30"
                    @error="e => (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎮</text></svg>'"
                  />
                  <button
                    class="absolute -bottom-1 -right-1 w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center text-white hover:bg-violet-600 transition-colors"
                    @click="randomizeAvatar"
                    title="换一个头像"
                  >
                    <RefreshCw :size="12" />
                  </button>
                </div>
                <div class="flex-1">
                  <div class="text-white font-medium">{{ gameStore.userInfo.nickname }}</div>
                  <button
                    class="text-violet-400 text-sm hover:text-violet-300 transition-colors flex items-center gap-1"
                    @click="openUserEditor"
                  >
                    <User :size="14" />
                    编辑昵称
                  </button>
                </div>
              </div>

              <div class="poster-preview mb-6">
                <div class="relative bg-white/5 rounded-2xl overflow-hidden border border-white/10 aspect-[3/4]">
                  <div v-if="isGenerating" class="absolute inset-0 flex flex-col items-center justify-center">
                    <div class="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                    <p class="text-white/60 text-sm">正在生成海报...</p>
                  </div>
                  <img
                    v-else-if="posterUrl"
                    :src="posterUrl"
                    alt="分享海报"
                    class="w-full h-full object-contain"
                  />
                  <div v-else class="absolute inset-0 flex flex-col items-center justify-center text-white/40">
                    <Image :size="48" class="mb-2" />
                    <p>海报生成失败</p>
                    <button
                      class="mt-2 px-4 py-2 bg-violet-500/20 text-violet-400 rounded-lg text-sm hover:bg-violet-500/30 transition-colors"
                      @click="generatePosterImage"
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
                  :class="{
                    'bg-white/10 border border-white/20 hover:bg-white/20': shareSuccess !== platform.id,
                    'bg-emerald-500/30 border border-emerald-500/50': shareSuccess === platform.id
                  }"
                  :disabled="isGenerating || isSharing || !posterUrl"
                  @click="handleShare(platform.id)"
                >
                  <div
                    class="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                    :style="{ backgroundColor: platform.color + '30' }"
                  >
                    <Check v-if="shareSuccess === platform.id" :size="24" class="text-emerald-400" />
                    <span v-else>{{ platform.icon }}</span>
                  </div>
                  <span class="text-white text-xs font-medium">{{ platform.name }}</span>
                </button>
              </div>

              <div v-if="copySuccess" class="text-center text-emerald-400 text-sm mb-4 animate-pulse">
                ✓ 已复制到剪贴板
              </div>

              <div class="flex gap-3">
                <button
                  class="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all hover:scale-105"
                  @click="generatePosterImage"
                  :disabled="isGenerating"
                >
                  <RefreshCw :size="18" :class="{ 'animate-spin': isGenerating }" />
                  重新生成
                </button>
                <button
                  class="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30 transition-all hover:scale-105"
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
            <div class="bg-slate-800 rounded-2xl p-6 w-full max-w-sm mx-4 border border-white/10">
              <h3 class="text-xl font-bold text-white mb-4">编辑昵称</h3>
              <input
                v-model="editingNickname"
                type="text"
                maxlength="12"
                class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="请输入昵称"
                @keyup.enter="saveUserInfo"
              />
              <p class="text-white/40 text-xs mt-2">最多12个字符</p>
              <div class="flex gap-3 mt-6">
                <button
                  class="flex-1 px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                  @click="showUserEditor = false"
                >
                  取消
                </button>
                <button
                  class="flex-1 px-4 py-3 bg-violet-500 text-white rounded-xl hover:bg-violet-600 transition-colors"
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
  box-shadow: 0 0 60px rgba(139, 92, 246, 0.2);
}
</style>
