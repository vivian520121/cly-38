<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'
import { Palette, Check, Sparkles, Moon, Sun } from 'lucide-vue-next'
import { ref } from 'vue'

const { currentThemeId, currentTheme, setTheme, themes } = useTheme()

const showSelector = ref(false)

const themeIcons = {
  'neon-space': Sparkles,
  'minimal-matte': Moon,
  'warm-sunset': Sun
}

function selectTheme(themeId: string) {
  setTheme(themeId as 'neon-space' | 'minimal-matte' | 'warm-sunset')
}

function toggleSelector() {
  showSelector.value = !showSelector.value
}

function closeSelector() {
  showSelector.value = false
}
</script>

<template>
  <div class="theme-selector relative">
    <button
      class="theme-toggle-btn flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all bg-[var(--card-bg)] backdrop-blur-[var(--card-blur)] border border-[var(--border-default)] hover:border-[var(--border-hover)] text-[var(--text-primary)]"
      @click="toggleSelector"
    >
      <Palette :size="16" />
      <span class="hidden sm:inline">{{ currentTheme.name }}</span>
    </button>

    <Transition name="dropdown">
      <div
        v-if="showSelector"
        class="theme-dropdown absolute top-full right-0 mt-2 w-72 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-default)] shadow-2xl overflow-hidden z-50"
      >
        <div class="p-3 border-b border-[var(--border-default)]">
          <h4 class="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Palette :size="16" class="text-[var(--accent-primary)]" />
            选择主题
          </h4>
          <p class="text-xs text-[var(--text-muted)] mt-1">一键切换全部配色风格</p>
        </div>

        <div class="p-2 space-y-1">
          <button
            v-for="theme in themes"
            :key="theme.id"
            class="theme-option w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left"
            :class="{
              'theme-option-active': currentThemeId === theme.id,
              'theme-option-inactive': currentThemeId !== theme.id
            }"
            @click="selectTheme(theme.id)"
          >
            <div
              class="theme-preview w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center relative overflow-hidden"
              :style="{
                background: `linear-gradient(135deg, ${theme.colors.background.gradientStart} 0%, ${theme.colors.background.gradientEnd} 100%)`
              }"
            >
              <div
                class="absolute inset-0 opacity-60"
                :style="{
                  background: `radial-gradient(circle at 30% 30%, ${theme.colors.accent.gradient[0]} 0%, transparent 50%), radial-gradient(circle at 70% 70%, ${theme.colors.accent.gradient[1]} 0%, transparent 50%)`
                }"
              />
              <component
                :is="themeIcons[theme.id as keyof typeof themeIcons]"
                :size="18"
                class="text-white relative z-10"
              />
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="font-medium text-[var(--text-primary)]">{{ theme.name }}</span>
                <Check
                  v-if="currentThemeId === theme.id"
                  :size="14"
                  class="text-[var(--accent-primary)] flex-shrink-0"
                />
              </div>
              <p class="text-xs text-[var(--text-muted)] truncate">{{ theme.description }}</p>
            </div>

            <div class="flex gap-1 flex-shrink-0">
              <div
                class="w-3 h-3 rounded-full"
                :style="{ backgroundColor: theme.colors.accent.gradient[0] }"
              />
              <div
                class="w-3 h-3 rounded-full"
                :style="{ backgroundColor: theme.colors.accent.gradient[1] }"
              />
            </div>
          </button>
        </div>
      </div>
    </Transition>

    <div
      v-if="showSelector"
      class="fixed inset-0 z-40"
      @click="closeSelector"
    />
  </div>
</template>

<style scoped>
.theme-option-active {
  background: linear-gradient(135deg, var(--accent-gradient-1) 0%, var(--accent-gradient-2) 100%);
}

.theme-option-active .text-\[var\(--text-primary\)\] {
  color: white;
}

.theme-option-active .text-\[var\(--text-muted\)\] {
  color: rgba(255, 255, 255, 0.7);
}

.theme-option-inactive {
  background: transparent;
}

.theme-option-inactive:hover {
  background: var(--card-bg);
}

.theme-option {
  transition: all 0.2s ease;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.theme-toggle-btn {
  transition: all 0.2s ease;
}

.theme-toggle-btn:hover {
  transform: translateY(-1px);
}
</style>
