import { Outlet } from 'react-router-dom'
import { AppHeader } from './AppHeader'
import { AppSidebar } from './AppSidebar'

export function AppLayout() {
  return (
    <>
      <AppHeader />
      <div className="cp-body">
        <AppSidebar />
        <main className="cp-main">
          <Outlet />
        </main>
      </div>
    </>
  )
}
