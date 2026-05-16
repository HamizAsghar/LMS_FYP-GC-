"use client"

import { useState } from "react"
import { 
  PlusCircle, 
  Save,
  Calendar,
  FileText,
  MessageSquare,
  CheckCircle,
  Mail,
  Ticket,
  Upload
} from "lucide-react"
import { Navbar } from '@/components/navbar'
import { useApi } from '@/hooks/use-api'
import { apiFetch } from '@/lib/api-client'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

const activityTypes = [
  { value: "mdb_replies", label: "MDB Replies", icon: MessageSquare, color: "bg-blue-500" },
  { value: "gdb_marking", label: "GDB Marking", icon: CheckCircle, color: "bg-green-500" },
  { value: "assignment_upload", label: "Assignment Upload", icon: Upload, color: "bg-purple-500" },
  { value: "assignment_marking", label: "Assignment Marking", icon: FileText, color: "bg-orange-500" },
  { value: "ticket_handling", label: "Ticket Handling", icon: Ticket, color: "bg-red-500" },
  { value: "email_responses", label: "Email Responses", icon: Mail, color: "bg-cyan-500" },
]

const statusOptions = [
  { value: "Completed", label: "Completed" },
  { value: "In Progress", label: "In Progress" },
  { value: "Pending", label: "Pending" },
]

export default function AddActivityPage() {
  const [formData, setFormData] = useState({
    activityType: "",
    count: "",
    date: new Date().toISOString().split('T')[0],
    status: "Completed",
    remarks: ""
  })
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: dash, loading, refetch } = useApi('/api/instructor/activities')
  const activitiesData = dash?.activities || []
  const user = dash?.user || {}
  const userName = user.name || "Instructor"

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const selectedTypeLabel = activityTypes.find(a => a.value === formData.activityType)?.label
      
      // Normalize status to match Mongoose enum (e.g., 'in_progress' -> 'In Progress')
      const statusMap = {
        'completed': 'Completed',
        'in_progress': 'In Progress',
        'pending': 'Pending',
        'Completed': 'Completed',
        'In Progress': 'In Progress',
        'Pending': 'Pending'
      }
      
      const res = await apiFetch('/api/instructor/activities', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          activityType: selectedTypeLabel,
          status: statusMap[formData.status] || formData.status,
          count: parseInt(formData.count)
        })
      })

      if (res.success) {
        setShowSuccessModal(true)
        refetch()
        setFormData({
          activityType: "",
          count: "",
          date: new Date().toISOString().split('T')[0],
          status: "Completed",
          remarks: ""
        })
      }
    } catch (err) {
      toast.error(err.message || "Failed to submit activity")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate today's stats
  const todayStr = new Date().toISOString().split('T')[0]
  const todayActivities = activitiesData.filter(a => a.date.startsWith(todayStr))
  
  const getTodayCount = (typeLabel) => {
    return todayActivities
      .filter(a => a.activityType === typeLabel)
      .reduce((sum, a) => sum + (a.count || 0), 0)
  }

  const selectedActivity = activityTypes.find(a => a.value === formData.activityType)

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar 
        title="Add Activity" 
        userRole="Instructor"
        userName={userName}
        breadcrumbs={[
          { label: 'Instructor', href: '/instructor/dashboard' },
          { label: 'Add Activity' }
        ]}
      />
      
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-xl font-semibold text-foreground">Record New Activity</h2>
            <p className="text-muted-foreground">Log your daily LMS activities for tracking and reporting</p>
          </div>

          {/* Activity Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Select Activity Type</CardTitle>
              <CardDescription>Choose the type of activity you want to record</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {activityTypes.map((activity) => {
                  const Icon = activity.icon
                  const isSelected = formData.activityType === activity.value
                  return (
                    <button
                      key={activity.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, activityType: activity.value })}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        isSelected 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg ${activity.color} flex items-center justify-center mb-3`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <p className="font-medium text-sm">{activity.label}</p>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Activity Details Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activity Details</CardTitle>
              <CardDescription>Fill in the details of your activity</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Activity Type Display */}
                  <div className="space-y-2">
                    <Label>Activity Type</Label>
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      {selectedActivity ? (
                        <>
                          <div className={`w-8 h-8 rounded ${selectedActivity.color} flex items-center justify-center`}>
                            <selectedActivity.icon className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-medium">{selectedActivity.label}</span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">Select an activity type above</span>
                      )}
                    </div>
                  </div>

                  {/* Count */}
                  <div className="space-y-2">
                    <Label htmlFor="count">Count / Number</Label>
                    <Input
                      id="count"
                      type="number"
                      min="1"
                      placeholder="Enter count (e.g., 15)"
                      value={formData.count}
                      onChange={(e) => setFormData({ ...formData, count: e.target.value })}
                      required
                    />
                  </div>

                  {/* Date */}
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="date"
                        type="date"
                        className="pl-10"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Remarks */}
                <div className="space-y-2">
                  <Label htmlFor="remarks">Remarks (Optional)</Label>
                  <Textarea
                    id="remarks"
                    placeholder="Add any additional notes or remarks about this activity..."
                    rows={4}
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => window.history.back()}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting || !formData.activityType || !formData.count || !formData.status}>
                    <Save className="w-4 h-4 mr-2" />
                    {isSubmitting ? "Submitting..." : "Submit Activity"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Today&apos;s Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-primary">{getTodayCount("MDB Replies")}</p>
                  <p className="text-xs text-muted-foreground">MDB Replies</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{getTodayCount("GDB Marking")}</p>
                  <p className="text-xs text-muted-foreground">GDB Marked</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">{getTodayCount("Assignment Marking")}</p>
                  <p className="text-xs text-muted-foreground">Assignments</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-cyan-600">{getTodayCount("Ticket Handling")}</p>
                  <p className="text-xs text-muted-foreground">Tickets</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Success Modal */}
        <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
          <DialogContent>
            <DialogHeader>
              <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <DialogTitle className="text-center">Activity Submitted!</DialogTitle>
              <DialogDescription className="text-center">
                Your activity has been recorded successfully. It will be reflected in your reports.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center gap-3 mt-4">
              <Button variant="outline" onClick={() => setShowSuccessModal(false)}>
                Add Another
              </Button>
              <Button onClick={() => window.location.href = '/instructor/my-activities'}>
                View Activities
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
