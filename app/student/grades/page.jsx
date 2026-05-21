"use client"

import { useState } from "react"
import { 
  Award, 
  TrendingUp, 
  TrendingDown,
  BookOpen,
  FileText,
  ChevronDown,
  ChevronUp,
  Target,
  Download,
  Printer
} from "lucide-react"
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import { useApi } from '@/hooks/use-api'
import { useAuth } from '@/contexts/auth-context'

export default function StudentGradesPage() {
  const { user: authUser } = useAuth()
  const { data: gradesRaw, loading } = useApi('/api/student/grades')
  const [expandedCourse, setExpandedCourse] = useState(null)

  const handleExport = () => {
    if (!gradesData || gradesData.length === 0) return

    let csvContent = ""

    // 1. Title & Metadata
    csvContent += "STUDENT ACADEMIC PROGRESS REPORT\n"
    csvContent += `Student Name: ${authUser?.name || 'Student'}\n`
    csvContent += `Overall GPA: ${stats.overallGPA}\n`
    csvContent += `Average Score: ${stats.averagePercentage}%\n`
    csvContent += `Generated on: ${new Date().toLocaleString()}\n\n`

    // 2. Course Grades Table
    csvContent += "COURSE GRADES BREAKDOWN\n"
    csvContent += "Course,Instructor,Overall Grade,Percentage (%)\n"
    gradesData.forEach(course => {
      csvContent += `"${course.course}","${course.instructor}","${course.overallGrade}",${course.percentage}%\n`
    });
    csvContent += "\n"

    // 3. Detailed Assignment Grades Section
    csvContent += "DETAILED ASSIGNMENT GRADES\n"
    csvContent += "Course,Assignment Name,Score,Total Possible,Percentage (%),Submission Date,Status\n"
    gradesData.forEach(course => {
      course.assignments.forEach(assign => {
        const percent = assign.total > 0 ? ((assign.score / assign.total) * 100).toFixed(0) : 0;
        csvContent += `"${course.course}","${assign.name}",${assign.score},${assign.total},${percent}%,${assign.date},"${assign.status || 'Graded'}"\n`
      });
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

  const gradesData = gradesRaw?.courses || []
  const stats = gradesRaw?.stats || { overallGPA: "0.00", averagePercentage: "0.0", totalCredits: 0, activeCourses: 0 }

  const toggleCourse = (id) => {
    setExpandedCourse(expandedCourse === id ? null : id)
  }

  const getGradeColor = (grade) => {
    if (!grade) return "text-muted-foreground bg-muted"
    if (grade.startsWith("A")) return "text-green-600 bg-green-500/10"
    if (grade.startsWith("B")) return "text-blue-600 bg-blue-500/10"
    if (grade.startsWith("C")) return "text-yellow-600 bg-yellow-500/10"
    if (grade.startsWith("D")) return "text-orange-600 bg-orange-500/10"
    return "text-red-600 bg-red-500/10"
  }

  const getScoreColor = (score, total) => {
    const percentage = (score / total) * 100
    if (percentage >= 90) return "text-green-500"
    if (percentage >= 80) return "text-blue-500"
    if (percentage >= 70) return "text-yellow-500"
    if (percentage >= 60) return "text-orange-500"
    return "text-red-500"
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar 
        title="Grades & Performance" 
        userRole="Student"
        userName={authUser?.name || "Student"}
        breadcrumbs={[
          { label: 'Student', href: '/student' },
          { label: 'Grades' }
        ]}
      />
      
      <main className="flex-1 p-6 space-y-6 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-muted-foreground animate-pulse">Calculating academic progress...</p>
          </div>
        ) : (
          <>
            {/* Header with Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Academic Progress</h1>
                <p className="text-muted-foreground mt-1">Track your grades and performance across all courses</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
              </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <Award className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stats.overallGPA}</p>
                      <p className="text-sm text-muted-foreground">Current GPA</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Target className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stats.averagePercentage}%</p>
                      <p className="text-sm text-muted-foreground">Average Score</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stats.activeCourses}</p>
                      <p className="text-sm text-muted-foreground">Active Courses</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/10 rounded-lg">
                      <FileText className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stats.totalCredits}</p>
                      <p className="text-sm text-muted-foreground">Credit Hours</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

        {/* Course Grades */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Course Grades
            </CardTitle>
            <CardDescription>Click on a course to view detailed breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {gradesData.map((course) => (
              <div key={course.id} className="bg-muted/50 rounded-lg overflow-hidden">
                {/* Course Header */}
                <button
                  onClick={() => toggleCourse(course.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-muted/80 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-foreground">{course.course}</h3>
                      <p className="text-sm text-muted-foreground">{course.instructor}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <Badge className={getGradeColor(course.overallGrade)}>
                        {course.overallGrade}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">{course.percentage}%</p>
                    </div>
                    {expandedCourse === course.id ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Expanded Details */}
                {expandedCourse === course.id && (
                  <div className="border-t border-border p-4 bg-background/50">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-sm text-muted-foreground">
                            <th className="pb-3 font-medium">Assignment</th>
                            <th className="pb-3 font-medium text-center">Score</th>
                            <th className="pb-3 font-medium text-center">Percentage</th>
                            <th className="pb-3 font-medium text-right">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {course.assignments.map((assignment, index) => (
                            <tr key={index}>
                              <td className="py-3 text-foreground">{assignment.name}</td>
                              <td className="py-3 text-center">
                                <span className={`font-semibold ${getScoreColor(assignment.score, assignment.total)}`}>
                                  {assignment.score}
                                </span>
                                <span className="text-muted-foreground">/{assignment.total}</span>
                              </td>
                              <td className="py-3 text-center">
                                <span className={`font-medium ${getScoreColor(assignment.score, assignment.total)}`}>
                                  {((assignment.score / assignment.total) * 100).toFixed(0)}%
                                </span>
                              </td>
                              <td className="py-3 text-right text-muted-foreground">{assignment.date}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Grade Scale Reference */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Grade Scale Reference</CardTitle>
            <CardDescription>Understanding the grading system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {[
                { grade: "A", range: "90-100%", gpa: "4.0" },
                { grade: "B", range: "80-89%", gpa: "3.0" },
                { grade: "C", range: "70-79%", gpa: "2.0" },
                { grade: "D", range: "60-69%", gpa: "1.0" },
                { grade: "F", range: "Below 60%", gpa: "0.0" }
              ].map((item) => (
                <div key={item.grade} className="text-center p-3 bg-muted/50 rounded-lg">
                  <span className={`text-lg font-bold ${getGradeColor(item.grade).split(" ")[0]}`}>{item.grade}</span>
                  <p className="text-xs text-muted-foreground mt-1">{item.range}</p>
                  <p className="text-xs text-muted-foreground">GPA: {item.gpa}</p>
                </div>
              ))}
            </div>
          </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  )
}
