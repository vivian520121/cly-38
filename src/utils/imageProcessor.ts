import type { ImageFilterConfig, CropConfig } from '@/types'
import { DEFAULT_FILTER } from '@/types'

export function applyFilterToCanvas(
  ctx: CanvasRenderingContext2D,
  filter: ImageFilterConfig
): void {
  const filterString = `
    brightness(${filter.brightness}%)
    contrast(${filter.contrast}%)
    saturate(${filter.saturation}%)
    grayscale(${filter.grayscale}%)
    sepia(${filter.sepia}%)
    blur(${filter.blur}px)
  `.trim()
  ctx.filter = filterString
}

export function getFilterCSS(filter: ImageFilterConfig): string {
  return `
    brightness(${filter.brightness}%)
    contrast(${filter.contrast}%)
    saturate(${filter.saturation}%)
    grayscale(${filter.grayscale}%)
    sepia(${filter.sepia}%)
    blur(${filter.blur}px)
  `.trim()
}

export async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export function getSquareCrop(
  imgWidth: number,
  imgHeight: number
): CropConfig {
  const size = Math.min(imgWidth, imgHeight)
  const x = (imgWidth - size) / 2
  const y = (imgHeight - size) / 2
  return { x, y, width: size, height: size }
}

export function scaleCropToSize(
  crop: CropConfig,
  targetSize: number
): { scaledCrop: CropConfig; scale: number } {
  const scale = targetSize / Math.max(crop.width, crop.height)
  return {
    scaledCrop: {
      x: crop.x * scale,
      y: crop.y * scale,
      width: crop.width * scale,
      height: crop.height * scale
    },
    scale
  }
}

export async function processImage(
  file: File,
  filter: ImageFilterConfig = DEFAULT_FILTER,
  crop?: CropConfig,
  outputSize: number = 800
): Promise<{ dataUrl: string; processedImage: HTMLImageElement }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const dataUrl = e.target?.result as string
        const img = await loadImage(dataUrl)

        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')!

        const finalCrop = crop || getSquareCrop(img.width, img.height)

        canvas.width = outputSize
        canvas.height = outputSize

        applyFilterToCanvas(ctx, filter)

        ctx.drawImage(
          img,
          finalCrop.x,
          finalCrop.y,
          finalCrop.width,
          finalCrop.height,
          0,
          0,
          outputSize,
          outputSize
        )

        const processedDataUrl = canvas.toDataURL('image/jpeg', 0.95)
        const processedImg = await loadImage(processedDataUrl)

        resolve({
          dataUrl: processedDataUrl,
          processedImage: processedImg
        })
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export async function createPreviewCanvas(
  img: HTMLImageElement,
  filter: ImageFilterConfig,
  crop: CropConfig,
  previewSize: number = 400
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!

  canvas.width = previewSize
  canvas.height = previewSize

  applyFilterToCanvas(ctx, filter)

  ctx.drawImage(
    img,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    previewSize,
    previewSize
  )

  return canvas
}

export function resizeImageForPuzzle(
  img: HTMLImageElement,
  puzzleSize: number,
  filter: ImageFilterConfig = DEFAULT_FILTER
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!

  const pieceSize = Math.ceil(800 / puzzleSize)
  const totalSize = pieceSize * puzzleSize

  canvas.width = totalSize
  canvas.height = totalSize

  applyFilterToCanvas(ctx, filter)

  const crop = getSquareCrop(img.width, img.height)
  ctx.drawImage(
    img,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    totalSize,
    totalSize
  )

  return canvas
}

export function getPuzzlePieceBackground(
  processedCanvas: HTMLCanvasElement,
  pieceIndex: number,
  puzzleSize: number
): { backgroundImage: string; backgroundPosition: string } {
  const pieceSize = processedCanvas.width / puzzleSize
  const x = (pieceIndex % puzzleSize) * pieceSize
  const y = Math.floor(pieceIndex / puzzleSize) * pieceSize

  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = pieceSize
  tempCanvas.height = pieceSize
  const tempCtx = tempCanvas.getContext('2d')!

  tempCtx.drawImage(
    processedCanvas,
    x,
    y,
    pieceSize,
    pieceSize,
    0,
    0,
    pieceSize,
    pieceSize
  )

  return {
    backgroundImage: `url(${tempCanvas.toDataURL()})`,
    backgroundPosition: '0 0'
  }
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: '请选择图片文件' }
  }

  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: '图片大小不能超过10MB' }
  }

  return { valid: true }
}

export function resetFilter(): ImageFilterConfig {
  return { ...DEFAULT_FILTER }
}

export function adjustFilter(
  current: ImageFilterConfig,
  adjustments: Partial<ImageFilterConfig>
): ImageFilterConfig {
  return { ...current, ...adjustments }
}
