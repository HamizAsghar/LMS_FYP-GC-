'use client'

import { 
  Users, 
  BookOpen, 
  FileText, 
  Clock,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Calendar,
  ChevronRight,
  Activity,
  Upload,
  Mail
} from 'lucide-react'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { StatsCard } from '@/components/dashboard-components'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useApi } from '@/hooks/use-api'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

// Weekly performance data
// No hardcoded data here anymore

export default function InstructorDashboardPage() {
  const { data: dash, loading } = useApi('/api/instructor/dashboard')
  const s = dash?.stats || {}
  const user = dash?.user || {}
  const userName = user.name || "Instructor"
  
  const weeklyPerformanceData = dash?.weeklyPerformance || []
  const myCourses = dash?.myCourses || []
  const todaySchedule = dash?.todaySchedule || []
  const recentActivities = dash?.recentActivities || []
  const pendingSubmissions = (dash?.pendingSubmissions || []).map(s => ({
    ...s,
    submitted: new Date(s.submitted).toLocaleString()
  }))

  const stats = [
    { title: "Total Activities", value: s.totalActivities ?? 0, icon: Activity, description: "total logs" },
    { title: "Completed Tasks", value: s.completedTasks ?? 0, icon: CheckCircle, description: "this week" },
    { title: "Pending Tasks", value: s.pendingTasks ?? 0, icon: Clock, description: "to complete" },
    { title: "Uploaded Assignments", value: s.uploadedAssignments ?? 0, icon: Upload, description: "total" },
    { title: "Total Students", value: s.totalStudents ?? 0, icon: Users, description: "enrolled" },
    { title: "Avg Rating", value: s.avgRating ?? 0, icon: TrendingUp, description: "student feedback" },
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
        title="Instructor Dashboard" 
        userRole="Instructor"
        userName={userName}
        breadcrumbs={[
          { label: 'Instructor', href: '/instructor' },
          { label: 'Dashboard' }
        ]}
      />
      
      <main className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-6 text-primary-foreground">
          <h1 className="text-2xl font-bold">Welcome back, {userName}</h1>
          <p className="mt-1 opacity-90">You have {s.pendingTasks ?? 0} tasks pending and {todaySchedule.length} classes today</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Weekly Performance */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Weekly Performance
              </CardTitle>
              <CardDescription>Activities and grading overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyPerformanceData}>
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
                    <Legend />
                    <Bar dataKey="activities" fill="hsl(var(--primary))" name="Activities" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="graded" fill="hsl(var(--chart-2))" name="Assignments Graded" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Today's Schedule */}
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Today&apos;s Schedule
                </CardTitle>
                <CardDescription>Your classes for today</CardDescription>
              </div>
              <Link href="/instructor/schedule">
                <Button variant="ghost" size="sm" className="gap-1">
                  View All <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todaySchedule.map((item) => (
                  <div key={item.id} className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">{item.course}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" /> {item.time}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> {item.room}
                      </div>
                    </div>
                    <Badge className={`mt-2 ${item.type === "Lecture" ? "bg-blue-500/10 text-blue-500" : "bg-green-500/10 text-green-500"}`}>
                      {item.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Courses & Recent Activities */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* My Courses */}
          <Card className="bg-card border-border lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  My Courses
                </CardTitle>
                <CardDescription>Course progress overview</CardDescription>
              </div>
              <Link href="/instructor/courses">
                <Button variant="ghost" size="sm" className="gap-1">
                  View All <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myCourses.map((course) => (
                  <div key={course.id} className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-foreground">{course.name}</h3>
                      <span className="text-sm text-muted-foreground">{course.progress}% Complete</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-3">
                      <div 
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" /> {course.students} Students
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" /> {course.assignments} Assignments
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Recent Activities
              </CardTitle>
              <CardDescription>Your latest activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivities.slice(0, 4).map((activity) => (
                  <div key={activity.id || activity._id} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-foreground text-sm">{activity.activityType}</span>
                      <Badge variant={activity.status === 'Completed' ? 'default' : activity.status === 'Pending' ? 'secondary' : 'outline'}>
                        {activity.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Count: {activity.count || 1}</span>
                      <span>{new Date(activity.date || activity.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Submissions */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Recent Submissions to Review
              </CardTitle>
              <CardDescription>Student submissions awaiting grading</CardDescription>
            </div>
            <Link href="/instructor/submissions">
              <Button variant="outline" size="sm" className="gap-1">
                View All <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Student</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Assignment</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Course</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Submitted</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingSubmissions.map((submission) => (
                    <tr key={submission.id} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                            {submission.student.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="font-medium text-foreground">{submission.student}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-foreground">{submission.assignment}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{submission.course}</Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{submission.submitted}</td>
                      <td className="py-3 px-4">
                        <Button size="sm">Review</Button>
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
