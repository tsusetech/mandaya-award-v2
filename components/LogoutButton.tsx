// components/LogoutButton.tsx
'use client'

import { useRouter } from 'next/navigation'
import { logoutUser } from '@/lib/auth'
import { toast } from 'sonner'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = () => {
    logoutUser()
    toast.success('Logged out successfully')
    router.push('/login')
  }

  return (
    <button
      onClick={handleLogout}
      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
    >
      Logout
    </button>
  )
}
