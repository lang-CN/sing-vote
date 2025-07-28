// 检测是否为微信浏览器
export function isWechatBrowser() {
  const userAgent = navigator.userAgent.toLowerCase()
  return userAgent.includes('micromessenger')
}

// 检测是否为微信内置浏览器
export function isWechatInternalBrowser() {
  const userAgent = navigator.userAgent.toLowerCase()
  return userAgent.includes('micromessenger') && !userAgent.includes('wxwork')
}
