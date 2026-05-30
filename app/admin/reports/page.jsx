'use client'

import { useState } from 'react'
import { 
  BarChart3, 
  Download,
  Printer,
  Calendar,
  TrendingUp,
  Users,
  FileText,
  Activity,
  GraduationCap,
  Eye,
  Search
} from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { StatsCard, StatusBadge } from '@/components/dashboard-components'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { apiFetch } from '@/lib/api-client'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts'

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly')
  const [analytics, setAnalytics] = useState(null)
  const [reportsList, setReportsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [activitiesSearchQuery, setActivitiesSearchQuery] = useState('')
  const [activitiesTypeFilter, setActivitiesTypeFilter] = useState('all')

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const res = await apiFetch(`/api/admin/reports?analytics=true&period=${selectedPeriod}`)
      if (res.success) {
        setAnalytics(res.data)
      }
      
      const reportsRes = await apiFetch('/api/admin/reports?limit=10')
      if (reportsRes.success) {
        setReportsList(reportsRes.data.reports)
      }
    } catch (err) {
      if (err?.status !== 401 && err?.status !== 403) {
        console.error("Failed to load analytics", err)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [selectedPeriod])

  const handleGenerateReport = async () => {
    try {
      toast.loading('Generating report...')
      const res = await apiFetch('/api/admin/reports', {
        method: 'POST',
        body: JSON.stringify({ period: selectedPeriod })
      })
      if (res.success) {
        toast.dismiss()
        toast.success('Report generated and saved!')
        fetchAnalytics()
      }
    } catch (err) {
      toast.dismiss()
      toast.error(err.message || 'Failed to generate report')
    }
  }

  const handleExportExcel = () => {
    if (!analytics) {
      toast.error('No report data available to export')
      return
    }

    let csvContent = "data:text/csv;charset=utf-8,"
    csvContent += "System Performance & Analytics Report\n"
    csvContent += `Report Period,${selectedPeriod.toUpperCase()}\n`
    csvContent += `Generated On,${new Date(analytics.generatedAt || new Date()).toLocaleString()}\n\n`

    csvContent += "METRIC CARD OVERVIEW\n"
    csvContent += "Metric Name,Value\n"
    csvContent += `Total Assignments,${analytics.performanceCards?.totalAssignments || 0}\n`
    csvContent += `Total Submissions,${analytics.performanceCards?.submissions || 0}\n`
    csvContent += `Instructor Activities,${analytics.performanceCards?.instructorActivities || 0}\n`
    csvContent += `Student Activities,${analytics.performanceCards?.studentActivities || 0}\n\n`

    csvContent += "ASSIGNMENT COMPLETION STATUS BREAKDOWN\n"
    csvContent += "Status,Count\n"
    const comp = analytics.assignmentCompletion || []
    comp.forEach(item => {
      csvContent += `"${item._id || 'Pending'}",${item.count}\n`
    })
    csvContent += "\n"

    csvContent += "ENGAGEMENT BY ROLE\n"
    csvContent += "Role,Activity Count\n"
    csvContent += `"Instructors",${analytics.performanceCards?.instructorActivities || 0}\n`
    csvContent += `"Students",${analytics.performanceCards?.studentActivities || 0}\n\n`

    csvContent += "STUDENT DETAILED ACTIVITIES\n"
    csvContent += "Student Name,Student Email,Activity Type,Item Name,Status,Date,Remarks\n"
    const detailedActs = analytics.studentActivitiesList || []
    detailedActs.forEach(act => {
      const dateStr = new Date(act.date).toLocaleString().replace(/,/g, '')
      const name = (act.studentName || '').replace(/"/g, '""')
      const email = (act.studentEmail || '').replace(/"/g, '""')
      const type = (act.activityType || '').replace(/"/g, '""')
      const item = (act.itemName || '').replace(/"/g, '""')
      const status = (act.status || '').replace(/"/g, '""')
      const remarks = (act.remarks || '').replace(/"/g, '""')
      csvContent += `"${name}","${email}","${type}","${item}","${status}","${dateStr}","${remarks}"\n`
    })

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `admin_performance_report_${selectedPeriod}_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Performance report exported to Excel successfully!')
  }

  const cards = analytics?.performanceCards || {}
  
  const stats = [
    { title: "Instructor Activities", value: (cards.instructorActivities || 0).toLocaleString(), icon: Activity },
    { title: "Student Activities", value: (cards.studentActivities || 0).toLocaleString(), icon: Users },
    { title: "Total Submissions", value: (cards.submissions || 0).toLocaleString(), icon: FileText },
    { title: "Total Assignments", value: (cards.totalAssignments || 0).toLocaleString(), icon: TrendingUp },
  ]

  const completionData = (analytics?.assignmentCompletion || []).map(s => ({
    name: s._id || 'Pending',
    value: s.count,
    color: s._id === 'Graded' ? '#22c55e' : s._id === 'Submitted' ? '#3b82f6' : '#f59e0b'
  }))

  const detailedActivities = analytics?.studentActivitiesList || []
  const filteredActivities = detailedActivities.filter(act => {
    const matchesSearch = 
      (act.studentName || '').toLowerCase().includes(activitiesSearchQuery.toLowerCase()) ||
      (act.studentEmail || '').toLowerCase().includes(activitiesSearchQuery.toLowerCase()) ||
      (act.itemName || '').toLowerCase().includes(activitiesSearchQuery.toLowerCase()) ||
      (act.remarks || '').toLowerCase().includes(activitiesSearchQuery.toLowerCase())

    const matchesType = activitiesTypeFilter === 'all' || act.activityType === activitiesTypeFilter

    return matchesSearch && matchesType
  })

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar 
        title="Reports & Analytics" 
        userRole="Administrator"
        userName="Admin User"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Reports & Analytics' }
        ]}
      />
      
      <main className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-4">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Last 7 Days</SelectItem>
                <SelectItem value="monthly">Last 30 Days</SelectItem>
                <SelectItem value="semester">Last 4 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 flex-wrap">
            {/* <Button className="gap-2" onClick={handleGenerateReport}>
              <Activity className="h-4 w-4" />
              Generate &amp; Save Report
            </Button> */}
            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleExportExcel}>
              <Download className="h-4 w-4" />
              Export Excel
            </Button>
            <Button className="gap-2 bg-rose-600 hover:bg-rose-700 text-white" onClick={() => window.print()}>
              <FileText className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* Performance Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <StatsCard key={i} {...s} />
          ))}
        </div>

        {/* Report Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Live Analytics</TabsTrigger>
            <TabsTrigger value="activities">Student Activities</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Submission Statistics */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Assignment Submission Status
                  </CardTitle>
                  <CardDescription>Breakdown of submissions in selected period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center">
                    {completionData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={completionData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {completionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-muted-foreground">No submission data for this period</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Activity Overview */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Engagement Overview
                  </CardTitle>
                  <CardDescription>Instructor vs Student activity count</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Instructors', value: cards.instructorActivities || 0 },
                        { name: 'Students', value: cards.studentActivities || 0 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={14} tick={{ fill: "#fff" }} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tick={{ fill: "#fff" }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Activities" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activities" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Detailed Student Activities
                    </CardTitle>
                    <CardDescription>
                      Detailed logs of student submissions, downloads, and other events in the selected period.
                    </CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <div className="relative flex-1 sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search student or item..."
                        className="pl-10 h-9"
                        value={activitiesSearchQuery}
                        onChange={(e) => setActivitiesSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select value={activitiesTypeFilter} onValueChange={setActivitiesTypeFilter}>
                      <SelectTrigger className="w-full sm:w-44 h-9">
                        <SelectValue placeholder="All Activity Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Activity Types</SelectItem>
                        <SelectItem value="Assignment Submission">Assignment Submission</SelectItem>
                        <SelectItem value="Material Download">Material Download</SelectItem>
                        <SelectItem value="Attendance">Attendance</SelectItem>
                        <SelectItem value="Quiz Attempt">Quiz Attempt</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Student</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Activity Type</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Details / Item</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredActivities.map((act) => (
                        <tr key={act.id} className="border-b border-border/50 hover:bg-muted/50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                                {act.studentName.charAt(0)}
                              </div>
                              <div>
                                <div className="font-medium text-foreground">{act.studentName}</div>
                                <div className="text-xs text-muted-foreground">{act.studentEmail}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={act.activityType === 'Assignment Submission' ? 'default' : 'outline'} className="text-xs">
                              {act.activityType}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-foreground font-medium">{act.itemName}</td>
                          <td className="py-3 px-4">
                            <StatusBadge status={act.status} />
                          </td>
                          <td className="py-3 px-4 text-muted-foreground text-sm">
                            {new Date(act.date).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground max-w-[200px] truncate" title={act.remarks}>
                            {act.remarks || '—'}
                          </td>
                        </tr>
                      ))}
                      {filteredActivities.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-10 text-center text-muted-foreground">
                            No student activities found for this period.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Saved Reports
                </CardTitle>
                <CardDescription>Browsing previously generated system reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Report Title</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Generated By</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportsList.map((report) => (
                        <tr key={report._id} className="border-b border-border/50 hover:bg-muted/50">
                          <td className="py-3 px-4 font-medium text-foreground">{report.title}</td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">{report.type}</Badge>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">{report.generatedBy?.name || 'Admin'}</td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <Button variant="ghost" size="sm" className="gap-2" onClick={() => console.log(report.data)}>
                              <Eye className="h-4 w-4" /> View
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {reportsList.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-10 text-center text-muted-foreground">
                            No saved reports found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
