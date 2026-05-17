'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, BookOpen, Users, Settings, LogOut, FileText, Bell, BarChart3, UserCog, Activity, FolderOpen, Upload, ClipboardList, PlusCircle, Send, Download, GraduationCap, ChevronLeft, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Admin Sidebar Navigation Items
const adminNavItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Manage Users', icon: UserCog },
  { href: '/admin/instructors', label: 'Manage Instructors', icon: GraduationCap },
  { href: '/admin/courses', label: 'Manage Courses', icon: BookOpen },
  { href: '/admin/make-class', label: 'Make Class', icon: PlusCircle },
  { href: '/admin/assign-classes', label: 'Assign Classes', icon: Send },
  { href: '/admin/instructor-activities', label: 'Instructor Activities', icon: Activity },
  { href: '/admin/student-activities', label: 'Student Activities', icon: Users },
  { href: '/admin/assignments', label: 'Assignments', icon: FileText },
  { href: '/admin/materials', label: 'Learning Materials', icon: FolderOpen },
  { href: '/admin/activity-logs', label: 'Activity Logs', icon: ClipboardList },
  { href: '/admin/reports', label: 'Reports & Analytics', icon: BarChart3 },
  { href: '/admin/notifications', label: 'Notifications', icon: Bell },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

// Instructor Sidebar Navigation Items
const instructorNavItems = [
  { href: '/instructor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/instructor/courses', label: 'My Courses', icon: BookOpen },
  { href: '/instructor/add-activity', label: 'Add Activity', icon: PlusCircle },
  { href: '/instructor/my-activities', label: 'My Activities', icon: Activity },
  { href: '/instructor/upload-assignment', label: 'Upload Assignment', icon: Upload },
  { href: '/instructor/materials', label: 'Learning Materials', icon: FolderOpen },
  { href: '/instructor/submissions', label: 'Student Submissions', icon: ClipboardList },
  { href: '/instructor/students', label: 'My Students', icon: Users },
  { href: '/instructor/notifications', label: 'Notifications', icon: Bell },
  { href: '/instructor/reports', label: 'Reports', icon: BarChart3 },
  { href: '/instructor/profile', label: 'Profile', icon: UserCog },
  { href: '/instructor/settings', label: 'Settings', icon: Settings },
]

// Student Sidebar Navigation Items
const studentNavItems = [
  { href: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/student/courses', label: 'My Courses', icon: BookOpen },
  { href: '/student/assignments', label: 'Assignments', icon: FileText },
  { href: '/student/submit-assignment', label: 'Submit Assignment', icon: Send },
  { href: '/student/materials', label: 'Learning Materials', icon: Download },
  { href: '/student/grades', label: 'My Grades', icon: GraduationCap },
  { href: '/student/notifications', label: 'Notifications', icon: Bell },
  { href: '/student/reports', label: 'Reports', icon: BarChart3 },
  { href: '/student/profile', label: 'Profile', icon: UserCog },
  { href: '/student/settings', label: 'Settings', icon: Settings },
]

function SidebarContent({ navItems, title, collapsed, onToggle }) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout, settings } = useAuth()

  const filteredNavItems = navItems.filter(item => {
    if (item.label === 'Notifications' && !settings.sidebarNotifications) return false
    return true
  })

  const handleLogout = () => {
    logout()
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside className={cn(
        "bg-sidebar border-r border-sidebar-border min-h-screen flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}>
        {/* Header */}
        <div className={cn(
          "p-4 border-b border-sidebar-border flex items-center",
          collapsed ? "justify-center" : "justify-between"
        )}>
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
                <GraduationCap className="h-5 w-5 text-sidebar-primary-foreground" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-sidebar-foreground">{title}</h2>
                <p className="text-xs text-muted-foreground">Panel</p>
              </div>
            </div>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggle}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            const linkContent = (
              <Link key={item.href} href={item.href}>
                <Button 
                  variant={isActive ? 'default' : 'ghost'}
                  className={cn(
                    "w-full gap-3 transition-all",
                    collapsed ? "justify-center px-2" : "justify-start",
                    isActive 
                      ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90" 
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Button>
              </Link>
            )

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    {linkContent}
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              )
            }

            return linkContent
          })}
        </nav>
        
        {/* Logout */}
        <div className="p-2 border-t border-sidebar-border space-y-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                className={cn(
                  "w-full gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive",
                  collapsed ? "justify-center px-2" : "justify-start"
                )}
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 flex-shrink-0" />
                {!collapsed && <span>Logout</span>}
              </Button>
            </TooltipTrigger>
            {collapsed && <TooltipContent side="right">Logout</TooltipContent>}
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  )
}

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <SidebarContent 
      navItems={adminNavItems} 
      title="Admin" 
      collapsed={collapsed}
      onToggle={() => setCollapsed(!collapsed)}
    />
  )
}

export function InstructorSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <SidebarContent 
      navItems={instructorNavItems} 
      title="Instructor" 
      collapsed={collapsed}
      onToggle={() => setCollapsed(!collapsed)}
    />
  )
}

export function StudentSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <SidebarContent 
      navItems={studentNavItems} 
      title="Student" 
      collapsed={collapsed}
      onToggle={() => setCollapsed(!collapsed)}
    />
  )
}
