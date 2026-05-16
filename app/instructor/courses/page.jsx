"use client"

import { useState } from "react"
import { 
  Plus, 
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Calendar,
  BookOpen,
  Users,
  FileText,
  Loader2
} from "lucide-react"
import { useEffect } from "react"
import { Navbar } from '@/components/navbar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useApi } from '@/hooks/use-api'
import { apiFetch } from '@/lib/api-client'
import { toast } from "sonner"
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Dynamic data will be fetched from API

export default function InstructorCoursesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [newCourse, setNewCourse] = useState({
    code: "",
    name: "",
    description: "",
    semester: ""
  })

  const { data: dash, loading, refetch } = useApi('/api/instructor/courses')
  const coursesData = dash?.courses || []
  const user = dash?.user || {}
  const userName = user.name || "Instructor"

  const filteredCourses = coursesData.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenCreate = () => {
    setEditingCourse(null)
    setNewCourse({ code: "", name: "", description: "", semester: "" })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (course) => {
    setEditingCourse(course)
    setNewCourse({
      code: course.code,
      name: course.name,
      description: course.description,
      semester: course.semester
    })
    setIsDialogOpen(true)
  }

  const handleSaveCourse = async () => {
    console.log("Saving course. Editing:", editingCourse ? "Yes" : "No", newCourse);
    if (!newCourse.name || !newCourse.code) {
      toast.error("Name and Code are required")
      return
    }

    setIsCreating(true)
    try {
      const url = editingCourse 
        ? `/api/instructor/courses/${editingCourse._id}` 
        : '/api/instructor/courses'
      const method = editingCourse ? 'PUT' : 'POST'
      
      console.log(`Sending ${method} request to ${url}`);

      const data = await apiFetch(url, {
        method,
        body: JSON.stringify(newCourse)
      })
      
      console.log("Save response data:", data);

      if (data.success) {
        toast.success(editingCourse ? "Course updated successfully" : "Course created successfully")
        setIsDialogOpen(false)
        setEditingCourse(null)
        setNewCourse({ code: "", name: "", description: "", semester: "" })
        refetch()
      } else {
        toast.error(data.message || "Failed to save course")
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error(err.message || "An error occurred")
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteCourse = async (id) => {
    console.log("Delete button clicked for ID:", id)
    if (!window.confirm("Are you sure you want to delete this course?")) {
      console.log("Deletion cancelled by user")
      return
    }

    try {
      const url = `/api/instructor/courses/${id}`;
      console.log("Sending DELETE request to:", url);
      
      const data = await apiFetch(url, {
        method: 'DELETE'
      })
      console.log("Delete response data:", data)

      if (data.success) {
        toast.success("Course deleted successfully")
        refetch()
      } else {
        toast.error(data.message || "Failed to delete course")
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err.message || "An error occurred")
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading courses...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar 
        title="My Courses" 
        userRole="Instructor"
        userName={userName}
        breadcrumbs={[
          { label: 'Instructor', href: '/instructor' },
          { label: 'Courses' }
        ]}
      />
      
      <main className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Course Management</h2>
            <p className="text-muted-foreground">Manage your courses, materials, and assignments</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <Button className="gap-2" onClick={handleOpenCreate}>
              <Plus className="w-4 h-4" />
              Create Course
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingCourse ? 'Edit Course' : 'Create New Course'}</DialogTitle>
                <DialogDescription>
                  {editingCourse ? 'Update your course details' : 'Add a new course to your teaching portfolio'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Course Code</Label>
                    <Input 
                      placeholder="e.g., CS501" 
                      value={newCourse.code}
                      onChange={(e) => setNewCourse({...newCourse, code: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Semester</Label>
                    <Select 
                      value={newCourse.semester}
                      onValueChange={(val) => setNewCourse({...newCourse, semester: val})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fall 2024">Fall 2024</SelectItem>
                        <SelectItem value="Spring 2025">Spring 2025</SelectItem>
                        <SelectItem value="Summer 2025">Summer 2025</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Course Name</Label>
                  <Input 
                    placeholder="e.g., Advanced Algorithms" 
                    value={newCourse.name}
                    onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea 
                    placeholder="Course description..." 
                    rows={3} 
                    value={newCourse.description}
                    onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveCourse} disabled={isCreating}>
                  {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingCourse ? 'Update Course' : 'Create Course'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{coursesData.length}</p>
                  <p className="text-sm text-muted-foreground">Total Courses</p>
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
                  <p className="text-2xl font-bold text-foreground">
                    {coursesData.reduce((sum, c) => sum + (c.students || 0), 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {coursesData.reduce((sum, c) => sum + (c.assignmentCount || 0), 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Assignments</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    0
                  </p>
                  <p className="text-sm text-muted-foreground">Materials</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course._id || course.id} className="bg-card border-border hover:border-primary/50 transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{course.code} - {course.name}</h3>
                      <p className="text-sm text-muted-foreground">{course.semester}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="gap-2">
                        <Eye className="h-4 w-4" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2" onSelect={() => handleOpenEdit(course)}>
                        <Edit className="h-4 w-4" /> Edit Course
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-destructive" onSelect={() => handleDeleteCourse(course._id)}>
                        <Trash2 className="h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <p className="text-sm text-muted-foreground mb-4">{course.description}</p>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2 text-sm">
                    <span className="text-muted-foreground">Course Progress</span>
                    <span className="font-medium text-foreground">{course.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" /> {course.students}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-4 w-4" /> {course.assignmentCount || 0}
                    </span>
                  </div>
                  <Badge className="bg-green-500/10 text-green-500">{course.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No courses found</h3>
            <p className="text-muted-foreground">Try adjusting your search</p>
          </div>
        )}
      </main>
    </div>
  )
}
