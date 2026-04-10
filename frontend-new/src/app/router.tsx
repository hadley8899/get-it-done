import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { AppShell } from '@/components/AppShell'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { PublicOnlyRoute } from '@/components/PublicOnlyRoute'
import { BoardDetailsPage } from '@/pages/BoardDetailsPage'
import { BoardsPage } from '@/pages/BoardsPage'
import { BoardTemplatesPage } from '@/pages/BoardTemplatesPage'
import { CreateBoardPage } from '@/pages/CreateBoardPage'
import { CreateWorkspacePage } from '@/pages/CreateWorkspacePage'
import { DashboardPage } from '@/pages/DashboardPage'
import { KnowledgebasePage } from '@/pages/KnowledgebasePage'
import { KnowledgebaseCategoryPage } from '@/pages/KnowledgebaseCategoryPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { UserSettingsPage } from '@/pages/UserSettingsPage'
import { TasksPage } from '@/pages/TasksPage'
import { UpdateWorkspacePage } from '@/pages/UpdateWorkspacePage'
import { WorkspaceInvitesPage } from '@/pages/WorkspaceInvitesPage'
import { WorkspacesPage } from '@/pages/WorkspacesPage'
import { CreateKnowledgebaseCategoryPage } from '@/pages/CreateKnowledgebaseCategoryPage'
import { UpdateKnowledgebaseCategoryPage } from '@/pages/UpdateKnowledgebaseCategoryPage'
import { ForgotPasswordConfirmPage } from '@/pages/auth/ForgotPasswordConfirmPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { LogoutPage } from '@/pages/auth/LogoutPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <AppShell />,
        children: [
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'workspaces', element: <WorkspacesPage /> },
          { path: 'workspaces/create', element: <CreateWorkspacePage /> },
          { path: 'workspaces/update/:uuid', element: <UpdateWorkspacePage /> },
          { path: 'workspaces/invites', element: <WorkspaceInvitesPage /> },
          { path: 'tasks', element: <TasksPage /> },
          { path: 'tasks/all', element: <TasksPage /> },
          { path: 'tasks/my-assigned-tasks', element: <TasksPage /> },
          { path: 'tasks/created-by-me', element: <TasksPage /> },
          { path: 'boards', element: <BoardsPage /> },
          { path: 'boards/create', element: <CreateBoardPage /> },
          { path: 'boards/board-templates', element: <BoardTemplatesPage /> },
          { path: 'boards/:uuid', element: <BoardDetailsPage /> },
          { path: 'knowledgebase', element: <KnowledgebasePage /> },
          { path: 'knowledgebase/category/create', element: <CreateKnowledgebaseCategoryPage /> },
          { path: 'knowledgebase/category/update/:uuid', element: <UpdateKnowledgebaseCategoryPage /> },
          { path: 'knowledgebase/category/:uuid', element: <KnowledgebaseCategoryPage /> },
          { path: 'settings', element: <SettingsPage /> },
          { path: 'settings/user', element: <UserSettingsPage /> },
        ],
      },
    ],
  },
  {
    path: '/',
    element: <PublicOnlyRoute />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/user/register', element: <RegisterPage /> },
      { path: '/user/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/user/forgot-password-confirm/:token', element: <ForgotPasswordConfirmPage /> },
    ],
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [{ path: '/user/logout', element: <LogoutPage /> }],
  },
  { path: '*', element: <NotFoundPage /> },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
