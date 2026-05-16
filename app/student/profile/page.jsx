'use client'

import Link from 'next/link'
import { 
  Settings,
  User, 
  Mail, 
  Phone, 
  MapPin, 
  BookOpen, 
  Calendar, 
  Award,
  ExternalLink
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { Navbar } from '@/components/navbar'

export default function StudentProfilePage() {
  const { user: authUser } = useAuth()

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background/50">
      <Navbar 
        title="Student Profile" 
        userRole="Student"
        userName={authUser?.name || "Student"}
        breadcrumbs={[
          { label: 'Student', href: '/student' },
          { label: 'Profile' }
        ]}
      />
      
      <main className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
            <p className="text-muted-foreground mt-1">Summary of your student account and academic status</p>
          </div>
          <Link
            href="/student/settings"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            <Settings className="w-4 h-4" />
            Manage Settings
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="bg-card border border-border rounded-xl p-6 h-fit shadow-sm">
            <div className="text-center">
              <div className="relative inline-block mb-4">
                {authUser?.avatar ? (
                  <img 
                    src={authUser?.avatar} 
                    alt="Avatar" 
                    className="w-24 h-24 rounded-full object-cover border-4 border-primary/20 shadow-inner"
                  />
                ) : (
                  <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-3xl font-bold text-primary border-4 border-primary/20">
                    {authUser?.name?.split(" ").map(n => n[0]).join("") || 'S'}
                  </div>
                )}
              </div>
              <h2 className="text-xl font-bold text-foreground">{authUser?.name}</h2>
              <p className="text-muted-foreground text-sm uppercase tracking-wider font-medium">{authUser?.role || 'Student'}</p>
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-xs font-semibold border border-green-500/20">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                Active Student
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 transition-colors">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase">Department</p>
                  <p className="font-semibold text-foreground text-sm truncate">{authUser?.department || 'Not Assigned'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 transition-colors">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Calendar className="w-4 h-4 text-purple-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase">Joined Date</p>
                  <p className="font-semibold text-foreground text-sm">{new Date(authUser?.createdAt || Date.now()).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Account Details
                </h3>
                <Link href="/student/settings" className="text-xs text-primary hover:underline flex items-center gap-1 font-medium">
                  Update <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-xl bg-muted/20 border border-border/50">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">Full Name</label>
                  <p className="text-foreground font-semibold flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    {authUser?.name}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-muted/20 border border-border/50">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">Email Address</label>
                  <p className="text-foreground font-semibold flex items-center gap-2 truncate">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    {authUser?.email}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-muted/20 border border-border/50">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">Phone Number</label>
                  <p className="text-foreground font-semibold flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    {authUser?.phone || 'Not Provided'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-muted/20 border border-border/50">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">User ID</label>
                  <p className="text-foreground font-mono text-xs font-semibold flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    {authUser?._id}
                  </p>
                </div>
              </div>
            </div>

            {/* Academic Information Card */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Award className="w-32 h-32 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Academic Overview
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
                <div className="text-center p-4 bg-primary/5 rounded-2xl border border-primary/10">
                  <p className="text-2xl font-black text-primary">{authUser?.role?.charAt(0) || 'S'}</p>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">Access Level</p>
                </div>
                <div className="text-center p-4 bg-green-500/5 rounded-2xl border border-green-500/10">
                  <p className="text-2xl font-black text-green-600 uppercase tracking-tighter text-sm">Verified</p>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">Status</p>
                </div>
                <div className="text-center p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                  <p className="text-2xl font-black text-blue-600">{new Date().getFullYear()}</p>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">Active Year</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
