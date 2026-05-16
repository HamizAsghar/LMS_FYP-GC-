'use client'

import { useState } from 'react'
import { 
  Users, 
  Search, 
  Plus,
  Filter,
  MoreVertical,
  Mail,
  Phone,
  Building,
  Calendar,
  Edit,
  Trash2,
  Eye,
  BookOpen,
  CheckCircle2
} from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { StatusBadge } from '@/components/dashboard-components'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from '@/components/ui/label'
import { apiFetch } from '@/lib/api-client'
import { useEffect } from 'react'

export default function ManageUsersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [usersList, setUsersList] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Student',
    department: ''
  })

  // Enrollment State
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [allCourses, setAllCourses] = useState([])
  const [studentEnrolledIds, setStudentEnrolledIds] = useState([])
  const [enrollLoading, setEnrollLoading] = useState(false)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await apiFetch('/api/admin/users?limit=100')
      if (res.success) {
        const mappedUsers = res.data.users.map(u => ({
          id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          department: u.department || 'Not Assigned',
          status: u.status,
          joinedDate: new Date(u.createdAt || Date.now()).toLocaleDateString(),
          avatar: u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random`
        }))
        setUsersList(mappedUsers)
      }
    } catch (err) {
      if (err?.status !== 401 && err?.status !== 403) {
        console.error("Failed to load users", err)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleCreateUser = async () => {
    try {
      const res = await apiFetch('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(newUser)
      })
      if (res.success) {
        toast.success('User created successfully')
        setIsAddDialogOpen(false)
        setNewUser({ name: '', email: '', password: '', role: 'Student', department: '' })
        fetchUsers()
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create user')
    }
  }

  const handleUpdateUser = async () => {
    try {
      const res = await apiFetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: editingUser.name,
          status: editingUser.status,
          department: editingUser.department
        })
      })
      if (res.success) {
        toast.success('User updated successfully')
        setIsEditDialogOpen(false)
        fetchUsers()
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update user')
    }
  }

  const handleDeleteUser = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    try {
      const res = await apiFetch(`/api/admin/users/${id}`, {
        method: 'DELETE'
      })
      if (res.success) {
        toast.success('User deleted successfully')
        fetchUsers()
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete user')
    }
  }

  const openEnrollDialog = async (student) => {
    setSelectedStudent(student)
    setIsEnrollDialogOpen(true)
    setEnrollLoading(true)
    try {
      const [coursesRes, enrollmentRes] = await Promise.all([
        apiFetch('/api/admin/courses?limit=100'),
        apiFetch(`/api/admin/enrollments?studentId=${student.id}`)
      ])
      if (coursesRes.success) setAllCourses(coursesRes.data.courses)
      if (enrollmentRes.success) setStudentEnrolledIds(enrollmentRes.data.map(c => c._id))
    } catch (err) {
      toast.error("Failed to load enrollment data")
    } finally {
      setEnrollLoading(false)
    }
  }

  const toggleEnrollment = async (courseId, isEnrolled) => {
    try {
      const res = await apiFetch('/api/admin/enrollments', {
        method: 'POST',
        body: JSON.stringify({
          studentId: selectedStudent.id,
          courseId,
          action: isEnrolled ? 'unenroll' : 'enroll'
        })
      })
      if (res.success) {
        toast.success(res.message)
        setStudentEnrolledIds(prev => 
          isEnrolled ? prev.filter(id => id !== courseId) : [...prev, courseId]
        )
      }
    } catch (err) {
      toast.error(err.message || "Failed to update enrollment")
    }
  }

  const filteredUsers = usersList.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role.toLowerCase() === filterRole.toLowerCase()
    const matchesStatus = filterStatus === 'all' || user.status.toLowerCase() === filterStatus.toLowerCase()
    return matchesSearch && matchesRole && matchesStatus
  })

  const UserTable = ({ data }) => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Name</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Role</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Department</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Joined Date</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((user) => (
            <tr key={user.id} className="border-b border-border/50 hover:bg-muted/50">
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  </div>
                  <span className="font-medium text-foreground">{user.name}</span>
                </div>
              </td>
              <td className="py-3 px-4 text-muted-foreground">{user.email}</td>
              <td className="py-3 px-4">
                <Badge variant="outline">{user.role}</Badge>
              </td>
              <td className="py-3 px-4 text-foreground">{user.department}</td>
              <td className="py-3 px-4">
                <StatusBadge status={user.status} />
              </td>
              <td className="py-3 px-4 text-muted-foreground">{user.joinedDate}</td>
              <td className="py-3 px-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="gap-2">
                      <Eye className="h-4 w-4" /> View Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2" onClick={() => {
                      setEditingUser(user)
                      setIsEditDialogOpen(true)
                    }}>
                      <Edit className="h-4 w-4" /> Edit User
                    </DropdownMenuItem>
                    {user.role === 'Student' && (
                      <DropdownMenuItem className="gap-2 text-primary" onClick={() => openEnrollDialog(user)}>
                        <BookOpen className="h-4 w-4" /> Manage Enrollment
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem className="gap-2 text-destructive" onClick={() => handleDeleteUser(user.id)}>
                      <Trash2 className="h-4 w-4" /> Delete User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar 
        title="Manage Users" 
        userRole="Administrator"
        userName="Admin User"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Manage Users' }
        ]}
      />
      
      <main className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-1 gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search users..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="instructor">Instructor</SelectItem>
                <SelectItem value="student">Student</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>Create a new user account</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input 
                    placeholder="Enter full name" 
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    type="email" 
                    placeholder="Enter email" 
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input 
                    type="password" 
                    placeholder="Enter password" 
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={newUser.role} onValueChange={(val) => setNewUser({...newUser, role: val})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Instructor">Instructor</SelectItem>
                      <SelectItem value="Student">Student</SelectItem>
                      <SelectItem value="Admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Input 
                    placeholder="e.g. Computer Science" 
                    value={newUser.department}
                    onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateUser}>Create User</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit User Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Edit User</DialogTitle>
                <DialogDescription>Update user information</DialogDescription>
              </DialogHeader>
              {editingUser && (
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input 
                      value={editingUser.name}
                      onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={editingUser.status} onValueChange={(val) => setEditingUser({...editingUser, status: val})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Input 
                      value={editingUser.department}
                      onChange={(e) => setEditingUser({...editingUser, department: e.target.value})}
                    />
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleUpdateUser}>Update User</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{usersList.length}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{usersList.filter(u => u.role === 'Instructor').length}</p>
                  <p className="text-sm text-muted-foreground">Instructors</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{usersList.filter(u => u.role === 'Student').length}</p>
                  <p className="text-sm text-muted-foreground">Students</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table with Tabs */}
        <Card className="bg-card border-border">
          <Tabs defaultValue="all" className="w-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Users List</CardTitle>
                <TabsList>
                  <TabsTrigger value="all">All Users</TabsTrigger>
                  <TabsTrigger value="instructors">Instructors</TabsTrigger>
                  <TabsTrigger value="students">Students</TabsTrigger>
                </TabsList>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <p className="text-muted-foreground">Loading users...</p>
                </div>
              ) : (
                <>
                  <TabsContent value="all" className="mt-0">
                    <UserTable data={filteredUsers} />
                  </TabsContent>
                  <TabsContent value="instructors" className="mt-0">
                    <UserTable data={filteredUsers.filter(u => u.role === 'Instructor')} />
                  </TabsContent>
                  <TabsContent value="students" className="mt-0">
                    <UserTable data={filteredUsers.filter(u => u.role === 'Student')} />
                  </TabsContent>
                </>
              )}
            </CardContent>
          </Tabs>
        </Card>

        {/* Enrollment Dialog */}
        <Dialog open={isEnrollDialogOpen} onOpenChange={setIsEnrollDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Manage Enrollment: {selectedStudent?.name}</DialogTitle>
              <DialogDescription>Assign or remove courses for this student</DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {enrollLoading ? (
                <div className="flex items-center justify-center py-10">
                  <p className="text-muted-foreground animate-pulse">Loading courses...</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {allCourses.map(course => {
                    const isEnrolled = studentEnrolledIds.includes(course._id)
                    return (
                      <div key={course._id} className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border/50 hover:bg-muted transition-colors">
                        <div>
                          <p className="font-semibold text-foreground">{course.code}: {course.name}</p>
                          <p className="text-xs text-muted-foreground">Instructor: {course.instructor?.name || 'Unassigned'}</p>
                        </div>
                        <Button 
                          variant={isEnrolled ? "destructive" : "default"} 
                          size="sm"
                          onClick={() => toggleEnrollment(course._id, isEnrolled)}
                          className="gap-2"
                        >
                          {isEnrolled ? (
                            <>Unenroll</>
                          ) : (
                            <>
                              <Plus className="h-4 w-4" />
                              Enroll
                            </>
                          )}
                        </Button>
                      </div>
                    )
                  })}
                  {allCourses.length === 0 && (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground">No courses available. Create a course first.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => setIsEnrollDialogOpen(false)}>Done</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
