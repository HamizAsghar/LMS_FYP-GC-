"use client"

import { useState, useEffect } from "react"
import { 
  Users, 
  BookOpen, 
  FileText, 
  Clock,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Calendar,
  ChevronRight,
  Activity
} from "lucide-react"
import Link from "next/link"
import { apiFetch } from '@/lib/api-client'

export default function InstructorDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiFetch('/api/instructor/dashboard');
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading dashboard...</div>;
  }

  if (!data) {
    return <div className="p-8 text-center text-muted-foreground">Failed to load dashboard data.</div>;
  }

  const { user, stats, myCourses, todaySchedule, pendingSubmissions } = data;

  // Format stats array for the grid
  const statsArray = [
    { title: "Total Students", value: stats?.totalStudents || 0, icon: Users, color: "bg-blue-100 text-blue-600", change: "Current semester" },
    { title: "Active Courses", value: myCourses?.length || 0, icon: BookOpen, color: "bg-green-100 text-green-600", change: "This term" },
    { title: "Pending Reviews", value: pendingSubmissions?.length || 0, icon: FileText, color: "bg-orange-100 text-orange-600", change: "Needs grading" },
    { title: "Total Activities", value: stats?.totalActivities || 0, icon: Activity, color: "bg-purple-100 text-purple-600", change: `${stats?.completedTasks || 0} completed` }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-6 text-primary-foreground">
        <h1 className="text-2xl font-bold">Welcome back, {user?.name || "Instructor"}</h1>
        <p className="mt-1 opacity-90">You have {pendingSubmissions?.length || 0} assignments pending review and {todaySchedule?.length || 0} classes today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsArray.map((stat, index) => (
          <div key={index} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">{stat.change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Courses */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-foreground">My Courses</h2>
            <Link href="/instructor/courses" className="text-sm text-primary hover:underline flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-4 space-y-4">
            {myCourses?.length > 0 ? myCourses.map((course) => (
              <div key={course.id} className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-foreground">{course.name}</h3>
                  <span className="text-sm text-muted-foreground">{course.progress}% Complete</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-3">
                  <div 
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" /> {course.students} Students
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-4 h-4" /> {course.assignments} Assignments
                  </span>
                </div>
              </div>
            )) : <p className="text-sm text-muted-foreground">No courses available.</p>}
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-card border border-border rounded-xl">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Today's Schedule</h2>
            <Link href="/instructor/schedule" className="text-sm text-primary hover:underline flex items-center gap-1">
              Full Schedule <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-4 space-y-3">
            {todaySchedule?.length > 0 ? todaySchedule.map((item) => (
              <div key={item.id} className="p-3 bg-muted/50 rounded-lg">
                <h4 className="font-medium text-foreground text-sm mb-2">{item.course}</h4>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" /> {item.time}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> {item.room}
                  </div>
                </div>
                <span className={`inline-block mt-2 px-2 py-0.5 text-xs font-medium rounded ${
                  item.type === "Lecture" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                }`}>
                  {item.type}
                </span>
              </div>
            )) : <p className="text-sm text-muted-foreground">No classes scheduled for today.</p>}
          </div>
        </div>
      </div>

      {/* Pending Submissions */}
      <div className="bg-card border border-border rounded-xl">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Recent Submissions to Review</h2>
          <Link href="/instructor/submissions" className="text-sm text-primary hover:underline flex items-center gap-1">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Student</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Assignment</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Course</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Submitted</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pendingSubmissions?.length > 0 ? pendingSubmissions.map((submission) => (
                <tr key={submission.id} className="hover:bg-muted/30">
                  <td className="py-3 px-4 text-foreground">{submission.student}</td>
                  <td className="py-3 px-4 text-foreground">{submission.assignment}</td>
                  <td className="py-3 px-4 text-muted-foreground">{submission.course}</td>
                  <td className="py-3 px-4 text-muted-foreground">{new Date(submission.submitted).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <Link href="/instructor/submissions">
                      <button className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
                        Review
                      </button>
                    </Link>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-muted-foreground">No pending submissions</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
