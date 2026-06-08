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

export const DIFFICULTIES: DifficultyConfig[] = [
  { size: 3, label: '简单 3×3', baseScore: 1000 },
  { size: 4, label: '中等 4×4', baseScore: 2000 },
  { size: 5, label: '困难 5×5', baseScore: 3500 },
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
