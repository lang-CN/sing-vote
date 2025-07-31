// 设备信息获取工具

/**
 * 生成UUID的简化版本（不依赖外部库）
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * 生成并缓存设备UUID
 */
export function getDeviceUUID() {
  const STORAGE_KEY = 'device_uuid'
  
  // 尝试从localStorage获取已存储的UUID
  let deviceUUID = localStorage.getItem(STORAGE_KEY)
  
  if (!deviceUUID) {
    // 如果没有，生成新的UUID并存储
    deviceUUID = generateUUID()
    localStorage.setItem(STORAGE_KEY, deviceUUID)
  }
  
  return deviceUUID
}

/**
 * 获取设备MAC地址（尝试多种方式）
 * 注意：由于浏览器安全限制，无法直接获取真实MAC地址
 * 这里使用设备指纹作为替代方案
 */
export async function getDeviceFingerprint() {
  try {
    // 尝试使用WebRTC获取本地IP和网络信息
    const fingerprint = await generateDeviceFingerprint()
    return fingerprint
  } catch (error) {
    console.warn('无法获取设备指纹:', error)
    // 降级方案：使用浏览器和系统信息生成伪MAC地址
    return generateFallbackFingerprint()
  }
}

/**
 * 生成设备指纹
 */
async function generateDeviceFingerprint() {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  ctx.textBaseline = 'top'
  ctx.font = '14px Arial'
  ctx.fillText('Device fingerprint', 2, 2)
  
  const canvasFingerprint = canvas.toDataURL()
  
  const fingerprint = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    cookieEnabled: navigator.cookieEnabled,
    screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    canvas: canvasFingerprint.slice(-50), // 只取最后50个字符
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: navigator.deviceMemory || 'unknown'
  }
  
  // 将指纹信息转换为字符串并生成hash
  const fingerprintString = JSON.stringify(fingerprint)
  const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(fingerprintString))
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  
  // 格式化为MAC地址样式 (取前12位，每两位用冒号分隔)
  const macStyle = hashHex.slice(0, 12).match(/.{2}/g).join(':')
  
  return macStyle
}

/**
 * 降级方案：生成伪MAC地址
 */
function generateFallbackFingerprint() {
  const info = [
    navigator.userAgent,
    navigator.language,
    navigator.platform,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset()
  ].join('|')
  
  // 简单hash算法
  let hash = 0
  for (let i = 0; i < info.length; i++) {
    const char = info.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // 转换为32位整数
  }
  
  // 转换为MAC地址格式
  const hex = Math.abs(hash).toString(16).padStart(12, '0').slice(0, 12)
  return hex.match(/.{2}/g).join(':')
}

/**
 * 获取完整的设备标识信息
 */
export async function getDeviceIdentity(device_uuid, device_fingerprint) {
  const STORAGE_KEY_UUID = 'device_uuid';
  const STORAGE_KEY_FP = 'device_fingerprint';

  let uuid, fingerprint;

  if (device_uuid && device_fingerprint) {
    // 覆盖本地缓存
    localStorage.setItem(STORAGE_KEY_UUID, device_uuid);
    localStorage.setItem(STORAGE_KEY_FP, device_fingerprint);
    uuid = device_uuid;
    fingerprint = device_fingerprint;
  } else {
    uuid = getDeviceUUID();
    // 优先取本地缓存的 device_fingerprint
    fingerprint = localStorage.getItem(STORAGE_KEY_FP) || await getDeviceFingerprint();
    // 如果本地没有缓存，则生成并存储
    if (!localStorage.getItem(STORAGE_KEY_FP)) {
      localStorage.setItem(STORAGE_KEY_FP, fingerprint);
    }
  }

  return {
    uuid,
    fingerprint,
    timestamp: Date.now()
  }
}
