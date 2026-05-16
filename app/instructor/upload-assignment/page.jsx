"use client"

import { useState, useEffect } from "react"
import { useApi } from '@/hooks/use-api'
import { apiFetch, uploadFile } from '@/lib/api-client'
import { toast } from 'sonner'
import { 
  Upload, 
  FileText, 
  Calendar,
  BookOpen,
  Save,
  X,
  CheckCircle
} from "lucide-react"
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
} from "@/components/ui/dialog"

export default function UploadAssignmentPage() {
  const { data: coursesData } = useApi('/api/instructor/courses')
  const { data: assignmentsData, refetch: refetchAssignments } = useApi('/api/instructor/assignments')
  const courses = coursesData?.courses || []
  const user = coursesData?.user || {}
  const userName = user.name || "Instructor"
  const recentAssignments = (assignmentsData?.assignments || []).slice(0, 5)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    course: "",
    description: "",
    instructions: "",
    totalMarks: "",
    deadline: "",
    file: null
  })
  const [dragActive, setDragActive] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

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
      setFormData({ ...formData, file: e.dataTransfer.files[0] })
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] })
    }
  }

  const removeFile = () => {
    setFormData({ ...formData, file: null })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      let fileUrl = ''
      if (formData.file) {
        const uploaded = await uploadFile(formData.file, 'eduhub/assignments')
        fileUrl = uploaded.url
      }
      const selectedCourse = courses.find((c) => c._id === formData.course || c.code === formData.course)
      await apiFetch('/api/instructor/assignments', {
        method: 'POST',
        body: JSON.stringify({
          title: formData.title,
          course: selectedCourse?._id || formData.course,
          description: formData.description,
          instructions: formData.instructions,
          totalMarks: Number(formData.totalMarks),
          deadline: formData.deadline,
          subject: selectedCourse?.code || '',
          fileUrl,
          status: 'Active',
        }),
      })
      setShowSuccessModal(true)
      refetchAssignments()
      setFormData({
        title: "",
        course: "",
        description: "",
        instructions: "",
        totalMarks: "",
        deadline: "",
        file: null
      })
      toast.success('Assignment created successfully')
    } catch (err) {
      toast.error(err.message || 'Failed to create assignment')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar 
        title="Upload Assignment" 
        userRole="Instructor"
        userName={userName}
        breadcrumbs={[
          { label: 'Instructor', href: '/instructor/dashboard' },
          { label: 'Upload Assignment' }
        ]}
      />
      
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-xl font-semibold text-foreground">Create New Assignment</h2>
            <p className="text-muted-foreground">Upload a new assignment for your students</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Assignment Details</CardTitle>
                  <CardDescription>Fill in the assignment information</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                      <Label htmlFor="title">Assignment Title</Label>
                      <Input
                        id="title"
                        placeholder="e.g., Assignment 4 - Functions and Loops"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>

                    {/* Course Selection */}
                    <div className="space-y-2">
                      <Label>Course</Label>
                      <Select
                        value={formData.course}
                        onValueChange={(value) => setFormData({ ...formData, course: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a course" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.map((course) => (
                            <SelectItem key={course._id} value={course._id}>
                              {course.code} - {course.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Brief description of the assignment..."
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>

                    {/* Instructions */}
                    <div className="space-y-2">
                      <Label htmlFor="instructions">Instructions</Label>
                      <Textarea
                        id="instructions"
                        placeholder="Detailed instructions for students..."
                        rows={5}
                        value={formData.instructions}
                        onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Total Marks */}
                      <div className="space-y-2">
                        <Label htmlFor="marks">Total Marks</Label>
                        <Input
                          id="marks"
                          type="number"
                          min="1"
                          placeholder="e.g., 100"
                          value={formData.totalMarks}
                          onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                          required
                        />
                      </div>

                      {/* Deadline */}
                      <div className="space-y-2">
                        <Label htmlFor="deadline">Deadline</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="deadline"
                            type="datetime-local"
                            className="pl-10"
                            value={formData.deadline}
                            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* File Upload */}
                    <div className="space-y-2">
                      <Label>Assignment File (Optional)</Label>
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
                          accept=".pdf,.doc,.docx,.ppt,.pptx"
                        />
                        {formData.file ? (
                          <div className="flex items-center justify-center gap-3">
                            <FileText className="h-8 w-8 text-primary" />
                            <div className="text-left">
                              <p className="font-medium">{formData.file.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {(formData.file.size / 1024 / 1024).toFixed(2)} MB
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
                              Supports PDF, DOC, DOCX, PPT, PPTX (max 50MB)
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex justify-end gap-3">
                      <Button type="button" variant="outline">
                        Save as Draft
                      </Button>
                      <Button type="submit">
                        <Upload className="w-4 h-4 mr-2" />
                        Publish Assignment
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Recent Assignments */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recent Assignments</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentAssignments.map((assignment) => (
                    <div key={assignment._id || assignment.id} className="p-3 bg-muted rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{assignment.title}</p>
                          <p className="text-xs text-muted-foreground">{assignment.course?.code || assignment.course}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{new Date(assignment.deadline).toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs text-primary mt-1">{assignment.submissions?.length || 0} submissions</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Provide clear and detailed instructions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Set realistic deadlines</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Include grading rubric if possible</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Attach sample files when needed</span>
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
              <DialogTitle className="text-center">Assignment Published!</DialogTitle>
              <DialogDescription className="text-center">
                Your assignment has been successfully published. Students will be notified.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center gap-3 mt-4">
              <Button variant="outline" onClick={() => setShowSuccessModal(false)}>
                Create Another
              </Button>
              <Button onClick={() => window.location.href = '/instructor/submissions'}>
                View Submissions
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
