'use client'

import { useState } from 'react'
import { 
  BookOpen, 
  Clock, 
  Play,
  Search,
  Filter,
  User,
  Calendar
} from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
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
import Link from 'next/link'
import { apiFetch } from '@/lib/api-client'
import { useEffect } from 'react'
import { toast } from 'sonner'

import { useAuth } from '@/contexts/auth-context'

export default function StudentCoursesPage() {
  const { user: authUser } = useAuth()
  const [coursesList, setCoursesList] = useState([])
  const [allCourses, setAllCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [semesterFilter, setSemesterFilter] = useState('all')

  const fetchCourses = async () => {
    try {
      setLoading(true)
      // Fetch enrolled courses
      const enrolledRes = await apiFetch('/api/student/courses')
      // Fetch all available courses from a new or existing endpoint
      const allRes = await apiFetch('/api/courses') 
      
      if (enrolledRes.success) {
        setCoursesList(enrolledRes.data)
      }
      if (allRes.success) {
        setAllCourses(allRes.data)
      }
    } catch (err) {
      if (err?.status !== 401 && err?.status !== 403) {
        toast.error('Failed to load courses')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  const enrolledIds = new Set(coursesList.map(c => c._id))
  const notEnrolledCourses = allCourses.filter(c => !enrolledIds.has(c._id))

  const filteredEnrolled = coursesList.filter(course => {
    const matchesSearch = (course.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (course.code || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSemester = semesterFilter === 'all' || course.semester === semesterFilter
    return matchesSearch && matchesSemester
  })

  const filteredAvailable = notEnrolledCourses.filter(course => {
    const matchesSearch = (course.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (course.code || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSemester = semesterFilter === 'all' || course.semester === semesterFilter
    return matchesSearch && matchesSemester
  })

  const inProgressCourses = filteredEnrolled.filter(c => c.status === 'Active' || c.status === 'in-progress')
  const completedCourses = filteredEnrolled.filter(c => c.status === 'Completed' || c.status === 'completed')

  const semesters = [...new Set(allCourses.map(c => c.semester).filter(Boolean))]

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar 
        title="My Courses" 
        userRole="Student"
        userName={authUser?.name || "Student"}
        breadcrumbs={[
          { label: 'Student', href: '/student' },
          { label: 'Courses' }
        ]}
      />
      
      <main className="flex-1 p-6 overflow-auto">
        {/* Header with Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={semesterFilter} onValueChange={setSemesterFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Semesters</SelectItem>
              {semesters.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-muted-foreground">Loading courses...</p>
          </div>
        ) : (
          <Tabs defaultValue="in-progress" className="space-y-6">
            <TabsList>
              <TabsTrigger value="in-progress" className="gap-2">
                <Play className="h-4 w-4" />
                In Progress ({inProgressCourses.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Completed ({completedCourses.length})
              </TabsTrigger>
              <TabsTrigger value="available" className="gap-2">
                <Filter className="h-4 w-4" />
                Available ({filteredAvailable.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="in-progress">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {inProgressCourses.map((course) => (
                  <Card key={course._id} className="bg-card border-border hover:border-primary/50 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <Badge variant="outline">{course.code}</Badge>
                        <Badge className="bg-primary/10 text-primary">{course.credits || 3} Credits</Badge>
                      </div>
                      <CardTitle className="text-lg mt-2">{course.name}</CardTitle>
                      <CardDescription className="line-clamp-2">{course.description || 'No description provided'}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-4 w-4" />
                          {course.instructor?.name || 'Instructor'}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="text-foreground font-medium">{course.completedLessons || 0}/{course.totalLessons || 12} lessons</span>
                          </div>
                          <Progress value={course.progress || 0} className="h-2" />
                        </div>

                        {course.nextClass && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            Next: {course.nextClass}
                          </div>
                        )}

                        <Link href={`/student/courses/${course._id}`} className="block">
                          <Button className="w-full gap-2">
                            <Play className="h-4 w-4" />
                            Continue Learning
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {inProgressCourses.length === 0 && (
                  <div className="col-span-full py-12 text-center border-2 border-dashed border-border rounded-lg">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <p className="text-muted-foreground">No active courses found.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="completed">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedCourses.map((course) => (
                  <Card key={course._id} className="bg-card border-border">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <Badge variant="outline">{course.code}</Badge>
                        <Badge className="bg-green-500/10 text-green-500">Completed</Badge>
                      </div>
                      <CardTitle className="text-lg mt-2">{course.name}</CardTitle>
                      <CardDescription className="line-clamp-2">{course.description || 'Course completed successfully'}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-4 w-4" />
                          {course.instructor?.name || 'Instructor'}
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {course.semester}
                        </div>

                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <span className="text-muted-foreground">Final Grade</span>
                          <span className="text-xl font-bold text-green-500">{course.grade || 'A'}</span>
                        </div>

                        <Link href={`/student/courses/${course._id}`} className="block">
                          <Button variant="outline" className="w-full">
                            View Course
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {completedCourses.length === 0 && (
                  <div className="col-span-full py-12 text-center border-2 border-dashed border-border rounded-lg">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <p className="text-muted-foreground">You haven't completed any courses yet.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="available">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAvailable.map((course) => (
                  <Card key={course._id} className="bg-card border-border opacity-75 hover:opacity-100 transition-opacity grayscale hover:grayscale-0">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <Badge variant="secondary">{course.code}</Badge>
                        <Badge variant="outline" className="text-muted-foreground">Not Enrolled</Badge>
                      </div>
                      <CardTitle className="text-lg mt-2">{course.name}</CardTitle>
                      <CardDescription className="line-clamp-2">{course.description || 'Available for enrollment'}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-4 w-4" />
                          Instructor: {course.instructor?.name || 'To be assigned'}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          Semester: {course.semester || 'Upcoming'}
                        </div>
                        <Button variant="secondary" className="w-full" disabled>
                          Enrollment Closed
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {filteredAvailable.length === 0 && (
                  <div className="col-span-full py-12 text-center">
                    <p className="text-muted-foreground">No other courses available.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  )
}
