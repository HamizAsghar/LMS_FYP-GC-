'use client'

import { useState } from 'react'
import { 
  Bell, 
  BookOpen, 
  FileText, 
  Award,
  Calendar,
  Clock,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  MoreVertical,
  Download,
  MessageSquare,
  AlertCircle
} from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { useApi } from '@/hooks/use-api'
import { apiFetch } from '@/lib/api-client'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/auth-context'

const getNotificationConfig = (type) => {
  switch(type) {
    case 'assignment':
      return { icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10' }
    case 'grade':
      return { icon: Award, color: 'text-green-500', bg: 'bg-green-500/10' }
    case 'submission':
      return { icon: Check, color: 'text-cyan-500', bg: 'bg-cyan-500/10' }
    case 'deadline':
      return { icon: Clock, color: 'text-red-500', bg: 'bg-red-500/10' }
    case 'system':
      return { icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-500/10' }
    default:
      return { icon: Bell, color: 'text-primary', bg: 'bg-primary/10' }
  }
}

export default function StudentNotifications() {
  const { user: authUser } = useAuth()
  const { data: notificationsData, loading, refetch } = useApi('/api/student/notifications')
  const [filter, setFilter] = useState('all')

  const allNotifications = notificationsData?.notifications || []
  const unreadCount = notificationsData?.unreadCount || 0

  const filteredNotifications = allNotifications.filter(n => {
    if (filter === 'all') return true
    if (filter === 'unread') return !n.read
    return n.type === filter
  })

  const markAsRead = async (id) => {
    try {
      await apiFetch('/api/student/notifications', {
        method: 'PUT',
        body: JSON.stringify({ notificationId: id })
      })
      refetch()
    } catch (err) {
      toast.error('Failed to mark as read')
    }
  }

  const markAllAsRead = async () => {
    try {
      await apiFetch('/api/student/notifications', {
        method: 'PUT',
        body: JSON.stringify({ markAll: true })
      })
      refetch()
      toast.success('All notifications marked as read')
    } catch (err) {
      toast.error('Failed to update notifications')
    }
  }

  const deleteNotification = async (id) => {
    try {
      await apiFetch(`/api/student/notifications?id=${id}`, {
        method: 'DELETE'
      })
      refetch()
      toast.success('Notification deleted')
    } catch (err) {
      toast.error('Failed to delete notification')
    }
  }

  function formatTime(timestamp) {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours} hours ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar 
        title="Notifications" 
        userRole="Student"
        userName="Ahmad Hassan"
        breadcrumbs={[
          { label: 'Student', href: '/student' },
          { label: 'Notifications' }
        ]}
      />
      
      <main className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
            <p className="text-muted-foreground mt-1">
              Stay updated with your courses and activities
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-2">{unreadCount} unread</Badge>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={markAllAsRead} className="gap-2">
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList className="bg-muted/50">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">
              Unread
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">{unreadCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="assignment">Assignments</TabsTrigger>
            <TabsTrigger value="grade">Grades</TabsTrigger>
            <TabsTrigger value="announcement">Announcements</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Notifications List */}
        <Card className="bg-card border-border">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mb-4 animate-pulse" />
                <p className="text-sm text-muted-foreground">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-foreground">No notifications</h3>
                <p className="text-sm text-muted-foreground">
                  {filter === 'unread' ? 'All caught up!' : 'No notifications to show'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredNotifications.map((notification) => {
                  const config = getNotificationConfig(notification.type)
                  const Icon = config.icon
                  return (
                    <div 
                      key={notification._id} 
                      className={`flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors ${
                        !notification.read ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className={`p-2 rounded-lg flex-shrink-0 ${config.bg}`}>
                        <Icon className={`h-5 w-5 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className={`font-medium text-foreground ${!notification.read ? 'font-semibold' : ''}`}>
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <span className="h-2 w-2 rounded-full bg-primary" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatTime(notification.timestamp)}
                              </span>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {!notification.read && (
                                <DropdownMenuItem onClick={() => markAsRead(notification._id)}>
                                  <Check className="h-4 w-4 mr-2" />
                                  Mark as read
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                onClick={() => deleteNotification(notification._id)}
                                className="text-red-500"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notification Settings Link */}
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Notification Preferences</p>
                <p className="text-sm text-muted-foreground">Manage what notifications you receive</p>
              </div>
            </div>
            <Button variant="outline" asChild>
              <a href="/student/settings">Manage</a>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
