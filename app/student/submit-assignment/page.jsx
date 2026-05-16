"use client"

import { useState } from "react"
import { 
  Upload, 
  FileText, 
  Calendar,
  BookOpen,
  Send,
  X,
  CheckCircle,
  AlertCircle,
  Clock
} from "lucide-react"
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { useApi } from '@/hooks/use-api'
import { apiFetch, uploadFile } from '@/lib/api-client'
import { toast } from 'sonner'

import { useAuth } from '@/contexts/auth-context'

function getDaysRemaining(deadline) {
  if (!deadline) return 0
  const now = new Date()
  const deadlineDate = new Date(deadline)
  const diff = deadlineDate - now
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  return days
}

function getDeadlineStatus(deadline) {
  const days = getDaysRemaining(deadline)
  if (days < 0) return { label: "Overdue", color: "bg-red-100 text-red-700" }
  if (days <= 1) return { label: "Due Today", color: "bg-red-100 text-red-700" }
  if (days <= 3) return { label: `${days} days left`, color: "bg-orange-100 text-orange-700" }
  return { label: `${days} days left`, color: "bg-green-100 text-green-700" }
}

export default function SubmitAssignmentPage() {
  const { user: authUser } = useAuth()
  const { data: assignmentsRaw, loading: loadingAssignments, refetch: refetchAssignments } = useApi('/api/student/assignments')
  const { data: submissionsRaw, loading: loadingSubmissions, refetch: refetchSubmissions } = useApi('/api/student/submissions')
  
  const assignments = assignmentsRaw || []
  const pendingAssignments = assignments
    .filter((a) => a.submissionStatus === 'Pending' || a.submissionStatus === 'Not Submitted')
    .map((a) => ({
      id: a._id,
      title: a.title,
      course: a.course?.name ? `${a.course.code} - ${a.course.name}` : 'Unknown Course',
      courseCode: a.course?.code || 'N/A',
      instructor: a.instructor?.name || 'Instructor',
      deadline: a.dueDate,
      totalMarks: a.totalPoints || 100,
      description: a.description,
      status: 'pending',
    }))

  const submittedAssignments = (submissionsRaw || []).map((s) => ({
    id: s._id,
    title: s.assignment?.title || 'Assignment',
    course: s.course?.code || s.assignment?.course?.code || '',
    submittedDate: new Date(s.submittedAt).toLocaleDateString(),
    marks: s.grade,
    totalMarks: s.assignment?.totalPoints || 100,
    status: s.status?.toLowerCase() || 'submitted',
  }))

  const [selectedAssignment, setSelectedAssignment] = useState("")
  const [notes, setNotes] = useState("")
  const [file, setFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const currentAssignment = pendingAssignments.find(a => a.id.toString() === selectedAssignment)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const removeFile = () => {
    setFile(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedAssignment || !file) {
      toast.error('Select an assignment and upload a file')
      return
    }
    setSubmitting(true)
    try {
      const uploaded = await uploadFile(file, 'submissions')
      const res = await apiFetch('/api/student/submissions', {
        method: 'POST',
        body: JSON.stringify({ 
          assignmentId: selectedAssignment, 
          fileUrl: uploaded.url,
          notes: notes
        }),
      })

      if (res.success) {
        setShowSuccessModal(true)
        refetchAssignments()
        refetchSubmissions()
        setSelectedAssignment("")
        setNotes("")
        setFile(null)
        toast.success('Assignment submitted successfully')
      }
    } catch (err) {
      toast.error(err.message || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col bg-background/50">
      <Navbar 
        title="Submit Assignment" 
        userRole="Student"
        userName={authUser?.name || "Student"}
        breadcrumbs={[
          { label: 'Student', href: '/student' },
          { label: 'Submit Assignment' }
        ]}
      />
      
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-2xl font-bold text-foreground">Assignment Submission</h2>
            <p className="text-muted-foreground">Upload your work for grading and feedback</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Submit Your Work</CardTitle>
                  <CardDescription>Choose an assignment and upload your file</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Assignment Selection */}
                    <div className="space-y-2">
                      <Label>Select Assignment</Label>
                      <Select value={selectedAssignment} onValueChange={setSelectedAssignment}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={loadingAssignments ? "Loading assignments..." : "Choose an assignment to submit"} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {pendingAssignments.length === 0 ? (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                              No pending assignments found.
                            </div>
                          ) : (
                            pendingAssignments.map((assignment) => {
                              const status = getDeadlineStatus(assignment.deadline)
                              return (
                                <SelectItem key={assignment.id} value={assignment.id.toString()}>
                                  <div className="flex items-center gap-2">
                                    <span className="truncate max-w-[200px]">{assignment.title}</span>
                                    <Badge className={`${status.color} text-[10px] px-1 h-4 flex-shrink-0`}>{status.label}</Badge>
                                  </div>
                                </SelectItem>
                              )
                            })
                          )}
                        </SelectContent>
                      </Select>
                      {pendingAssignments.length === 0 && !loadingAssignments && (
                        <p className="text-xs text-orange-500 mt-1">You have no pending assignments to submit at this time.</p>
                      )}
                    </div>

                    {/* Assignment Details */}
                    {currentAssignment && (
                      <Card className="bg-muted/50">
                        <CardContent className="pt-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium">{currentAssignment.title}</p>
                                <p className="text-sm text-muted-foreground">{currentAssignment.course}</p>
                              </div>
                              <Badge className={getDeadlineStatus(currentAssignment.deadline).color}>
                                {getDeadlineStatus(currentAssignment.deadline).label}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Instructor</p>
                                <p className="font-medium">{currentAssignment.instructor}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Total Marks</p>
                                <p className="font-medium">{currentAssignment.totalMarks}</p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-muted-foreground">Deadline</p>
                                <p className="font-medium">{new Date(currentAssignment.deadline).toLocaleString()}</p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-muted-foreground">Description</p>
                                <p>{currentAssignment.description}</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* File Upload */}
                    <div className="space-y-2">
                      <Label>Upload File</Label>
                      <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                          dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('file-upload')?.click()}
                      >
                        <input
                          id="file-upload"
                          type="file"
                          className="hidden"
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx,.zip,.rar"
                        />
                        {file ? (
                          <div className="flex items-center justify-center gap-3">
                            <FileText className="h-8 w-8 text-primary" />
                            <div className="text-left">
                              <p className="font-medium">{file.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={(e) => { e.stopPropagation(); removeFile(); }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                            <p className="text-sm font-medium">Drop your file here or click to browse</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Supports PDF, DOC, DOCX, ZIP, RAR (max 50MB)
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                      <Label htmlFor="notes">Additional Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Any comments or notes for your instructor..."
                        rows={4}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-3">
                      <Button type="button" variant="outline">
                        Save Draft
                      </Button>
                      <Button type="submit" disabled={!selectedAssignment || !file}>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Assignment
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Pending Assignments */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Pending Assignments
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pendingAssignments.map((assignment) => {
                    const status = getDeadlineStatus(assignment.deadline)
                    return (
                      <div 
                        key={assignment.id} 
                        className="p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                        onClick={() => setSelectedAssignment(assignment.id.toString())}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{assignment.title}</p>
                            <p className="text-xs text-muted-foreground">{assignment.courseCode}</p>
                          </div>
                          <Badge className={`${status.color} text-xs flex-shrink-0`}>
                            {status.label}
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              {/* Recent Submissions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Recent Submissions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {submittedAssignments.map((submission) => (
                    <div key={submission.id} className="p-3 bg-muted rounded-lg">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{submission.title}</p>
                          <p className="text-xs text-muted-foreground">{submission.course}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Submitted: {submission.submittedDate}
                          </p>
                        </div>
                        {submission.status === "graded" ? (
                          <Badge className="bg-green-100 text-green-700">
                            {submission.marks}/{submission.totalMarks}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Submission Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span>Submit before the deadline</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span>Check file format requirements</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span>Include your name and ID</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span>Verify file is not corrupted</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Success Modal */}
        <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
          <DialogContent>
            <DialogHeader>
              <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <DialogTitle className="text-center">Submission Successful!</DialogTitle>
              <DialogDescription className="text-center">
                Your assignment has been submitted successfully. You will be notified once it is graded.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center gap-3 mt-4">
              <Button variant="outline" onClick={() => setShowSuccessModal(false)}>
                Submit Another
              </Button>
              <Button onClick={() => window.location.href = '/student/assignments'}>
                View Assignments
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
