"use client"

import { useState, useEffect } from "react"
import { 
  Users, 
  Search, 
  Mail,
  Eye,
  FileText,
  TrendingUp,
  TrendingDown
} from "lucide-react"
import { Navbar } from '@/components/navbar'
import { Card, CardContent } from '@/components/ui/card'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { apiFetch } from '@/lib/api-client'

export default function InstructorStudentsPage() {
  const [studentsData, setStudentsData] = useState([])
  const [courses, setCourses] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCourse, setSelectedCourse] = useState("All Courses")
  const [selectedStudent, setSelectedStudent] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await apiFetch('/api/instructor/students')
        if (res.success) {
          setStudentsData(res.data.students || [])
          if (res.data.courses) {
            setCourses(res.data.courses.map(c => `${c.code} - ${c.name}`))
          }
          if (res.data.user) {
            setUser(res.data.user)
          }
        }
      } catch (err) {
        console.error("Failed to load students", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredStudents = studentsData.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (student.rollNo && student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCourse = selectedCourse === "All Courses" || student.course.includes(selectedCourse.split(" - ")[0])
    return matchesSearch && matchesCourse
  })

  const getGradeColor = (grade) => {
    if (!grade || grade === 'N/A') return "text-gray-600 bg-gray-100"
    if (grade.startsWith("A")) return "text-green-600 bg-green-100"
    if (grade.startsWith("B")) return "text-blue-600 bg-blue-100"
    if (grade.startsWith("C")) return "text-yellow-600 bg-yellow-100"
    return "text-red-600 bg-red-100"
  }

  const getAttendanceColor = (attendance) => {
    if (attendance >= 85) return "text-green-600"
    if (attendance >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar 
        title="My Students" 
        userRole="Instructor"
        userName={user?.name || "Instructor"}
        breadcrumbs={[
          { label: 'Instructor', href: '/instructor' },
          { label: 'Students' }
        ]}
      />
      
      <main className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Header */}
        <div>
          <h2 className="text-xl font-semibold text-foreground">Student Management</h2>
          <p className="text-muted-foreground">View and manage students enrolled in your courses</p>
        </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{studentsData.length}</p>
              <p className="text-sm text-muted-foreground">Total Students</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {studentsData.length ? Math.round(studentsData.reduce((sum, s) => sum + s.attendance, 0) / studentsData.length) : 0}%
              </p>
              <p className="text-sm text-muted-foreground">Avg. Attendance</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {studentsData.reduce((sum, s) => sum + s.assignments.submitted, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Submissions</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingDown className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {studentsData.filter(s => s.status === "At Risk").length}
              </p>
              <p className="text-sm text-muted-foreground">At Risk</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="All Courses">All Courses</option>
            {courses.map(course => (
              <option key={course} value={course}>{course}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Student</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Roll No</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Course</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Attendance</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Grade</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Assignments</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-muted/30">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium text-primary">
                        {student.name.split(" ").map(n => n[0]).join("").substring(0,2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-foreground">{student.rollNo}</td>
                  <td className="py-3 px-4 text-muted-foreground text-sm">{student.course.split(",")[0]}</td>
                  <td className="py-3 px-4">
                    <span className={`font-medium ${getAttendanceColor(student.attendance)}`}>
                      {student.attendance}%
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getGradeColor(student.grade)}`}>
                      {student.grade}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {student.assignments.submitted}/{student.assignments.total}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      student.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setSelectedStudent(student)}
                        className="p-1 hover:bg-muted rounded"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button className="p-1 hover:bg-muted rounded" title="Send Email" onClick={() => window.location.href = `mailto:${student.email}`}>
                        <Mail className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {loading && studentsData.length === 0 && (
        <div className="text-center py-12">
           <h3 className="text-lg font-medium text-foreground mb-2">Loading students...</h3>
        </div>
      )}

      {!loading && filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No students found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
        </div>
      )}
      </main>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Student Details</h2>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-2 hover:bg-muted rounded-lg text-xl"
              >
                &times;
              </button>
            </div>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-xl font-bold text-primary mx-auto mb-3">
                {selectedStudent.name.split(" ").map(n => n[0]).join("").substring(0,2).toUpperCase()}
              </div>
              <h3 className="text-lg font-semibold text-foreground">{selectedStudent.name}</h3>
              <p className="text-muted-foreground">{selectedStudent.rollNo}</p>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Email</span>
                <span className="text-foreground">{selectedStudent.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Course</span>
                <span className="text-foreground">{selectedStudent.course}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Attendance</span>
                <span className={`font-medium ${getAttendanceColor(selectedStudent.attendance)}`}>
                  {selectedStudent.attendance}%
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Current Grade</span>
                <span className={`px-2 py-1 text-xs font-medium rounded ${getGradeColor(selectedStudent.grade)}`}>
                  {selectedStudent.grade}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Assignments</span>
                <span className="text-foreground">
                  {selectedStudent.assignments.submitted}/{selectedStudent.assignments.total} submitted
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Status</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  selectedStudent.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}>
                  {selectedStudent.status}
                </span>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => window.location.href = `mailto:${selectedStudent.email}`} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80">
                <Mail className="w-4 h-4" /> Send Email
              </button>
              <button className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
                View Full Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
