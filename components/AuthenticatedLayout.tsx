'use client'

import { ReactNode } from 'react'
import Navigation from './Navigation'
import RequireAuth from './RequireAuth'

interface AuthenticatedLayoutProps {
  children: ReactNode
  allowedRoles?: string[]
}

export default function AuthenticatedLayout({ 
  children, 
  allowedRoles = ['PESERTA', 'ADMIN', 'SUPERADMIN', 'JURI'] 
}: AuthenticatedLayoutProps) {
  return (
    <RequireAuth allowedRoles={allowedRoles}>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="pt-16">
          {children}
        </main>
      </div>
    </RequireAuth>
  )
}
