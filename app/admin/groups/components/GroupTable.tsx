'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, Eye, MoreHorizontal, Users, Shield, Settings } from 'lucide-react'

interface Group {
  id: number
  groupName: string
  description?: string
  memberCount?: number
}

interface GroupTableProps {
  groups: Group[]
  onEdit: (group: Group) => void
  onDelete: (id: number) => void
  onView: (id: number) => void
}

export default function GroupTable({ groups, onEdit, onDelete, onView }: GroupTableProps) {
  const getGroupColor = (groupName: string) => {
    const name = groupName.toLowerCase()
    
    // Government categories
    if (name.includes('provinsi')) {
      return 'from-blue-500 to-blue-600'
    }
    if (name.includes('kabupaten')) {
      return 'from-indigo-500 to-indigo-600'
    }
    if (name.includes('kota')) {
      return 'from-purple-500 to-purple-600'
    }
    if (name.includes('desa')) {
      return 'from-cyan-500 to-cyan-600'
    }
    
    // Non-government partner categories
    if (name.includes('perguruan tinggi')) {
      return 'from-orange-500 to-orange-600'
    }
    if (name.includes('lsm') || name.includes('organisasi')) {
      return 'from-pink-500 to-pink-600'
    }
    if (name.includes('bumn') || name.includes('swasta')) {
      return 'from-teal-500 to-teal-600'
    }
    
    // Grassroots categories
    if (name.includes('individu')) {
      return 'from-emerald-500 to-emerald-600'
    }
    if (name.includes('lifetime') || name.includes('contribution')) {
      return 'from-amber-500 to-amber-600'
    }
    
    // Default fallback
    return 'from-green-500 to-green-600'
  }

  const getGroupIcon = (groupName: string) => {
    const name = groupName.toLowerCase()
    
    // Government categories - each with unique icons representing hierarchy
    if (name.includes('provinsi')) {
      return '🏛️' // Government building for provincial level
    }
    if (name.includes('kabupaten')) {
      return '🏢' // Office building for regency level
    }
    if (name.includes('kota')) {
      return '🏙️' // Cityscape for city level
    }
    if (name.includes('desa')) {
      return '🏘️' // Houses for village level
    }
    
    // Non-government partner categories
    if (name.includes('perguruan tinggi')) {
      return '🎓'
    }
    if (name.includes('lsm') || name.includes('organisasi')) {
      return '🤝'
    }
    if (name.includes('bumn') || name.includes('swasta')) {
      return '🏢'
    }
    
    // Grassroots categories
    if (name.includes('individu')) {
      return '👤'
    }
    if (name.includes('lifetime') || name.includes('contribution')) {
      return '🏆'
    }
    
    // Default fallback
    return <Shield className="h-5 w-5" />
  }

  const getMemberCountBadge = (count: number) => {
    if (count === 0) {
      return (
        <Badge className="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 text-xs">
          No members
        </Badge>
      )
    } else if (count < 5) {
      return (
        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs">
          {count} member{count !== 1 ? 's' : ''}
        </Badge>
      )
    } else if (count < 10) {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs">
          {count} members
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 text-xs">
          {count} members
        </Badge>
      )
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="w-full">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
              Group
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
              Description
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
              Members
            </th>
            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {groups.map((group) => {
            const groupColor = getGroupColor(group.groupName)
            const groupIcon = getGroupIcon(group.groupName)
            
            return (
              <tr 
                key={group.id} 
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 group"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${groupColor} flex items-center justify-center text-white font-semibold text-sm shadow-lg`}>
                        {typeof groupIcon === 'string' ? (
                          <span className="text-lg">{groupIcon}</span>
                        ) : (
                          groupIcon
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                        {group.groupName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Group ID: {group.id}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                    {group.description || 'No description provided'}
                  </div>
                  {group.description && group.description.length > 50 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {group.description.substring(0, 50)}...
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40">
                        <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {group.memberCount || 0}
                      </span>
                    </div>
                    {getMemberCountBadge(group.memberCount || 0)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onView(group.id)}
                      className="h-8 px-3 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 transition-all duration-200"
                    >
                      <Users className="h-4 w-4 mr-1" />
                      <span className="text-xs">Members</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEdit(group)}
                      className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-all duration-200"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete(group.id)}
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
            )
          })}
        </tbody>
      </table>
      {groups.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400">
            <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
              <Shield className="h-12 w-12" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">No groups found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Create a new group to get started</p>
          </div>
        </div>
      )}
    </div>
  )
}

