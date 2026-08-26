import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth/AuthContext'
import { AppLayout } from './layout/AppLayout'
import { AgentHealthPage } from './pages/AgentHealthPage'
import { AiAssistantDetectionPage } from './pages/AiAssistantDetectionPage'
import { AiAdoptionPage } from './pages/AiAdoptionPage'
import { AlertsPage } from './pages/AlertsPage'
import { CategoriesPage } from './pages/CategoriesPage'
import { DashboardPage } from './pages/DashboardPage'
import { DepartmentsPage } from './pages/DepartmentsPage'
import { EditEmployeePage } from './pages/EditEmployeePage'
import { EmployeesPage } from './pages/EmployeesPage'
import { EventsPage } from './pages/EventsPage'
import { LoginPage } from './pages/LoginPage'
import { NeedsAttentionPage } from './pages/NeedsAttentionPage'
import { SettingsPage } from './pages/SettingsPage'
import { SystemLogsPage } from './pages/SystemLogsPage'
import { ProductivityPage } from './pages/ProductivityPage'
import { ReportsPage } from './pages/ReportsPage'
import { UserManagementPage } from './pages/UserManagementPage'
import {
  JobRolesPage,
  ProjectsPage,
} from './pages/WorkspacePages'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/needs-attention" element={<NeedsAttentionPage />} />
        <Route path="/employees" element={<EmployeesPage />} />
        <Route path="/user-management" element={<UserManagementPage />} />
        <Route path="/user-management/:employeeId" element={<EditEmployeePage />} />
        <Route path="/departments" element={<DepartmentsPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/job-roles" element={<JobRolesPage />} />
        <Route path="/productivity" element={<ProductivityPage />} />
        <Route path="/ai-adoption" element={<AiAdoptionPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/ai-assistant-detection" element={<AiAssistantDetectionPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/agent-health" element={<AgentHealthPage />} />
        <Route path="/system-logs" element={<SystemLogsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

function RequireAuth() {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <AppLayout />
}

