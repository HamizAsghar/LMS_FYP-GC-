'use client'

import { useState, useEffect } from 'react'
import { 
  BookOpen, 
  Clock, 
  FileText, 
  Download, 
  CheckCircle2, 
  Circle, 
  AlertCircle,
  ChevronLeft,
  User,
  Calendar,
  ExternalLink,
  PlayCircle
} from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import Link from 'next/link'
import { apiFetch } from '@/lib/api-client'
import { toast } from 'sonner'
import { useParams } from 'next/navigation'

export default function StudentCourseDetailsPage() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await apiFetch(`/api/student/courses/${id}`)
      if (res.success) {
        setData(res.data)
      }
    } catch (err) {
      if (err?.status !== 401 && err?.status !== 403) {
        toast.error('Failed to load course details')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [id])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground animate-pulse">Loading course content...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex-1 flex flex-col min-h-screen bg-background">
        <Navbar title="Course Not Found" userRole="Student" />
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-md w-full text-center">
            <CardHeader>
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-2" />
              <CardTitle>Course Not Found</CardTitle>
              <CardDescription>The course you are looking for does not exist or you don't have access to it.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/student/courses">
                <Button variant="outline" className="w-full gap-2">
                  <ChevronLeft className="h-4 w-4" /> Back to My Courses
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const { course, assignments, materials } = data
  const completedAssignments = assignments.filter(a => a.submissionStatus === 'Graded' || a.submissionStatus === 'Submitted').length
  const progress = assignments.length > 0 ? Math.round((completedAssignments / assignments.length) * 100) : 0

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background/50">
      <Navbar 
        title={course.name} 
        userRole="Student"
        breadcrumbs={[
          { label: 'Student', href: '/student' },
          { label: 'Courses', href: '/student/courses' },
          { label: course.code }
        ]}
      />
      
      <main className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Course Header Banner */}
        <Card className="bg-primary/5 border-primary/20 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <BookOpen className="h-32 w-32" />
          </div>
          <CardHeader className="relative z-10">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-background/80">{course.code}</Badge>
                  <Badge className="bg-primary/10 text-primary border-primary/20">{course.semester || 'Fall 2024'}</Badge>
                </div>
                <CardTitle className="text-3xl font-bold text-foreground mt-2">{course.name}</CardTitle>
                <div className="flex items-center gap-4 mt-4 text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <User className="h-4 w-4" />
                    <span className="text-sm font-medium">{course.instructor?.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">Updated {new Date(course.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="bg-background/80 backdrop-blur-sm p-4 rounded-xl border border-border/50 min-w-[200px]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Course Progress</span>
                  <span className="text-sm font-bold text-primary">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2 mb-2" />
                <p className="text-xs text-muted-foreground">{completedAssignments}/{assignments.length} assignments completed</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-background/80 backdrop-blur-sm border border-border p-1">
            <TabsTrigger value="overview" className="gap-2">Overview</TabsTrigger>
            <TabsTrigger value="assignments" className="gap-2">Assignments</TabsTrigger>
            <TabsTrigger value="materials" className="gap-2">Learning Materials</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-card shadow-sm">
                  <CardHeader>
                    <CardTitle>About this Course</CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground leading-relaxed">
                    {course.description || 'No detailed description provided for this course yet. Please check back later or contact your instructor for the syllabus.'}
                  </CardContent>
                </Card>

                <Card className="bg-card shadow-sm">
                  <CardHeader>
                    <CardTitle>Recent Materials</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {materials.slice(0, 3).map((item) => (
                      <div key={item._id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            {item.type === 'Video' ? <PlayCircle className="h-5 w-5 text-primary" /> : <FileText className="h-5 w-5 text-primary" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{item.title}</p>
                            <p className="text-xs text-muted-foreground">{item.type} • {new Date(item.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" asChild>
                          <a href={item.fileUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    ))}
                    {materials.length === 0 && (
                      <p className="text-center py-4 text-sm text-muted-foreground">No materials uploaded yet.</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="bg-card shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Instructor</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary border-2 border-primary/20">
                        {course.instructor?.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{course.instructor?.name}</p>
                        <p className="text-sm text-muted-foreground">{course.instructor?.department || 'Faculty Member'}</p>
                        <p className="text-xs text-primary mt-1">{course.instructor?.email}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Upcoming Deadlines</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {assignments.filter(a => a.submissionStatus === 'Pending').slice(0, 2).map((a) => (
                      <div key={a._id} className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/10">
                        <p className="text-sm font-medium text-foreground">{a.title}</p>
                        <div className="flex items-center gap-1.5 mt-1 text-orange-600">
                          <Clock className="h-3 w-3" />
                          <span className="text-xs font-bold">Due: {new Date(a.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                    {assignments.filter(a => a.submissionStatus === 'Pending').length === 0 && (
                      <div className="text-center py-4">
                        <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2 opacity-30" />
                        <p className="text-xs text-muted-foreground">No pending deadlines!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments">
            <Card className="bg-card shadow-sm">
              <CardHeader>
                <CardTitle>Course Assignments</CardTitle>
                <CardDescription>View and submit your work for this course</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {assignments.map((assignment) => (
                  <div key={assignment._id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-border/50 hover:border-primary/30 transition-all gap-4">
                    <div className="flex gap-4">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        {assignment.submissionStatus === 'Graded' ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : assignment.submissionStatus === 'Submitted' ? (
                          <Circle className="h-5 w-5 text-blue-500 fill-blue-500/20" />
                        ) : (
                          <FileText className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">{assignment.title}</h4>
                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{assignment.description || 'No instructions provided'}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> Due: {new Date(assignment.dueDate).toLocaleDateString()}
                          </span>
                          <Badge variant="secondary" className="text-[10px] py-0 h-5">
                            {assignment.totalPoints || 100} Points
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 self-end md:self-center">
                      <div className="text-right mr-4 hidden md:block">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</p>
                        <p className={`text-sm font-bold ${
                          assignment.submissionStatus === 'Graded' ? 'text-green-500' : 
                          assignment.submissionStatus === 'Submitted' ? 'text-blue-500' : 'text-muted-foreground'
                        }`}>
                          {assignment.submissionStatus}
                          {assignment.grade && ` (${assignment.grade}%)`}
                        </p>
                      </div>
                      <Link href={`/student/assignments`}>
                        <Button variant={assignment.submissionStatus === 'Pending' ? 'default' : 'outline'} className="gap-2">
                          {assignment.submissionStatus === 'Pending' ? 'Submit' : 'View Submission'}
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
                {assignments.length === 0 && (
                  <div className="text-center py-20">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <p className="text-muted-foreground font-medium">No assignments posted for this course yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Materials Tab */}
          <TabsContent value="materials">
            <Card className="bg-card shadow-sm">
              <CardHeader>
                <CardTitle>Learning Materials</CardTitle>
                <CardDescription>Course content, lecture notes and shared resources</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {materials.map((item) => (
                    <div key={item._id} className="p-4 rounded-xl border border-border/50 hover:bg-muted/30 transition-all flex flex-col justify-between group">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                          item.type === 'Video' ? 'bg-red-500/10 text-red-500' : 
                          item.type === 'PDF' ? 'bg-blue-500/10 text-blue-500' : 'bg-primary/10 text-primary'
                        }`}>
                          {item.type === 'Video' ? <PlayCircle className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
                        </div>
                        <Badge variant="outline" className="text-[10px]">{item.type}</Badge>
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{item.title}</h4>
                        <p className="text-xs text-muted-foreground">Uploaded {new Date(item.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="mt-6 pt-4 border-t border-border/50 flex gap-2">
                        <Button variant="default" size="sm" className="flex-1 gap-2" asChild>
                          <a href={item.fileUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3" /> Open
                          </a>
                        </Button>
                        <Button variant="ghost" size="sm" className="px-2" asChild>
                          <a href={item.fileUrl} download>
                            <Download className="h-3 w-3" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                  {materials.length === 0 && (
                    <div className="col-span-full py-20 text-center">
                      <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                      <p className="text-muted-foreground font-medium">No materials shared yet.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
