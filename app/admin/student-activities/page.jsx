'use client'

import { useState } from 'react'
import { 
  Users, 
  Search, 
  Download,
  TrendingUp
} from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { StatsCard, StatusBadge } from '@/components/dashboard-components'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { apiFetch } from '@/lib/api-client'
import { useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function StudentActivitiesPage() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterDate, setFilterDate] = useState('')

  const fetchActivities = async () => {
    try {
      setLoading(true)
      let url = `/api/admin/student-activities?limit=100&search=${searchQuery}`
      if (filterStatus !== 'all') url += `&status=${filterStatus}`
      
      const res = await apiFetch(url)
      if (res.success) {
        setActivities(res.data.activities)
      }
    } catch (err) {
      if (err?.status !== 401 && err?.status !== 403) {
        console.error("Failed to load student activities", err)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchActivities()
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery, filterStatus])

  const totalStats = {
    submissions: activities.reduce((acc, a) => acc + (a.assignmentSubmission || 0), 0),
    avgAttendance: activities.length > 0 ? Math.round(activities.reduce((acc, a) => acc + (a.attendance || 0), 0) / activities.length) : 0,
    downloads: activities.reduce((acc, a) => acc + (a.materialDownloads || 0), 0),
    quizAttempts: activities.reduce((acc, a) => acc + (a.quizAttempts || 0), 0),
  }

  const chartData = activities.slice(0, 10).map(a => ({
    name: a.studentName.split(' ')[0],
    submissions: a.assignmentSubmission || 0,
    downloads: a.materialDownloads || 0,
    quizAttempts: a.quizAttempts || 0
  }))

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar 
        title="Student Activities" 
        userRole="Administrator"
        userName="Admin User"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Student Activities' }
        ]}
      />
      
      <main className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard title="Total Submissions" value={totalStats.submissions} icon={Users} />
          <StatsCard title="Avg Attendance" value={`${totalStats.avgAttendance}%`} icon={Users} />
          <StatsCard title="Material Downloads" value={totalStats.downloads} icon={Users} />
          <StatsCard title="Quiz Attempts" value={totalStats.quizAttempts} icon={Users} />
        </div>

        {/* Chart */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Student Engagement Overview
            </CardTitle>
            <CardDescription>Comparison of real-time student activity metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    </linearGradient>
                    <linearGradient id="colorDown" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
                    </linearGradient>
                    <linearGradient id="colorQuiz" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--chart-3))" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="hsl(var(--chart-3))" stopOpacity={0.3}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--primary)/0.05)' }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      padding: '12px'
                    }}
                    itemStyle={{ fontSize: '12px', fontWeight: '500' }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    align="right" 
                    height={36}
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '12px', paddingBottom: '20px' }}
                  />
                  <Bar 
                    dataKey="submissions" 
                    fill="url(#colorSub)" 
                    name="Submissions" 
                    radius={[6, 6, 0, 0]} 
                    barSize={30}
                    stroke="hsl(var(--primary))"
                    strokeWidth={1}
                  />
                  <Bar 
                    dataKey="downloads" 
                    fill="url(#colorDown)" 
                    name="Downloads" 
                    radius={[6, 6, 0, 0]} 
                    barSize={30}
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={1}
                  />
                  <Bar 
                    dataKey="quizAttempts" 
                    fill="url(#colorQuiz)" 
                    name="Quiz Attempts" 
                    radius={[6, 6, 0, 0]} 
                    barSize={30}
                    stroke="hsl(var(--chart-3))"
                    strokeWidth={1}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by student name..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Input 
            type="date" 
            className="w-40"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>

        {/* Activities Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>All Student Activities</CardTitle>
            <CardDescription>Track activities and engagement of all students</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-center py-10">Loading student activities...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Student Name</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Activity Type</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Value</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities.map((activity) => (
                      <tr key={activity.id} className="border-b border-border/50 hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                              {activity.studentName.charAt(0)}
                            </div>
                            <span className="font-medium text-foreground">{activity.studentName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-foreground">{activity.activityType}</td>
                        <td className="py-3 px-4 text-foreground font-semibold">
                          {activity.activityType === 'Attendance' ? `${activity.attendance}%` : 
                           activity.activityType === 'Assignment Submission' ? activity.assignmentSubmission :
                           activity.activityType === 'Material Download' ? activity.materialDownloads :
                           activity.quizAttempts}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={activity.status} />
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {new Date(activity.date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground max-w-[200px] truncate">
                          {activity.remarks || '—'}
                        </td>
                      </tr>
                    ))}
                    {activities.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-muted-foreground">
                          No student activity records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
