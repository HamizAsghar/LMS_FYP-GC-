'use client'

import { useState } from 'react'
import { 
  BookOpen, 
  Search, 
  Plus,
  MoreVertical,
  Users,
  Calendar,
  Edit,
  Trash2,
  Eye,
  GraduationCap
} from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { StatusBadge } from '@/components/dashboard-components'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
import { Textarea } from '@/components/ui/textarea'
import { apiFetch } from '@/lib/api-client'
import { useEffect } from 'react'
import { toast } from 'sonner'

export default function ManageCoursesPage() {
  const [coursesList, setCoursesList] = useState([])
  const [instructorsList, setInstructorsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [newCourse, setNewCourse] = useState({
    name: '',
    code: '',
    instructor: '',
    semester: 'Fall 2026',
    category: '',
    description: ''
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      const [coursesRes, instructorsRes] = await Promise.all([
        apiFetch('/api/admin/courses?limit=100'),
        apiFetch('/api/admin/users?role=Instructor&limit=100')
      ])
      
      if (coursesRes.success) {
        setCoursesList(coursesRes.data.courses)
      }
      if (instructorsRes.success) {
        setInstructorsList(instructorsRes.data.users)
      }
    } catch (err) {
      if (err?.status !== 401 && err?.status !== 403) {
        console.error("Failed to load data", err)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreateCourse = async () => {
    try {
      const res = await apiFetch('/api/admin/courses', {
        method: 'POST',
        body: JSON.stringify(newCourse)
      })
      if (res.success) {
        toast.success('Course created successfully')
        setIsAddDialogOpen(false)
        setNewCourse({ name: '', code: '', instructor: '', semester: 'Fall 2026', category: '', description: '' })
        fetchData()
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create course')
    }
  }

  const handleUpdateCourse = async () => {
    try {
      const res = await apiFetch(`/api/admin/courses/${editingCourse._id}`, {
        method: 'PUT',
        body: JSON.stringify(editingCourse)
      })
      if (res.success) {
        toast.success('Course updated successfully')
        setIsEditDialogOpen(false)
        fetchData()
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update course')
    }
  }

  const handleDeleteCourse = async (id) => {
    if (!confirm('Are you sure you want to delete this course?')) return
    try {
      const res = await apiFetch(`/api/admin/courses/${id}`, {
        method: 'DELETE'
      })
      if (res.success) {
        toast.success('Course deleted successfully')
        fetchData()
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete course')
    }
  }

  const filteredCourses = coursesList.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (course.instructor?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === 'all' || course.category?.toLowerCase() === filterCategory.toLowerCase()
    return matchesSearch && matchesCategory
  })

  const CourseCard = ({ course }) => (
    <Card className="bg-card border-border hover:border-primary/50 transition-all group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{course.name}</CardTitle>
              <CardDescription>{course.code}</CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="gap-2">
                <Eye className="h-4 w-4" /> View Details
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2" onClick={() => {
                setEditingCourse(course)
                setIsEditDialogOpen(true)
              }}>
                <Edit className="h-4 w-4" /> Edit Course
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 text-destructive" onClick={() => handleDeleteCourse(course._id)}>
                <Trash2 className="h-4 w-4" /> Delete Course
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <GraduationCap className="h-4 w-4" />
          <span>{course.instructor?.name || 'No Instructor'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{course.semester}</span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground font-medium">{course.students}</span>
            <span className="text-muted-foreground">students</span>
          </div>
          <StatusBadge status={course.status} />
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar 
        title="Manage Courses" 
        userRole="Administrator"
        userName="Admin User"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Manage Courses' }
        ]}
      />
      
      <main className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-1 gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search courses..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Computer Science">Computer Science</SelectItem>
                <SelectItem value="Artificial Intelligence">Artificial Intelligence</SelectItem>
                <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                <SelectItem value="Information Technology">Information Technology</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Course
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Course</DialogTitle>
                <DialogDescription>Create a new course in the system</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Course Name</Label>
                    <Input 
                      placeholder="Enter course name" 
                      value={newCourse.name}
                      onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Course Code</Label>
                    <Input 
                      placeholder="e.g. CS101" 
                      value={newCourse.code}
                      onChange={(e) => setNewCourse({...newCourse, code: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Instructor</Label>
                  <Select value={newCourse.instructor} onValueChange={(val) => setNewCourse({...newCourse, instructor: val})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select instructor" />
                    </SelectTrigger>
                    <SelectContent>
                      {instructorsList.map((instructor) => (
                        <SelectItem key={instructor._id} value={instructor._id}>
                          {instructor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Semester</Label>
                    <Select value={newCourse.semester} onValueChange={(val) => setNewCourse({...newCourse, semester: val})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Spring 2026">Spring 2026</SelectItem>
                        <SelectItem value="Fall 2026">Fall 2026</SelectItem>
                        <SelectItem value="Summer 2026">Summer 2026</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={newCourse.category} onValueChange={(val) => setNewCourse({...newCourse, category: val})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Computer Science">Computer Science</SelectItem>
                        <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                        <SelectItem value="Information Technology">Information Technology</SelectItem>
                        <SelectItem value="Artificial Intelligence">Artificial Intelligence</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea 
                    placeholder="Enter course description" 
                    rows={3} 
                    value={newCourse.description}
                    onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateCourse}>Create Course</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Course Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Edit Course</DialogTitle>
                <DialogDescription>Update course information</DialogDescription>
              </DialogHeader>
              {editingCourse && (
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Course Name</Label>
                      <Input 
                        value={editingCourse.name}
                        onChange={(e) => setEditingCourse({...editingCourse, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Course Code</Label>
                      <Input 
                        value={editingCourse.code}
                        onChange={(e) => setEditingCourse({...editingCourse, code: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Instructor</Label>
                    <Select value={editingCourse.instructor?._id || editingCourse.instructor} onValueChange={(val) => setEditingCourse({...editingCourse, instructor: val})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {instructorsList.map((instructor) => (
                          <SelectItem key={instructor._id} value={instructor._id}>
                            {instructor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={editingCourse.status} onValueChange={(val) => setEditingCourse({...editingCourse, status: val})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={editingCourse.category} onValueChange={(val) => setEditingCourse({...editingCourse, category: val})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Computer Science">Computer Science</SelectItem>
                          <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                          <SelectItem value="Information Technology">Information Technology</SelectItem>
                          <SelectItem value="Artificial Intelligence">Artificial Intelligence</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleUpdateCourse}>Update Course</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{coursesList.length}</p>
                  <p className="text-sm text-muted-foreground">Total Courses</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{coursesList.filter(c => c.status === 'Active').length}</p>
                  <p className="text-sm text-muted-foreground">Active Courses</p>
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
                  <p className="text-2xl font-bold text-foreground">{coursesList.reduce((acc, c) => acc + (c.students || 0), 0)}</p>
                  <p className="text-sm text-muted-foreground">Total Enrollments</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{instructorsList.length}</p>
                  <p className="text-sm text-muted-foreground">Available Instructors</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course Grid */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">All Courses</h2>
          {loading ? (
            <p className="text-muted-foreground">Loading courses...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
