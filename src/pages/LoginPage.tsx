import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  EuiButton,
  EuiFieldPassword,
  EuiFieldText,
  EuiForm,
  EuiIcon,
} from '@elastic/eui'
import { useAuth } from '../auth/AuthContext'
import { FormField } from '../components/FormField'
import { PulseLogo } from '../components/PulseLogo'
import { useColorMode } from '../theme/ColorModeContext'

export function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const { colorMode, toggleColorMode } = useColorMode()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    const message = login(username, password)
    if (message) {
      setError(message)
      return
    }
    navigate('/', { replace: true })
  }

  return (
    <div className="cp-login">
      <button
        type="button"
        className="cp-header-btn cp-login__theme"
        aria-label={
          colorMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'
        }
        title="Toggle color mode"
        onClick={toggleColorMode}
      >
        <EuiIcon type={colorMode === 'light' ? 'sun' : 'moon'} size="m" />
      </button>

      <div className="cp-login__center">
        <section className="cp-card cp-login__card">
          <div className="cp-login__brand">
            <PulseLogo />
            ColanPulse
          </div>
          <div className="cp-page-lead">
            <h1 className="cp-activity-title">Sign in</h1>
            <div className="cp-card-sub">Welcome back to ColanPulse.</div>
          </div>

          <EuiForm css={{ margin: 0 }} component="form" onSubmit={onSubmit}>
            <div className="cp-login__form">
              <FormField label="Username">
                <EuiFieldText
                  compressed
                  fullWidth
                  autoComplete="username"
                  placeholder="Enter username"
                  prepend={<EuiIcon type="user" />}
                  value={username}
                  onChange={(event) => {
                    setUsername(event.target.value)
                    setError('')
                  }}
                />
              </FormField>
              <FormField label="Password">
                <EuiFieldPassword
                  compressed
                  fullWidth
                  type="dual"
                  autoComplete="current-password"
                  placeholder="Enter password"
                  prepend={<EuiIcon type="lock" />}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value)
                    setError('')
                  }}
                />
              </FormField>
              {error ? (
                <div className="cp-callout" role="alert">
                  <EuiIcon className="cp-callout__icon" type="warning" color="#C61E25" />
                  <div>
                    <div className="cp-callout__title">{error}</div>
                  </div>
                </div>
              ) : null}
              <EuiButton fill fullWidth type="submit">
                Sign in
              </EuiButton>
            </div>
          </EuiForm>
        </section>
        <p className="cp-login__copy">© 2026 Colan Infotech. All rights reserved.</p>
      </div>
    </div>
  )
}
