"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Users, UserPlus, Mail, Calendar } from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/api"
import AddMembersModal from "./components/AddMembersModal"

interface User {
  id: number
  name: string
  email: string
  createdAt?: string
}

interface Group {
  id: number
  name: string
  description?: string
  createdAt?: string
}

export default function GroupDetailPage() {
  const router = useRouter()
  const { id: groupId } = useParams() as { id: string }
  const [group, setGroup] = useState<Group | null>(null)
  const [members, setMembers] = useState<User[]>([])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const fetchGroupDetails = async () => {
    try {
      setLoading(true)

      const groupRes = await api.get(`/groups/${groupId}`)
      setGroup(groupRes.data)

      const membersRes = await api.get(`/groups/${groupId}/users`)
      const membersList = Array.isArray(membersRes.data)
        ? membersRes.data
        : membersRes.data.users || []
      setMembers(membersList)
    } catch (err) {
      toast.error("Failed to load group data.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGroupDetails()
  }, [groupId])

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
            <div className="h-32 bg-gray-200 rounded"></div>
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
                onClick={() => router.push('/admin/groups')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Groups</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{group?.name || 'Loading...'}</h1>
                <p className="text-gray-600">{group?.description || 'Group details and member management'}</p>
              </div>
            </div>
            <Button onClick={() => setShowModal(true)} className="flex items-center space-x-2">
              <UserPlus className="h-4 w-4" />
              <span>Add Members</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Group Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span>Group Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Group Name</p>
                <p className="text-lg font-semibold">{group?.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Members</p>
                <p className="text-lg font-semibold">{members.length}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Created</p>
                <p className="text-lg font-semibold">
                  {group?.createdAt ? new Date(group.createdAt).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </div>
            {group?.description && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-500">Description</p>
                <p className="text-gray-700">{group.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Members Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-600" />
                <span>Members ({members.length})</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {members.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No members in this group yet</p>
                <p className="text-sm text-gray-400">Click "Add Members" to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {members.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {user.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Mail className="h-3 w-3" />
                          <span>{user.email}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-400">
                      {user.createdAt && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AddMembersModal
        groupId={parseInt(groupId)}
        open={showModal}
        onClose={() => {
          setShowModal(false)
          fetchGroupDetails()
        }}
      />
    </div>
  )
}
