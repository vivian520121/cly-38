import type { SharePlatform, ShareData, GameResult } from '@/types'
import { formatTime } from './score'

export interface PlatformConfig {
  id: SharePlatform
  name: string
  icon: string
  color: string
  description: string
}

export const PLATFORM_CONFIGS: PlatformConfig[] = [
  {
    id: 'wechat',
    name: '微信',
    icon: '💬',
    color: '#07c160',
    description: '分享到微信好友或朋友圈'
  },
  {
    id: 'weibo',
    name: '微博',
    icon: '📱',
    color: '#e6162d',
    description: '分享到新浪微博'
  },
  {
    id: 'qq',
    name: 'QQ',
    icon: '🐧',
    color: '#12b7f5',
    description: '分享到QQ好友或空间'
  },
  {
    id: 'copy',
    name: '复制',
    icon: '📋',
    color: '#8b5cf6',
    description: '复制图片到剪贴板'
  },
  {
    id: 'download',
    name: '保存',
    icon: '💾',
    color: '#f59e0b',
    description: '保存海报到本地'
  }
]

function buildShareText(gameResult: GameResult): string {
  const difficultyText = `${gameResult.difficulty}×${gameResult.difficulty}`
  const starsText = '⭐'.repeat(gameResult.stars) + '☆'.repeat(3 - gameResult.stars)

  return (
    `🎉 我在飞鼠拼图中成功还原了${difficultyText}拼图！\n` +
    `${starsText}\n` +
    `👣 步数：${gameResult.moves} 步\n` +
    `⏱️ 用时：${formatTime(gameResult.time)}\n` +
    `🏆 得分：${gameResult.score} 分\n\n` +
    `快来挑战你的智力极限吧！🧩`
  )
}

export function buildShareData(gameResult: GameResult, imageUrl: string): ShareData {
  return {
    title: `🎉 我在飞鼠拼图获得了 ${gameResult.score} 分！`,
    description: buildShareText(gameResult),
    imageUrl,
    url: window.location.href
  }
}

export function shareToWeibo(shareData: ShareData): void {
  const params = new URLSearchParams({
    url: shareData.url,
    title: shareData.title,
    pic: shareData.imageUrl
  })
  window.open(`https://service.weibo.com/share/share.php?${params.toString()}`, '_blank', 'width=600,height=400')
}

export function shareToQQ(shareData: ShareData): void {
  const params = new URLSearchParams({
    url: shareData.url,
    title: shareData.title,
    desc: shareData.description,
    pics: shareData.imageUrl
  })
  window.open(`https://connect.qq.com/widget/shareqq/index.html?${params.toString()}`, '_blank', 'width=600,height=400')
}

export function shareToQZone(shareData: ShareData): void {
  const params = new URLSearchParams({
    url: shareData.url,
    title: shareData.title,
    desc: shareData.description,
    pics: shareData.imageUrl,
    summary: shareData.description
  })
  window.open(`https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?${params.toString()}`, '_blank', 'width=600,height=400')
}

export function shareToWechat(shareData: ShareData): Promise<boolean> {
  return new Promise((resolve) => {
    if (navigator.share) {
      navigator.share({
        title: shareData.title,
        text: shareData.description,
        url: shareData.url
      })
        .then(() => resolve(true))
        .catch(() => resolve(false))
    } else {
      const wechatTip = document.createElement('div')
      wechatTip.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.85);
        z-index: 99999;
        display: flex;
        align-items: flex-start;
        justify-content: flex-end;
        padding: 40px;
        color: white;
        font-size: 18px;
      `
      wechatTip.innerHTML = `
        <div style="text-align: center; max-width: 300px;">
          <div style="font-size: 60px; margin-bottom: 20px;">👆</div>
          <div style="font-size: 20px; font-weight: bold; margin-bottom: 12px;">点击右上角菜单</div>
          <div style="opacity: 0.8; line-height: 1.6;">选择「发送给朋友」或「分享到朋友圈」</div>
          <div style="margin-top: 30px; padding: 12px 24px; background: rgba(255,255,255,0.2); border-radius: 8px; cursor: pointer;">知道了</div>
        </div>
      `

      const close = () => {
        document.body.removeChild(wechatTip)
        resolve(false)
      }

      wechatTip.addEventListener('click', close)
      document.body.appendChild(wechatTip)
    }
  })
}

export async function nativeShare(shareData: ShareData, files?: File[]): Promise<boolean> {
  if (!navigator.share) return false

  try {
    if (navigator.canShare && files) {
      const canShareFiles = navigator.canShare({ files })
      if (canShareFiles) {
        await navigator.share({ title: shareData.title, text: shareData.description, files })
        return true
      }
    }
    await navigator.share({ title: shareData.title, text: shareData.description, url: shareData.url })
    return true
  } catch {
    return false
  }
}

export function dataUrlToFile(dataUrl: string, filename: string): Promise<File> {
  return new Promise((resolve, reject) => {
    try {
      const arr = dataUrl.split(',')
      const mimeMatch = arr[0].match(/:(.*?);/)
      const mime = mimeMatch ? mimeMatch[1] : 'image/png'
      const bstr = atob(arr[1])
      let n = bstr.length
      const u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      const blob = new Blob([u8arr], { type: mime })
      resolve(new File([blob], filename, { type: mime }))
    } catch (error) {
      reject(error)
    }
  })
}

export function copyTextToClipboard(text: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => resolve(true))
        .catch(() => {
          resolve(fallbackCopyText(text))
        })
    } else {
      resolve(fallbackCopyText(text))
    }
  })
}

function fallbackCopyText(text: string): boolean {
  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    textarea.style.left = '-9999px'
    textarea.style.top = '-9999px'
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()
    textarea.setSelectionRange(0, text.length)

    const success = document.execCommand('copy')
    document.body.removeChild(textarea)
    return success
  } catch {
    return false
  }
}

export function copyImageToClipboard(dataUrl: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (!navigator.clipboard || !window.ClipboardItem) {
      resolve(false)
      return
    }

    dataUrlToFile(dataUrl, 'puzzle-victory.png')
      .then(file => {
        const item = new ClipboardItem({ [file.type]: file })
        navigator.clipboard.write([item])
          .then(() => resolve(true))
          .catch(() => resolve(false))
      })
      .catch(() => resolve(false))
  })
}

export function downloadImage(dataUrl: string, filename: string = 'puzzle-victory'): void {
  try {
    const link = document.createElement('a')
    link.download = `${filename}-${Date.now()}.png`
    link.href = dataUrl
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    setTimeout(() => {
      document.body.removeChild(link)
    }, 100)
  } catch (error) {
    console.error('Download failed:', error)
    window.open(dataUrl, '_blank')
  }
}

export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

export function isWechatBrowser(): boolean {
  return /MicroMessenger/i.test(navigator.userAgent)
}

export function isQQBrowser(): boolean {
  return /QQ/i.test(navigator.userAgent)
}

export function isWeiboBrowser(): boolean {
  return /Weibo/i.test(navigator.userAgent)
}
