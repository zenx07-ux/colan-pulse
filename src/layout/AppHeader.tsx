import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { EuiContextMenu, EuiIcon, EuiPopover } from '@elastic/eui'
import { AlertsModal } from '../components/AlertsModal'
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
  '/categories': 'Categories',
  '/ai-assistant-detection': 'AI Assistant Detection',
  '/events': 'Events',
  '/reports': 'Reports',
  '/alerts': 'Alerts',
  '/agent-health': 'Agent Health',
  '/system-logs': 'System Logs',
  '/settings': 'Settings',
}

export function AppHeader() {
  const { colorMode, toggleColorMode } = useColorMode()
  const location = useLocation()
  const [clock, setClock] = useState(utcClock)
  const [isAlertsOpen, setIsAlertsOpen] = useState(false)
  const [isUserOpen, setIsUserOpen] = useState(false)
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
                className="cp-header-btn"
                aria-label="Account menu"
                onClick={() => setIsUserOpen((open) => !open)}
              >
                <span className="cp-ca">CA</span>
              </button>
            }
            isOpen={isUserOpen}
            closePopover={() => setIsUserOpen(false)}
            panelPaddingSize="none"
            anchorPosition="downRight"
          >
            <EuiContextMenu
              initialPanelId={0}
              panels={[
                {
                  id: 0,
                  title: 'Colan Admin',
                  items: [
                    { name: 'Profile', icon: 'user' },
                    { name: 'Preferences', icon: 'gear' },
                    { name: 'Log out', icon: 'exit' },
                  ],
                },
              ]}
            />
          </EuiPopover>
        </div>
      </header>
      {isAlertsOpen ? <AlertsModal onClose={() => setIsAlertsOpen(false)} /> : null}
    </>
  )
}
