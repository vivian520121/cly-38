import { ref, watchEffect, onMounted, computed } from 'vue'
import { THEMES, type ThemeConfig } from '@/types'

type ThemeId = 'neon-space' | 'minimal-matte' | 'warm-sunset'

const THEME_STORAGE_KEY = 'puzzle_theme'

export function useTheme() {
  const currentThemeId = ref<ThemeId>('neon-space')

  const currentTheme = computed<ThemeConfig>(() => {
    return THEMES.find(t => t.id === currentThemeId.value) || THEMES[0]
  })

  const getPreferredTheme = (): ThemeId => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId | null
    if (saved && THEMES.some(t => t.id === saved)) {
      return saved
    }
    return 'neon-space'
  }

  const applyTheme = (themeId: ThemeId) => {
    const theme = THEMES.find(t => t.id === themeId) || THEMES[0]
    const root = document.documentElement

    root.style.setProperty('--bg-primary', theme.colors.background.primary)
    root.style.setProperty('--bg-secondary', theme.colors.background.secondary)
    root.style.setProperty('--bg-gradient-start', theme.colors.background.gradientStart)
    root.style.setProperty('--bg-gradient-end', theme.colors.background.gradientEnd)

    root.style.setProperty('--accent-primary', theme.colors.accent.primary)
    root.style.setProperty('--accent-secondary', theme.colors.accent.secondary)
    root.style.setProperty('--accent-gradient-1', theme.colors.accent.gradient[0])
    root.style.setProperty('--accent-gradient-2', theme.colors.accent.gradient[1])

    root.style.setProperty('--text-primary', theme.colors.text.primary)
    root.style.setProperty('--text-secondary', theme.colors.text.secondary)
    root.style.setProperty('--text-muted', theme.colors.text.muted)

    root.style.setProperty('--border-default', theme.colors.border.default)
    root.style.setProperty('--border-hover', theme.colors.border.hover)

    root.style.setProperty('--glow-primary', theme.colors.glow.primary)
    root.style.setProperty('--glow-secondary', theme.colors.glow.secondary)

    root.style.setProperty('--card-bg', theme.colors.card.background)
    root.style.setProperty('--card-blur', theme.colors.card.backdropBlur)

    document.documentElement.classList.remove('neon-space', 'minimal-matte', 'warm-sunset')
    document.documentElement.classList.add(themeId)

    localStorage.setItem(THEME_STORAGE_KEY, themeId)
  }

  const setTheme = (themeId: ThemeId) => {
    currentThemeId.value = themeId
  }

  const cycleTheme = () => {
    const currentIndex = THEMES.findIndex(t => t.id === currentThemeId.value)
    const nextIndex = (currentIndex + 1) % THEMES.length
    currentThemeId.value = THEMES[nextIndex].id as ThemeId
  }

  onMounted(() => {
    currentThemeId.value = getPreferredTheme()
    applyTheme(currentThemeId.value)
  })

  watchEffect(() => {
    applyTheme(currentThemeId.value)
  })

  return {
    currentThemeId,
    currentTheme,
    setTheme,
    cycleTheme,
    themes: THEMES
  }
}
