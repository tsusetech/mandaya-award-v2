'use client'

import { Button } from '@/components/ui/button'

export function UserTable({ users, onEdit, onDelete }: {
  users: any[]
  onEdit: (user: any) => void
  onDelete: (id: number) => void
}) {
  return (
    <table className="w-full border mt-4">
      <thead>
        <tr className="border-b">
          <th className="p-2 text-left">Name</th>
          <th className="p-2 text-left">Email</th>
          <th className="p-2 text-left">Username</th>
          <th className="p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user.id} className="border-b">
            <td className="p-2">{user.name}</td>
            <td className="p-2">{user.email}</td>
            <td className="p-2">{user.username}</td>
            <td className="p-2 space-x-2 text-center">
              <Button size="sm" onClick={() => onEdit(user)}>Edit</Button>
              <Button size="sm" variant="destructive" onClick={() => onDelete(user.id)}>Delete</Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
