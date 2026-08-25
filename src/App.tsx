import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './layout/AppLayout'
import { AgentHealthPage } from './pages/AgentHealthPage'
import { AlertsPage } from './pages/AlertsPage'
import { DashboardPage } from './pages/DashboardPage'
import { EditEmployeePage } from './pages/EditEmployeePage'
import { EmployeesPage } from './pages/EmployeesPage'
import { EventsPage } from './pages/EventsPage'
import { UserManagementPage } from './pages/UserManagementPage'
import {
  CategoriesPage,
  DepartmentsPage,
  JobRolesPage,
  ProductivityPage,
  ProjectsPage,
  ReportsPage,
} from './pages/WorkspacePages'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/employees" element={<EmployeesPage />} />
        <Route path="/user-management" element={<UserManagementPage />} />
        <Route path="/user-management/:employeeId" element={<EditEmployeePage />} />
        <Route path="/departments" element={<DepartmentsPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/job-roles" element={<JobRolesPage />} />
        <Route path="/productivity" element={<ProductivityPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/agent-health" element={<AgentHealthPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
