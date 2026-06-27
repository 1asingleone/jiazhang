import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { AuthPage } from '@/features/auth/auth-page'
import { TransactionsPage } from '@/features/transactions/transactions-page'
import { StatsPage } from '@/features/stats/stats-page'
import { FamilyPage } from '@/features/family/family-page'
import { AppLayout } from '@/app/app-layout'
import type { ReactNode } from 'react'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-[480px] items-center justify-center">
        <p className="text-sm text-slate-400">加载中...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  return <>{children}</>
}

export const router = createBrowserRouter([
  {
    path: '/auth',
    element: <AuthPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <TransactionsPage /> },
      { path: 'stats', element: <StatsPage /> },
      { path: 'family', element: <FamilyPage /> },
    ],
  },
])
