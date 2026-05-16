'use client'

import { 
  BookOpen, 
  Calendar, 
  Clock, 
  FileText, 
  GraduationCap,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Play
} from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

// Mock data
const stats = {
  enrolledCourses: 6,
  completedCourses: 2,
  pendingAssignments: 4,
  averageGrade: 'B+',
  attendanceRate: 92
}

const enrolledCourses = [
  {
    id: 1,
    code: 'CS301',
    name: 'Data Structures & Algorithms',
    instructor: 'Dr. Ahmad Khan',
    progress: 65,
    nextClass: 'Today, 10:00 AM',
    status: 'in-progress'
  },
  {
    id: 2,
    code: 'CS302',
    name: 'Database Systems',
    instructor: 'Prof. Sarah Ali',
    progress: 45,
    nextClass: 'Tomorrow, 2:00 PM',
    status: 'in-progress'
  },
  {
    id: 3,
    code: 'CS303',
    name: 'Operating Systems',
    instructor: 'Dr. Usman Malik',
    progress: 78,
    nextClass: 'Wed, 11:00 AM',
    status: 'in-progress'
  }
]

const upcomingDeadlines = [
  {
    id: 1,
    title: 'Binary Tree Implementation',
    course: 'CS301',
    dueDate: 'Today, 11:59 PM',
    type: 'assignment',
    urgent: true
  },
  {
    id: 2,
    title: 'ER Diagram Design',
    course: 'CS302',
    dueDate: 'Tomorrow, 5:00 PM',
    type: 'assignment',
    urgent: true
  },
  {
    id: 3,
    title: 'Midterm Exam',
    course: 'CS303',
    dueDate: 'May 20, 2024',
    type: 'exam',
    urgent: false
  },
  {
    id: 4,
    title: 'Quiz 3',
    course: 'CS301',
    dueDate: 'May 22, 2024',
    type: 'quiz',
    urgent: false
  }
]

const recentGrades = [
  { course: 'CS301', assessment: 'Quiz 2', score: 85, maxScore: 100, date: 'May 10' },
  { course: 'CS302', assessment: 'Assignment 2', score: 92, maxScore: 100, date: 'May 8' },
  { course: 'CS303', assessment: 'Midterm', score: 78, maxScore: 100, date: 'May 5' }
]

const todaySchedule = [
  { time: '10:00 AM', course: 'CS301', room: 'Room 201', type: 'Lecture' },
  { time: '12:00 PM', course: 'CS302', room: 'Lab 3', type: 'Lab' },
  { time: '3:00 PM', course: 'CS303', room: 'Room 105', type: 'Lecture' }
]

export default function StudentDashboard() {
  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar 
        title="Student Dashboard" 
        userRole="Student"
        userName="Ali Hassan"
        breadcrumbs={[
          { label: 'Dashboard' }
        ]}
      />
      
      <main className="flex-1 p-6 overflow-auto">
        {/* Welcome Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">Welcome back, Ali!</h2>
          <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your courses today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Enrolled</p>
                  <p className="text-xl font-bold text-foreground">{stats.enrolledCourses}</p>
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
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-xl font-bold text-foreground">{stats.completedCourses}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <FileText className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-xl font-bold text-foreground">{stats.pendingAssignments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Grade</p>
                  <p className="text-xl font-bold text-foreground">{stats.averageGrade}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Attendance</p>
                  <p className="text-xl font-bold text-foreground">{stats.attendanceRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* My Courses */}
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    My Courses
                  </CardTitle>
                  <CardDescription>Your enrolled courses and progress</CardDescription>
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
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{course.code}</Badge>
                            <h4 className="font-semibold text-foreground">{course.name}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{course.instructor}</p>
                        </div>
                        <Button size="sm" variant="outline" className="gap-1">
                          <Play className="h-4 w-4" />
                          Continue
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="text-foreground font-medium">{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>
                      <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        Next class: {course.nextClass}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Grades */}
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    Recent Grades
                  </CardTitle>
                  <CardDescription>Your latest assessment results</CardDescription>
                </div>
                <Link href="/student/grades">
                  <Button variant="ghost" size="sm" className="gap-1">
                    View All <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentGrades.map((grade, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{grade.course}</Badge>
                        <div>
                          <p className="font-medium text-foreground">{grade.assessment}</p>
                          <p className="text-sm text-muted-foreground">{grade.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${grade.score >= 80 ? 'text-green-500' : grade.score >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
                          {grade.score}/{grade.maxScore}
                        </p>
                        <p className="text-sm text-muted-foreground">{grade.score}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Upcoming Deadlines */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-primary" />
                  Upcoming Deadlines
                </CardTitle>
                <CardDescription>Don&apos;t miss these important dates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingDeadlines.map((deadline) => (
                    <div key={deadline.id} className={`p-3 rounded-lg ${deadline.urgent ? 'bg-red-500/10 border border-red-500/20' : 'bg-muted/50'}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-foreground">{deadline.title}</p>
                          <p className="text-sm text-muted-foreground">{deadline.course}</p>
                        </div>
                        <Badge variant={deadline.type === 'exam' ? 'destructive' : deadline.type === 'quiz' ? 'secondary' : 'outline'}>
                          {deadline.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className={deadline.urgent ? 'text-red-500 font-medium' : 'text-muted-foreground'}>
                          {deadline.dueDate}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/student/assignments">
                  <Button className="w-full mt-4" variant="outline">
                    View All Assignments
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Today's Schedule */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Today&apos;s Schedule
                </CardTitle>
                <CardDescription>Your classes for today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {todaySchedule.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                      <div className="text-center min-w-[60px]">
                        <p className="font-bold text-foreground">{item.time.split(' ')[0]}</p>
                        <p className="text-xs text-muted-foreground">{item.time.split(' ')[1]}</p>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{item.course}</p>
                        <p className="text-sm text-muted-foreground">{item.room} - {item.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/student/schedule">
                  <Button className="w-full mt-4" variant="outline">
                    View Full Schedule
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
