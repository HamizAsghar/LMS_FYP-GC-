'use client'

import { useState } from 'react'
import { 
  Activity, 
  Search, 
  Download,
  Filter,
  Calendar,
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

export default function InstructorActivitiesPage() {
  const [activities, setActivities] = useState([])
  const [statistics, setStatistics] = useState({})
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterDate, setFilterDate] = useState('')

  const fetchActivities = async () => {
    try {
      setLoading(true)
      let url = `/api/admin/instructor-activities?limit=100&search=${searchQuery}`
      if (filterStatus !== 'all') url += `&status=${filterStatus}`
      if (filterDate) url += `&startDate=${filterDate}&endDate=${filterDate}`
      
      const res = await apiFetch(url)
      if (res.success) {
        setActivities(res.data.activities)
        
        // Map statistics for cards
        const statsMap = {
          'MDB Replies': 0,
          'GDB Marking': 0,
          'Assignment Upload': 0,
          'Assignment Marking': 0,
          'Ticket Handling': 0,
          'Email Responses': 0,
        }
        res.data.statistics.forEach(s => {
          if (statsMap[s._id] !== undefined) statsMap[s._id] = s.total
        })
        setStatistics(statsMap)
      }
    } catch (err) {
      if (err?.status !== 401 && err?.status !== 403) {
        console.error("Failed to load activities", err)
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
  }, [searchQuery, filterStatus, filterDate])

  const chartData = activities.slice(0, 10).map(a => ({
    name: a.instructorName.split(' ')[0],
    mdbReplies: a.mdbReplies || 0,
    assignmentMarking: a.assignmentMarking || 0,
    emailResponses: a.emailResponses || 0
  }))

  const handleExport = () => {
    if (!activities || activities.length === 0) return

    let csvContent = ""

    // 1. Title & Metadata
    csvContent += "INSTRUCTOR DAILY ACTIVITIES REPORT\n"
    csvContent += `Generated on: ${new Date().toLocaleString()}\n`
    csvContent += `Status Filter: ${filterStatus.toUpperCase()}\n`
    csvContent += `Search Query: ${searchQuery || 'None'}\n\n`

    // 2. High-level Statistics Tally
    csvContent += "ACTIVITY STATISTICS OVERVIEW\n"
    csvContent += "Activity Type,Total Logged Counts\n"
    Object.entries(statistics).forEach(([type, count]) => {
      csvContent += `"${type}",${count}\n`
    });
    csvContent += "\n"

    // 3. Raw Activities Log Table
    csvContent += "INSTRUCTOR ACTIVITIES DETAILED LOG\n"
    csvContent += "Instructor Name,Activity Type,Action Count,Status,Activity Date,Remarks / Details\n"
    activities.forEach(activity => {
      csvContent += `"${activity.instructorName}","${activity.activityType}",${activity.count},"${activity.status}","${new Date(activity.date).toLocaleDateString()}","${activity.remarks || ''}"\n`
    });

    // Create a blob and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `Instructor_Activities_Report_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar 
        title="Instructor Activities" 
        userRole="Administrator"
        userName="Admin User"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Instructor Activities' }
        ]}
      />
      
      <main className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatsCard title="MDB Replies" value={statistics['MDB Replies'] || 0} icon={Activity} />
          <StatsCard title="GDB Marking" value={statistics['GDB Marking'] || 0} icon={Activity} />
          <StatsCard title="Assignment Uploads" value={statistics['Assignment Upload'] || 0} icon={Activity} />
          <StatsCard title="Assignment Marking" value={statistics['Assignment Marking'] || 0} icon={Activity} />
          <StatsCard title="Ticket Handling" value={statistics['Ticket Handling'] || 0} icon={Activity} />
          <StatsCard title="Email Responses" value={statistics['Email Responses'] || 0} icon={Activity} />
        </div>

        {/* Chart */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Recent Activity Impact
            </CardTitle>
            <CardDescription>Visualizing recent instructor activity records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#8884d8" stopOpacity={0.3}/>
                    </linearGradient>
                    <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#82ca9d" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#82ca9d" stopOpacity={0.3}/>
                    </linearGradient>
                    <linearGradient id="grad3" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ffc658" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#ffc658" stopOpacity={0.3}/>
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
                    dataKey="mdbReplies" 
                    fill="url(#grad1)" 
                    name="MDB Replies" 
                    radius={[6, 6, 0, 0]} 
                    barSize={30}
                    stroke="#8884d8"
                    strokeWidth={1}
                  />
                  <Bar 
                    dataKey="assignmentMarking" 
                    fill="url(#grad2)" 
                    name="Marking" 
                    radius={[6, 6, 0, 0]} 
                    barSize={30}
                    stroke="#82ca9d"
                    strokeWidth={1}
                  />
                  <Bar 
                    dataKey="emailResponses" 
                    fill="url(#grad3)" 
                    name="Emails" 
                    radius={[6, 6, 0, 0]} 
                    barSize={30}
                    stroke="#ffc658"
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
              placeholder="Search by instructor name..." 
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
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
            </SelectContent>
          </Select>
          <Input 
            type="date" 
            className="w-40"
            value={filterDate}
          />
          <Button variant="outline" className="gap-2 bg-card ml-auto" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Activities Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>All Instructor Activities</CardTitle>
            <CardDescription>Track daily LMS activities of all instructors</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-center py-10">Loading activities...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Instructor Name</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Activity Type</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Count</th>
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
                              {activity.instructorName.charAt(0)}
                            </div>
                            <span className="font-medium text-foreground">{activity.instructorName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-foreground">{activity.activityType}</td>
                        <td className="py-3 px-4 text-foreground font-semibold">{activity.count}</td>
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
                          No activity records found.
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
