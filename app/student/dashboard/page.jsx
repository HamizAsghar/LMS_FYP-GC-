'use client'

import { 
  BookOpen, 
  FileText, 
  Download,
  Clock,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Calendar,
  ChevronRight,
  Bell,
  Award,
  GraduationCap
} from 'lucide-react'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { StatsCard } from '@/components/dashboard-components'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/api-client'
import { useState } from 'react'
import { useApi } from '@/hooks/use-api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

// Course completion data will be fetched from API

export default function StudentDashboardPage() {
  const { data: dash, loading } = useApi('/api/student/dashboard')
  const s = dash?.stats || {}
  const progressData = dash?.progressData || []
  const enrolledCourses = dash?.enrolledCourses || []
  const upcomingDeadlines = (dash?.upcomingDeadlines || []).map((d) => ({
    ...d,
    deadline: d.deadline ? new Date(d.deadline).toLocaleString() : '',
  }))
  const recentNotifications = dash?.recentNotifications || []
  const courseCompletionData = dash?.courseCompletionData || []

  const user = dash?.user || {}
  const userName = user.name || "Student"

  const [enrollUsername, setEnrollUsername] = useState('')
  const [enrollPassword, setEnrollPassword] = useState('')
  const [isEnrolling, setIsEnrolling] = useState(false)

  const handleEnroll = async () => {
    if (!enrollUsername || !enrollPassword) {
      toast.error("Please enter both username and password")
      return
    }
    try {
      setIsEnrolling(true)
      const res = await apiFetch('/api/student/enroll', {
        method: 'POST',
        body: JSON.stringify({ username: enrollUsername, password: enrollPassword })
      })
      if (res.success) {
        toast.success("Successfully enrolled in class!")
        setEnrollUsername('')
        setEnrollPassword('')
        // ideally refetch dashboard data here
        window.location.reload()
      } else {
        toast.error(res.message || "Failed to enroll")
      }
    } catch (err) {
      toast.error("An error occurred during enrollment")
    } finally {
      setIsEnrolling(false)
    }
  }

  const stats = [
    { title: "Total Courses", value: s.totalCourses ?? 0, icon: BookOpen, description: "active courses" },
    { title: "Pending Assignments", value: s.pendingAssignments ?? 0, icon: Clock, description: "to submit" },
    { title: "Submitted", value: s.submittedAssignments ?? 0, icon: CheckCircle, description: "assignments" },
    { title: "Downloads", value: s.downloadedMaterials ?? 0, icon: Download, description: "materials" },
    { title: "Overall Progress", value: `${s.overallProgress ?? 0}%`, icon: TrendingUp, description: "average" },
    { title: "Attendance", value: `${s.attendance ?? 0}%`, icon: Calendar, description: "overall" },
  ]

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar 
        title="Student Dashboard" 
        userRole="Student"
        userName={userName}
        breadcrumbs={[
          { label: 'Student', href: '/student' },
          { label: 'Dashboard' }
        ]}
      />
      
      <main className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-6 text-primary-foreground">
          <h1 className="text-2xl font-bold">Welcome back, {userName}</h1>
          <p className="mt-1 opacity-90">You have {s.pendingAssignments ?? 0} pending assignments and {upcomingDeadlines.length} upcoming deadlines today</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Progress Chart */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Learning Progress
              </CardTitle>
              <CardDescription>Your weekly progress overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line type="monotone" dataKey="progress" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} name="Progress %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Course Completion */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Course Completion Status
              </CardTitle>
              <CardDescription>Overall course completion breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={courseCompletionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {courseCompletionData.map((entry, index) => (
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
        </div>

        {/* My Courses & Upcoming Deadlines */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* My Courses */}
          <Card className="bg-card border-border lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  My Courses
                </CardTitle>
                <CardDescription>Your enrolled courses this semester</CardDescription>
              </div>
              <Link href="/student/courses">
                <Button variant="ghost" size="sm" className="gap-1">
                  View All <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {enrolledCourses.map((course) => (
                  <div key={course.id} className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-foreground">{course.code} - {course.name}</h3>
                        <p className="text-sm text-muted-foreground">{course.instructor}</p>
                      </div>
                      <Badge variant="outline">{course.progress}%</Badge>
                    </div>
                    <Progress value={course.progress} className="h-2 mb-3" />
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>Next: {course.nextClass}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Deadlines */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                Upcoming Deadlines
              </CardTitle>
              <CardDescription>Assignments due soon</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingDeadlines.map((deadline) => (
                  <div key={deadline.id} className={`p-3 rounded-lg border ${deadline.urgent ? 'bg-destructive/5 border-destructive/20' : 'bg-muted/50 border-border'}`}>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-medium text-foreground text-sm">{deadline.title}</span>
                      {deadline.urgent && (
                        <Badge variant="destructive" className="text-xs">Urgent</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{deadline.course}</p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span className={deadline.urgent ? 'text-destructive font-medium' : ''}>{deadline.deadline}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/student/assignments" className="block mt-4">
                <Button variant="outline" size="sm" className="w-full">
                  View All Assignments
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Notifications & Quick Actions */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Notifications */}
          <Card className="bg-card border-border lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Recent Notifications
                </CardTitle>
                <CardDescription>Stay updated with your courses</CardDescription>
              </div>
              <Link href="/student/notifications">
                <Button variant="ghost" size="sm" className="gap-1">
                  View All <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentNotifications.map((notification) => (
                  <div key={notification.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      notification.type === 'assignment' ? 'bg-blue-500/10 text-blue-500' :
                      notification.type === 'grade' ? 'bg-green-500/10 text-green-500' :
                      'bg-purple-500/10 text-purple-500'
                    }`}>
                      {notification.type === 'assignment' ? <FileText className="w-4 h-4" /> :
                       notification.type === 'grade' ? <Award className="w-4 h-4" /> :
                       <Download className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground">{notification.title}</p>
                      <p className="text-xs text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Enroll in Class */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Enroll in a Class
              </CardTitle>
              <CardDescription>Enter class credentials to join</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input 
                placeholder="Username (e.g. class_bscs_6_web_a)" 
                value={enrollUsername} 
                onChange={(e) => setEnrollUsername(e.target.value)} 
              />
              <Input 
                type="password" 
                placeholder="Password" 
                value={enrollPassword} 
                onChange={(e) => setEnrollPassword(e.target.value)} 
              />
              <Button className="w-full mt-2" onClick={handleEnroll} disabled={isEnrolling}>
                {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Quick Actions
              </CardTitle>
              <CardDescription>Common tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/student/submit-assignment" className="block">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <FileText className="w-4 h-4" />
                  Submit Assignment
                </Button>
              </Link>
              <Link href="/student/materials" className="block">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Download className="w-4 h-4" />
                  Download Materials
                </Button>
              </Link>
              <Link href="/student/courses" className="block">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <BookOpen className="w-4 h-4" />
                  View Courses
                </Button>
              </Link>
              <Link href="/student/grades" className="block">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Award className="w-4 h-4" />
                  Check Grades
                </Button>
              </Link>
              <Link href="/student/reports" className="block">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <TrendingUp className="w-4 h-4" />
                  View Reports
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
