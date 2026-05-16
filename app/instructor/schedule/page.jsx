"use client"

import { useState } from "react"
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  Trash2
} from "lucide-react"

// Dummy schedule data
const weekSchedule = {
  Monday: [
    { id: 1, course: "CS101 - Programming Fundamentals", time: "09:00 - 10:30", room: "Room A-101", students: 45, type: "Lecture" },
    { id: 2, course: "CS201 - Data Structures", time: "11:00 - 12:30", room: "Room B-205", students: 38, type: "Lecture" },
    { id: 3, course: "CS301 - Database Systems", time: "14:00 - 16:00", room: "Lab C-301", students: 42, type: "Lab" }
  ],
  Tuesday: [
    { id: 4, course: "CS401 - Machine Learning", time: "09:00 - 10:30", room: "Room D-102", students: 31, type: "Lecture" },
    { id: 5, course: "CS101 - Programming Fundamentals", time: "14:00 - 16:00", room: "Lab A-102", students: 45, type: "Lab" }
  ],
  Wednesday: [
    { id: 6, course: "CS201 - Data Structures", time: "09:00 - 10:30", room: "Room B-205", students: 38, type: "Lecture" },
    { id: 7, course: "CS301 - Database Systems", time: "11:00 - 12:30", room: "Room C-103", students: 42, type: "Lecture" },
    { id: 8, course: "CS401 - Machine Learning", time: "14:00 - 16:00", room: "Lab D-201", students: 31, type: "Lab" }
  ],
  Thursday: [
    { id: 9, course: "CS101 - Programming Fundamentals", time: "09:00 - 10:30", room: "Room A-101", students: 45, type: "Lecture" },
    { id: 10, course: "CS201 - Data Structures", time: "14:00 - 16:00", room: "Lab B-301", students: 38, type: "Lab" }
  ],
  Friday: [
    { id: 11, course: "CS301 - Database Systems", time: "09:00 - 10:30", room: "Room C-103", students: 42, type: "Lecture" },
    { id: 12, course: "CS401 - Machine Learning", time: "11:00 - 12:30", room: "Room D-102", students: 31, type: "Lecture" }
  ],
  Saturday: [],
  Sunday: []
}

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export default function InstructorSchedulePage() {
  const [selectedDay, setSelectedDay] = useState("Monday")
  const [showAddModal, setShowAddModal] = useState(false)

  const getTypeColor = (type) => {
    switch (type) {
      case "Lecture": return "bg-blue-100 text-blue-700 border-blue-200"
      case "Lab": return "bg-green-100 text-green-700 border-green-200"
      case "Tutorial": return "bg-purple-100 text-purple-700 border-purple-200"
      default: return "bg-muted text-muted-foreground border-border"
    }
  }

  const totalClasses = Object.values(weekSchedule).flat().length
  const totalStudents = Object.values(weekSchedule).flat().reduce((sum, c) => sum + c.students, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Teaching Schedule</h1>
          <p className="text-muted-foreground mt-1">Manage your weekly class schedule</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Class
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalClasses}</p>
              <p className="text-sm text-muted-foreground">Classes This Week</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalStudents}</p>
              <p className="text-sm text-muted-foreground">Total Students</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{weekSchedule[selectedDay]?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Classes on {selectedDay}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Day Selector */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Weekly Schedule</h2>
            <div className="flex items-center gap-2">
              <button className="p-1 hover:bg-muted rounded">
                <ChevronLeft className="w-5 h-5 text-muted-foreground" />
              </button>
              <span className="text-sm text-muted-foreground">Jan 2024</span>
              <button className="p-1 hover:bg-muted rounded">
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {days.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedDay === day
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {day}
                {weekSchedule[day]?.length > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-background/20 rounded">
                    {weekSchedule[day].length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Schedule List */}
        <div className="p-4">
          {weekSchedule[selectedDay]?.length > 0 ? (
            <div className="space-y-3">
              {weekSchedule[selectedDay].map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border ${getTypeColor(item.type)}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{item.course}</h3>
                      <span className="px-2 py-0.5 text-xs font-medium bg-background/50 rounded mt-1 inline-block">
                        {item.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="p-1 hover:bg-background/50 rounded" title="Edit">
                        <Edit className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button className="p-1 hover:bg-background/50 rounded" title="Delete">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {item.time}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {item.room}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      {item.students} Students
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Classes</h3>
              <p className="text-muted-foreground">You have no classes scheduled for {selectedDay}</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Class Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-foreground mb-4">Add New Class</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Course</label>
                <select className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                  <option>Select course...</option>
                  <option>CS101 - Programming Fundamentals</option>
                  <option>CS201 - Data Structures</option>
                  <option>CS301 - Database Systems</option>
                  <option>CS401 - Machine Learning</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Day</label>
                <select className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                  {days.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Start Time</label>
                  <input
                    type="time"
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">End Time</label>
                  <input
                    type="time"
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Room</label>
                <input
                  type="text"
                  placeholder="e.g., Room A-101"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Type</label>
                <select className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                  <option>Lecture</option>
                  <option>Lab</option>
                  <option>Tutorial</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80"
              >
                Cancel
              </button>
              <button className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
                Add Class
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
