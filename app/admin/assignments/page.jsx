'use client'


import { 
  FileText, 
  Search, 
  Plus,
  Calendar,
  Clock,
  Users,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  TrendingUp
} from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { StatsCard, StatusBadge, ProgressBar } from '@/components/dashboard-components'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { apiFetch } from '@/lib/api-client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

export default function AdminAssignmentsPage() {
  const [assignmentsList, setAssignmentsList] = useState([])
  const [coursesList, setCoursesList] = useState([])
  const [instructorsList, setInstructorsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState(null)
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    course: '',
    instructor: '',
    totalMarks: 100,
    deadline: '',
    description: '',
    subject: ''
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      const [assignmentsRes, coursesRes, instructorsRes] = await Promise.all([
        apiFetch('/api/admin/assignments?limit=100'),
        apiFetch('/api/admin/courses?limit=100'),
        apiFetch('/api/admin/users?role=Instructor&limit=100')
      ])
      
      if (assignmentsRes.success) {
        setAssignmentsList(assignmentsRes.data.assignments)
      }
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

  const handleCreateAssignment = async () => {
    try {
      if (!newAssignment.course) return toast.error('Please select a course')
      if (!newAssignment.instructor) return toast.error('Please select an instructor')
      
      const selectedCourse = coursesList.find(c => c._id === newAssignment.course)
      const payload = {
        ...newAssignment,
        subject: selectedCourse?.code || ''
      }

      const res = await apiFetch('/api/admin/assignments', {
        method: 'POST',
        body: JSON.stringify(payload)
      })
      if (res.success) {
        toast.success('Assignment created successfully')
        setIsAddDialogOpen(false)
        setNewAssignment({ title: '', course: '', instructor: '', totalMarks: 100, deadline: '', description: '', subject: '' })
        fetchData()
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create assignment')
    }
  }

  const handleUpdateAssignment = async () => {
    try {
      const res = await apiFetch(`/api/admin/assignments/${editingAssignment._id}`, {
        method: 'PUT',
        body: JSON.stringify(editingAssignment)
      })
      if (res.success) {
        toast.success('Assignment updated successfully')
        setIsEditDialogOpen(false)
        fetchData()
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update assignment')
    }
  }

  const handleDeleteAssignment = async (id) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return
    try {
      const res = await apiFetch(`/api/admin/assignments/${id}`, {
        method: 'DELETE'
      })
      if (res.success) {
        toast.success('Assignment deleted successfully')
        fetchData()
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete assignment')
    }
  }

  const filteredAssignments = assignmentsList.filter(assignment => 
    assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (assignment.subject || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalSubmissions = assignmentsList.reduce((acc, a) => acc + (a.submissionsCount || 0), 0)
  const totalStudents = assignmentsList.reduce((acc, a) => acc + (a.totalStudents || 0), 0)
  const submissionData = [
    { name: 'Submitted', value: totalSubmissions || 0, color: '#22c55e' },
    { name: 'Pending', value: Math.max(0, totalStudents - totalSubmissions), color: '#f59e0b' },
  ]

  const AssignmentCard = ({ assignment }) => {
    const isOverdue = new Date(assignment.deadline) < new Date() && assignment.status !== 'Completed'

    const submissionPercentage = assignment.totalStudents > 0 
      ? Math.round(((assignment.submissionsCount || 0) / assignment.totalStudents) * 100) 
      : 0

    return (
      <Card className="bg-card border-border hover:border-primary/50 transition-all">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">{assignment.title}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <span className="font-medium text-primary">{assignment.course?.code || assignment.subject}</span>
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="gap-2" onClick={() => {
                  setEditingAssignment(assignment)
                  setIsEditDialogOpen(true)
                }}>
                  <Edit className="h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 text-destructive" onClick={() => handleDeleteAssignment(assignment._id)}>
                  <Trash2 className="h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2">{assignment.description}</p>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Due: {new Date(assignment.deadline).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>{assignment.totalMarks} marks</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Submissions</span>
              <span className="font-medium text-foreground">{assignment.submissionsCount || 0}/{assignment.totalStudents || 0}</span>
            </div>
            <ProgressBar value={submissionPercentage} showLabel={false} />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <StatusBadge status={isOverdue ? 'Late' : assignment.status} />
            <span className="text-xs text-muted-foreground">By: {assignment.instructor?.name || 'Unknown'}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar 
        title="Assignment Management" 
        userRole="Administrator"
        userName="Admin User"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Assignments' }
        ]}
      />
      
      <main className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatsCard title="Total Assignments" value={assignmentsList.length} icon={FileText} />
          <StatsCard title="Real Submissions" value={totalSubmissions} icon={Users} />
          <StatsCard title="Avg Marks" value={assignmentsList.length > 0 ? Math.round(assignmentsList.reduce((acc, a) => acc + (a.totalMarks || 0), 0) / assignmentsList.length) : 0} icon={TrendingUp} />
          <StatsCard title="Active Assignments" value={assignmentsList.filter(a => a.status === 'Active').length} icon={Clock} />
        </div>

        {/* Submission Overview Chart */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Global Submission Overview</CardTitle>
            <CardDescription>Visualizing submission data across all active assignments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={submissionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {submissionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search assignments..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Assignment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Assignment</DialogTitle>
                <DialogDescription>Add a new assignment to the system</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Assignment Title</Label>
                  <Input 
                    placeholder="Enter assignment title" 
                    value={newAssignment.title}
                    onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Course</Label>
                    <Select value={newAssignment.course} onValueChange={(val) => setNewAssignment({...newAssignment, course: val})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        {coursesList.map((course) => (
                          <SelectItem key={course._id} value={course._id}>{course.code} - {course.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Instructor</Label>
                    <Select value={newAssignment.instructor} onValueChange={(val) => setNewAssignment({...newAssignment, instructor: val})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select instructor" />
                      </SelectTrigger>
                      <SelectContent>
                        {instructorsList.map((inst) => (
                          <SelectItem key={inst._id} value={inst._id}>{inst.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Total Marks</Label>
                    <Input 
                      type="number" 
                      placeholder="100" 
                      value={newAssignment.totalMarks}
                      onChange={(e) => setNewAssignment({...newAssignment, totalMarks: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Deadline</Label>
                    <Input 
                      type="datetime-local" 
                      value={newAssignment.deadline}
                      onChange={(e) => setNewAssignment({...newAssignment, deadline: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea 
                    placeholder="Enter assignment description" 
                    rows={3} 
                    value={newAssignment.description}
                    onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateAssignment}>Create Assignment</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Edit Assignment</DialogTitle>
                <DialogDescription>Update assignment details</DialogDescription>
              </DialogHeader>
              {editingAssignment && (
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Assignment Title</Label>
                    <Input 
                      value={editingAssignment.title}
                      onChange={(e) => setEditingAssignment({...editingAssignment, title: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Total Marks</Label>
                      <Input 
                        type="number" 
                        value={editingAssignment.totalMarks}
                        onChange={(e) => setEditingAssignment({...editingAssignment, totalMarks: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={editingAssignment.status} onValueChange={(val) => setEditingAssignment({...editingAssignment, status: val})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Deadline</Label>
                    <Input 
                      type="datetime-local" 
                      value={new Date(editingAssignment.deadline).toISOString().slice(0, 16)}
                      onChange={(e) => setEditingAssignment({...editingAssignment, deadline: e.target.value})}
                    />
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleUpdateAssignment}>Update Assignment</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Assignment Cards */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">All Assignments</h2>
          {loading ? (
            <p className="text-muted-foreground">Loading assignments...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAssignments.map((assignment) => (
                <AssignmentCard key={assignment._id} assignment={assignment} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
