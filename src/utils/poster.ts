import type { UserInfo, GameResult, HonorBadge, PosterConfig } from '@/types'
import { formatTime } from './score'

const DEFAULT_CONFIG: PosterConfig = {
  width: 750,
  height: 1200,
  backgroundColor: '#0f172a',
  gradientColors: ['#8b5cf6', '#ec4899', '#f59e0b']
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

function drawGradientBackground(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#1e1b4b')
  gradient.addColorStop(0.3, '#312e81')
  gradient.addColorStop(0.6, '#4c1d95')
  gradient.addColorStop(1, '#831843')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
}

function drawDecorativePattern(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.globalAlpha = 0.1
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * width
    const y = Math.random() * height
    const size = Math.random() * 60 + 20
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size)
    gradient.addColorStop(0, '#ffffff')
    gradient.addColorStop(1, 'transparent')
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  ctx.globalAlpha = 0.05
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * width
    const y = Math.random() * height
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(x, y, 2, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

async function drawUserAvatar(
  ctx: CanvasRenderingContext2D,
  avatarUrl: string,
  x: number,
  y: number,
  size: number
) {
  try {
    const img = await loadImage(avatarUrl)
    ctx.save()
    ctx.beginPath()
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()

    ctx.fillStyle = '#334155'
    ctx.fillRect(x, y, size, size)

    const scale = Math.max(size / img.width, size / img.height)
    const scaledWidth = img.width * scale
    const scaledHeight = img.height * scale
    const offsetX = x + (size - scaledWidth) / 2
    const offsetY = y + (size - scaledHeight) / 2
    ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight)

    ctx.restore()

    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2)
    ctx.stroke()

    const glowGradient = ctx.createRadialGradient(
      x + size / 2, y + size / 2, size / 2,
      x + size / 2, y + size / 2, size / 2 + 10
    )
    glowGradient.addColorStop(0, 'rgba(251, 191, 36, 0.3)')
    glowGradient.addColorStop(1, 'transparent')
    ctx.strokeStyle = glowGradient
    ctx.lineWidth = 10
    ctx.beginPath()
    ctx.arc(x + size / 2, y + size / 2, size / 2 + 5, 0, Math.PI * 2)
    ctx.stroke()
  } catch {
    ctx.fillStyle = '#475569'
    ctx.beginPath()
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#94a3b8'
    ctx.font = 'bold 48px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('🎮', x + size / 2, y + size / 2)
  }
}

function drawTrophy(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const gradient = ctx.createLinearGradient(x, y, x, y + size)
  gradient.addColorStop(0, '#fcd34d')
  gradient.addColorStop(0.5, '#f59e0b')
  gradient.addColorStop(1, '#d97706')

  ctx.fillStyle = gradient
  ctx.font = `bold ${size}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('🏆', x, y)
}

function drawStars(ctx: CanvasRenderingContext2D, stars: number, x: number, y: number, size: number) {
  for (let i = 0; i < 3; i++) {
    const starX = x + i * (size + 15)
    ctx.font = `${size}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    if (i < stars) {
      ctx.fillText('⭐', starX, y)
    } else {
      ctx.globalAlpha = 0.3
      ctx.fillText('⭐', starX, y)
      ctx.globalAlpha = 1
    }
  }
}

function drawStatCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  icon: string,
  label: string,
  value: string,
  color: string
) {
  drawRoundedRect(ctx, x, y, width, height, 16)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
  ctx.lineWidth = 1
  ctx.stroke()

  const iconSize = 32
  const iconY = y + 20
  ctx.fillStyle = color + '33'
  drawRoundedRect(ctx, x + width / 2 - iconSize, iconY, iconSize * 2, iconSize + 8, 12)
  ctx.fill()

  ctx.font = '24px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(icon, x + width / 2, iconY + iconSize / 2 + 4)

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 32px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(value, x + width / 2, y + height / 2 + 20)

  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
  ctx.font = '18px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, x + width / 2, y + height - 30)
}

function drawHonorBadges(
  ctx: CanvasRenderingContext2D,
  badges: HonorBadge[],
  x: number,
  y: number,
  width: number
) {
  if (badges.length === 0) return

  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
  ctx.font = 'bold 22px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText('🏅 获得荣誉', width / 2, y)

  const badgeWidth = 100
  const badgeHeight = 110
  const spacing = 20
  const totalWidth = badges.length * badgeWidth + (badges.length - 1) * spacing
  const startX = (width - totalWidth) / 2

  badges.forEach((badge, index) => {
    const badgeX = startX + index * (badgeWidth + spacing)
    const badgeY = y + 45

    drawRoundedRect(ctx, badgeX, badgeY, badgeWidth, badgeHeight, 16)
    ctx.fillStyle = badge.color + '20'
    ctx.fill()
    ctx.strokeStyle = badge.color + '60'
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.font = '36px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(badge.icon, badgeX + badgeWidth / 2, badgeY + 12)

    ctx.fillStyle = badge.color
    ctx.font = 'bold 14px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(badge.name, badgeX + badgeWidth / 2, badgeY + 58)

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    const conditionLines = badge.condition.match(/.{1,8}/g) || [badge.condition]
    conditionLines.forEach((line, lineIndex) => {
      ctx.fillText(line, badgeX + badgeWidth / 2, badgeY + 80 + lineIndex * 14)
    })
  })
}

function drawFooter(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const footerY = height - 100

  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
  ctx.fillRect(0, footerY, width, 100)

  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
  ctx.font = 'bold 24px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('🧩 飞鼠拼图', width / 2, footerY + 40)

  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
  ctx.font = '16px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('挑战你的智力极限 · 扫码加入游戏', width / 2, footerY + 72)

  const qrSize = 60
  const qrX = width - qrSize - 40
  const qrY = footerY + 20

  ctx.fillStyle = '#ffffff'
  drawRoundedRect(ctx, qrX, qrY, qrSize, qrSize, 8)
  ctx.fill()

  ctx.fillStyle = '#0f172a'
  ctx.font = '10px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('扫码', qrX + qrSize / 2, qrY + qrSize / 2)
}

function determineHonorBadges(result: GameResult): HonorBadge[] {
  const badges: HonorBadge[] = []

  if (result.time <= 60) {
    badges.push({ id: 'speed_demon', name: '闪电手', icon: '⚡', color: '#f59e0b', condition: '60秒内完成' })
  }

  if (result.difficulty === 5) {
    badges.push({ id: 'master', name: '拼图大师', icon: '👑', color: '#ec4899', condition: '5×5难度完成' })
  }

  const optimalMoves = result.difficulty * result.difficulty - 1
  if (result.moves <= optimalMoves * 1.5) {
    badges.push({ id: 'efficient', name: '高效玩家', icon: '🎯', color: '#10b981', condition: '最少步数完成' })
  }

  if (result.stars === 3) {
    badges.push({ id: 'perfect', name: '完美主义', icon: '💎', color: '#8b5cf6', condition: '无提示完成' })
  }

  return badges.slice(0, 3)
}

export interface GeneratePosterOptions {
  userInfo: UserInfo
  gameResult: GameResult
  puzzleImage?: string
  config?: Partial<PosterConfig>
}

export async function generatePoster(options: GeneratePosterOptions): Promise<string> {
  const { userInfo, gameResult, puzzleImage, config } = options
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  const { width, height } = finalConfig

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  drawGradientBackground(ctx, width, height)
  drawDecorativePattern(ctx, width, height)

  let currentY = 80

  drawTrophy(ctx, width / 2, currentY + 50, 80)
  currentY += 120

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 48px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText('🎉 恭喜完成！', width / 2, currentY)
  currentY += 60

  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
  ctx.font = '24px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText(`成功还原 ${gameResult.difficulty}×${gameResult.difficulty} 拼图`, width / 2, currentY)
  currentY += 60

  await drawUserAvatar(ctx, userInfo.avatar, width / 2 - 60, currentY, 120)
  currentY += 140

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 32px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText(userInfo.nickname, width / 2, currentY)
  currentY += 60

  drawStars(ctx, gameResult.stars, width / 2 - 60, currentY + 20, 48)
  currentY += 90

  const statCardWidth = 200
  const statCardHeight = 140
  const statSpacing = 30
  const statStartX = (width - statCardWidth * 3 - statSpacing * 2) / 2

  drawStatCard(
    ctx, statStartX, currentY, statCardWidth, statCardHeight,
    '👣', '步数', gameResult.moves.toString(), '#3b82f6'
  )
  drawStatCard(
    ctx, statStartX + statCardWidth + statSpacing, currentY, statCardWidth, statCardHeight,
    '⏱️', '用时', formatTime(gameResult.time), '#10b981'
  )
  drawStatCard(
    ctx, statStartX + statCardWidth * 2 + statSpacing * 2, currentY, statCardWidth, statCardHeight,
    '🏆', '得分', gameResult.score.toString(), '#ec4899'
  )
  currentY += statCardHeight + 50

  const badges = determineHonorBadges(gameResult)
  drawHonorBadges(ctx, badges, 40, currentY, width - 80)
  currentY += badges.length > 0 ? 180 : 0

  if (puzzleImage) {
    try {
      const img = await loadImage(puzzleImage)
      const previewSize = 160
      const previewX = (width - previewSize) / 2
      const previewY = currentY

      drawRoundedRect(ctx, previewX - 5, previewY - 5, previewSize + 10, previewSize + 10, 20)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
      ctx.fill()

      ctx.save()
      drawRoundedRect(ctx, previewX, previewY, previewSize, previewSize, 16)
      ctx.clip()
      ctx.drawImage(img, previewX, previewY, previewSize, previewSize)
      ctx.restore()

      currentY += previewSize + 40
    } catch {
      // Ignore image load error
    }
  }

  drawFooter(ctx, width, height)

  return canvas.toDataURL('image/png', 1.0)
}

export function downloadPoster(dataUrl: string, filename: string = 'puzzle-victory') {
  const link = document.createElement('a')
  link.download = `${filename}-${Date.now()}.png`
  link.href = dataUrl
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function copyImageToClipboard(dataUrl: string): Promise<void> {
  return fetch(dataUrl)
    .then(res => res.blob())
    .then(blob => {
      const item = new ClipboardItem({ 'image/png': blob })
      return navigator.clipboard.write([item])
    })
}
