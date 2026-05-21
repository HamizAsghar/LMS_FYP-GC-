"use client"

import { useState } from "react"
import { 
  BarChart3, 
  Download, 
  TrendingUp,
  TrendingDown,
  BookOpen,
  FileText,
  Award,
  Calendar,
  Printer
} from "lucide-react"
import { Navbar } from '@/components/navbar'
import { StatsCard } from '@/components/dashboard-components'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { useApi } from '@/hooks/use-api'
import { useAuth } from '@/contexts/auth-context'

export default function StudentReportsPage() {
  const { user: authUser } = useAuth()
  const { data: reportsData, loading } = useApi('/api/student/reports')
  const [selectedSemester, setSelectedSemester] = useState("fall2024")
  const [selectedCourse, setSelectedCourse] = useState("all")

  const courseProgress = reportsData?.courseProgress || []
  const submissionHistory = reportsData?.submissionHistory || []
  const performanceTrend = reportsData?.performanceTrend || []
  const stats = reportsData?.stats || { avgGrade: 0, totalSubmissions: 0, onTimeSubmissions: 0, activeCourses: 0 }

  const handleExport = () => {
    if (!reportsData) return

    let csvContent = ""

    // 1. Title & Metadata
    csvContent += "STUDENT ACADEMIC REPORT & ANALYTICS\n"
    csvContent += `Student Name: ${authUser?.name || 'Student'}\n`
    csvContent += `Generated on: ${new Date().toLocaleString()}\n\n`

    // 2. Overview Stats Section
    csvContent += "OVERVIEW STATISTICS\n"
    csvContent += "Metric,Value\n"
    csvContent += `Average Grade,${stats.avgGrade}%\n`
    csvContent += `Total Submissions,${stats.totalSubmissions}\n`
    csvContent += `On-Time Rate,${stats.totalSubmissions > 0 ? Math.round((stats.onTimeSubmissions / stats.totalSubmissions) * 100) : 0}%\n`
    csvContent += `Active Courses,${stats.activeCourses}\n\n`

    // 3. Course Progress Section
    csvContent += "COURSE PROGRESS & COMPLETION\n"
    csvContent += "Course Code,Course Name,Progress (%),Grade,Assignments,Completed\n"
    courseProgress.forEach(course => {
      csvContent += `"${course.course}","${course.name}",${course.progress}%,${course.grade},${course.assignments},${course.completed}\n`
    });
    csvContent += "\n"

    // 4. Submission History Section
    csvContent += "SUBMISSION & GRADING HISTORY\n"
    csvContent += "Assignment,Course Code,Submission Date,Score/Grade,Status\n"
    submissionHistory.forEach(s => {
      csvContent += `"${s.title}","${s.course}","${s.submitted}","${s.grade}","${s.status.toUpperCase()}"\n`
    });

    // Create a blob and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `${authUser?.name || 'Student'}_Academic_Report_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar 
        title="My Reports" 
        userRole="Student"
        userName={authUser?.name || "Student"}
        breadcrumbs={[
          { label: 'Student', href: '/student/dashboard' },
          { label: 'Reports' }
        ]}
      />
      
      <main className="flex-1 p-6 space-y-6 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground animate-pulse">
            Generating academic reports...
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Academic Reports</h2>
                <p className="text-muted-foreground">Track your academic performance and progress</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatsCard
                title="Average Grade"
                value={`${stats.avgGrade}%`}
                icon={Award}
                trend="+5.2%"
                trendUp={true}
              />
              <StatsCard
                title="Total Submissions"
                value={stats.totalSubmissions}
                icon={FileText}
                trend="+3"
                trendUp={true}
                iconColor="text-blue-600"
              />
              <StatsCard
                title="On-Time Rate"
                value={`${stats.totalSubmissions > 0 ? Math.round((stats.onTimeSubmissions / stats.totalSubmissions) * 100) : 0}%`}
                icon={Calendar}
                trend="+2%"
                trendUp={true}
                iconColor="text-green-600"
              />
              <StatsCard
                title="Active Courses"
                value={stats.activeCourses}
                icon={BookOpen}
                trend="0"
                trendUp={true}
                iconColor="text-purple-600"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Course Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Course Progress</CardTitle>
                  <CardDescription>Completion status of your enrolled courses</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {courseProgress.map((course) => (
                    <div key={course.course} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{course.course}</p>
                          <p className="text-xs text-muted-foreground">{course.name}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={
                            course.grade.startsWith('A') ? 'default' : 
                            course.grade.startsWith('B') ? 'secondary' : 'outline'
                          }>
                            {course.grade}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {course.completed}/{course.assignments} done
                          </p>
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

        {/* Submission History */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Submission History</CardTitle>
                <CardDescription>Your recent assignment submissions and grades</CardDescription>
              </div>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courseProgress.map((course) => (
                    <SelectItem key={course.course} value={course.course}>
                      {course.course} - {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Assignment</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissionHistory
                  .filter(s => selectedCourse === "all" || s.course === selectedCourse)
                  .map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-medium">{submission.title}</TableCell>
                    <TableCell>{submission.course}</TableCell>
                    <TableCell>{submission.submitted}</TableCell>
                    <TableCell>
                      <span className={submission.status === "graded" ? "font-semibold" : "text-muted-foreground"}>
                        {submission.grade}
                      </span>
                    </TableCell>
                    <TableCell>
                      {submission.status === "graded" ? (
                        <Badge className="bg-green-100 text-green-700">Graded</Badge>
                      ) : (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Quick Reports */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={handleExport}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Grade Report</p>
                  <p className="text-sm text-muted-foreground">Download your grade card</p>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* <Card className="cursor-pointer hover:border-primary transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Transcript</p>
                  <p className="text-sm text-muted-foreground">View academic transcript</p>
                </div>
              </div>
            </CardContent>
          </Card> */}
          {/* <Card className="cursor-pointer hover:border-primary transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Achievements</p>
                  <p className="text-sm text-muted-foreground">View your achievements</p>
                </div>
              </div>
            </CardContent>
          </Card> */}
        </div>
        </>
        )}
      </main>
    </div>
  )
}
