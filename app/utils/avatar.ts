/**
 * DiceBear API를 사용한 아바타 URL 생성
 * 같은 이름은 항상 같은 아바타를 반환
 */

type AvatarStyle = 
  | 'avataaars'
  | 'bottts'
  | 'lorelei'
  | 'fun-emoji'
  | 'notionists'
  | 'thumbs'
  | 'big-smile'
  | 'pixel-art'

const DEFAULT_STYLE: AvatarStyle = 'lorelei'

export function getAvatarUrl(name: string, style: AvatarStyle = DEFAULT_STYLE): string {
  const seed = encodeURIComponent(name)
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`
}

/**
 * 다양한 스타일로 아바타 URL 가져오기
 */
export const avatar = {
  avataaars: (name: string) => getAvatarUrl(name, 'avataaars'),
  bottts: (name: string) => getAvatarUrl(name, 'bottts'),
  lorelei: (name: string) => getAvatarUrl(name, 'lorelei'),
  funEmoji: (name: string) => getAvatarUrl(name, 'fun-emoji'),
  notionists: (name: string) => getAvatarUrl(name, 'notionists'),
  thumbs: (name: string) => getAvatarUrl(name, 'thumbs'),
  bigSmile: (name: string) => getAvatarUrl(name, 'big-smile'),
  pixelArt: (name: string) => getAvatarUrl(name, 'pixel-art'),
}
