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
  Eye
} from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { StatsCard } from '@/components/dashboard-components'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
          <div className="flex gap-2">
            <Button className="gap-2" onClick={handleGenerateReport}>
              <Activity className="h-4 w-4" />
              Generate & Save Report
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              Print View
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
            <TabsTrigger value="history">Report History</TabsTrigger>
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
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
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
