"use client"

import { useState, useEffect } from "react"
import { 
  Bell, 
  Check, 
  Trash2,
  Filter,
  CheckCheck,
  FileText,
  MessageSquare,
  AlertCircle,
  Info,
  Calendar
} from "lucide-react"
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { apiFetch } from '@/lib/api-client'

const typeIcons = {
  assignment: FileText,
  deadline: Calendar,
  message: MessageSquare,
  system: AlertCircle,
  info: Info,
}

const typeColors = {
  assignment: "bg-blue-100 text-blue-600",
  deadline: "bg-orange-100 text-orange-600",
  message: "bg-green-100 text-green-600",
  system: "bg-red-100 text-red-600",
  info: "bg-purple-100 text-purple-600",
}

function formatTimeAgo(timestamp) {
  const now = new Date()
  const date = new Date(timestamp)
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 60) return `${minutes} minutes ago`
  if (hours < 24) return `${hours} hours ago`
  if (days < 7) return `${days} days ago`
  return date.toLocaleDateString()
}

export default function InstructorNotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [filter, setFilter] = useState("all")
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await apiFetch('/api/instructor/notifications')
      if (res.success) {
        setNotifications(res.data.notifications || [])
        setUser(res.data.user)
      }
    } catch (err) {
      if (err?.status !== 401 && err?.status !== 403) {
        console.error(err)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredNotifications = notifications.filter(n => {
    if (filter === "all") return true
    if (filter === "unread") return !n.read
    return n.type === filter
  })

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = async (id) => {
    try {
      const res = await apiFetch('/api/instructor/notifications', {
        method: 'PUT',
        body: JSON.stringify({ notificationId: id })
      })
      if (res.success) fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  const markAllAsRead = async () => {
    try {
      const res = await apiFetch('/api/instructor/notifications', {
        method: 'PUT',
        body: JSON.stringify({ markAll: true })
      })
      if (res.success) fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  const deleteNotification = async (id) => {
    try {
      const res = await apiFetch(`/api/instructor/notifications?id=${id}`, {
        method: 'DELETE'
      })
      if (res.success) fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  const clearAll = async () => {
    if (!confirm("Are you sure you want to delete all notifications?")) return;
    try {
      const res = await apiFetch(`/api/instructor/notifications?id=all`, {
        method: 'DELETE'
      })
      if (res.success) fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar 
        title="Notifications" 
        userRole="Instructor"
        userName={user?.name || "Instructor"}
        breadcrumbs={[
          { label: 'Instructor', href: '/instructor' },
          { label: 'Notifications' }
        ]}
      />
      
      <main className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Notification Center</h2>
            <p className="text-muted-foreground">
              You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="assignment">Assignments</SelectItem>
                <SelectItem value="deadline">Deadlines</SelectItem>
                <SelectItem value="message">Messages</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0}>
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
            <Button variant="outline" className="text-destructive" onClick={clearAll} disabled={notifications.length === 0}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{notifications.length}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{notifications.filter(n => n.type === 'assignment' || n.type === 'submission').length}</p>
                  <p className="text-xs text-muted-foreground">Assignments</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{notifications.filter(n => n.type === 'deadline').length}</p>
                  <p className="text-xs text-muted-foreground">Deadlines</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{notifications.filter(n => n.type === 'message' || n.type === 'grade').length}</p>
                  <p className="text-xs text-muted-foreground">Messages/Grades</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{unreadCount}</p>
                  <p className="text-xs text-muted-foreground">Unread</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No notifications to show</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map((notification) => {
                  const Icon = typeIcons[notification.type] || Bell
                  const colorClass = typeColors[notification.type] || "bg-muted text-muted-foreground"
                  
                  return (
                    <div 
                      key={notification._id}
                      className={`p-4 rounded-lg border transition-colors ${
                        notification.read ? 'bg-background' : 'bg-primary/5 border-primary/20'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-medium">{notification.title}</p>
                              <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {formatTimeAgo(notification.timestamp)}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              {!notification.read && (
                                <Badge variant="default" className="text-xs">New</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {!notification.read && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => markAsRead(notification._id)}
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => deleteNotification(notification._id)}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
