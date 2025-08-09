'use client'

import { PencilIcon, TrashIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Users, Shield } from 'lucide-react'

interface GroupTableProps {
  groups: any[]
  onEdit: (group: any) => void
  onDelete: (id: number) => void
  onView: (id: number) => void
}

export default function GroupTable({ groups, onEdit, onDelete, onView }: GroupTableProps) {
  return (
    <div className="relative overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs uppercase bg-gray-50">
          <tr>
            <th className="px-6 py-3">Group Name</th>
            <th className="px-6 py-3">Description</th>
            <th className="px-6 py-3">Members</th>
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <tr key={group.id} className="bg-white border-b hover:bg-gray-50">
              <td className="px-6 py-4 font-medium text-gray-900">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span>{group.groupName}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-gray-500">
                {group.description || 'No description'}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-500">{group.memberCount || 0}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onView(group.id)}
                    className="flex items-center space-x-1"
                  >
                    <Users className="h-4 w-4" />
                    <span>Manage Members</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onEdit(group)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onDelete(group.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
          {groups.length === 0 && (
            <tr className="bg-white">
              <td colSpan={4} className="px-6 py-12 text-center">
                <div className="flex flex-col items-center justify-center text-gray-500">
                  <Shield className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg font-medium">No Groups Found</p>
                  <p className="text-sm text-gray-400">Create a new group to get started</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

