'use client'

import { useForm } from 'react-hook-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useEffect } from 'react'

export function UserForm({ open, onClose, onSubmit, defaultValues }: {
  open: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  defaultValues?: any
}) {
  const { register, handleSubmit, reset } = useForm({ defaultValues })

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues])

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
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
