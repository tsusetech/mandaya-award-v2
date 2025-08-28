'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import GroupTable from './components/GroupTable'
import GroupForm from './components/GroupForm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Search, Plus, Shield, Users, Activity, TrendingUp, UserCheck, Filter, Download, Users2 } from 'lucide-react'
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="p-6 space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-green-500/5 to-green-600/5 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-tr from-green-400/5 to-green-500/5 blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-gradient-to-r from-green-500/3 to-green-600/3 blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Header Section */}
      <div className="relative bg-gradient-to-r from-green-500/10 via-green-600/10 to-green-500/10 border-b border-green-200/50 dark:border-green-800/50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-green-600/5"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'32\\' height=\\'32\\' viewBox=\\'0 0 32 32\\'><path fill=\\'%2316A34A\\' d=\\'M0 31h32v1H0zM31 0v32h1V0z\\'/></svg>')] opacity-5"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push('/admin')}
                className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-gray-900 dark:text-white backdrop-blur-sm border border-white/20"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg border-2 border-green-400/50">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 via-green-500 to-green-400 bg-clip-text text-transparent">
                    Group Management
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    Create and manage user groups for organized collaboration
                  </p>
                </div>
              </div>
            </div>
            <Button 
              onClick={handleCreate} 
              className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-200"
            >
              <Plus className="h-4 w-4" />
              <span>Add Group</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.03] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-green-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Groups</CardTitle>
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 group-hover:from-green-200 dark:group-hover:from-green-900/60 group-hover:to-green-300 dark:group-hover:to-green-800/60 transition-all duration-300 transform group-hover:scale-110">
                <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{stats.totalGroups}</div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-500 animate-pulse" />
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Active groups</p>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.03] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Members</CardTitle>
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 group-hover:from-blue-200 dark:group-hover:from-blue-900/60 group-hover:to-blue-300 dark:group-hover:to-blue-800/60 transition-all duration-300 transform group-hover:scale-110">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{stats.totalMembers}</div>
              <div className="flex items-center space-x-2">
                <UserCheck className="h-4 w-4 text-blue-500 animate-pulse" />
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Across all groups</p>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.03] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Group Size</CardTitle>
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40 group-hover:from-purple-200 dark:group-hover:from-purple-900/60 group-hover:to-purple-300 dark:group-hover:to-purple-800/60 transition-all duration-300 transform group-hover:scale-110">
                <Users2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{stats.averageGroupSize}</div>
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-purple-500 animate-pulse" />
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Members per group</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden group hover:shadow-2xl transition-all duration-500 mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-500/5 to-gray-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="pt-6 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Search groups by name or description..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-12 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-800 dark:focus:border-green-400 transition-all duration-200"
                  />
                </div>
                <Button variant="outline" className="flex items-center space-x-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                </Button>
                <Button variant="outline" className="flex items-center space-x-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </Button>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-full">
                Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredGroups.length}</span> of <span className="font-semibold text-gray-900 dark:text-white">{groups.length}</span> groups
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Groups Table */}
        <Card className="border-0 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-500/5 to-gray-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center space-x-3 text-xl">
              <div className="p-2 rounded-lg bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40">
                <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-gray-900 dark:text-white font-bold">Groups</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">Live</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
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
