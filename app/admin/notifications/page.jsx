'use client'

import { useState } from 'react'
import { 
  Bell, 
  Search, 
  Check,
  Trash2,
  FileText,
  Upload,
  Clock,
  Award,
  Settings,
  CheckCheck,
  Filter,
  MoreVertical
} from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

function getNotificationIcon(type) {
  switch(type) {
    case 'assignment':
      return <FileText className="h-5 w-5 text-blue-500" />
    case 'submission':
      return <Upload className="h-5 w-5 text-green-500" />
    case 'deadline':
      return <Clock className="h-5 w-5 text-orange-500" />
    case 'grade':
      return <Award className="h-5 w-5 text-purple-500" />
    case 'system':
      return <Settings className="h-5 w-5 text-gray-500" />
    default:
      return <Bell className="h-5 w-5 text-primary" />
  }
}

function getNotificationBgColor(type) {
  switch(type) {
    case 'assignment':
      return 'bg-blue-500/10'
    case 'submission':
      return 'bg-green-500/10'
    case 'deadline':
      return 'bg-orange-500/10'
    case 'grade':
      return 'bg-purple-500/10'
    case 'system':
      return 'bg-gray-500/10'
    default:
      return 'bg-primary/10'
  }
}

function formatTimeAgo(date) {
  if (!date) return ''
  const now = new Date()
  const diff = now - new Date(date)
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 60) return `${minutes} minutes ago`
  if (hours < 24) return `${hours} hours ago`
  return `${days} days ago`
}

export default function NotificationsPage() {
  const [notificationsList, setNotificationsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await apiFetch('/api/admin/notifications?limit=100')
      if (res.success) {
        setNotificationsList(res.data.notifications)
      }
    } catch (err) {
      if (err?.status !== 401 && err?.status !== 403) {
        console.error("Failed to load notifications", err)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleMarkAsRead = async (id) => {
    try {
      const res = await apiFetch(`/api/admin/notifications/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ read: true })
      })
      if (res.success) {
        setNotificationsList(prev => prev.map(n => n._id === id ? { ...n, read: true } : n))
      }
    } catch (err) {
      toast.error('Failed to mark as read')
    }
  }

  const handleDeleteNotification = async (id) => {
    try {
      const res = await apiFetch(`/api/admin/notifications/${id}`, {
        method: 'DELETE'
      })
      if (res.success) {
        setNotificationsList(prev => prev.filter(n => n._id !== id))
        toast.success('Notification deleted')
      }
    } catch (err) {
      toast.error('Failed to delete notification')
    }
  }

  const handleMarkAllRead = async () => {
    try {
      const res = await apiFetch('/api/admin/notifications', {
        method: 'PUT',
        body: JSON.stringify({ read: true })
      })
      if (res.success) {
        setNotificationsList(prev => prev.map(n => ({ ...n, read: true })))
        toast.success('All notifications marked as read')
      }
    } catch (err) {
      toast.error('Failed to mark all as read')
    }
  }

  const filteredNotifications = notificationsList.filter(notification => {
    const matchesSearch = (notification.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (notification.message || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || notification.type === filterType
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'read' && notification.read) ||
                         (filterStatus === 'unread' && !notification.read)
    return matchesSearch && matchesType && matchesStatus
  })

  const unreadCount = notificationsList.filter(n => !n.read).length
  const stats = {
    total: notificationsList.length,
    unread: unreadCount,
    assignments: notificationsList.filter(n => n.type === 'assignment').length,
    deadlines: notificationsList.filter(n => n.type === 'deadline').length,
    system: notificationsList.filter(n => n.type === 'system').length
  }

  const NotificationCard = ({ notification }) => (
    <div className={`flex items-start gap-4 p-4 rounded-lg border transition-all hover:border-primary/50 ${
      notification.read ? 'bg-card border-border' : 'bg-primary/5 border-primary/20 shadow-sm'
    }`}>
      <div className={`h-10 w-10 rounded-full ${getNotificationBgColor(notification.type)} flex items-center justify-center flex-shrink-0`}>
        {getNotificationIcon(notification.type)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className={`font-medium text-foreground ${!notification.read && 'font-semibold'}`}>
              {notification.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs text-muted-foreground">{formatTimeAgo(notification.createdAt)}</span>
              <Badge variant="outline" className="text-xs capitalize">{notification.type}</Badge>
              {!notification.read && (
                <Badge className="bg-primary text-primary-foreground text-xs">New</Badge>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="flex-shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!notification.read && (
                <DropdownMenuItem className="gap-2" onClick={() => handleMarkAsRead(notification._id)}>
                  <Check className="h-4 w-4" /> Mark as Read
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="gap-2 text-destructive" onClick={() => handleDeleteNotification(notification._id)}>
                <Trash2 className="h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar 
        title="Notifications" 
        userRole="Administrator"
        userName="Admin User"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Notifications' }
        ]}
      />
      
      <main className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bell className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <Bell className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.unread}</p>
                  <p className="text-sm text-muted-foreground">Unread</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.assignments}</p>
                  <p className="text-sm text-muted-foreground">Assignments</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.deadlines}</p>
                  <p className="text-sm text-muted-foreground">Deadlines</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-gray-500/10 flex items-center justify-center">
                  <Settings className="h-6 w-6 text-gray-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.system}</p>
                  <p className="text-sm text-muted-foreground">System</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-1 gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search notifications..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="assignment">Assignment</SelectItem>
                <SelectItem value="submission">Submission</SelectItem>
                <SelectItem value="deadline">Deadline</SelectItem>
                <SelectItem value="grade">Grade</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={handleMarkAllRead}>
              <CheckCheck className="h-4 w-4" />
              Mark All Read
            </Button>
            <Button variant="outline" className="gap-2 text-destructive hover:text-destructive" onClick={() => toast.info('Manual clearing coming soon')}>
              <Trash2 className="h-4 w-4" />
              Clear All
            </Button>
          </div>
        </div>

        {/* Notifications List */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>All Notifications</CardTitle>
            <CardDescription>
              {loading ? 'Loading notifications...' : (unreadCount > 0 
                ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                : 'All notifications are read')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread" className="relative">
                  Unread
                  {unreadCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="read">Read</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-3">
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map(notification => (
                    <NotificationCard key={notification._id} notification={notification} />
                  ))
                ) : !loading && (
                  <div className="text-center py-12">
                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No notifications found</h3>
                    <p className="text-sm text-muted-foreground">No notifications match your search criteria</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="unread" className="space-y-3">
                {filteredNotifications.filter(n => !n.read).length > 0 ? (
                  filteredNotifications.filter(n => !n.read).map(notification => (
                    <NotificationCard key={notification._id} notification={notification} />
                  ))
                ) : !loading && (
                  <div className="text-center py-12">
                    <CheckCheck className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">All caught up!</h3>
                    <p className="text-sm text-muted-foreground">You have no unread notifications</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="read" className="space-y-3">
                {filteredNotifications.filter(n => n.read).length > 0 ? (
                  filteredNotifications.filter(n => n.read).map(notification => (
                    <NotificationCard key={notification._id} notification={notification} />
                  ))
                ) : !loading && (
                  <div className="text-center py-12">
                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No read notifications</h3>
                    <p className="text-sm text-muted-foreground">Notifications you have read will appear here</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
