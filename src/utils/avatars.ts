const AVATARS = ['#16C5C0', '#61A2FF', '#EE72A6', '#EAAE01']

export function avatarColor(name: string, index = 0) {
  return AVATARS[(name.length + index) % AVATARS.length]
}
