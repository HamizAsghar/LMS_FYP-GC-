'use client'

import { useState } from 'react'
import { 
  FileText, 
  Clock, 
  AlertCircle,
  CheckCircle,
  Search,
  Filter,
  Upload,
  ChevronRight
} from 'lucide-react'
import { Navbar } from '@/components/navbar'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

import { apiFetch } from '@/lib/api-client'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/auth-context'

export default function StudentAssignmentsPage() {
  const { user: authUser } = useAuth()
  const [assignmentsList, setAssignmentsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [courseFilter, setCourseFilter] = useState('all')

  const fetchAssignments = async () => {
    try {
      setLoading(true)
      const res = await apiFetch('/api/student/assignments')
      if (res.success) {
        setAssignmentsList(res.data)
      }
    } catch (err) {
      if (err?.status !== 401 && err?.status !== 403) {
        toast.error('Failed to load assignments')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAssignments()
  }, [])

  const filteredAssignments = assignmentsList.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCourse = courseFilter === 'all' || assignment.course?.code === courseFilter
    return matchesSearch && matchesCourse
  })

  const pendingAssignments = filteredAssignments.filter(a => a.submissionStatus === 'Pending' || a.submissionStatus === 'Not Submitted')
  const submittedAssignments = filteredAssignments.filter(a => a.submissionStatus === 'Submitted')
  const gradedAssignments = filteredAssignments.filter(a => a.submissionStatus === 'Graded')

  const courses = [...new Set(assignmentsList.map(a => a.course?.code).filter(Boolean))]

  const getStatusBadge = (status, urgent) => {
    if (status === 'pending' && urgent) {
      return <Badge variant="destructive">Urgent</Badge>
    }
    if (status === 'pending') {
      return <Badge variant="outline" className="text-yellow-500 border-yellow-500">Pending</Badge>
    }
    if (status === 'submitted') {
      return <Badge variant="outline" className="text-blue-500 border-blue-500">Submitted</Badge>
    }
    return <Badge className="bg-green-500/10 text-green-500">Graded</Badge>
  }

  const getTypeBadge = (type) => {
    const colors = {
      programming: 'bg-purple-500/10 text-purple-500',
      design: 'bg-pink-500/10 text-pink-500',
      report: 'bg-blue-500/10 text-blue-500',
      lab: 'bg-green-500/10 text-green-500'
    }
    return <Badge className={colors[type] || 'bg-gray-500/10 text-gray-500'}>{type}</Badge>
  }

  const AssignmentCard = ({ assignment }) => (
    <Card className={`bg-card border-border ${assignment.urgent ? 'border-red-500/50' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{assignment.course?.code}</Badge>
            {getTypeBadge(assignment.type || 'programming')}
          </div>
          {getStatusBadge(assignment.submissionStatus?.toLowerCase(), assignment.urgent)}
        </div>
        
        <h3 className="font-semibold text-foreground mb-1">{assignment.title}</h3>
        <p className="text-sm text-muted-foreground mb-3">{assignment.course?.name}</p>
        <p className="text-xs text-primary mb-3">Instructor: {assignment.instructor?.name || 'Faculty'}</p>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{assignment.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className={assignment.urgent ? 'text-red-500 font-medium' : 'text-muted-foreground'}>
              {assignment.submissionStatus === 'Pending' || assignment.submissionStatus === 'Not Submitted' ? `Due: ${new Date(assignment.dueDate).toLocaleDateString()}` : `Submitted: ${new Date(assignment.submittedAt).toLocaleDateString()}`}
            </span>
          </div>
          {assignment.submissionStatus === 'Pending' || assignment.submissionStatus === 'Not Submitted' ? (
            <Link href={`/student/submit-assignment?assignmentId=${assignment._id}`}>
              <Button variant="default" size="sm">
                Submit
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          ) : (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  View
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>{assignment.title}</DialogTitle>
                  <DialogDescription>
                    {assignment.course?.name} - {assignment.course?.code}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground">Description</Label>
                    <p className="text-foreground mt-1">{assignment.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Due Date</Label>
                      <p className="text-foreground mt-1">{new Date(assignment.dueDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Max Score</Label>
                      <p className="text-foreground mt-1">{assignment.totalPoints || 100} points</p>
                    </div>
                  </div>
                  
                  {assignment.submissionStatus === 'Graded' && (
                    <>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-muted-foreground">Your Score</span>
                          <span className={`text-2xl font-bold ${assignment.marksObtained >= (assignment.totalPoints * 0.8) ? 'text-green-500' : assignment.marksObtained >= (assignment.totalPoints * 0.6) ? 'text-yellow-500' : 'text-red-500'}`}>
                            {assignment.marksObtained}/{assignment.totalPoints}
                          </span>
                        </div>
                      </div>
                      {assignment.feedback && (
                        <div>
                          <Label className="text-muted-foreground">Instructor Feedback</Label>
                          <p className="text-foreground mt-1 p-3 bg-muted/50 rounded-lg">{assignment.feedback}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
        
        {assignment.submissionStatus === 'Graded' && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Score</span>
              <span className={`font-bold ${assignment.marksObtained >= (assignment.totalPoints * 0.8) ? 'text-green-500' : assignment.marksObtained >= (assignment.totalPoints * 0.6) ? 'text-yellow-500' : 'text-red-500'}`}>
                {assignment.marksObtained}/{assignment.totalPoints}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar 
        title="Assignments" 
        userRole="Student"
        userName={authUser?.name || "Student"}
        breadcrumbs={[
          { label: 'Student', href: '/student' },
          { label: 'Assignments' }
        ]}
      />
      
      <main className="flex-1 p-6 overflow-auto bg-background/50">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-muted-foreground">Loading assignments...</p>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/10 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pending</p>
                      <p className="text-2xl font-bold text-foreground">{pendingAssignments.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Clock className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Awaiting Grade</p>
                      <p className="text-2xl font-bold text-foreground">{submittedAssignments.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Graded</p>
                      <p className="text-2xl font-bold text-foreground">{gradedAssignments.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search assignments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Tabs defaultValue="pending" className="space-y-6">
              <TabsList>
                <TabsTrigger value="pending" className="gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Pending ({pendingAssignments.length})
                </TabsTrigger>
                <TabsTrigger value="submitted" className="gap-2">
                  <Clock className="h-4 w-4" />
                  Submitted ({submittedAssignments.length})
                </TabsTrigger>
                <TabsTrigger value="graded" className="gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Graded ({gradedAssignments.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingAssignments.map((assignment) => (
                    <AssignmentCard key={assignment._id} assignment={assignment} />
                  ))}
                </div>
                {pendingAssignments.length === 0 && (
                  <Card className="bg-card border-border">
                    <CardContent className="p-12 text-center">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">All caught up!</h3>
                      <p className="text-muted-foreground">You have no pending assignments.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="submitted">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {submittedAssignments.map((assignment) => (
                    <AssignmentCard key={assignment._id} assignment={assignment} />
                  ))}
                </div>
                {submittedAssignments.length === 0 && (
                  <Card className="bg-card border-border">
                    <CardContent className="p-12 text-center">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">No submissions awaiting grades</h3>
                      <p className="text-muted-foreground">All your submitted assignments have been graded.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="graded">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {gradedAssignments.map((assignment) => (
                    <AssignmentCard key={assignment._id} assignment={assignment} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  )
}
