'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Clock, CheckCircle, Users, ClipboardList } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'

interface Group {
  id: number
  groupName: string
  description?: string
  responseSession?: {
    id: number
    status: string
    progressPercentage: number
  }
}



interface DashboardStats {
  totalGroups: number
  activeAssessments: number
  completedAssessments: number
  totalSubmissions: number
  draftSubmissions: number
  submittedSubmissions: number
  reviewedSubmissions: number
}

export default function PesertaDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalGroups: 0,
    activeAssessments: 0,
    completedAssessments: 0,
    totalSubmissions: 0,
    draftSubmissions: 0,
    submittedSubmissions: 0,
    reviewedSubmissions: 0
  })
  const [groups, setGroups] = useState<Group[]>([])

  const [loading, setLoading] = useState(true)

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      // Get user's assigned groups
      const groupsRes = await api.get('/groups/my-groups')

      // Get user groups - handle different response structures
      const userGroups = Array.isArray(groupsRes.data) ? groupsRes.data : groupsRes.data?.groups || []
      setGroups(userGroups)
      
      // Calculate stats based only on groups
      const activeAssessments = userGroups.filter((g: Group) => g.responseSession && g.responseSession.status !== 'submitted').length
      const completedAssessments = userGroups.filter((g: Group) => g.responseSession && g.responseSession.status === 'submitted').length
      
      setStats({
        totalGroups: userGroups.length,
        activeAssessments,
        completedAssessments,
        totalSubmissions: 0, // No submissions endpoint available
        draftSubmissions: 0,
        submittedSubmissions: 0,
        reviewedSubmissions: 0
      })


    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="px-4 sm:px-6 py-4">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-48"></div>
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-6">
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
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
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Participant Dashboard</h1>
              <p className="text-sm sm:text-base text-gray-600">Manage your assessment groups and track their progress</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">My Groups</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalGroups}</div>
              <p className="text-xs text-gray-500">Assigned groups</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Assessments</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeAssessments}</div>
              <p className="text-xs text-gray-500">In progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedAssessments}</div>
              <p className="text-xs text-gray-500">Assessments done</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Assessments</CardTitle>
              <CheckCircle className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalGroups}</div>
              <p className="text-xs text-gray-500">All assessments</p>
            </CardContent>
          </Card>
        </div>

        {/* My Groups */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>My Assessment Groups</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/peserta/groups')}
                className="flex items-center space-x-2"
              >
                <span>View All</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {groups.length === 0 ? (
              <div className="text-center py-8">
                <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No groups assigned yet</p>
                <p className="text-sm text-gray-400">You will be notified when you are assigned to a group</p>
              </div>
                                      ) : (
               <div className="space-y-4">
                 {Array.isArray(groups) ? groups.slice(0, 3).map((group) => (
                   <div
                     key={group.id}
                     className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                     onClick={() => router.push(`/peserta/assessment/${group.id}`)}
                   >
                     <div className="flex items-center space-x-4">
                       <div className="text-blue-500">
                         <Users className="h-4 w-4" />
                       </div>
                       <div>
                         <p className="font-medium text-gray-900">{group.groupName}</p>
                         {group.description && (
                           <p className="text-sm text-gray-500">{group.description}</p>
                         )}
                         {group.responseSession && (
                           <p className="text-sm text-gray-500">
                             Progress: {group.responseSession.progressPercentage}% • 
                             Status: {group.responseSession.status.replace('_', ' ')}
                           </p>
                         )}
                       </div>
                     </div>
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={(e) => {
                         e.stopPropagation()
                         router.push(`/peserta/assessment/${group.id}`)
                       }}
                     >
                       {group.responseSession ? 'Continue' : 'Start'}
                     </Button>
                   </div>
                 )) : null}
               </div>
             )}
          </CardContent>
        </Card>



        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/peserta/groups')}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span>My Groups</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">View and complete assessments</p>
              <Button className="mt-4 w-full" variant="outline">
                View Groups
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/peserta/profile')}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-purple-600" />
                <span>Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">Manage your profile</p>
              <Button className="mt-4 w-full" variant="outline">
                View Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

