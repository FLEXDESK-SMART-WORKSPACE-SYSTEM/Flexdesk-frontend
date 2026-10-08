export const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8002/api/v1'

export async function request(path, options = {}) {
  const token = sessionStorage.getItem('flexdesk_token')
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  })
  const text = await response.text()
  const data = text ? JSON.parse(text) : null
  if (!response.ok) {
    const detail = typeof data?.detail === 'string' ? data.detail : data?.detail?.message
    throw new Error(detail || data?.message || 'Request failed')
  }
  return data
}

export function clearSession() {
  sessionStorage.removeItem('flexdesk_token')
  sessionStorage.removeItem('flexdesk_user')
}

export async function logout() {
  try {
    await request('/auth/logout', { method: 'POST' })
  } finally {
    clearSession()
    window.location.replace('/login.html')
  }
}

export function requireEmployeeSession() {
  const user = JSON.parse(sessionStorage.getItem('flexdesk_user') || 'null')
  if (!sessionStorage.getItem('flexdesk_token') || user?.id == null) {
    window.location.replace('/login.html')
    return null
  }
  if (user.role === 'admin') {
    window.location.replace('/admin.html')
    return null
  }
  return user
}
