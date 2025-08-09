'use client'

import { useForm } from 'react-hook-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useEffect } from 'react'

export default function GroupForm({ open, onClose, onSubmit, defaultValues }: {
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
          <DialogTitle>{defaultValues?.id ? 'Edit Group' : 'Create Group'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input {...register('groupName')} placeholder="Group Name" required />
          <Input {...register('description')} placeholder="Description" required />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}


