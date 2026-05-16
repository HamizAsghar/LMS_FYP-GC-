// Admin Stats
export const adminStats = {
  totalUsers: 2847,
  totalInstructors: 156,
  totalStudents: 2691,
  totalCourses: 89,
  totalActivities: 12456,
  pendingTasks: 34,
  assignmentSubmissions: 4521,
  monthlyGrowth: 12.5
}

// Instructor Stats
export const instructorStats = {
  totalActivities: 234,
  completedTasks: 189,
  pendingTasks: 45,
  uploadedAssignments: 28,
  weeklyPerformance: 87,
  totalStudents: 156,
  avgRating: 4.8
}

// Student Stats
export const studentStats = {
  totalCourses: 6,
  pendingAssignments: 4,
  submittedAssignments: 18,
  downloadedMaterials: 45,
  overallProgress: 72,
  attendance: 89
}

// Users Data
export const users = [
  {
    id: 1,
    name: "Ahmed Khan",
    email: "ahmed.khan@university.edu",
    role: "Instructor",
    department: "Computer Science",
    status: "Active",
    joinedDate: "2023-08-15",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed"
  },
  {
    id: 2,
    name: "Fatima Ali",
    email: "fatima.ali@university.edu",
    role: "Student",
    department: "Software Engineering",
    status: "Active",
    joinedDate: "2024-01-10",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima"
  },
  {
    id: 3,
    name: "Muhammad Hassan",
    email: "m.hassan@university.edu",
    role: "Instructor",
    department: "Information Technology",
    status: "Active",
    joinedDate: "2022-03-20",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Hassan"
  },
  {
    id: 4,
    name: "Ayesha Malik",
    email: "ayesha.malik@university.edu",
    role: "Student",
    department: "Computer Science",
    status: "Inactive",
    joinedDate: "2023-09-01",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ayesha"
  },
  {
    id: 5,
    name: "Usman Tariq",
    email: "usman.tariq@university.edu",
    role: "Student",
    department: "Data Science",
    status: "Active",
    joinedDate: "2024-02-05",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Usman"
  },
  {
    id: 6,
    name: "Sara Ahmed",
    email: "sara.ahmed@university.edu",
    role: "Instructor",
    department: "Artificial Intelligence",
    status: "Active",
    joinedDate: "2023-01-12",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sara"
  }
]

// Instructors Data
export const instructors = [
  {
    id: 1,
    name: "Ahmed Khan",
    email: "ahmed.khan@university.edu",
    department: "Computer Science",
    courses: 5,
    students: 245,
    rating: 4.8,
    status: "Active",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed",
    phone: "+92 300 1234567"
  },
  {
    id: 2,
    name: "Muhammad Hassan",
    email: "m.hassan@university.edu",
    department: "Information Technology",
    courses: 3,
    students: 156,
    rating: 4.6,
    status: "Active",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Hassan",
    phone: "+92 301 2345678"
  },
  {
    id: 3,
    name: "Sara Ahmed",
    email: "sara.ahmed@university.edu",
    department: "Artificial Intelligence",
    courses: 4,
    students: 189,
    rating: 4.9,
    status: "Active",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sara",
    phone: "+92 302 3456789"
  },
  {
    id: 4,
    name: "Ali Raza",
    email: "ali.raza@university.edu",
    department: "Software Engineering",
    courses: 6,
    students: 312,
    rating: 4.7,
    status: "Active",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ali",
    phone: "+92 303 4567890"
  }
]

// Students Data
export const students = [
  {
    id: 1,
    name: "Fatima Ali",
    email: "fatima.ali@university.edu",
    department: "Software Engineering",
    enrolledCourses: 4,
    submissions: 18,
    attendance: 92,
    status: "Active",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima"
  },
  {
    id: 2,
    name: "Usman Tariq",
    email: "usman.tariq@university.edu",
    department: "Data Science",
    enrolledCourses: 3,
    submissions: 15,
    attendance: 88,
    status: "Active",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Usman"
  },
  {
    id: 3,
    name: "Ayesha Malik",
    email: "ayesha.malik@university.edu",
    department: "Computer Science",
    enrolledCourses: 5,
    submissions: 22,
    attendance: 95,
    status: "Active",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ayesha"
  },
  {
    id: 4,
    name: "Bilal Ahmed",
    email: "bilal.ahmed@university.edu",
    department: "Information Technology",
    enrolledCourses: 2,
    submissions: 8,
    attendance: 75,
    status: "Inactive",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bilal"
  },
  {
    id: 5,
    name: "Zainab Hassan",
    email: "zainab.hassan@university.edu",
    department: "Artificial Intelligence",
    enrolledCourses: 4,
    submissions: 20,
    attendance: 90,
    status: "Active",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zainab"
  }
]

// Courses Data
export const courses = [
  {
    id: 1,
    name: "Introduction to Programming",
    code: "CS101",
    instructor: "Ahmed Khan",
    semester: "Spring 2024",
    students: 85,
    status: "Active",
    category: "Computer Science"
  },
  {
    id: 2,
    name: "Data Structures & Algorithms",
    code: "CS201",
    instructor: "Muhammad Hassan",
    semester: "Spring 2024",
    students: 72,
    status: "Active",
    category: "Computer Science"
  },
  {
    id: 3,
    name: "Machine Learning Fundamentals",
    code: "AI301",
    instructor: "Sara Ahmed",
    semester: "Spring 2024",
    students: 56,
    status: "Active",
    category: "Artificial Intelligence"
  },
  {
    id: 4,
    name: "Web Development",
    code: "SE201",
    instructor: "Ali Raza",
    semester: "Spring 2024",
    students: 94,
    status: "Active",
    category: "Software Engineering"
  },
  {
    id: 5,
    name: "Database Management",
    code: "IT202",
    instructor: "Ahmed Khan",
    semester: "Fall 2023",
    students: 68,
    status: "Completed",
    category: "Information Technology"
  }
]

// Instructor Activities Data
export const instructorActivities = [
  {
    id: 1,
    instructorName: "Ahmed Khan",
    mdbReplies: 45,
    gdbMarking: 28,
    assignmentUploads: 12,
    assignmentMarking: 156,
    ticketHandling: 8,
    emailResponses: 34,
    status: "Completed",
    date: "2024-03-15"
  },
  {
    id: 2,
    instructorName: "Muhammad Hassan",
    mdbReplies: 32,
    gdbMarking: 19,
    assignmentUploads: 8,
    assignmentMarking: 98,
    ticketHandling: 5,
    emailResponses: 22,
    status: "Completed",
    date: "2024-03-15"
  },
  {
    id: 3,
    instructorName: "Sara Ahmed",
    mdbReplies: 56,
    gdbMarking: 35,
    assignmentUploads: 15,
    assignmentMarking: 189,
    ticketHandling: 12,
    emailResponses: 45,
    status: "Pending",
    date: "2024-03-16"
  },
  {
    id: 4,
    instructorName: "Ali Raza",
    mdbReplies: 28,
    gdbMarking: 22,
    assignmentUploads: 10,
    assignmentMarking: 134,
    ticketHandling: 6,
    emailResponses: 28,
    status: "In Progress",
    date: "2024-03-16"
  }
]

// Student Activities Data
export const studentActivities = [
  {
    id: 1,
    studentName: "Fatima Ali",
    assignmentSubmission: 18,
    attendance: 92,
    materialDownloads: 34,
    quizAttempts: 8,
    status: "Active",
    date: "2024-03-15"
  },
  {
    id: 2,
    studentName: "Usman Tariq",
    assignmentSubmission: 15,
    attendance: 88,
    materialDownloads: 28,
    quizAttempts: 6,
    status: "Active",
    date: "2024-03-15"
  },
  {
    id: 3,
    studentName: "Ayesha Malik",
    assignmentSubmission: 22,
    attendance: 95,
    materialDownloads: 45,
    quizAttempts: 10,
    status: "Active",
    date: "2024-03-16"
  },
  {
    id: 4,
    studentName: "Bilal Ahmed",
    assignmentSubmission: 8,
    attendance: 75,
    materialDownloads: 12,
    quizAttempts: 3,
    status: "Inactive",
    date: "2024-03-14"
  }
]

// Assignments Data
export const assignments = [
  {
    id: 1,
    title: "Programming Fundamentals Assignment 1",
    subject: "CS101",
    description: "Complete exercises on variables, data types, and control structures",
    deadline: "2024-03-20",
    totalMarks: 100,
    uploadedDate: "2024-03-01",
    submissions: 72,
    totalStudents: 85,
    status: "Active"
  },
  {
    id: 2,
    title: "Data Structures Lab Task",
    subject: "CS201",
    description: "Implement linked list operations in C++",
    deadline: "2024-03-18",
    totalMarks: 50,
    uploadedDate: "2024-03-05",
    submissions: 65,
    totalStudents: 72,
    status: "Active"
  },
  {
    id: 3,
    title: "ML Project Proposal",
    subject: "AI301",
    description: "Submit a detailed proposal for your machine learning project",
    deadline: "2024-03-25",
    totalMarks: 150,
    uploadedDate: "2024-03-10",
    submissions: 28,
    totalStudents: 56,
    status: "Active"
  },
  {
    id: 4,
    title: "Web Development Midterm Project",
    subject: "SE201",
    description: "Build a responsive portfolio website using HTML, CSS, and JavaScript",
    deadline: "2024-03-22",
    totalMarks: 200,
    uploadedDate: "2024-03-02",
    submissions: 89,
    totalStudents: 94,
    status: "Active"
  },
  {
    id: 5,
    title: "Database Design Assignment",
    subject: "IT202",
    description: "Design and normalize a database schema for an e-commerce system",
    deadline: "2024-03-15",
    totalMarks: 75,
    uploadedDate: "2024-02-28",
    submissions: 68,
    totalStudents: 68,
    status: "Completed"
  }
]

// Student Submissions Data
export const submissions = [
  {
    id: 1,
    studentName: "Fatima Ali",
    studentId: "2024-CS-001",
    assignment: "Programming Fundamentals Assignment 1",
    submittedDate: "2024-03-18",
    status: "Submitted",
    marks: null,
    feedback: null,
    file: "assignment1_fatima.pdf"
  },
  {
    id: 2,
    studentName: "Usman Tariq",
    studentId: "2024-DS-002",
    assignment: "Data Structures Lab Task",
    submittedDate: "2024-03-17",
    status: "Graded",
    marks: 45,
    feedback: "Good implementation. Minor issues with edge cases.",
    file: "lab_task_usman.cpp"
  },
  {
    id: 3,
    studentName: "Ayesha Malik",
    studentId: "2024-CS-003",
    assignment: "Programming Fundamentals Assignment 1",
    submittedDate: "2024-03-19",
    status: "Submitted",
    marks: null,
    feedback: null,
    file: "assignment1_ayesha.pdf"
  },
  {
    id: 4,
    studentName: "Zainab Hassan",
    studentId: "2024-AI-004",
    assignment: "ML Project Proposal",
    submittedDate: "2024-03-20",
    status: "Graded",
    marks: 140,
    feedback: "Excellent proposal with clear objectives and methodology.",
    file: "ml_proposal_zainab.docx"
  },
  {
    id: 5,
    studentName: "Bilal Ahmed",
    studentId: "2024-IT-005",
    assignment: "Database Design Assignment",
    submittedDate: "2024-03-14",
    status: "Late",
    marks: 60,
    feedback: "Good work but submitted after deadline. 10% penalty applied.",
    file: "db_assignment_bilal.pdf"
  }
]

// Learning Materials Data
export const learningMaterials = [
  {
    id: 1,
    title: "Introduction to Programming - Lecture 1",
    type: "PDF",
    course: "CS101",
    uploadedBy: "Ahmed Khan",
    uploadedDate: "2024-02-15",
    downloads: 156,
    size: "2.4 MB"
  },
  {
    id: 2,
    title: "Data Structures Video Lecture",
    type: "Video",
    course: "CS201",
    uploadedBy: "Muhammad Hassan",
    uploadedDate: "2024-02-20",
    downloads: 89,
    size: "450 MB"
  },
  {
    id: 3,
    title: "Machine Learning Slides - Week 3",
    type: "Slides",
    course: "AI301",
    uploadedBy: "Sara Ahmed",
    uploadedDate: "2024-03-01",
    downloads: 112,
    size: "15 MB"
  },
  {
    id: 4,
    title: "Web Development Cheat Sheet",
    type: "Document",
    course: "SE201",
    uploadedBy: "Ali Raza",
    uploadedDate: "2024-02-28",
    downloads: 234,
    size: "1.2 MB"
  },
  {
    id: 5,
    title: "Database Normalization Notes",
    type: "PDF",
    course: "IT202",
    uploadedBy: "Ahmed Khan",
    uploadedDate: "2024-02-10",
    downloads: 178,
    size: "3.8 MB"
  },
  {
    id: 6,
    title: "Python Basics Tutorial",
    type: "Video",
    course: "CS101",
    uploadedBy: "Ahmed Khan",
    uploadedDate: "2024-03-05",
    downloads: 203,
    size: "320 MB"
  }
]

// Notifications Data
export const notifications = [
  {
    id: 1,
    type: "assignment",
    title: "New Assignment Posted",
    message: "Programming Fundamentals Assignment 2 has been posted",
    timestamp: new Date(Date.now() - 30 * 60000),
    read: false
  },
  {
    id: 2,
    type: "submission",
    title: "Assignment Submitted",
    message: "Your assignment for CS201 has been submitted successfully",
    timestamp: new Date(Date.now() - 2 * 3600000),
    read: false
  },
  {
    id: 3,
    type: "deadline",
    title: "Deadline Reminder",
    message: "ML Project Proposal deadline is in 2 days",
    timestamp: new Date(Date.now() - 5 * 3600000),
    read: true
  },
  {
    id: 4,
    type: "grade",
    title: "Assignment Graded",
    message: "Your Data Structures Lab Task has been graded. Score: 45/50",
    timestamp: new Date(Date.now() - 24 * 3600000),
    read: true
  },
  {
    id: 5,
    type: "system",
    title: "System Maintenance",
    message: "LMS will be under maintenance on Sunday from 2-4 AM",
    timestamp: new Date(Date.now() - 48 * 3600000),
    read: true
  }
]

// Reports Data
export const weeklyReports = [
  { week: "Week 1", activities: 45, submissions: 234, performance: 78 },
  { week: "Week 2", activities: 52, submissions: 289, performance: 82 },
  { week: "Week 3", activities: 48, submissions: 256, performance: 75 },
  { week: "Week 4", activities: 61, submissions: 312, performance: 88 }
]

export const monthlyReports = [
  { month: "Jan", instructorActivities: 180, studentSubmissions: 890, avgPerformance: 76 },
  { month: "Feb", instructorActivities: 205, studentSubmissions: 956, avgPerformance: 79 },
  { month: "Mar", instructorActivities: 192, studentSubmissions: 1023, avgPerformance: 82 }
]

// Activity Types for Instructor
export const activityTypes = [
  { value: "mdb_replies", label: "MDB Replies" },
  { value: "gdb_marking", label: "GDB Marking" },
  { value: "assignment_upload", label: "Assignment Upload" },
  { value: "assignment_marking", label: "Assignment Marking" },
  { value: "ticket_handling", label: "Ticket Handling" },
  { value: "email_responses", label: "Email Responses" }
]

// My Activities (Instructor)
export const myActivities = [
  {
    id: 1,
    activityType: "MDB Replies",
    count: 15,
    status: "Completed",
    date: "2024-03-15",
    remarks: "Responded to all student queries"
  },
  {
    id: 2,
    activityType: "Assignment Marking",
    count: 28,
    status: "In Progress",
    date: "2024-03-16",
    remarks: "CS101 Assignment 1 grading"
  },
  {
    id: 3,
    activityType: "GDB Marking",
    count: 12,
    status: "Completed",
    date: "2024-03-14",
    remarks: "Week 5 GDB evaluation"
  },
  {
    id: 4,
    activityType: "Assignment Upload",
    count: 2,
    status: "Completed",
    date: "2024-03-13",
    remarks: "Uploaded Assignment 2 and Lab Task 3"
  },
  {
    id: 5,
    activityType: "Email Responses",
    count: 8,
    status: "Pending",
    date: "2024-03-16",
    remarks: "Student queries regarding project"
  }
]

// Chart Data
export const performanceChartData = [
  { name: "Week 1", activities: 45, submissions: 234 },
  { name: "Week 2", activities: 52, submissions: 289 },
  { name: "Week 3", activities: 48, submissions: 256 },
  { name: "Week 4", activities: 61, submissions: 312 }
]

export const enrollmentChartData = [
  { name: "CS101", students: 85 },
  { name: "CS201", students: 72 },
  { name: "AI301", students: 56 },
  { name: "SE201", students: 94 },
  { name: "IT202", students: 68 }
]

export const submissionStatsData = [
  { name: "Submitted", value: 65, color: "#22c55e" },
  { name: "Pending", value: 25, color: "#f59e0b" },
  { name: "Late", value: 10, color: "#ef4444" }
]

// Recent Activity Logs
export const recentActivityLogs = [
  {
    id: 1,
    user: "Ahmed Khan",
    role: "Instructor",
    action: "Login",
    target: "Admin Dashboard",
    timestamp: new Date(Date.now() - 15 * 60000),
    ipAddress: "192.168.1.101"
  },
  {
    id: 2,
    user: "Fatima Ali",
    role: "Student",
    action: "Submitted",
    target: "Programming Fundamentals Assignment 1",
    timestamp: new Date(Date.now() - 45 * 60000),
    ipAddress: "192.168.1.102"
  },
  {
    id: 3,
    user: "Sara Ahmed",
    role: "Instructor",
    action: "Updated",
    target: "ML Project Proposal",
    timestamp: new Date(Date.now() - 2 * 3600000),
    ipAddress: "192.168.1.103"
  },
  {
    id: 4,
    user: "Muhammad Hassan",
    role: "Instructor",
    action: "Created",
    target: "Data Structures Video Lecture",
    timestamp: new Date(Date.now() - 4 * 3600000),
    ipAddress: "192.168.1.104"
  },
  {
    id: 5,
    user: "System",
    role: "Admin",
    action: "Updated",
    target: "Weekly Performance Report",
    timestamp: new Date(Date.now() - 24 * 3600000),
    ipAddress: "127.0.0.1"
  },
  {
    id: 6,
    user: "Usman Tariq",
    role: "Student",
    action: "Enrolled",
    target: "CS201 - Data Structures",
    timestamp: new Date(Date.now() - 26 * 3600000),
    ipAddress: "192.168.1.105"
  },
  {
    id: 7,
    user: "Ali Raza",
    role: "Instructor",
    action: "Login",
    target: "Instructor Panel",
    timestamp: new Date(Date.now() - 28 * 3600000),
    ipAddress: "192.168.1.106"
  },
  {
    id: 8,
    user: "Ayesha Malik",
    role: "Student",
    action: "Submitted",
    target: "Database Design Assignment",
    timestamp: new Date(Date.now() - 30 * 3600000),
    ipAddress: "192.168.1.107"
  }
]

// Top Performing Instructors
export const topInstructors = [
  { name: "Sara Ahmed", activities: 156, rating: 4.9, completionRate: 98 },
  { name: "Ahmed Khan", activities: 142, rating: 4.8, completionRate: 95 },
  { name: "Ali Raza", activities: 128, rating: 4.7, completionRate: 92 },
  { name: "Muhammad Hassan", activities: 115, rating: 4.6, completionRate: 89 }
]

// Chart Data for various dashboards
export const chartData = [
  { name: 'Jan', students: 65 },
  { name: 'Feb', students: 78 },
  { name: 'Mar', students: 90 },
  { name: 'Apr', students: 81 },
  { name: 'May', students: 95 },
  { name: 'Jun', students: 110 }
]

export const enrollmentData = [
  { course: 'CS101', enrolled: 85, completed: 68 },
  { course: 'CS201', enrolled: 72, completed: 52 },
  { course: 'AI301', enrolled: 56, completed: 38 },
  { course: 'SE201', enrolled: 94, completed: 76 },
  { course: 'IT202', enrolled: 68, completed: 55 }
]
