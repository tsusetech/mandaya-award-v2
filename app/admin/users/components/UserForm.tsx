'use client'

import { useForm } from 'react-hook-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import api from '@/lib/api'

interface Group {
  id: number
  name?: string
  groupName?: string
  description?: string
}

export function UserForm({ open, onClose, onSubmit, defaultValues }: {
  open: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  defaultValues?: any
}) {
  const { register, handleSubmit, reset } = useForm({ defaultValues })
  const [groups, setGroups] = useState<Group[]>([])
  const [loadingGroups, setLoadingGroups] = useState(false)

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues])

  useEffect(() => {
    if (open) {
      fetchGroups()
    }
  }, [open])

  const fetchGroups = async () => {
    try {
      setLoadingGroups(true)
      const res = await api.get('/groups')
      console.log('Groups API response:', res.data)
      const groupsList = res.data.groups || []
      console.log('Groups list:', groupsList)
      setGroups(groupsList)
    } catch (err) {
      console.error('Error fetching groups:', err)
    } finally {
      setLoadingGroups(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{defaultValues?.id ? 'Edit User' : 'Create User'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input {...register('name')} placeholder="Name" required />
          <Input {...register('email')} placeholder="Email" required />
          <Input {...register('username')} placeholder="Username" required />
          {!defaultValues?.id && (
            <Input {...register('password')} placeholder="Password" type="password" required />
          )}
          
          {/* Group Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Assign to Group</label>
            <select
              {...register('groupId')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loadingGroups}
            >
              <option value="">Select a group (optional)</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name || group.groupName || `Group ${group.id}`}
                </option>
              ))}
            </select>
            {loadingGroups && (
              <p className="text-xs text-gray-500">Loading groups...</p>
            )}
            {!loadingGroups && groups.length === 0 && (
              <p className="text-xs text-gray-500">No groups available</p>
            )}
            {!loadingGroups && groups.length > 0 && (
              <p className="text-xs text-gray-500">{groups.length} groups loaded</p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
