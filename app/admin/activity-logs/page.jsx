'use client'

import { useState } from 'react'
import { 
  Activity, 
  Search, 
  Download,
  Filter,
  Calendar,
  User,
  FileText,
  BookOpen,
  LogIn,
  Upload,
  Edit
} from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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

function getActionIcon(action) {
  switch(action.toLowerCase()) {
    case 'login':
      return <LogIn className="h-4 w-4" />
    case 'submitted':
      return <Upload className="h-4 w-4" />
    case 'created':
      return <FileText className="h-4 w-4" />
    case 'updated':
      return <Edit className="h-4 w-4" />
    case 'enrolled':
      return <BookOpen className="h-4 w-4" />
    default:
      return <Activity className="h-4 w-4" />
  }
}

function getActionColor(action) {
  switch(action.toLowerCase()) {
    case 'login':
      return 'bg-blue-500/10 text-blue-500'
    case 'submitted':
      return 'bg-green-500/10 text-green-500'
    case 'created':
      return 'bg-purple-500/10 text-purple-500'
    case 'updated':
      return 'bg-orange-500/10 text-orange-500'
    case 'enrolled':
      return 'bg-primary/10 text-primary'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

function formatTimestamp(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterAction, setFilterAction] = useState('all')
  const [filterRole, setFilterRole] = useState('all')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, pages: 1 })

  const fetchLogs = async () => {
    try {
      setLoading(true)
      let url = `/api/admin/activity-logs?page=${page}&limit=20&search=${searchQuery}`
      if (filterAction !== 'all') url += `&action=${filterAction}`
      if (filterRole !== 'all') url += `&role=${filterRole}`
      
      const res = await apiFetch(url)
      if (res.success) {
        setLogs(res.data.logs)
        setPagination(res.data.pagination)
      }
    } catch (err) {
      if (err?.status !== 401 && err?.status !== 403) {
        console.error("Failed to load activity logs", err)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    if (logs.length === 0) {
      toast.error('No activities to export')
      return
    }

    let csvContent = "data:text/csv;charset=utf-8,"
    csvContent += "Activity Log Report\n"
    csvContent += `Generated On,${new Date().toLocaleString()}\n`
    csvContent += `Search Query,${searchQuery || 'None'}\n`
    csvContent += `Action Filter,${filterAction}\n`
    csvContent += `Role Filter,${filterRole}\n\n`
    
    csvContent += "User Name,User Email,Role,Action,Target,Timestamp,IP Address\n"

    logs.forEach(log => {
      const name = (log.user?.name || 'System').replace(/,/g, " ")
      const email = (log.user?.email || 'N/A').replace(/,/g, " ")
      const role = (log.role || 'N/A').replace(/,/g, " ")
      const action = (log.action || '').replace(/,/g, " ")
      const target = (log.target || '').replace(/,/g, " ")
      const timestamp = formatTimestamp(log.timestamp).replace(/,/g, " ")
      const ip = (log.ipAddress || '—').replace(/,/g, " ")

      csvContent += `"${name}","${email}","${role}","${action}","${target}","${timestamp}","${ip}"\n`
    })

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `activity_logs_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Activity logs exported successfully')
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLogs()
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery, filterAction, filterRole, page])

  const activityStats = {
    total: pagination.total,
    logins: logs.filter(l => l.action?.toLowerCase() === 'login').length,
    submissions: logs.filter(l => l.action?.toLowerCase().includes('submitted')).length,
    updates: logs.filter(l => l.action?.toLowerCase().includes('updated')).length,
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar 
        title="Activity Logs" 
        userRole="Administrator"
        userName="Admin User"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Activity Logs' }
        ]}
      />
      
      <main className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{activityStats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Activities</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <LogIn className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{activityStats.logins}</p>
                  <p className="text-sm text-muted-foreground">Login Activities</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Upload className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{activityStats.submissions}</p>
                  <p className="text-sm text-muted-foreground">Submissions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Edit className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{activityStats.updates}</p>
                  <p className="text-sm text-muted-foreground">Updates</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by user or activity..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={filterAction} onValueChange={setFilterAction}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="login">Login</SelectItem>
              <SelectItem value="created">Created</SelectItem>
              <SelectItem value="updated">Updated</SelectItem>
              <SelectItem value="deleted">Deleted</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="Instructor">Instructor</SelectItem>
              <SelectItem value="Student">Student</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Activity Log Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
            <CardDescription>Complete record of system activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Role</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Action</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Target</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Timestamp</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-muted-foreground">Loading logs...</td>
                    </tr>
                  ) : logs.map((log) => (
                    <tr key={log._id} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                            {(log.user?.name || 'S').charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">{log.user?.name || 'System'}</span>
                            <span className="text-xs text-muted-foreground">{log.user?.email || 'N/A'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{log.role || 'N/A'}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-md ${getActionColor(log.action || '')}`}>
                          {getActionIcon(log.action || '')}
                          <span className="text-sm font-medium">{log.action}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-foreground">{log.target}</td>
                      <td className="py-3 px-4 text-muted-foreground">{formatTimestamp(log.timestamp)}</td>
                      <td className="py-3 px-4">
                        <code className="text-xs bg-muted px-2 py-1 rounded">{log.ipAddress || '—'}</code>
                      </td>
                    </tr>
                  ))}
                  {!loading && logs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-muted-foreground">No activity logs found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  Previous
                </Button>
                <span className="py-1 px-3 text-sm text-muted-foreground">
                  Page {page} of {pagination.pages}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={page === pagination.pages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
