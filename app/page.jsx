'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  GraduationCap,
  Users,
  BookOpen,
  BarChart3,
  Shield,
  Clock,
  Bell,
  FileText,
  CheckCircle,
  ArrowRight,
  Laptop,
  Award
} from 'lucide-react'

export default function LandingPage() {
  const features = [
    {
      icon: BookOpen,
      title: "Course Management",
      description: "Create, organize, and manage courses with ease. Upload materials, set deadlines, and track progress."
    },
    {
      icon: FileText,
      title: "Assignment System",
      description: "Create assignments, collect submissions, and provide feedback all in one place."
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "Comprehensive reports and analytics to track instructor and student performance."
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Stay updated with real-time notifications for assignments, deadlines, and announcements."
    },
    {
      icon: Clock,
      title: "Activity Tracking",
      description: "Monitor daily LMS activities of instructors including MDB replies, GDB marking, and more."
    },
    {
      icon: Shield,
      title: "Role-Based Access",
      description: "Secure access control with separate dashboards for Admin, Instructor, and Student roles."
    }
  ]

  const roles = [
    {
      icon: Shield,
      title: "Administrator",
      description: "Full system control with user management, analytics, and configuration options.",
      color: "from-purple-500 to-purple-700",
      link: "/login?role=admin"
    },
    {
      icon: GraduationCap,
      title: "Instructor",
      description: "Manage courses, upload materials, grade assignments, and track student progress.",
      color: "from-blue-500 to-blue-700",
      link: "/login?role=instructor"
    },
    {
      icon: Users,
      title: "Student",
      description: "Access courses, submit assignments, download materials, and view grades.",
      color: "from-green-500 to-green-700",
      link: "/login?role=student"
    }
  ]

  const stats = [
    { value: "2,800+", label: "Active Users" },
    { value: "150+", label: "Instructors" },
    { value: "89", label: "Courses" },
    { value: "98%", label: "Satisfaction" }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">EduLMS</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#roles" className="text-muted-foreground hover:text-foreground transition-colors">Roles</a>
              <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">About</a>
            </div>
            <div className="flex gap-3">
              <Link href="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 mb-8">
              <Award className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Trusted by 150+ Institutions</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-6 text-balance">
              Complete Learning Management System
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-pretty">
              A comprehensive platform for managing instructor activities, student assignments,
              learning materials, and academic performance tracking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="gap-2">
                  Start Free Trial
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  View Demo
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-card/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage your educational institution effectively
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-card border-border hover:border-primary/50 transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section id="roles" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Choose Your Role
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Separate dashboards designed for each user type with role-specific features
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {roles.map((role, index) => (
              <Card key={index} className="bg-card border-border overflow-hidden hover:shadow-xl transition-all group">
                <div className={`h-2 bg-gradient-to-r ${role.color}`} />
                <CardHeader className="pt-8">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${role.color} mb-4`}>
                    <role.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{role.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <CardDescription className="text-base">{role.description}</CardDescription>
                  <Link href={role.link}>
                    <Button className="w-full group-hover:bg-primary/90">
                      Login as {role.title}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-card/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                About Our Platform
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                EduLMS is a comprehensive Learning Management System designed to streamline
                educational processes. Our platform helps institutions track instructor
                daily activities, manage student assignments, organize learning materials,
                and generate insightful reports.
              </p>
              <ul className="space-y-4">
                {[
                  "Monitor instructor daily LMS activities",
                  "Track student assignments and submissions",
                  "Organize and share learning materials",
                  "Generate comprehensive performance reports",
                  "Real-time notifications and alerts"
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <Laptop className="h-32 w-32 text-primary/50" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-muted-foreground mb-10">
            Join thousands of institutions already using EduLMS to manage their educational activities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Create Account
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">EduLMS</span>
            </div>
            <div className="flex gap-8">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Contact</a>
            </div>
            <p className="text-muted-foreground text-sm">
              2026 EduLMS. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
