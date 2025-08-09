import RequireAuth from '@/components/RequireAuth'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RequireAuth allowedRoles={['ADMIN', 'SUPERADMIN']}>
      {children}
    </RequireAuth>
  )
}
