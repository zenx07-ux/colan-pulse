import { useLocation, useNavigate } from 'react-router-dom'
import { EuiIcon } from '@elastic/eui'
import { NAV_ITEMS } from './nav'

export function AppSidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <aside className="cp-sidebar">
      <div className="cp-sidebar__label">Monitoring</div>
      <nav className="cp-nav-list" aria-label="Monitoring">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname === item.path ||
                location.pathname.startsWith(`${item.path}/`)
          return (
            <button
              key={item.id}
              type="button"
              className={`cp-nav-item${isActive ? ' is-active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <EuiIcon type={item.icon} size="m" color="currentColor" />
              <span>{item.name}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
