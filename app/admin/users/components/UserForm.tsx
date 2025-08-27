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

interface Role {
  id: number
  name: string
  description?: string
}

interface UserFormData {
  name: string
  email: string
  username: string
  password?: string
  role: string
  groupId?: number
}

interface UserFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: UserFormData) => void
  defaultValues?: Partial<UserFormData> & { id?: string; userRoles?: Array<{ role?: { name: string } }> }
}

export function UserForm({ open, onClose, onSubmit, defaultValues }: UserFormProps) {
  const { register, handleSubmit, reset } = useForm<UserFormData>({ defaultValues })
  const [groups, setGroups] = useState<Group[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loadingGroups, setLoadingGroups] = useState(false)
  const [loadingRoles, setLoadingRoles] = useState(false)

  useEffect(() => {
    // Extract role from userRoles if editing
    if (defaultValues?.id && defaultValues?.userRoles?.length > 0) {
      const userRole = defaultValues.userRoles[0]?.role?.name
      console.log('Extracted role:', userRole) // Debug log
      const formData = {
        ...defaultValues,
        role: userRole || ''
      }
      console.log('Form data with role:', formData) // Debug log
      reset(formData)
    } else {
      reset(defaultValues)
    }
  }, [defaultValues, reset])

  useEffect(() => {
    if (open) {
      fetchGroups()
      fetchRoles()
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

  const fetchRoles = async () => {
    try {
      setLoadingRoles(true)
      const res = await api.get('/roles')
      console.log('Roles API response:', res.data)
      const rolesList = res.data.data || []
      console.log('Roles list:', rolesList)
      setRoles(rolesList)
    } catch (err) {
      console.error('Error fetching roles:', err)
    } finally {
      setLoadingRoles(false)
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
          
          {/* Role Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Role</label>
            <select
              {...register('role')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={loadingRoles}
            >
              <option value="">Select a role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.name}>
                  {role.name}
                </option>
              ))}
            </select>
            {loadingRoles && (
              <p className="text-xs text-gray-500">Loading roles...</p>
            )}
            {!loadingRoles && roles.length === 0 && (
              <p className="text-xs text-gray-500">No roles available</p>
            )}
            {!loadingRoles && roles.length > 0 && (
              <p className="text-xs text-gray-500">{roles.length} roles loaded</p>
            )}
          </div>
          
          {/* Group Selection - Disabled when editing */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Assign to Group {defaultValues?.id && '(Disabled when editing)'}
            </label>
            <select
              {...register('groupId')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loadingGroups || !!defaultValues?.id}
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
