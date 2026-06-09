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
  return fetch(dataUrl)
    .then(res => res.blob())
    .then(blob => new File([blob], filename, { type: 'image/png' }))
}

export function copyTextToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text)
      .then(() => true)
      .catch(() => false)
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()

  try {
    const success = document.execCommand('copy')
    document.body.removeChild(textarea)
    return Promise.resolve(success)
  } catch {
    document.body.removeChild(textarea)
    return Promise.resolve(false)
  }
}

export function copyImageToClipboard(dataUrl: string): Promise<boolean> {
  return fetch(dataUrl)
    .then(res => res.blob())
    .then(blob => {
      if (navigator.clipboard && window.ClipboardItem) {
        const item = new ClipboardItem({ [blob.type]: blob })
        return navigator.clipboard.write([item])
          .then(() => true)
          .catch(() => false)
      }
      return false
    })
    .catch(() => false)
}

export function downloadImage(dataUrl: string, filename: string = 'puzzle-victory'): void {
  const link = document.createElement('a')
  link.download = `${filename}-${Date.now()}.png`
  link.href = dataUrl
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
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
