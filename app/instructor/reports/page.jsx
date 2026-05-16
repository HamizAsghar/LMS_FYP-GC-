"use client"

import { useState, useEffect } from "react"
import { 
  BarChart3, 
  Download, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  Activity,
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
import { apiFetch } from '@/lib/api-client'

export default function InstructorReportsPage() {
  const [reportPeriod, setReportPeriod] = useState("monthly")
  const [selectedCourse, setSelectedCourse] = useState("all")
  
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true)
        const res = await apiFetch(`/api/instructor/reports?period=${reportPeriod}`)
        if (res.success) {
          setData(res.data)
        }
      } catch (err) {
        if (err?.status !== 401 && err?.status !== 403) {
          console.error(err)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchReports()
  }, [reportPeriod])

  const coursePerformanceFiltered = data?.coursePerformance
    ? (selectedCourse === "all" ? data.coursePerformance : data.coursePerformance.filter(c => c.course === selectedCourse))
    : []

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar 
        title="Reports & Analytics" 
        userRole="Instructor"
        userName={data?.user?.name || "Instructor"}
        breadcrumbs={[
          { label: 'Instructor', href: '/instructor' },
          { label: 'Reports' }
        ]}
      />
      
      <main className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Performance Reports</h2>
            <p className="text-muted-foreground">Track your teaching activities and student performance</p>
          </div>
          <div className="flex gap-2">
            <Select value={reportPeriod} onValueChange={setReportPeriod}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="semester">Semester</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button onClick={() => alert("Exporting report...")}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading reports data...</div>
        ) : !data ? (
          <div className="text-center py-12 text-muted-foreground">Failed to load reports.</div>
        ) : (
          <>
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatsCard
                title="Total Activities"
                value={data.overview.totalActivities}
                icon={Activity}
                trend={`${data.overview.activitiesTrend > 0 ? '+' : ''}${data.overview.activitiesTrend.toFixed(1)}%`}
                trendUp={data.overview.activitiesTrend >= 0}
              />
              <StatsCard
                title="Assignments Marked"
                value={data.overview.assignmentsMarked}
                icon={FileText}
                trend={`${data.overview.assignmentsMarkedTrend > 0 ? '+' : ''}${data.overview.assignmentsMarkedTrend.toFixed(1)}%`}
                trendUp={data.overview.assignmentsMarkedTrend >= 0}
                iconColor="text-green-600"
              />
              <StatsCard
                title="Active Students"
                value={data.overview.activeStudents}
                icon={Users}
                trend="+5%" // Keep static as requested
                trendUp={true}
                iconColor="text-blue-600"
              />
              <StatsCard
                title="Avg. Response Time"
                value="2.4h" // Keep static as requested
                icon={Calendar}
                trend="-15%" // Keep static as requested
                trendUp={true}
                iconColor="text-purple-600"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Activity Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Activity Summary</CardTitle>
                  <CardDescription>Comparison with previous period</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Activity Type</TableHead>
                        <TableHead className="text-right">This Period</TableHead>
                        <TableHead className="text-right">Last Period</TableHead>
                        <TableHead className="text-right">Change</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.activitySummary.map((item) => (
                        <TableRow key={item.type}>
                          <TableCell className="font-medium">{item.type}</TableCell>
                          <TableCell className="text-right">{item.thisMonth}</TableCell>
                          <TableCell className="text-right text-muted-foreground">{item.lastMonth}</TableCell>
                          <TableCell className="text-right">
                            <div className={`flex items-center justify-end gap-1 ${item.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {item.change >= 0 ? (
                                <TrendingUp className="w-4 h-4" />
                              ) : (
                                <TrendingDown className="w-4 h-4" />
                              )}
                              <span>{Math.abs(item.change)}%</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Weekly Activity Chart Placeholder */}
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Activity Trend</CardTitle>
                  <CardDescription>Activities distribution over the period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.weeklyData.map((week) => {
                      const total = week.mdbReplies + week.gdbMarking + week.assignments + week.tickets;
                      return (
                        <div key={week.week} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{week.week}</span>
                            <span className="text-muted-foreground">
                              {total} total
                            </span>
                          </div>
                          <div className="flex gap-1 h-6">
                            {total === 0 ? (
                              <div className="bg-muted rounded w-full h-full" />
                            ) : (
                              <>
                                <div 
                                  className="bg-blue-500 rounded-l transition-all" 
                                  style={{ width: `${(week.mdbReplies / total) * 100}%` }}
                                  title={`MDB: ${week.mdbReplies}`}
                                />
                                <div 
                                  className="bg-green-500 transition-all" 
                                  style={{ width: `${(week.gdbMarking / total) * 100}%` }}
                                  title={`GDB: ${week.gdbMarking}`}
                                />
                                <div 
                                  className="bg-orange-500 transition-all" 
                                  style={{ width: `${(week.assignments / total) * 100}%` }}
                                  title={`Assignments: ${week.assignments}`}
                                />
                                <div 
                                  className="bg-red-500 rounded-r transition-all" 
                                  style={{ width: `${(week.tickets / total) * 100}%` }}
                                  title={`Tickets: ${week.tickets}`}
                                />
                              </>
                            )}
                          </div>
                        </div>
                      )
                    })}
                    <div className="flex flex-wrap gap-4 mt-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-blue-500" />
                        <span>MDB Replies</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-green-500" />
                        <span>GDB Marking</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-orange-500" />
                        <span>Assignments</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-red-500" />
                        <span>Tickets</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Course Performance */}
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Course Performance</CardTitle>
                    <CardDescription>Student performance across your courses</CardDescription>
                  </div>
                  <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Courses</SelectItem>
                      {data.coursePerformance.map(c => (
                        <SelectItem key={c.course} value={c.course}>{c.course}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead className="text-right">Students</TableHead>
                      <TableHead className="text-right">Avg. Grade</TableHead>
                      <TableHead className="text-right">Submissions</TableHead>
                      <TableHead className="text-right">Completion Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coursePerformanceFiltered.length > 0 ? coursePerformanceFiltered.map((course) => (
                      <TableRow key={course.course}>
                        <TableCell className="font-medium">{course.course} - {course.name}</TableCell>
                        <TableCell className="text-right">{course.students}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={course.avgGrade >= 75 ? "default" : "secondary"}>
                            {course.avgGrade}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{course.submissions}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${course.completion}%` }}
                              />
                            </div>
                            <span className="text-sm">{course.completion}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">No course performance data available</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Quick Reports */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card 
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => setReportPeriod("weekly")}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg ${reportPeriod === 'weekly' ? 'bg-primary text-primary-foreground' : 'bg-blue-100 text-blue-600'} flex items-center justify-center`}>
                      <BarChart3 className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-medium">Weekly Report</p>
                      <p className="text-sm text-muted-foreground">View recent weekly analysis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card 
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => setReportPeriod("monthly")}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg ${reportPeriod === 'monthly' ? 'bg-primary text-primary-foreground' : 'bg-green-100 text-green-600'} flex items-center justify-center`}>
                      <BarChart3 className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-medium">Monthly Report</p>
                      <p className="text-sm text-muted-foreground">Comprehensive monthly summary</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card 
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => setReportPeriod("semester")}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg ${reportPeriod === 'semester' ? 'bg-primary text-primary-foreground' : 'bg-purple-100 text-purple-600'} flex items-center justify-center`}>
                      <BarChart3 className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-medium">Semester Report</p>
                      <p className="text-sm text-muted-foreground">Full semester performance review</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
