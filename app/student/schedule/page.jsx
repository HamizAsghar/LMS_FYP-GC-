"use client"

import { useState } from "react"
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User,
  ChevronLeft,
  ChevronRight,
  BookOpen
} from "lucide-react"

// Dummy schedule data
const weekSchedule = {
  Monday: [
    { id: 1, course: "CS101 - Programming Fundamentals", time: "09:00 - 10:30", room: "Room A-101", instructor: "Dr. Ahmed Khan", type: "Lecture" },
    { id: 2, course: "CS201 - Data Structures", time: "11:00 - 12:30", room: "Room B-205", instructor: "Prof. Sara Ahmed", type: "Lecture" },
    { id: 3, course: "CS301 - Database Systems", time: "14:00 - 15:30", room: "Lab C-301", instructor: "Dr. Muhammad Hassan", type: "Lab" }
  ],
  Tuesday: [
    { id: 4, course: "CS401 - Machine Learning", time: "09:00 - 10:30", room: "Room D-102", instructor: "Dr. Fatima Ali", type: "Lecture" },
    { id: 5, course: "CS101 - Programming Fundamentals", time: "14:00 - 16:00", room: "Lab A-102", instructor: "Dr. Ahmed Khan", type: "Lab" }
  ],
  Wednesday: [
    { id: 6, course: "CS201 - Data Structures", time: "09:00 - 10:30", room: "Room B-205", instructor: "Prof. Sara Ahmed", type: "Lecture" },
    { id: 7, course: "CS301 - Database Systems", time: "11:00 - 12:30", room: "Room C-103", instructor: "Dr. Muhammad Hassan", type: "Lecture" },
    { id: 8, course: "CS401 - Machine Learning", time: "14:00 - 16:00", room: "Lab D-201", instructor: "Dr. Fatima Ali", type: "Lab" }
  ],
  Thursday: [
    { id: 9, course: "CS101 - Programming Fundamentals", time: "09:00 - 10:30", room: "Room A-101", instructor: "Dr. Ahmed Khan", type: "Lecture" },
    { id: 10, course: "CS201 - Data Structures", time: "14:00 - 16:00", room: "Lab B-301", instructor: "Prof. Sara Ahmed", type: "Lab" }
  ],
  Friday: [
    { id: 11, course: "CS301 - Database Systems", time: "09:00 - 10:30", room: "Room C-103", instructor: "Dr. Muhammad Hassan", type: "Lecture" },
    { id: 12, course: "CS401 - Machine Learning", time: "11:00 - 12:30", room: "Room D-102", instructor: "Dr. Fatima Ali", type: "Lecture" }
  ],
  Saturday: [],
  Sunday: []
}

const upcomingEvents = [
  { id: 1, title: "Midterm Exam - CS101", date: "2024-01-25", time: "10:00 AM", type: "Exam" },
  { id: 2, title: "Assignment Due - CS201", date: "2024-01-22", time: "11:59 PM", type: "Assignment" },
  { id: 3, title: "Project Presentation - CS401", date: "2024-01-28", time: "02:00 PM", type: "Presentation" },
  { id: 4, title: "Quiz - CS301", date: "2024-01-24", time: "09:00 AM", type: "Quiz" }
]

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export default function StudentSchedulePage() {
  const [selectedDay, setSelectedDay] = useState("Monday")
  const [view, setView] = useState("week")

  const getTypeColor = (type) => {
    switch (type) {
      case "Lecture": return "bg-blue-100 text-blue-700 border-blue-200"
      case "Lab": return "bg-green-100 text-green-700 border-green-200"
      case "Tutorial": return "bg-purple-100 text-purple-700 border-purple-200"
      default: return "bg-muted text-muted-foreground border-border"
    }
  }

  const getEventTypeColor = (type) => {
    switch (type) {
      case "Exam": return "bg-red-100 text-red-700"
      case "Assignment": return "bg-orange-100 text-orange-700"
      case "Presentation": return "bg-purple-100 text-purple-700"
      case "Quiz": return "bg-yellow-100 text-yellow-700"
      default: return "bg-muted text-muted-foreground"
    }
  }

  const totalClasses = Object.values(weekSchedule).flat().length
  const todayClasses = weekSchedule[selectedDay]?.length || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Class Schedule</h1>
          <p className="text-muted-foreground mt-1">View your weekly class schedule and upcoming events</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView("week")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === "week" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Week View
          </button>
          <button
            onClick={() => setView("day")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === "day" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Day View
          </button>
        </div>
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
              <BookOpen className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{todayClasses}</p>
              <p className="text-sm text-muted-foreground">Classes on {selectedDay}</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{upcomingEvents.length}</p>
              <p className="text-sm text-muted-foreground">Upcoming Events</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Schedule */}
        <div className="lg:col-span-2">
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
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-foreground">{item.course}</h3>
                        <span className="px-2 py-1 text-xs font-medium bg-background/50 rounded">
                          {item.type}
                        </span>
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
                          <User className="w-4 h-4" />
                          {item.instructor}
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
        </div>

        {/* Upcoming Events */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="font-semibold text-foreground mb-4">Upcoming Events</h2>
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-foreground text-sm">{event.title}</h4>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${getEventTypeColor(event.type)}`}>
                    {event.type}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {event.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {event.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
