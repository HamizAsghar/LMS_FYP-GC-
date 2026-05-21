'use client'

import { useState, useEffect } from 'react'
import { BookOpen, User, Bell, X, GraduationCap, Search } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { apiFetch } from '@/lib/api-client'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/auth-context'

export default function StudentCoursesPage() {
  const { user: authUser } = useAuth()
  const [coursesList, setCoursesList] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCourse, setSelectedCourse] = useState(null)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true)
        const res = await apiFetch('/api/student/courses')
        if (res.success) {
          const data = res.data
          let combined = []
          if (Array.isArray(data)) {
            combined = data
          } else if (data && typeof data === 'object') {
            combined = [
              ...(Array.isArray(data.courses) ? data.courses : []),
              ...(Array.isArray(data.assignedClasses) ? data.assignedClasses : []),
            ]
          }
          setCoursesList(combined.map(c => ({
            ...c,
            code: c.code || c.className || 'CLASS',
          })))
        }
      } catch (err) {
        if (err?.status !== 401 && err?.status !== 403) {
          toast.error('Failed to load courses')
        }
      } finally {
        setLoading(false)
      }
    }
    fetchCourses()
  }, [])

  const filtered = coursesList.filter(c =>
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.code || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar
        title="My Courses"
        userRole="Student"
        userName={authUser?.name || 'Student'}
        breadcrumbs={[
          { label: 'Student', href: '/student' },
          { label: 'Courses' }
        ]}
      />

      <main className="flex-1 p-6 overflow-auto space-y-6">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-muted-foreground">Loading courses...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-border rounded-xl">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-30" />
            <p className="text-muted-foreground font-medium">No enrolled courses found.</p>
            <p className="text-sm text-muted-foreground mt-1">Your admin will enroll you in courses.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(course => (
              <Card key={course._id} className="bg-card border-border hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="outline" className="text-xs">{course.code}</Badge>
                    <Badge className="bg-green-500/15 text-green-500 border-green-500/30 text-xs">
                      Enrolled
                    </Badge>
                  </div>
                  <CardTitle className="text-lg mt-2 leading-snug">{course.name || course.subject || 'Course'}</CardTitle>
                  {course.description && (
                    <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {(course.instructor?.name || course.instructorName) && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      {course.instructor?.name || course.instructorName}
                    </div>
                  )}
                  {course.semester && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      {course.semester}
                    </div>
                  )}
                  <Button
                    className="w-full gap-2 mt-2"
                    onClick={() => setSelectedCourse(course)}
                  >
                    <BookOpen className="h-4 w-4" />
                    View Course
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Simple Enrolled Info Modal */}
      {selectedCourse && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setSelectedCourse(null)}
        >
          <div
            className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <Badge variant="outline" className="mb-2">{selectedCourse.code}</Badge>
                <h2 className="text-lg font-bold text-foreground">{selectedCourse.name || selectedCourse.subject}</h2>
                {(selectedCourse.instructor?.name || selectedCourse.instructorName) && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedCourse.instructor?.name || selectedCourse.instructorName}
                  </p>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedCourse(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Enrolled Banner */}
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-start gap-3">
              <GraduationCap className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-primary">You are enrolled in this course</p>
                <p className="text-sm text-muted-foreground mt-1">
                  You will receive updates automatically when your instructor uploads new assignments or learning materials.
                </p>
              </div>
            </div>

            {/* Notification hint */}
            <div className="p-3 rounded-lg bg-muted/50 border border-border flex items-center gap-2 text-sm text-muted-foreground">
              <Bell className="h-4 w-4 flex-shrink-0 text-primary" />
              Check your <span className="font-medium text-foreground mx-1">Notifications</span> for the latest course updates.
            </div>

            <Button className="w-full" onClick={() => setSelectedCourse(null)}>Got it</Button>
          </div>
        </div>
      )}
    </div>
  )
}
