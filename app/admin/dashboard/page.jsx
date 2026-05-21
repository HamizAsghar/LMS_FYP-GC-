'use client'

import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Activity,
  Clock,
  FileText,
  TrendingUp,
  BarChart3
} from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { StatsCard, ProgressBar } from '@/components/dashboard-components'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useApi } from '@/hooks/use-api'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts'
import { Plus, UserPlus, BookPlus, Download } from 'lucide-react'

function formatTimeAgo(date) {
  if (!date) return ''
  const now = new Date()
  const diff = now - new Date(date)
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export default function AdminDashboard() {
  const { data: dash, loading } = useApi('/api/admin/dashboard')
  const adminStats = dash?.cards || {}
  const topInstructors = dash?.topPerformingInstructors || []
  const recentActivityLogs = dash?.recentActivityLogs || []
  const performanceChartData = (dash?.monthlyPerformance || []).map((m) => ({
    month: m.month,
    activities: m.activities,
    submissions: m.submissions,
  }))

  const stats = [
    { title: "Total Users", value: (adminStats.totalUsers ?? 0).toLocaleString(), icon: Users, trend: "+12.5%", description: "from last month" },
    { title: "Total Instructors", value: (adminStats.totalInstructors ?? 0).toLocaleString(), icon: GraduationCap, trend: "+5.2%", description: "from last month" },
    { title: "Total Students", value: (adminStats.totalStudents ?? 0).toLocaleString(), icon: Users, trend: "+15.3%", description: "from last month" },
    { title: "Total Courses", value: (adminStats.totalCourses ?? 0).toLocaleString(), icon: BookOpen, trend: "+8.1%", description: "from last month" },
    { title: "Total Activities", value: (adminStats.totalActivities ?? 0).toLocaleString(), icon: Activity, trend: "+22.4%", description: "from last month" },
    { title: "Pending Tasks", value: (adminStats.pendingTasks ?? 0).toLocaleString(), icon: Clock, trend: "-3.2%", trendUp: false, description: "from last week" },
  ]

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    )
  }

  const submissionColors = {
    submitted: '#3b82f6',
    graded: '#22c55e',
    pending: '#f59e0b',
    late: '#ef4444'
  }

  const submissionStatsDataFormatted = Object.entries(dash?.assignmentSubmissionStats || {}).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: submissionColors[name.toLowerCase()] || '#94a3b8'
  }))

  const handleExport = () => {
    if (!dash) return

    let csvContent = ""

    // 1. Title & Metadata
    csvContent += "ADMIN SYSTEM MONITORING & PERFORMANCE REPORT\n"
    csvContent += `Generated on: ${new Date().toLocaleString()}\n`
    csvContent += `System Status: ACTIVE & SECURED\n\n`

    // 2. High-level Overview Cards Statistics
    csvContent += "SYSTEM STATISTICS OVERVIEW\n"
    csvContent += "Metric,Value\n"
    csvContent += `Total Registered Users,${adminStats.totalUsers ?? 0}\n`
    csvContent += `Total Instructors,${adminStats.totalInstructors ?? 0}\n`
    csvContent += `Total Students,${adminStats.totalStudents ?? 0}\n`
    csvContent += `Total Courses,${adminStats.totalCourses ?? 0}\n`
    csvContent += `Total Daily Activities,${adminStats.totalActivities ?? 0}\n`
    csvContent += `Pending Tasks,${adminStats.pendingTasks ?? 0}\n\n`

    // 3. Assignment Submission Breakdown
    csvContent += "ASSIGNMENT SUBMISSION DISTRIBUTION\n"
    csvContent += "Status,Count\n"
    submissionStatsDataFormatted.forEach(stat => {
      csvContent += `"${stat.name}",${stat.value}\n`
    });
    csvContent += "\n"

    // 4. Top Performing Instructors Tally
    csvContent += "TOP PERFORMING INSTRUCTORS LEADERBOARD\n"
    csvContent += "Instructor Name,Department,Rating,Active Courses,Activities Conducted,Completion Rate (%)\n"
    topInstructors.forEach(inst => {
      csvContent += `"${inst.name || 'Instructor'}","${inst.department || 'N/A'}",${inst.rating || 0},${inst.courses || 0},${inst.activities || 0},${inst.completionRate || 0}%\n`
    });
    csvContent += "\n"

    // 5. Recent System Activity Logs
    csvContent += "RECENT SYSTEM ACTIVITY LOGS\n"
    csvContent += "Log User,Action,Target,Timestamp\n"
    recentActivityLogs.forEach(log => {
      csvContent += `"${log.user}","${log.action}","${log.target}","${new Date(log.timestamp).toLocaleString()}"\n`
    });

    // Create a blob and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `LMS_Admin_System_Report_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar 
        title="Admin Dashboard" 
        userRole="Administrator"
        userName="Admin User"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Dashboard' }
        ]}
      />
      
      <main className="flex-1 p-6 space-y-6 overflow-auto bg-background/50">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Button className="gap-2 shadow-sm">
            <UserPlus className="h-4 w-4" /> Add User
          </Button>
          <Button variant="outline" className="gap-2 bg-card">
            <BookPlus className="h-4 w-4" /> New Course
          </Button>
          <Button variant="outline" className="gap-2 bg-card">
            <Plus className="h-4 w-4" /> Create Activity
          </Button>
          <Button variant="outline" className="gap-2 bg-card" onClick={handleExport}>
            <Download className="h-4 w-4" /> Export Report
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Performance Chart */}
          <Card className="bg-card border-border lg:col-span-2 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Performance Analytics
                </CardTitle>
                <CardDescription>Engagement trends over the last 6 months</CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 border border-primary/20">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-xs font-medium text-primary">Activities</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-500/10 border border-blue-500/20">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-xs font-medium text-blue-500">Submissions</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceChartData}>
                    <defs>
                      <linearGradient id="colorActivities" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="month" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="activities" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorActivities)" 
                      name="Activities" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="submissions" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorSubmissions)" 
                      name="Submissions" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Submission Statistics */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Submission Breakdown
              </CardTitle>
              <CardDescription>Overall status distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex flex-col items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={submissionStatsDataFormatted}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {submissionStatsDataFormatted.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                       contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-4">
                  {submissionStatsDataFormatted.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span className="text-xs font-medium text-muted-foreground">{entry.name}</span>
                      <span className="text-xs font-bold text-foreground">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Second Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Top Performing Instructors */}
          <Card className="bg-card border-border lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Top Performing Instructors
              </CardTitle>
              <CardDescription>Based on activity completion rate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Instructor</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Activities</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Rating</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Completion Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topInstructors.map((instructor, index) => (
                      <tr key={index} className="border-b border-border/50 hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                            {instructor.name?.charAt(0) || 'I'}
                          </div>
                          <span className="font-medium text-foreground">{instructor.name || 'Unknown Instructor'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-foreground">{instructor.activities}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-500">&#9733;</span>
                            <span className="text-foreground">{instructor.rating}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <ProgressBar value={instructor.completionRate} showLabel={true} size="sm" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity Logs */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest system activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivityLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-start gap-3 pb-4 border-b border-border/50 last:border-0 last:pb-0">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary flex-shrink-0">
                      {log.user.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{log.user}</p>
                      <p className="text-xs text-muted-foreground truncate">{log.action}: {log.target}</p>
                      <p className="text-xs text-muted-foreground mt-1">{formatTimeAgo(log.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Student Submission Overview */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Student Submission Overview
              </CardTitle>
              <CardDescription>Assignment submission trends</CardDescription>
            </div>
            <Button variant="outline" size="sm">View All</Button>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="submissions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Submissions" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
