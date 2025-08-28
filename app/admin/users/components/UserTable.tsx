'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, Eye, MoreHorizontal } from 'lucide-react'

interface User {
  id: number
  name: string
  email: string
  username: string
  isActive?: boolean
  userRoles?: Array<{
    role?: {
      name: string
    }
  }>
}

interface UserTableProps {
  users: User[]
  onEdit: (user: User) => void
  onDelete: (id: number) => void
}

export function UserTable({ users, onEdit, onDelete }: UserTableProps) {
  const getRoleBadge = (user: User) => {
    const role = user.userRoles?.[0]?.role?.name
    if (!role) return null

    const roleColors = {
      'ADMIN': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      'SUPERADMIN': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      'JURI': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'PESERTA': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    }

    return (
      <Badge className={`${roleColors[role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'} text-xs font-medium`}>
        {role}
      </Badge>
    )
  }

  const getStatusBadge = (user: User) => {
    const isActive = user.isActive !== false
    return (
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
        <span className={`text-xs font-medium ${isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
          {isActive ? 'Active' : 'Inactive'}
        </span>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="w-full">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
              Contact
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {users.map((user, index) => (
            <tr 
              key={user.id} 
              className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 group"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {user.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      @{user.username}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 dark:text-white">{user.email}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{user.username}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getRoleBadge(user)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(user)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="flex items-center justify-center space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(user)}
                    className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-all duration-200"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(user.id)}
                    className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-all duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-all duration-200"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400">
            <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">No users found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Get started by creating a new user.</p>
          </div>
        </div>
      )}
    </div>
  )
}
