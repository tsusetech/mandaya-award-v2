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
  groupName: string
  name?: string
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
      console.log('Group API response:', groupRes.data)
      const groupData = groupRes.data.group || groupRes.data
      console.log('Group data:', groupData)
      setGroup(groupData)

      const membersRes = await api.get(`/groups/${groupId}/users`)
      console.log('Members API response:', membersRes.data)
      const membersList = Array.isArray(membersRes.data)
        ? membersRes.data
        : membersRes.data.users || []
      setMembers(membersList)
    } catch (err) {
      console.error('Error fetching group details:', err)
      toast.error("Gagal memuat data kelompok.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGroupDetails()
  }, [groupId])

    if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="p-6 space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {[1, 2].map(i => (
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
                onClick={() => router.push('/admin/groups')}
                className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-gray-900 dark:text-white backdrop-blur-sm border border-white/20"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Kembali ke Kelompok</span>
              </Button>
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg border-2 border-green-400/50">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 via-green-500 to-green-400 bg-clip-text text-transparent">
                    {group?.groupName || group?.name || 'Loading...'}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    {group?.description || 'Detail kelompok dan manajemen anggota'}
                  </p>
                </div>
              </div>
            </div>
            <Button 
              onClick={() => setShowModal(true)} 
              className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-200"
            >
              <UserPlus className="h-4 w-4" />
              <span>Tambah Anggota</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Group Info Card */}
        <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-green-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center space-x-3 text-xl">
              <div className="p-2 rounded-lg bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40">
                <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-gray-900 dark:text-white font-bold">Informasi Kelompok</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200/50 dark:border-blue-800/50">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Nama Kelompok</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{group?.groupName || group?.name}</p>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200/50 dark:border-purple-800/50">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Total Anggota</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{members.length}</p>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200/50 dark:border-orange-800/50">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Dibuat</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {group?.createdAt ? new Date(group.createdAt).toLocaleDateString() : 'Tidak diketahui'}
                </p>
              </div>
            </div>
            {group?.description && (
              <div className="mt-6 p-4 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 border border-gray-200/50 dark:border-gray-700/50">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Deskripsi</p>
                <p className="text-gray-700 dark:text-gray-300">{group.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Members Card */}
        <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-green-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-3 text-xl">
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40">
                  <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-gray-900 dark:text-white font-bold">Anggota ({members.length})</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            {members.length === 0 ? (
              <div className="text-center py-12">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 mb-4 inline-block">
                  <Users className="h-12 w-12 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Belum ada anggota dalam kelompok ini</h3>
                <p className="text-gray-600 dark:text-gray-300">Klik "Tambah Anggota" untuk memulai</p>
              </div>
            ) : (
              <div className="space-y-4">
                {members.map((user) => (
                  <div key={user.id} className="group/item flex items-center justify-between p-4 border border-gray-200/50 dark:border-gray-700/50 rounded-lg hover:bg-gradient-to-r hover:from-green-50/50 hover:to-green-100/50 dark:hover:from-green-900/20 dark:hover:to-green-800/20 transition-all duration-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg group-hover/item:scale-110 transition-transform duration-200">
                        <span className="text-white font-semibold text-lg">
                          {user.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-lg">{user.name}</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                          <Mail className="h-4 w-4" />
                          <span>{user.email}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {user.createdAt && (
                        <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-full">
                          <Calendar className="h-4 w-4" />
                          <span>Bergabung {new Date(user.createdAt).toLocaleDateString()}</span>
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
