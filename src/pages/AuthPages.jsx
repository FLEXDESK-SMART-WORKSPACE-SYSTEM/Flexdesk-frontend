import { useState } from 'react'
import { API } from '../api'

const passwordPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,256}$/

function nextPath() {
  const value = new URLSearchParams(window.location.search).get('next')
  if (!value?.startsWith('/')) return '/'
  try {
    const destination = new URL(value, window.location.origin)
    return destination.origin === window.location.origin
      ? destination.pathname + destination.search + destination.hash
      : '/'
  } catch {
    return '/'
  }
}

function AuthCard({ title, children }) {
  return (
    <main className="auth-card">
      <a className="auth-brand" href="/" aria-label="FLEXDESK home">
        <span className="auth-mark">F</span>
        <span>FLEXDESK<small>SMART WORKSPACE SYSTEM</small></span>
      </a>
      <h1>{title}</h1>
      {children}
    </main>
  )
}

export function LoginPage() {
  const params = new URLSearchParams(window.location.search)
  const [employeeId, setEmployeeId] = useState('')
  const [password, setPassword] = useState('')
  const [createMode, setCreateMode] = useState(false)
  const [adminMode, setAdminMode] = useState(false)
  const [message, setMessage] = useState(
    params.get('created') === '1'
      ? 'Password created. Please sign in.'
      : params.get('updated') === '1'
        ? 'Password updated. Please sign in.'
        : params.get('error') === 'session'
          ? 'Your session expired. Please sign in again.'
          : params.has('sso_error')
            ? 'Single sign-on could not be completed. Sign in with your employee ID and password.'
            : ''
  )
  const [isSuccess, setIsSuccess] = useState(params.has('created') || params.has('updated'))
  const [busy, setBusy] = useState(false)

  function switchToEmployee() {
    setAdminMode(false)
    setCreateMode(false)
    setEmployeeId('')
    setPassword('')
    setMessage('')
  }

  async function submit(event) {
    event.preventDefault()
    setMessage('')
    setIsSuccess(false)
    setBusy(true)
    try {
      const id = employeeId.trim()
      if (id !== 'admin' && !/^[0-9]{5}$/.test(id)) {
        throw new Error('Enter admin or a 5-digit employee ID.')
      }
      if (createMode && !passwordPattern.test(password)) {
        throw new Error('Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number and a special character.')
      }
      const endpoint = createMode ? '/auth/password' : '/auth/login'
      const response = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee_id: id, password })
      })
      const data = await response.json()
      if (!response.ok) {
        if (!createMode && response.status === 409 && data.detail?.code === 'password_not_created') {
          setCreateMode(true)
          setPassword('')
          return
        }
        const detail = typeof data.detail === 'string' ? data.detail : data.detail?.message
        throw new Error(detail || 'Invalid employee ID or password.')
      }
      if (createMode && !data.access_token) {
        const continuation = params.get('next')
        window.location.replace(`/login.html?created=1${continuation ? `&next=${encodeURIComponent(continuation)}` : ''}`)
        return
      }
      sessionStorage.setItem('flexdesk_token', data.access_token)
      sessionStorage.setItem('flexdesk_user', JSON.stringify(data.user))
      window.location.replace(data.user.role === 'admin' ? '/admin.html' : nextPath())
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to sign in. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  function enableAdminLogin() {
    setAdminMode(true)
    setCreateMode(false)
    setEmployeeId('admin')
    setPassword('')
    setMessage('')
  }

  return (
    <div className="auth-page">
      <AuthCard title={adminMode ? 'Administrator sign in' : 'Welcome back'}>
        <p className="auth-intro">{adminMode ? 'Sign in to manage FLEXDESK administration.' : 'Sign in to find and manage your workspace.'}</p>
        <form onSubmit={submit}>
          <label className="auth-label" htmlFor="employeeId">Emp ID</label>
          <input
            id="employeeId"
            className="auth-input"
            value={employeeId}
            onChange={(event) => setEmployeeId(event.target.value)}
            autoComplete="username"
            readOnly={adminMode}
            required
          />
          <label className="auth-label" htmlFor="password">{createMode ? 'Create password' : 'Password'}</label>
          <input
            id="password"
            className="auth-input"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={createMode ? 'new-password' : 'current-password'}
            minLength={createMode ? 8 : undefined}
            pattern={createMode ? '(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,256}' : undefined}
            required={createMode || adminMode}
          />
          {createMode && <p className="auth-requirements">At least 8 characters, with an uppercase letter, a lowercase letter, a number and a special character.</p>}
          <button className="auth-primary" type="submit" disabled={busy}>
            {busy ? 'Please wait…' : createMode ? 'Save password' : adminMode ? 'Sign in as Admin' : 'Sign in'}
          </button>
          {!adminMode && (
            <>
              <button className="auth-secondary" type="button" onClick={() => { setCreateMode(!createMode); setPassword(''); setMessage('') }}>
                {createMode ? 'Back to sign in' : 'Create password'}
              </button>
              {!createMode && <p className="auth-link"><a href={`/forgot-password.html${params.get('next') ? `?next=${encodeURIComponent(params.get('next'))}` : ''}`}>Forgot password?</a></p>}
              <button className="auth-admin" type="button" onClick={enableAdminLogin}>Login as Admin</button>
            </>
          )}
          {adminMode && <button className="auth-secondary" type="button" onClick={switchToEmployee}>Back to employee login</button>}
          <p className={`auth-message${isSuccess ? ' success' : ''}`} role="status" aria-live="polite">{message}</p>
        </form>
      </AuthCard>
    </div>
  )
}

export function ForgotPasswordPage() {
  const continuation = new URLSearchParams(window.location.search).get('next')
  const [employeeId, setEmployeeId] = useState('')
  const [password, setPassword] = useState('')
  const [hasAccount, setHasAccount] = useState(false)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setMessage('')
    setBusy(true)
    try {
      if (!/^[0-9]{5}$/.test(employeeId.trim())) throw new Error('Emp ID must be exactly 5 digits.')
      const payload = { employee_id: employeeId.trim() }
      if (hasAccount) {
        if (!passwordPattern.test(password)) throw new Error('Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number and a special character.')
        payload.password = password
      }
      const response = await fetch(`${API}/auth/password/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.detail || 'Unable to update password.')
      if (!hasAccount) {
        setHasAccount(true)
      } else {
        window.location.replace(`/login.html?updated=1${continuation ? `&next=${encodeURIComponent(continuation)}` : ''}`)
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to reset password.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-page">
      <AuthCard title="Reset password">
        <p className="auth-intro">Enter your Emp ID to continue.</p>
        <form onSubmit={submit}>
          <label className="auth-label" htmlFor="resetEmployeeId">Emp ID</label>
          <input
            id="resetEmployeeId"
            className="auth-input"
            inputMode="numeric"
            maxLength={5}
            pattern="[0-9]{5}"
            value={employeeId}
            onChange={(event) => setEmployeeId(event.target.value)}
            autoComplete="username"
            required
          />
          {hasAccount && <>
            <label className="auth-label" htmlFor="newPassword">New password</label>
            <input
              id="newPassword"
              className="auth-input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              minLength={8}
              pattern="(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,256}"
              required
            />
            <p className="auth-requirements">At least 8 characters, with an uppercase letter, a lowercase letter, a number and a special character.</p>
          </>}
          <button className="auth-primary" type="submit" disabled={busy}>{busy ? 'Please wait…' : hasAccount ? 'Save new password' : 'Generate new password'}</button>
          <p className="auth-message" role="alert" aria-live="polite">{message}</p>
        </form>
        <a className="auth-link" href={`/login.html${continuation ? `?next=${encodeURIComponent(continuation)}` : ''}`}>Back to sign in</a>
      </AuthCard>
    </div>
  )
}
