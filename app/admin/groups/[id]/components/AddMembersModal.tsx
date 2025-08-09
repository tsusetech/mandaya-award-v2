// app/admin/groups/[id]/components/AddMembersModal.tsx
'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
        toast.error('Failed to fetch users')
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
    if (!assignedUserIds.length) return toast.warning('No users selected.')
    setLoading(true)
    try {
      await api.post(`/groups/${groupId}/users/bulk`, {
        userIds: assignedUserIds,
      })
      toast.success('Users successfully assigned to the group.')
      onClose()
    } catch (err) {
      toast.error('Failed to assign users.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Add Members to Group #{groupId}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[300px] overflow-y-auto">
          {users.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No users available to add</p>
          ) : (
            users.map((user) => (
              <div key={user.id} className="flex items-center space-x-3 border-b pb-2">
                <input
                  type="checkbox"
                  checked={assignedUserIds.includes(user.id)}
                  onChange={() => handleToggle(user.id)}
                  className="w-5 h-5 cursor-pointer"
                />
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border border-gray-300 text-gray-700"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || assignedUserIds.length === 0}
            className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
