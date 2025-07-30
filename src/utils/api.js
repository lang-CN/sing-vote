// src/utils/api.js

const isDev = window.location.hostname === 'AAA'

export const API_BASE = isDev ? 'http://localhost:5000/api' : '/api'
// export const API_BASE = 'http://localhost:5000/api'

export function apiUrl(path) {
  if (path.startsWith('/')) return API_BASE + path
  return API_BASE + '/' + path
}
