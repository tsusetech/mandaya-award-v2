'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import GroupTable from './components/GroupTable'
import GroupForm from './components/GroupForm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Search, Plus, Shield, Users, Activity } from 'lucide-react'
import api from '@/lib/api'
import { toast } from 'sonner'

interface Group {
  id: number
  groupName: string
  description?: string
  memberCount?: number
}

interface GroupFormData {
  groupName: string
  description: string
}

interface Stats {
  totalGroups: number
  totalMembers: number
  averageGroupSize: number
}

export default function AdminGroupsPage() {
  const router = useRouter()
  const [groups, setGroups] = useState<Group[]>([])
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([])
  const [formOpen, setFormOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({
    totalGroups: 0,
    totalMembers: 0,
    averageGroupSize: 0
  })

  const fetchGroups = async () => {
    try {
      setLoading(true)
      const res = await api.get('/groups')
      const groupsList = res.data.groups || []
      
      // Fetch member counts for each group
      const groupsWithMembers = await Promise.all(
        groupsList.map(async (group: Group) => {
          try {
            const membersRes = await api.get(`/groups/${group.id}/users`)
            const members = Array.isArray(membersRes.data) 
              ? membersRes.data 
              : membersRes.data.users || []
            return { ...group, memberCount: members.length }
          } catch {
            return { ...group, memberCount: 0 }
          }
        })
      )

      setGroups(groupsWithMembers)
      setFilteredGroups(groupsWithMembers)

      // Calculate stats
      const totalMembers = groupsWithMembers.reduce((sum, group) => sum + group.memberCount, 0)
      setStats({
        totalGroups: groupsWithMembers.length,
        totalMembers,
        averageGroupSize: groupsWithMembers.length > 0 ? Math.round(totalMembers / groupsWithMembers.length) : 0
      })
    } catch (err) {
      toast.error('Failed to fetch groups')
      console.error('Error fetching groups:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    if (!term.trim()) {
      setFilteredGroups(groups)
      return
    }

    const filtered = groups.filter(group =>
      group.groupName?.toLowerCase().includes(term.toLowerCase()) ||
      group.description?.toLowerCase().includes(term.toLowerCase())
    )
    setFilteredGroups(filtered)
  }

  const handleCreate = () => {
    setSelectedGroup(null)
    setFormOpen(true)
  }

  const handleEdit = (group: Group) => {
    setSelectedGroup(group)
    setFormOpen(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/groups/${id}`)
      toast.success('Group deleted successfully')
      fetchGroups()
    } catch (err) {
      toast.error('Failed to delete group')
      console.error('Error deleting group:', err)
    }
  }

  const handleSubmit = async (data: GroupFormData) => {
    try {
      const payload = {
        groupName: data.groupName,
        description: data.description,
      }
    
      if (selectedGroup) {
        await api.put(`/groups/${selectedGroup.id}`, payload)
        toast.success('Group updated successfully')
      } else {
        await api.post('/groups', payload)
        toast.success('Group created successfully')
      }
    
      setFormOpen(false)
      fetchGroups()
    } catch (err) {
      toast.error('Failed to save group')
      console.error('Error saving group:', err)
    }
  }

  const handleViewGroup = (groupId: number) => {
    router.push(`/admin/groups/${groupId}`)
  }

  useEffect(() => {
    fetchGroups()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-48"></div>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push('/admin')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Group Management</h1>
                <p className="text-gray-600">Create and manage user groups</p>
              </div>
            </div>
            <Button onClick={handleCreate} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Group</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Groups</CardTitle>
              <Shield className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalGroups}</div>
              <p className="text-xs text-gray-500">Active groups</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Members</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMembers}</div>
              <p className="text-xs text-gray-500">Across all groups</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Group Size</CardTitle>
              <Activity className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageGroupSize}</div>
              <p className="text-xs text-gray-500">Members per group</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search groups by name or description..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="text-sm text-gray-500">
                Showing {filteredGroups.length} of {groups.length} groups
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Groups Table */}
        <Card>
          <CardHeader>
            <CardTitle>Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <GroupTable 
              groups={filteredGroups} 
              onEdit={handleEdit} 
              onDelete={handleDelete}
              onView={handleViewGroup}
            />
          </CardContent>
        </Card>
      </div>

      {/* Group Form Modal */}
      <GroupForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        defaultValues={selectedGroup ? {
          groupName: selectedGroup.groupName,
          description: selectedGroup.description || '',
          id: selectedGroup.id.toString()
        } : undefined}
      />
    </div>
  )
}
