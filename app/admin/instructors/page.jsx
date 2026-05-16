'use client'

import { useState } from 'react'
import { 
  GraduationCap, 
  Search, 
  Plus,
  MoreVertical,
  Mail,
  Phone,
  BookOpen,
  Users,
  Star,
  Edit,
  Trash2,
  Eye
} from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { StatsCard, StatusBadge, ProgressBar } from '@/components/dashboard-components'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
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
import { apiFetch } from '@/lib/api-client'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { PendingInstructorsPanel } from '@/components/pending-instructors-panel'

export default function AdminInstructorsPage() {
  const [instructors, setInstructors] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDepartment, setFilterDepartment] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingInstructor, setEditingInstructor] = useState(null)
  const [newInstructor, setNewInstructor] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    department: '',
    role: 'Instructor'
  })

  const fetchInstructors = async () => {
    try {
      setLoading(true)
      const res = await apiFetch('/api/admin/users?role=Instructor&limit=100')
      if (res.success) {
        const mapped = (res.data.users || []).map((u) => ({
          id: u._id,
          name: u.name,
          email: u.email,
          department: u.department || 'N/A',
          phone: u.phone || '—',
          status: u.status,
          approvalStatus: u.approvalStatus,
          avatar: u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.email}`,
          courses: u.coursesCount || 0,
          students: u.studentsCount || 0,
          rating: u.rating || 4.5,
        }))
        setInstructors(mapped)
      }
    } catch (err) {
      if (err?.status !== 401 && err?.status !== 403) {
        console.error("Failed to load instructors", err)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInstructors()
  }, [])

  const handleCreateInstructor = async () => {
    try {
      const res = await apiFetch('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(newInstructor)
      })
      if (res.success) {
        toast.success('Instructor added successfully')
        setIsAddDialogOpen(false)
        setNewInstructor({ name: '', email: '', password: '', phone: '', department: '', role: 'Instructor' })
        fetchInstructors()
      }
    } catch (err) {
      toast.error(err.message || 'Failed to add instructor')
    }
  }

  const handleUpdateInstructor = async () => {
    try {
      const res = await apiFetch(`/api/admin/users/${editingInstructor.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: editingInstructor.name,
          status: editingInstructor.status,
          department: editingInstructor.department,
          phone: editingInstructor.phone
        })
      })
      if (res.success) {
        toast.success('Instructor updated successfully')
        setIsEditDialogOpen(false)
        fetchInstructors()
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update instructor')
    }
  }

  const handleDeleteInstructor = async (id) => {
    if (!confirm('Are you sure you want to delete this instructor?')) return
    try {
      const res = await apiFetch(`/api/admin/users/${id}`, {
        method: 'DELETE'
      })
      if (res.success) {
        toast.success('Instructor deleted successfully')
        fetchInstructors()
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete instructor')
    }
  }

  const departments = [...new Set(instructors.map(i => i.department))]

  const filteredInstructors = instructors.filter(instructor => {
    const matchesSearch = instructor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         instructor.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDepartment = filterDepartment === 'all' || instructor.department === filterDepartment
    const matchesStatus = filterStatus === 'all' || instructor.status.toLowerCase() === filterStatus.toLowerCase()
    return matchesSearch && matchesDepartment && matchesStatus
  })

  const stats = {
    total: instructors.length,
    active: instructors.filter(i => i.status === 'Active').length,
    totalCourses: instructors.reduce((acc, i) => acc + i.courses, 0),
    totalStudents: instructors.reduce((acc, i) => acc + i.students, 0),
    avgRating: (instructors.reduce((acc, i) => acc + i.rating, 0) / instructors.length).toFixed(1)
  }

  const InstructorCard = ({ instructor }) => (
    <Card className="bg-card border-border hover:border-primary/50 transition-all group">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <img 
              src={instructor.avatar} 
              alt={instructor.name}
              className="h-16 w-16 rounded-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-foreground">{instructor.name}</h3>
                <p className="text-sm text-muted-foreground">{instructor.department}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="gap-2">
                    <Eye className="h-4 w-4" /> View Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2" onClick={() => {
                    setEditingInstructor(instructor)
                    setIsEditDialogOpen(true)
                  }}>
                    <Edit className="h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2 text-destructive" onClick={() => handleDeleteInstructor(instructor.id)}>
                    <Trash2 className="h-4 w-4" /> Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="flex items-center gap-4 mt-3 text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span className="truncate">{instructor.email}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{instructor.phone}</span>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-yellow-500">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="font-semibold text-foreground">{instructor.rating}</span>
                </div>
                <p className="text-xs text-muted-foreground">Rating</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-foreground">{instructor.courses}</span>
                </div>
                <p className="text-xs text-muted-foreground">Courses</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Users className="h-4 w-4 text-green-500" />
                  <span className="font-semibold text-foreground">{instructor.students}</span>
                </div>
                <p className="text-xs text-muted-foreground">Students</p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <StatusBadge status={instructor.status} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar 
        title="Manage Instructors" 
        userRole="Administrator"
        userName="Admin User"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Instructors' }
        ]}
      />
      
      <main className="flex-1 p-6 space-y-6 overflow-auto">
        <PendingInstructorsPanel />
        {loading && <p className="text-muted-foreground text-sm">Loading instructors...</p>}
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatsCard title="Total Instructors" value={stats.total} icon={GraduationCap} />
          <StatsCard title="Active" value={stats.active} icon={Users} trend="+5%" />
          <StatsCard title="Total Courses" value={stats.totalCourses} icon={BookOpen} />
          <StatsCard title="Total Students" value={stats.totalStudents} icon={Users} trend="+12%" />
          <StatsCard title="Avg Rating" value={stats.avgRating} icon={Star} trend="+0.2" />
        </div>

        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-1 gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search instructors..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
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
                Add Instructor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Instructor</DialogTitle>
                <DialogDescription>Register a new instructor in the system</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input 
                      placeholder="Enter full name" 
                      value={newInstructor.name}
                      onChange={(e) => setNewInstructor({...newInstructor, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input 
                      type="email" 
                      placeholder="Enter email" 
                      value={newInstructor.email}
                      onChange={(e) => setNewInstructor({...newInstructor, email: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input 
                      type="password" 
                      placeholder="Enter password" 
                      value={newInstructor.password}
                      onChange={(e) => setNewInstructor({...newInstructor, password: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input 
                      placeholder="+92 xxx xxxxxxx" 
                      value={newInstructor.phone}
                      onChange={(e) => setNewInstructor({...newInstructor, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Input 
                    placeholder="e.g. Computer Science" 
                    value={newInstructor.department}
                    onChange={(e) => setNewInstructor({...newInstructor, department: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateInstructor}>Add Instructor</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Instructor Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Instructor</DialogTitle>
                <DialogDescription>Update instructor information</DialogDescription>
              </DialogHeader>
              {editingInstructor && (
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input 
                      value={editingInstructor.name}
                      onChange={(e) => setEditingInstructor({...editingInstructor, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={editingInstructor.status} onValueChange={(val) => setEditingInstructor({...editingInstructor, status: val})}>
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
                      value={editingInstructor.department}
                      onChange={(e) => setEditingInstructor({...editingInstructor, department: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input 
                      value={editingInstructor.phone}
                      onChange={(e) => setEditingInstructor({...editingInstructor, phone: e.target.value})}
                    />
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleUpdateInstructor}>Update Instructor</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Instructors Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">All Instructors</h2>
            <Badge variant="outline">{filteredInstructors.length} instructors</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInstructors.map(instructor => (
              <InstructorCard key={instructor.id} instructor={instructor} />
            ))}
          </div>
        </div>

        {/* Instructors Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Instructor Details</CardTitle>
            <CardDescription>Complete list of all instructors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Department</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Courses</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Students</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Rating</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInstructors.map(instructor => (
                    <tr key={instructor.id} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={instructor.avatar}
                            alt={instructor.name}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                          <span className="font-medium text-foreground">{instructor.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{instructor.email}</td>
                      <td className="py-3 px-4 text-foreground">{instructor.department}</td>
                      <td className="py-3 px-4 text-foreground">{instructor.courses}</td>
                      <td className="py-3 px-4 text-foreground">{instructor.students}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-foreground">{instructor.rating}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={instructor.status} />
                      </td>
                      <td className="py-3 px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2">
                              <Eye className="h-4 w-4" /> View
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2" onClick={() => {
                              setEditingInstructor(instructor)
                              setIsEditDialogOpen(true)
                            }}>
                              <Edit className="h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-destructive" onClick={() => handleDeleteInstructor(instructor.id)}>
                              <Trash2 className="h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
