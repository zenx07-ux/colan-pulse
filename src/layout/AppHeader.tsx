import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { EuiIcon, EuiPopover } from '@elastic/eui'
import { useAuth } from '../auth/AuthContext'
import { AlertsModal } from '../components/AlertsModal'
import { ChangePasswordDrawer } from '../components/ChangePasswordDrawer'
import { PulseLogo } from '../components/PulseLogo'
import { alerts } from '../data/notifications'
import { useColorMode } from '../theme/ColorModeContext'
import { utcClock } from '../utils/format'

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/needs-attention': 'Needs Attention',
  '/employees': 'Employees',
  '/user-management': 'User Management',
  '/departments': 'Departments',
  '/projects': 'Projects',
  '/job-roles': 'Job Roles',
  '/productivity': 'Employee Productivity',
  '/ai-adoption': 'AI Adoption',
  '/categories': 'Categories',
  '/ai-assistant-detection': 'AI Assistant Detection',
  '/events': 'Events',
  '/reports': 'Report Configuration',
  '/alerts': 'Incident Center',
  '/agent-health': 'Agent Health',
  '/system-logs': 'System Logs',
  '/settings': 'Settings',
}

export function AppHeader() {
  const { colorMode, toggleColorMode } = useColorMode()
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [clock, setClock] = useState(utcClock)
  const [isAlertsOpen, setIsAlertsOpen] = useState(false)
  const [isUserOpen, setIsUserOpen] = useState(false)
  const [isPasswordOpen, setIsPasswordOpen] = useState(false)
  const pageTitle = location.pathname.startsWith('/user-management')
    ? 'User Management'
    : (PAGE_TITLES[location.pathname] ?? 'Dashboard')

  useEffect(() => {
    const timer = window.setInterval(() => setClock(utcClock()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <>
      <header className="cp-header">
        <a href="#/" className="cp-brand" aria-label="ColanPulse home">
          <PulseLogo />
          ColanPulse
        </a>
        <nav className="cp-crumbs" aria-label="Breadcrumb">
          <a href="#/" className="cp-crumbs__link">
            Workforce
          </a>
          <span className="cp-crumbs__sep">/</span>
          <span className="cp-crumbs__current">{pageTitle}</span>
        </nav>
        <div className="cp-header-spacer" />
        <div className="cp-header-actions">
          <span className="cp-live">
            <span className="cp-live__dot" />
            Live feed
          </span>
          <span className="cp-clock">{clock}</span>
          <button
            type="button"
            className="cp-header-btn"
            aria-label={
              colorMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'
            }
            title="Toggle color mode"
            onClick={toggleColorMode}
          >
            <EuiIcon type={colorMode === 'light' ? 'sun' : 'moon'} size="m" />
          </button>
          <button
            type="button"
            className="cp-header-btn"
            aria-label="Active alerts"
            onClick={() => setIsAlertsOpen(true)}
          >
            <EuiIcon type="bell" size="m" />
            <span className="cp-header-badge">{alerts.length}</span>
          </button>
          <EuiPopover
            ownFocus
            repositionOnScroll
            button={
              <button
                type="button"
                className="cp-user-btn"
                aria-label="Account menu"
                onClick={() => setIsUserOpen((open) => !open)}
              >
                <span className="cp-user-name">{user?.name ?? 'SuperAdmin'}</span>
                <span className="cp-ca">C</span>
              </button>
            }
            isOpen={isUserOpen}
            closePopover={() => setIsUserOpen(false)}
            panelPaddingSize="none"
            anchorPosition="downRight"
          >
            <div className="cp-user-menu">
              <div className="cp-user-menu__id">{user?.id ?? 'CIPL1234'}</div>
              <div className="cp-user-menu__meta">ID: {user?.id ?? 'CIPL1234'}</div>
              <div className="cp-user-menu__rule" />
              <button
                type="button"
                className="cp-user-menu__item"
                onClick={() => {
                  setIsUserOpen(false)
                  setIsPasswordOpen(true)
                }}
              >
                Change Password
              </button>
              <button
                type="button"
                className="cp-user-menu__item cp-user-menu__item--danger"
                onClick={() => {
                  setIsUserOpen(false)
                  logout()
                  navigate('/login', { replace: true })
                }}
              >
                Logout
              </button>
            </div>
          </EuiPopover>
        </div>
      </header>
      {isAlertsOpen ? <AlertsModal onClose={() => setIsAlertsOpen(false)} /> : null}
      {isPasswordOpen ? (
        <ChangePasswordDrawer onClose={() => setIsPasswordOpen(false)} />
      ) : null}
    </>
  )
}
