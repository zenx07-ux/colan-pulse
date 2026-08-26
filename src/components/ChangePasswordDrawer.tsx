import { useState, type FormEvent } from 'react'
import { EuiButton, EuiFieldPassword } from '@elastic/eui'
import { useAuth } from '../auth/AuthContext'
import { FormField } from './FormField'

export function ChangePasswordDrawer({ onClose }: { onClose: () => void }) {
  const { changePassword } = useAuth()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!current || !next || !confirm) {
      setError('Fill in all password fields.')
      return
    }
    if (next !== confirm) {
      setError('New password and confirmation do not match.')
      return
    }
    const message = changePassword(current, next)
    if (message) {
      setError(message)
      return
    }
    onClose()
  }

  return (
    <div className="cp-overlay" onClick={onClose} role="presentation">
      <aside
        className="cp-drawer"
        role="dialog"
        aria-labelledby="change-password-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="cp-drawer__head">
          <div className="cp-drawer__head-copy">
            <div className="cp-drawer__title" id="change-password-title">
              Change password
            </div>
            <div className="cp-emp-id">Update the password for this portal account.</div>
          </div>
          <button type="button" className="cp-icon-btn" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>
        <form className="cp-drawer__form" onSubmit={onSubmit}>
          <div className="cp-drawer__body">
            <FormField label="Current password">
            <EuiFieldPassword
              compressed
              fullWidth
              type="dual"
              value={current}
              onChange={(event) => {
                setCurrent(event.target.value)
                setError('')
              }}
            />
          </FormField>
          <FormField label="New password">
            <EuiFieldPassword
              compressed
              fullWidth
              type="dual"
              value={next}
              onChange={(event) => {
                setNext(event.target.value)
                setError('')
              }}
            />
          </FormField>
          <FormField label="Confirm new password">
            <EuiFieldPassword
              compressed
              fullWidth
              type="dual"
              value={confirm}
              onChange={(event) => {
                setConfirm(event.target.value)
                setError('')
              }}
            />
          </FormField>
            {error ? (
              <div className="cp-callout" role="alert">
                <div>
                  <div className="cp-callout__title">{error}</div>
                </div>
              </div>
            ) : null}
          </div>
          <div className="cp-drawer__foot">
            <EuiButton size="s" type="button" onClick={onClose}>
              Cancel
            </EuiButton>
            <EuiButton fill size="s" type="submit">
              Update password
            </EuiButton>
          </div>
        </form>
      </aside>
    </div>
  )
}
