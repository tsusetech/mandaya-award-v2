'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserForm } from './components/UserForm'
import { UserTable } from './components/UserTable'
import { BulkImportModal } from './components/BulkImportModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Search, UserPlus, Users, Shield, Activity, Upload, TrendingUp, UserCheck, Filter, Download } from 'lucide-react'
import api from '@/lib/api'
import { toast } from 'sonner'
import Image from 'next/image'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'

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

interface UserFormData {
  name: string
  email: string
  username: string
  password?: string
  role: string
  groupId?: number
}

interface UserStats {
  total: number
  active: number
  admins: number
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [formOpen, setFormOpen] = useState(false)
  const [bulkImportOpen, setBulkImportOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    active: 0,
    admins: 0
  })

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await api.get('/users')
      const usersList = res.data.users || []
      setUsers(usersList)
      setFilteredUsers(usersList)
      
      // Calculate stats
      setStats({
        total: usersList.length,
        active: usersList.filter((user: User) => user.isActive !== false).length,
        admins: usersList.filter((user: User) => 
          user.userRoles?.some((role) => 
            role.role?.name === 'ADMIN' || role.role?.name === 'SUPERADMIN'
          )
        ).length
      })
    } catch (err) {
      toast.error('Gagal memuat pengguna')
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    if (!term.trim()) {
      setFilteredUsers(users)
      return
    }

    const filtered = users.filter(user =>
      user.name?.toLowerCase().includes(term.toLowerCase()) ||
      user.email?.toLowerCase().includes(term.toLowerCase()) ||
      user.username?.toLowerCase().includes(term.toLowerCase())
    )
    setFilteredUsers(filtered)
  }

  const handleCreate = () => {
    setSelectedUser(null)
    setFormOpen(true)
  }

  const handleBulkImport = () => {
    setBulkImportOpen(true)
  }

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setFormOpen(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/users/${id}`)
      toast.success('Pengguna berhasil dihapus')
      fetchUsers()
    } catch (err) {
      toast.error('Gagal menghapus pengguna')
      console.error('Error deleting user:', err)
    }
  }

  const handleSubmit = async (data: UserFormData) => {
    try {
      const payload = {
        name: data.name,
        email: data.email,
        username: data.username,
        roleName: data.role,
        ...(data.password && { password: data.password }),
        ...(data.groupId && { groupId: data.groupId })
      }
    
      if (selectedUser) {
        await api.put(`/users/${selectedUser.id}`, payload)
        toast.success('Pengguna berhasil diperbarui')
      } else {
        await api.post('/auth/signup', payload)
        toast.success('Pengguna berhasil dibuat')
      }
    
      setFormOpen(false)
      fetchUsers()
    } catch (err) {
      toast.error('Gagal menyimpan pengguna')
      console.error('Error saving user:', err)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  if (loading) {
    return (
      <AuthenticatedLayout allowedRoles={['ADMIN', 'SUPERADMIN']}>
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
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout allowedRoles={['ADMIN', 'SUPERADMIN']}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-blue-500/5 to-blue-600/5 blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-tr from-blue-400/5 to-blue-500/5 blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-gradient-to-r from-blue-500/3 to-blue-600/3 blur-2xl animate-pulse delay-500"></div>
        </div>

      {/* Header Section */}
      <div className="relative bg-gradient-to-r from-blue-500/10 via-blue-600/10 to-blue-500/10 border-b border-blue-200/50 dark:border-blue-800/50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-blue-600/5"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'32\\' height=\\'32\\' viewBox=\\'0 0 32 32\\'><path fill=\\'%233B82F6\\' d=\\'M0 31h32v1H0zM31 0v32h1V0z\\'/></svg>')] opacity-5"></div>
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
                <span>Kembali ke Beranda</span>
              </Button>
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg border-2 border-blue-400/50">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 bg-clip-text text-transparent">
                    Manajemen Pengguna
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                                         Kelola pengguna sistem dan izin mereka dengan kontrol yang komprehensif
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                onClick={handleBulkImport} 
                className="flex items-center space-x-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-blue-200/50 dark:border-blue-800/50 hover:bg-white/70 dark:hover:bg-gray-700/50"
              >
                <Upload className="h-4 w-4" />
                <span>Impor Massal</span>
              </Button>
              <Button 
                onClick={handleCreate} 
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200"
              >
                <UserPlus className="h-4 w-4" />
                <span>Tambah Pengguna</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.03] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                             <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Pengguna</CardTitle>
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 group-hover:from-blue-200 dark:group-hover:from-blue-900/60 group-hover:to-blue-300 dark:group-hover:to-blue-800/60 transition-all duration-300 transform group-hover:scale-110">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{stats.total}</div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-500 animate-pulse" />
                                 <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Semua pengguna terdaftar</p>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.03] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-green-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                             <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Pengguna Aktif</CardTitle>
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 group-hover:from-green-200 dark:group-hover:from-green-900/60 group-hover:to-green-300 dark:group-hover:to-green-800/60 transition-all duration-300 transform group-hover:scale-110">
                <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{stats.active}</div>
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-blue-500 animate-pulse" />
                                 <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Saat ini aktif</p>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.03] border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                             <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Administrator</CardTitle>
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40 group-hover:from-purple-200 dark:group-hover:from-purple-900/60 group-hover:to-purple-300 dark:group-hover:to-purple-800/60 transition-all duration-300 transform group-hover:scale-110">
                <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{stats.admins}</div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-purple-500 animate-pulse" />
                                 <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Pengguna admin</p>
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
                                         placeholder="Cari pengguna berdasarkan nama, email, atau nama pengguna..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-12 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:focus:border-blue-400 transition-all duration-200"
                  />
                </div>
                <Button variant="outline" className="flex items-center space-x-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                  <Filter className="h-4 w-4" />
                  <span>Filter</span>
                </Button>
                <Button variant="outline" className="flex items-center space-x-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                  <Download className="h-4 w-4" />
                  <span>Ekspor</span>
                </Button>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-full">
                                 Menampilkan <span className="font-semibold text-gray-900 dark:text-white">{filteredUsers.length}</span> dari <span className="font-semibold text-gray-900 dark:text-white">{users.length}</span> pengguna
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="border-0 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-500/5 to-gray-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center space-x-3 text-xl">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
                             <span className="text-gray-900 dark:text-white font-bold">Pengguna</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                 <span className="text-sm text-green-600 dark:text-green-400 font-medium">Aktif</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <UserTable 
              users={filteredUsers} 
              onEdit={handleEdit} 
              onDelete={handleDelete} 
            />
          </CardContent>
        </Card>
      </div>

      {/* User Form Modal */}
      <UserForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        defaultValues={selectedUser ? {
          ...selectedUser,
          id: selectedUser.id.toString()
        } : undefined}
      />

      {/* Bulk Import Modal */}
      <BulkImportModal
        open={bulkImportOpen}
        onClose={() => setBulkImportOpen(false)}
        onSuccess={fetchUsers}
      />
      </div>
    </AuthenticatedLayout>
  )
}
