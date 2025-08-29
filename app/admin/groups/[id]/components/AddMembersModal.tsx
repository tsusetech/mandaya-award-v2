// app/admin/groups/[id]/components/AddMembersModal.tsx
'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Users } from 'lucide-react'
import api from '@/lib/api'
import { toast } from 'sonner'

interface User {
  id: number
  name: string
  email: string
}

interface AddMembersModalProps {
  groupId: string | number
  open: boolean
  onClose: () => void
}

export default function AddMembersModal({ groupId, open, onClose }: AddMembersModalProps) {
  const [users, setUsers] = useState<User[]>([])
  const [assignedUserIds, setAssignedUserIds] = useState<number[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return

    const fetchUsers = async () => {
      try {
        // Get all users
        const usersRes = await api.get('/users')
        const allUsers: User[] = usersRes.data.users || []

        // Get current group members
        const membersRes = await api.get(`/groups/${groupId}/users`)
        const currentMembers: User[] = Array.isArray(membersRes.data)
          ? membersRes.data
          : membersRes.data.users || []

        // Filter out users who are already in the group
        const currentMemberIds = currentMembers.map(member => member.id)
        const availableUsers = allUsers.filter(user => !currentMemberIds.includes(user.id))

        setUsers(availableUsers)
        setAssignedUserIds([])
      } catch (err) {
        console.error('Error fetching users:', err)
        toast.error('Gagal memuat pengguna')
      }
    }

    fetchUsers()
  }, [groupId, open])

  const handleToggle = (userId: number) => {
    setAssignedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  const handleSubmit = async () => {
    if (!assignedUserIds.length) return toast.warning('Tidak ada pengguna yang dipilih.')
    setLoading(true)
    try {
      await api.post(`/groups/${groupId}/users/bulk`, {
        userIds: assignedUserIds,
      })
      toast.success('Pengguna berhasil ditetapkan ke kelompok.')
      onClose()
    } catch (err) {
      toast.error('Gagal menetapkan pengguna.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-2xl">
        <DialogHeader className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-green-600/5 rounded-t-lg"></div>
          <DialogTitle className="relative z-10 flex items-center space-x-3 text-xl">
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40">
              <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-gray-900 dark:text-white font-bold">Tambah Anggota ke Kelompok #{groupId}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[300px] overflow-y-auto p-4">
          {users.length === 0 ? (
            <div className="text-center py-8">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700/50 dark:to-gray-800/50 mb-4 inline-block">
                <Users className="h-8 w-8 text-gray-500 dark:text-gray-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-300">Tidak ada pengguna yang tersedia untuk ditambahkan</p>
            </div>
          ) : (
            users.map((user) => (
              <div key={user.id} className="group flex items-center space-x-4 p-3 border border-gray-200/50 dark:border-gray-700/50 rounded-lg hover:bg-gradient-to-r hover:from-green-50/50 hover:to-green-100/50 dark:hover:from-green-900/20 dark:hover:to-green-800/20 transition-all duration-200">
                <input
                  type="checkbox"
                  checked={assignedUserIds.includes(user.id)}
                  onChange={() => handleToggle(user.id)}
                  className="w-5 h-5 cursor-pointer text-green-600 focus:ring-green-500"
                />
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
                    <span className="text-white font-semibold text-sm">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-3 p-4 border-t border-gray-200/50 dark:border-gray-700/50">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            disabled={loading}
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || assignedUserIds.length === 0}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
