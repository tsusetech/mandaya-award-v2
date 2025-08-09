'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, ClipboardList, Clock } from 'lucide-react'
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

export default function GroupsPage() {
  const router = useRouter()
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)

  const fetchGroups = async () => {
    try {
      setLoading(true)
      // Get user's assigned groups
      const res = await api.get('/groups/my-groups')
      console.log('Groups response:', res.data)
      const userGroups = Array.isArray(res.data) ? res.data : res.data?.groups || []
      setGroups(userGroups)
    } catch (err) {
      console.error('Error fetching groups:', err)
      toast.error('Failed to load groups')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGroups()
  }, [])

  const handleStartAssessment = async (groupId: number) => {
    try {
      // Get or create assessment session
      const res = await api.get(`/assessments/session/${groupId}`)
      router.push(`/peserta/assessment/${groupId}`)
    } catch (err) {
      console.error('Error starting assessment:', err)
      toast.error('Failed to start assessment')
    }
  }

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
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
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
                onClick={() => router.push('/peserta')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Groups</h1>
                <p className="text-gray-600">View and complete your group assessments</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {groups.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No groups assigned yet</p>
                <p className="text-sm text-gray-400">You will be notified when you are assigned to a group</p>
              </div>
            </CardContent>
          </Card>
        ) : (
                                <div className="grid gap-6">
             {Array.isArray(groups) ? groups.map((group) => (
               <Card key={group.id} className="hover:shadow-md transition-shadow">
                 <CardContent className="p-6">
                   <div className="flex items-center justify-between">
                     <div className="space-y-1">
                       <h2 className="text-xl font-semibold">{group.groupName}</h2>
                       {group.description && (
                         <p className="text-gray-600">{group.description}</p>
                       )}
                       {group.responseSession && (
                         <div className="flex items-center space-x-2 text-sm">
                           <Clock className="h-4 w-4 text-blue-500" />
                           <span className="text-gray-600">
                             Progress: {group.responseSession.progressPercentage}%
                           </span>
                           <span className="text-gray-400">•</span>
                           <span className="capitalize text-gray-600">
                             Status: {group.responseSession.status.replace('_', ' ')}
                           </span>
                         </div>
                       )}
                     </div>
                     <Button
                       onClick={() => handleStartAssessment(group.id)}
                       className="flex items-center space-x-2"
                     >
                       {group.responseSession ? (
                         <>
                           <Clock className="h-4 w-4" />
                           <span>Continue</span>
                         </>
                       ) : (
                         <>
                           <ArrowRight className="h-4 w-4" />
                           <span>Start</span>
                         </>
                       )}
                     </Button>
                   </div>
                 </CardContent>
               </Card>
             )) : null}
           </div>
        )}
      </div>
    </div>
  )
}
