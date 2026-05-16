"use client"

import { useState, useEffect } from "react"
import { 
  FileText, 
  Search, 
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  MessageSquare
} from "lucide-react"
import { Navbar } from '@/components/navbar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { apiFetch } from '@/lib/api-client'

export default function InstructorSubmissionsPage() {
  const [submissionsData, setSubmissionsData] = useState([])
  const [courses, setCourses] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCourse, setSelectedCourse] = useState("All Courses")
  const [selectedStatus, setSelectedStatus] = useState("All Status")
  
  const [showGradeModal, setShowGradeModal] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [gradeInput, setGradeInput] = useState("")
  const [feedbackInput, setFeedbackInput] = useState("")
  const [submittingGrade, setSubmittingGrade] = useState(false)

  const statuses = ["All Status", "Pending", "Submitted", "Graded", "Late"]

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await apiFetch('/api/instructor/submissions')
      if (res.success) {
        // Format submissions
        const formatted = res.data.submissions.map(sub => ({
          id: sub._id,
          student: sub.student?.name || 'Unknown Student',
          assignment: sub.assignment?.title || 'Unknown Assignment',
          course: sub.assignment?.course?.code || sub.assignment?.subject || 'N/A',
          totalMarks: sub.assignment?.totalMarks || 100,
          submittedAt: new Date(sub.submittedDate).toLocaleString(),
          status: sub.status,
          grade: sub.marks != null ? `${sub.marks}/${sub.assignment?.totalMarks || 100}` : null,
          marks: sub.marks,
          feedback: sub.feedback,
          fileUrl: sub.file
        }))
        setSubmissionsData(formatted)
        
        // Setup courses
        if (res.data.courses) {
          setCourses(res.data.courses.map(c => c.code))
        }

        if (res.data.user) {
          setUser(res.data.user)
        }
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredSubmissions = submissionsData.filter(submission => {
    const matchesSearch = submission.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.assignment.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCourse = selectedCourse === "All Courses" || submission.course === selectedCourse
    const matchesStatus = selectedStatus === "All Status" || submission.status === selectedStatus
    return matchesSearch && matchesCourse && matchesStatus
  })

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending": 
      case "Submitted": return "bg-yellow-100 text-yellow-700"
      case "Graded": return "bg-green-100 text-green-700"
      case "Late": return "bg-red-100 text-red-700"
      default: return "bg-muted text-muted-foreground"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
      case "Submitted": return <Clock className="w-4 h-4" />
      case "Graded": return <CheckCircle className="w-4 h-4" />
      case "Late": return <XCircle className="w-4 h-4" />
      default: return null
    }
  }

  const openGradeModal = (submission) => {
    setSelectedSubmission(submission)
    setGradeInput(submission.marks || "")
    setFeedbackInput(submission.feedback || "")
    setShowGradeModal(true)
  }

  const handleGradeSubmit = async () => {
    if (!selectedSubmission) return
    if (!gradeInput || isNaN(gradeInput)) {
      alert("Please enter a valid numeric grade")
      return
    }

    try {
      setSubmittingGrade(true)
      const res = await apiFetch('/api/instructor/submissions', {
        method: 'PUT',
        body: JSON.stringify({
          submissionId: selectedSubmission.id,
          marks: Number(gradeInput),
          feedback: feedbackInput
        })
      })

      if (res.success) {
        setShowGradeModal(false)
        fetchData()
      } else {
        alert(res.message || "Failed to submit grade")
      }
    } catch (err) {
      alert(err.message || "Error submitting grade")
    } finally {
      setSubmittingGrade(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar 
        title="Student Submissions" 
        userRole="Instructor"
        userName={user?.name || "Instructor"}
        breadcrumbs={[
          { label: 'Instructor', href: '/instructor' },
          { label: 'Submissions' }
        ]}
      />
      
      <main className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Header */}
        <div>
          <h2 className="text-xl font-semibold text-foreground">Submission Review</h2>
          <p className="text-muted-foreground">Review and grade student submissions</p>
        </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{submissionsData.length}</p>
              <p className="text-sm text-muted-foreground">Total Submissions</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {submissionsData.filter(s => s.status === "Pending" || s.status === "Submitted").length}
              </p>
              <p className="text-sm text-muted-foreground">Pending Review</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {submissionsData.filter(s => s.status === "Graded").length}
              </p>
              <p className="text-sm text-muted-foreground">Graded</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {submissionsData.filter(s => s.status === "Late").length}
              </p>
              <p className="text-sm text-muted-foreground">Late Submissions</p>
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
              placeholder="Search by student or assignment..."
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
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Student</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Assignment</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Course</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Submitted</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Grade</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredSubmissions.map((submission) => (
                <tr key={submission.id} className="hover:bg-muted/30">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium text-primary">
                        {submission.student.split(" ").map(n => n[0]).join("").substring(0,2).toUpperCase()}
                      </div>
                      <span className="font-medium text-foreground">{submission.student}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-foreground">{submission.assignment}</td>
                  <td className="py-3 px-4 text-muted-foreground">{submission.course}</td>
                  <td className="py-3 px-4 text-muted-foreground text-sm">{submission.submittedAt}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(submission.status)}`}>
                      {getStatusIcon(submission.status)}
                      {submission.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-foreground font-medium">
                    {submission.grade || "-"}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button 
                        className="p-1 hover:bg-muted rounded" 
                        title="View File"
                        onClick={() => {
                          if (submission.fileUrl) window.open(submission.fileUrl, '_blank')
                          else alert("No file attached to this submission")
                        }}
                      >
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button 
                        className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                        onClick={() => openGradeModal(submission)}
                      >
                        {submission.status === "Graded" ? "Edit Grade" : "Grade"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {loading && submissionsData.length === 0 && (
        <div className="text-center py-12">
           <h3 className="text-lg font-medium text-foreground mb-2">Loading submissions...</h3>
        </div>
      )}

      {!loading && filteredSubmissions.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No submissions found</h3>
          <p className="text-muted-foreground">Try adjusting your filters</p>
        </div>
      )}
      </main>

      {/* Grade Modal */}
      {showGradeModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-foreground mb-4">Grade Submission</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Student</label>
                <p className="text-foreground font-medium">{selectedSubmission.student}</p>
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Assignment</label>
                <p className="text-foreground">{selectedSubmission.assignment}</p>
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Grade (out of {selectedSubmission.totalMarks})</label>
                <input
                  type="number"
                  min="0"
                  max={selectedSubmission.totalMarks}
                  value={gradeInput}
                  onChange={(e) => setGradeInput(e.target.value)}
                  placeholder="Enter grade"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Feedback</label>
                <textarea
                  rows={4}
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  placeholder="Enter feedback for the student..."
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowGradeModal(false)}
                className="flex-1 px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80"
                disabled={submittingGrade}
              >
                Cancel
              </button>
              <button 
                onClick={handleGradeSubmit}
                disabled={submittingGrade}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                {submittingGrade ? "Submitting..." : "Submit Grade"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
