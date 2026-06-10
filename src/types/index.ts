export interface PuzzlePiece {
  id: number
  currentIndex: number
  correctIndex: number
  x: number
  y: number
  isEmpty: boolean
}

export interface DifficultyConfig {
  size: 3 | 4 | 5
  label: string
  baseScore: number
}

export interface GameResult {
  moves: number
  time: number
  score: number
  stars: number
  difficulty: number
}

export interface GameState {
  difficulty: 3 | 4 | 5
  pieces: PuzzlePiece[]
  initialPieces: PuzzlePiece[]
  moves: number
  time: number
  isPlaying: boolean
  isCompleted: boolean
  currentImage: string
  history: Array<{
    pieces: PuzzlePiece[]
    moves: number
  }>
}

export interface BuiltinImage {
  id: string
  name: string
  url: string
  thumb: string
}

export interface UserInfo {
  nickname: string
  avatar: string
}

export interface HonorBadge {
  id: string
  name: string
  icon: string
  color: string
  condition: string
}

export interface PosterConfig {
  width: number
  height: number
  backgroundColor: string
  gradientColors: string[]
}

export type SharePlatform = 'wechat' | 'weibo' | 'qq' | 'download' | 'copy'

export interface ShareData {
  title: string
  description: string
  imageUrl: string
  url: string
}

export const HONOR_BADGES: HonorBadge[] = [
  { id: 'speed_demon', name: '闪电手', icon: '⚡', color: '#f59e0b', condition: '60秒内完成' },
  { id: 'perfect', name: '完美主义', icon: '💎', color: '#8b5cf6', condition: '无提示完成' },
  { id: 'master', name: '拼图大师', icon: '👑', color: '#ec4899', condition: '5×5难度完成' },
  { id: 'efficient', name: '高效玩家', icon: '🎯', color: '#10b981', condition: '最少步数完成' },
  { id: 'persistent', name: '永不放弃', icon: '🔥', color: '#ef4444', condition: '连续完成3次' },
]

export const DIFFICULTIES: DifficultyConfig[] = [
  { size: 3, label: '简单 3×3', baseScore: 1000 },
  { size: 4, label: '中等 4×4', baseScore: 2000 },
  { size: 5, label: '困难 5×5', baseScore: 3500 },
]

export interface ThemeConfig {
  id: string
  name: string
  description: string
  colors: {
    background: {
      primary: string
      secondary: string
      gradientStart: string
      gradientEnd: string
    }
    accent: {
      primary: string
      secondary: string
      gradient: string[]
    }
    text: {
      primary: string
      secondary: string
      muted: string
    }
    border: {
      default: string
      hover: string
    }
    glow: {
      primary: string
      secondary: string
    }
    card: {
      background: string
      backdropBlur: string
    }
  }
}

export const THEMES: ThemeConfig[] = [
  {
    id: 'neon-space',
    name: '霓虹深空',
    description: '深邃宇宙中的霓虹光芒',
    colors: {
      background: {
        primary: '#0f172a',
        secondary: '#1e1b4b',
        gradientStart: '#0f172a',
        gradientEnd: '#1e1b4b'
      },
      accent: {
        primary: '#8b5cf6',
        secondary: '#ec4899',
        gradient: ['#8b5cf6', '#ec4899']
      },
      text: {
        primary: '#ffffff',
        secondary: 'rgba(255, 255, 255, 0.7)',
        muted: 'rgba(255, 255, 255, 0.5)'
      },
      border: {
        default: 'rgba(255, 255, 255, 0.1)',
        hover: 'rgba(255, 255, 255, 0.2)'
      },
      glow: {
        primary: 'rgba(139, 92, 246, 0.5)',
        secondary: 'rgba(236, 72, 153, 0.5)'
      },
      card: {
        background: 'rgba(255, 255, 255, 0.05)',
        backdropBlur: 'blur-sm'
      }
    }
  },
  {
    id: 'minimal-matte',
    name: '极简哑光黑',
    description: '低调优雅的深色哑光质感',
    colors: {
      background: {
        primary: '#18181b',
        secondary: '#27272a',
        gradientStart: '#18181b',
        gradientEnd: '#27272a'
      },
      accent: {
        primary: '#a1a1aa',
        secondary: '#71717a',
        gradient: ['#a1a1aa', '#71717a']
      },
      text: {
        primary: '#fafafa',
        secondary: 'rgba(250, 250, 250, 0.7)',
        muted: 'rgba(250, 250, 250, 0.5)'
      },
      border: {
        default: 'rgba(255, 255, 255, 0.08)',
        hover: 'rgba(255, 255, 255, 0.15)'
      },
      glow: {
        primary: 'rgba(161, 161, 170, 0.3)',
        secondary: 'rgba(113, 113, 122, 0.3)'
      },
      card: {
        background: 'rgba(39, 39, 42, 0.6)',
        backdropBlur: 'blur-md'
      }
    }
  },
  {
    id: 'warm-sunset',
    name: '暖日落柔光',
    description: '温暖柔和的日落余晖',
    colors: {
      background: {
        primary: '#2c1810',
        secondary: '#451a03',
        gradientStart: '#2c1810',
        gradientEnd: '#451a03'
      },
      accent: {
        primary: '#f97316',
        secondary: '#fbbf24',
        gradient: ['#f97316', '#fbbf24']
      },
      text: {
        primary: '#fffbeb',
        secondary: 'rgba(255, 251, 235, 0.7)',
        muted: 'rgba(255, 251, 235, 0.5)'
      },
      border: {
        default: 'rgba(255, 251, 235, 0.1)',
        hover: 'rgba(255, 251, 235, 0.2)'
      },
      glow: {
        primary: 'rgba(249, 115, 22, 0.4)',
        secondary: 'rgba(251, 191, 36, 0.4)'
      },
      card: {
        background: 'rgba(255, 251, 235, 0.05)',
        backdropBlur: 'blur-sm'
      }
    }
  }
]

export interface ImageFilterConfig {
  brightness: number
  contrast: number
  saturation: number
  grayscale: number
  sepia: number
  blur: number
}

export interface CropConfig {
  x: number
  y: number
  width: number
  height: number
}

export const DEFAULT_FILTER: ImageFilterConfig = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  grayscale: 0,
  sepia: 0,
  blur: 0
}

export const FILTER_PRESETS: { name: string; config: ImageFilterConfig }[] = [
  { name: '原图', config: { ...DEFAULT_FILTER } },
  { name: '明亮', config: { ...DEFAULT_FILTER, brightness: 120, contrast: 110 } },
  { name: '复古', config: { ...DEFAULT_FILTER, sepia: 50, contrast: 90, saturation: 80 } },
  { name: '黑白', config: { ...DEFAULT_FILTER, grayscale: 100, contrast: 110 } },
  { name: '鲜艳', config: { ...DEFAULT_FILTER, saturation: 150, contrast: 110 } },
  { name: '柔和', config: { ...DEFAULT_FILTER, brightness: 110, contrast: 90, saturation: 90 } },
  { name: '电影', config: { ...DEFAULT_FILTER, contrast: 120, saturation: 80, brightness: 95 } },
  { name: '冷色', config: { ...DEFAULT_FILTER, saturation: 80, brightness: 105 } }
]

export const BUILTIN_IMAGES: BuiltinImage[] = [
  {
    id: 'landscape1',
    name: '山川风景',
    url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20mountain%20landscape%20with%20lake%20and%20forest%20sunrise&image_size=square_hd',
    thumb: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20mountain%20landscape%20with%20lake%20and%20forest%20sunrise&image_size=square'
  },
  {
    id: 'ocean1',
    name: '海洋日落',
    url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=stunning%20ocean%20sunset%20with%20golden%20waves%20and%20palm%20trees&image_size=square_hd',
    thumb: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=stunning%20ocean%20sunset%20with%20golden%20waves%20and%20palm%20trees&image_size=square'
  },
  {
    id: 'city1',
    name: '都市夜景',
    url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=vibrant%20city%20night%20scene%20with%20neon%20lights%20and%20skyscrapers&image_size=square_hd',
    thumb: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=vibrant%20city%20night%20scene%20with%20neon%20lights%20and%20skyscrapers&image_size=square'
  },
  {
    id: 'forest1',
    name: '神秘森林',
    url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=magical%20forest%20path%20with%20sunbeams%20through%20trees&image_size=square_hd',
    thumb: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=magical%20forest%20path%20with%20sunbeams%20through%20trees&image_size=square'
  },
  {
    id: 'flower1',
    name: '花海',
    url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=colorful%20flower%20field%20in%20spring%20with%20butterflies&image_size=square_hd',
    thumb: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=colorful%20flower%20field%20in%20spring%20with%20butterflies&image_size=square'
  },
  {
    id: 'space1',
    name: '星空银河',
    url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20milky%20way%20galaxy%20with%20stars%20in%20night%20sky&image_size=square_hd',
    thumb: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20milky%20way%20galaxy%20with%20stars%20in%20night%20sky&image_size=square'
  }
]
