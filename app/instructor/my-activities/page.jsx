"use client"

import { useState } from "react"
import { 
  Activity, 
  Search, 
  Filter,
  Calendar,
  Edit,
  Trash2,
  Eye,
  Download,
  MessageSquare,
  CheckCircle,
  Mail,
  Ticket,
  Upload,
  FileText
} from "lucide-react"
import { Navbar } from '@/components/navbar'
import { StatsCard } from '@/components/dashboard-components'
import { useApi } from '@/hooks/use-api'
import { apiFetch } from '@/lib/api-client'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

// Icons and colors mapping

const activityTypeIcons = {
  "MDB Replies": MessageSquare,
  "GDB Marking": CheckCircle,
  "Assignment Upload": Upload,
  "Assignment Marking": FileText,
  "Ticket Handling": Ticket,
  "Email Responses": Mail,
}

const activityTypeColors = {
  "MDB Replies": "bg-blue-500",
  "GDB Marking": "bg-green-500",
  "Assignment Upload": "bg-purple-500",
  "Assignment Marking": "bg-orange-500",
  "Ticket Handling": "bg-red-500",
  "Email Responses": "bg-cyan-500",
}

export default function MyActivitiesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const { data: dash, loading, refetch } = useApi('/api/instructor/activities')
  const activitiesData = dash?.activities || []
  const user = dash?.user || {}
  const userName = user.name || "Instructor"

  const filteredActivities = activitiesData.filter(activity => {
    const matchesSearch = activity.activityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (activity.remarks || "").toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || activity.activityType === filterType
    const matchesStatus = filterStatus === "all" || activity.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage)
  const paginatedActivities = filteredActivities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const getStatusBadge = (status) => {
    switch (status) {
      case "Completed":
      case "completed":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Completed</Badge>
      case "In Progress":
      case "in_progress":
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">In Progress</Badge>
      case "Pending":
      case "pending":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Pending</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const [editingActivity, setEditingActivity] = useState(null)
  const [viewingActivity, setViewingActivity] = useState(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [editFormData, setEditFormData] = useState({
    activityType: "",
    count: "",
    date: "",
    status: "",
    remarks: ""
  })

  const handleOpenEdit = (activity) => {
    setEditingActivity(activity)
    setEditFormData({
      activityType: activity.activityType,
      count: activity.count,
      date: new Date(activity.date).toISOString().split('T')[0],
      status: activity.status,
      remarks: activity.remarks || ""
    })
    setIsEditDialogOpen(true)
  }

  const handleOpenView = (activity) => {
    setViewingActivity(activity)
    setIsViewDialogOpen(true)
  }

  const handleUpdate = async () => {
    setIsUpdating(true)
    try {
      // Normalize status
      const statusMap = {
        'completed': 'Completed',
        'in_progress': 'In Progress',
        'pending': 'Pending',
        'Completed': 'Completed',
        'In Progress': 'In Progress',
        'Pending': 'Pending'
      }

      const res = await apiFetch(`/api/instructor/activities/${editingActivity._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...editFormData,
          status: statusMap[editFormData.status] || editFormData.status,
          count: parseInt(editFormData.count)
        })
      })

      if (res.success) {
        toast.success("Activity updated successfully")
        setIsEditDialogOpen(false)
        refetch()
      }
    } catch (err) {
      toast.error(err.message || "Failed to update activity")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this activity?")) return
    try {
      const res = await apiFetch(`/api/instructor/activities/${id}`, { method: 'DELETE' })
      if (res.success) {
        toast.success("Activity deleted successfully")
        refetch()
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete activity")
    }
  }

  // Calculate stats
  const totalActivityCount = activitiesData.reduce((sum, a) => sum + (a.count || 0), 0)
  const completedActivityCount = activitiesData.filter(a => a.status === "Completed" || a.status === "completed").reduce((sum, a) => sum + (a.count || 0), 0)
  const pendingActivityCount = activitiesData.filter(a => ["Pending", "pending", "In Progress", "in_progress"].includes(a.status)).reduce((sum, a) => sum + (a.count || 0), 0)
  const thisWeekCount = activitiesData.filter(a => {
    const d = new Date(a.date)
    const now = new Date()
    const diff = now - d
    return diff < 7 * 24 * 60 * 60 * 1000
  }).length

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar 
        title="My Activities" 
        userRole="Instructor"
        userName={userName}
        breadcrumbs={[
          { label: 'Instructor', href: '/instructor/dashboard' },
          { label: 'My Activities' }
        ]}
      />
      
      <main className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Activity History</h2>
            <p className="text-muted-foreground">View and manage all your recorded activities</p>
          </div>
          <Button onClick={() => window.location.href = '/instructor/add-activity'}>
            <Activity className="w-4 h-4 mr-2" />
            Add New Activity
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatsCard
            title="Total Activities"
            value={totalActivityCount}
            icon={Activity}
            trend="+12%"
            trendUp={true}
          />
          <StatsCard
            title="Completed"
            value={completedActivityCount}
            icon={CheckCircle}
            trend="+8%"
            trendUp={true}
            iconColor="text-green-600"
          />
          <StatsCard
            title="In Progress"
            value={pendingActivityCount}
            icon={Calendar}
            trend="-5%"
            trendUp={false}
            iconColor="text-yellow-600"
          />
          <StatsCard
            title="This Week"
            value={thisWeekCount}
            icon={FileText}
            trend="+15%"
            trendUp={true}
            iconColor="text-blue-600"
          />
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search activities..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Activity Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="MDB Replies">MDB Replies</SelectItem>
                  <SelectItem value="GDB Marking">GDB Marking</SelectItem>
                  <SelectItem value="Assignment Upload">Assignment Upload</SelectItem>
                  <SelectItem value="Assignment Marking">Assignment Marking</SelectItem>
                  <SelectItem value="Ticket Handling">Ticket Handling</SelectItem>
                  <SelectItem value="Email Responses">Email Responses</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Activities Table */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Records</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Activity Type</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Remarks</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedActivities.map((activity) => {
                  const Icon = activityTypeIcons[activity.activityType] || Activity
                  const bgColor = activityTypeColors[activity.activityType] || "bg-gray-500"
                  return (
                    <TableRow key={activity._id || activity.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded ${bgColor} flex items-center justify-center`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-medium">{activity.activityType}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">{activity.count}</span>
                      </TableCell>
                      <TableCell>{getStatusBadge(activity.status)}</TableCell>
                      <TableCell>{new Date(activity.date).toLocaleDateString()}</TableCell>
                      <TableCell className="max-w-xs truncate">{activity.remarks}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => handleOpenView(activity)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleOpenEdit(activity)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onSelect={() => handleDelete(activity._id)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredActivities.length)} of {filteredActivities.length} activities
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Activity</DialogTitle>
              <DialogDescription>Update your recorded activity details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Count</Label>
                  <Input 
                    type="number" 
                    value={editFormData.count} 
                    onChange={(e) => setEditFormData({...editFormData, count: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select 
                    value={editFormData.status} 
                    onValueChange={(val) => setEditFormData({...editFormData, status: val})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input 
                  type="date" 
                  value={editFormData.date} 
                  onChange={(e) => setEditFormData({...editFormData, date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Remarks</Label>
                <Textarea 
                  value={editFormData.remarks} 
                  onChange={(e) => setEditFormData({...editFormData, remarks: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdate} disabled={isUpdating}>
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Activity
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Activity Details</DialogTitle>
            </DialogHeader>
            {viewingActivity && (
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                  <div className={`w-12 h-12 rounded-lg ${activityTypeColors[viewingActivity.activityType] || 'bg-gray-500'} flex items-center justify-center`}>
                    {(() => {
                      const Icon = activityTypeIcons[viewingActivity.activityType] || Activity
                      return <Icon className="w-6 h-6 text-white" />
                    })()}
                  </div>
                  <div>
                    <p className="text-lg font-bold">{viewingActivity.activityType}</p>
                    <p className="text-sm text-muted-foreground">{new Date(viewingActivity.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg">
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Count</p>
                    <p className="text-xl font-bold">{viewingActivity.count}</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Status</p>
                    <div>{getStatusBadge(viewingActivity.status)}</div>
                  </div>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Remarks</p>
                  <p className="text-sm whitespace-pre-wrap">{viewingActivity.remarks || "No remarks provided"}</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
