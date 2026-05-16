# Admin Panel API Documentation

## Overview
Complete API documentation for the Admin Panel of the EduHub LMS. These APIs handle all administrative operations including user management, course management, activity monitoring, and system settings.

---

## Base URL
```
/api/admin
```

## Authentication
All endpoints require JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## 1. Dashboard APIs

### 1.1 Get Dashboard Statistics
**Endpoint:** `GET /api/admin/dashboard/stats`

**Description:** Get overall dashboard statistics including user counts, course counts, activities, etc.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 2847,
    "totalInstructors": 156,
    "totalStudents": 2691,
    "totalCourses": 89,
    "totalActivities": 12456,
    "pendingTasks": 34,
    "assignmentSubmissions": 4521,
    "monthlyGrowth": 12.5
  }
}
```

### 1.2 Get Dashboard Charts Data
**Endpoint:** `GET /api/admin/dashboard/charts`

**Description:** Get chart data for performance and submission statistics.

**Query Parameters:**
- `period`: 'week' | 'month' | 'year' (default: 'month')

**Response:**
```json
{
  "success": true,
  "data": {
    "performanceChart": [
      { "name": "Week 1", "activities": 45, "submissions": 234 },
      { "name": "Week 2", "activities": 52, "submissions": 289 }
    ],
    "submissionStats": [
      { "name": "Submitted", "value": 65, "color": "#22c55e" },
      { "name": "Pending", "value": 25, "color": "#f59e0b" },
      { "name": "Late", "value": 10, "color": "#ef4444" }
    ]
  }
}
```

### 1.3 Get Top Performing Instructors
**Endpoint:** `GET /api/admin/dashboard/top-instructors`

**Description:** Get list of top performing instructors based on activity completion rate.

**Query Parameters:**
- `limit`: number (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "Sara Ahmed",
      "activities": 156,
      "rating": 4.9,
      "completionRate": 98
    }
  ]
}
```

### 1.4 Get Recent Activity Logs
**Endpoint:** `GET /api/admin/dashboard/recent-activities`

**Description:** Get recent system activity logs.

**Query Parameters:**
- `limit`: number (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "user": "Ahmed Khan",
      "role": "Instructor",
      "action": "Login",
      "target": "Admin Dashboard",
      "timestamp": "2024-03-15T10:30:00Z",
      "ipAddress": "192.168.1.101"
    }
  ]
}
```

---

## 2. Users Management APIs

### 2.1 Get All Users
**Endpoint:** `GET /api/admin/users`

**Description:** Get list of all users with filtering and pagination.

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 20)
- `search`: string (search by name or email)
- `role`: 'Student' | 'Instructor' | 'Admin'
- `status`: 'Active' | 'Inactive'
- `department`: string

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "Ahmed Khan",
      "email": "ahmed.khan@university.edu",
      "role": "Instructor",
      "department": "Computer Science",
      "status": "Active",
      "joinedDate": "2023-08-15",
      "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed"
    }
  ],
  "pagination": {
    "total": 2847,
    "page": 1,
    "limit": 20,
    "pages": 143
  }
}
```

### 2.2 Get User by ID
**Endpoint:** `GET /api/admin/users/:id`

**Description:** Get detailed information about a specific user.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Ahmed Khan",
    "email": "ahmed.khan@university.edu",
    "role": "Instructor",
    "department": "Computer Science",
    "status": "Active",
    "joinedDate": "2023-08-15",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed",
    "isVerified": true,
    "createdAt": "2023-08-15T00:00:00Z",
    "updatedAt": "2024-03-15T10:30:00Z"
  }
}
```

### 2.3 Create User
**Endpoint:** `POST /api/admin/users`

**Description:** Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@university.edu",
  "password": "SecurePassword123",
  "role": "Student",
  "department": "Computer Science",
  "status": "Active"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "name": "John Doe",
    "email": "john.doe@university.edu",
    "role": "Student",
    "department": "Computer Science",
    "status": "Active"
  }
}
```

### 2.4 Update User
**Endpoint:** `PUT /api/admin/users/:id`

**Description:** Update user information.

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "department": "Software Engineering",
  "status": "Inactive"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "name": "John Doe Updated",
    "email": "john.doe@university.edu",
    "role": "Student",
    "department": "Software Engineering",
    "status": "Inactive"
  }
}
```

### 2.5 Delete User
**Endpoint:** `DELETE /api/admin/users/:id`

**Description:** Delete a user account.

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

### 2.6 Get User Statistics
**Endpoint:** `GET /api/admin/users/stats/overview`

**Description:** Get user statistics overview.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 2847,
    "totalInstructors": 156,
    "totalStudents": 2691,
    "activeUsers": 2700,
    "inactiveUsers": 147,
    "newUsersThisMonth": 120
  }
}
```

---

## 3. Instructors Management APIs

### 3.1 Get All Instructors
**Endpoint:** `GET /api/admin/instructors`

**Description:** Get list of all instructors.

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 20)
- `search`: string
- `department`: string
- `status`: 'Active' | 'Inactive'

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439010",
      "name": "Ahmed Khan",
      "email": "ahmed.khan@university.edu",
      "department": "Computer Science",
      "phone": "+92 300 1234567",
      "courses": 5,
      "students": 245,
      "rating": 4.8,
      "status": "Active",
      "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed"
    }
  ],
  "pagination": {
    "total": 156,
    "page": 1,
    "limit": 20,
    "pages": 8
  }
}
```

### 3.2 Get Instructor by ID
**Endpoint:** `GET /api/admin/instructors/:id`

**Description:** Get detailed information about a specific instructor.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439010",
    "name": "Ahmed Khan",
    "email": "ahmed.khan@university.edu",
    "department": "Computer Science",
    "phone": "+92 300 1234567",
    "courses": 5,
    "students": 245,
    "rating": 4.8,
    "status": "Active",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed",
    "createdAt": "2023-08-15T00:00:00Z",
    "updatedAt": "2024-03-15T10:30:00Z"
  }
}
```

### 3.3 Create Instructor
**Endpoint:** `POST /api/admin/instructors`

**Description:** Create a new instructor.

**Request Body:**
```json
{
  "name": "Dr. Jane Smith",
  "email": "jane.smith@university.edu",
  "password": "SecurePassword123",
  "department": "Artificial Intelligence",
  "phone": "+92 300 9876543",
  "specialization": "Machine Learning"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Instructor created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439013",
    "userId": "507f1f77bcf86cd799439014",
    "name": "Dr. Jane Smith",
    "email": "jane.smith@university.edu",
    "department": "Artificial Intelligence",
    "phone": "+92 300 9876543"
  }
}
```

### 3.4 Update Instructor
**Endpoint:** `PUT /api/admin/instructors/:id`

**Description:** Update instructor information.

**Request Body:**
```json
{
  "department": "Data Science",
  "phone": "+92 300 5555555",
  "status": "Inactive"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Instructor updated successfully",
  "data": {
    "id": "507f1f77bcf86cd799439013",
    "name": "Dr. Jane Smith",
    "email": "jane.smith@university.edu",
    "department": "Data Science",
    "phone": "+92 300 5555555",
    "status": "Inactive"
  }
}
```

### 3.5 Delete Instructor
**Endpoint:** `DELETE /api/admin/instructors/:id`

**Description:** Delete an instructor.

**Response:**
```json
{
  "success": true,
  "message": "Instructor deleted successfully"
}
```

---

## 4. Students Management APIs

### 4.1 Get All Students
**Endpoint:** `GET /api/admin/students`

**Description:** Get list of all students.

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 20)
- `search`: string
- `department`: string
- `status`: 'Active' | 'Inactive'

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439015",
      "userId": "507f1f77bcf86cd799439016",
      "name": "Fatima Ali",
      "email": "fatima.ali@university.edu",
      "department": "Software Engineering",
      "enrolledCourses": 4,
      "submissions": 18,
      "attendance": 92,
      "status": "Active",
      "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima"
    }
  ],
  "pagination": {
    "total": 2691,
    "page": 1,
    "limit": 20,
    "pages": 135
  }
}
```

### 4.2 Get Student by ID
**Endpoint:** `GET /api/admin/students/:id`

**Description:** Get detailed information about a specific student.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439015",
    "userId": "507f1f77bcf86cd799439016",
    "name": "Fatima Ali",
    "email": "fatima.ali@university.edu",
    "department": "Software Engineering",
    "enrolledCourses": 4,
    "submissions": 18,
    "attendance": 92,
    "status": "Active",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima",
    "createdAt": "2024-01-10T00:00:00Z",
    "updatedAt": "2024-03-15T10:30:00Z"
  }
}
```

### 4.3 Create Student
**Endpoint:** `POST /api/admin/students`

**Description:** Create a new student.

**Request Body:**
```json
{
  "name": "Ahmed Hassan",
  "email": "ahmed.hassan@university.edu",
  "password": "SecurePassword123",
  "department": "Computer Science"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Student created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439017",
    "userId": "507f1f77bcf86cd799439018",
    "name": "Ahmed Hassan",
    "email": "ahmed.hassan@university.edu",
    "department": "Computer Science"
  }
}
```

### 4.4 Update Student
**Endpoint:** `PUT /api/admin/students/:id`

**Description:** Update student information.

**Request Body:**
```json
{
  "department": "Data Science",
  "status": "Inactive"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Student updated successfully",
  "data": {
    "id": "507f1f77bcf86cd799439017",
    "name": "Ahmed Hassan",
    "email": "ahmed.hassan@university.edu",
    "department": "Data Science",
    "status": "Inactive"
  }
}
```

### 4.5 Delete Student
**Endpoint:** `DELETE /api/admin/students/:id`

**Description:** Delete a student.

**Response:**
```json
{
  "success": true,
  "message": "Student deleted successfully"
}
```

---

## 5. Courses Management APIs

### 5.1 Get All Courses
**Endpoint:** `GET /api/admin/courses`

**Description:** Get list of all courses.

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 20)
- `search`: string
- `status`: 'Active' | 'Completed' | 'Archived'
- `category`: string

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439019",
      "name": "Introduction to Programming",
      "code": "CS101",
      "instructor": {
        "id": "507f1f77bcf86cd799439010",
        "name": "Ahmed Khan"
      },
      "semester": "Spring 2024",
      "students": 85,
      "status": "Active",
      "category": "Computer Science",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 89,
    "page": 1,
    "limit": 20,
    "pages": 5
  }
}
```

### 5.2 Get Course by ID
**Endpoint:** `GET /api/admin/courses/:id`

**Description:** Get detailed information about a specific course.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439019",
    "name": "Introduction to Programming",
    "code": "CS101",
    "instructor": {
      "id": "507f1f77bcf86cd799439010",
      "name": "Ahmed Khan",
      "email": "ahmed.khan@university.edu"
    },
    "semester": "Spring 2024",
    "students": 85,
    "status": "Active",
    "category": "Computer Science",
    "description": "Learn programming fundamentals",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-03-15T10:30:00Z"
  }
}
```

### 5.3 Create Course
**Endpoint:** `POST /api/admin/courses`

**Description:** Create a new course.

**Request Body:**
```json
{
  "name": "Advanced Web Development",
  "code": "SE301",
  "instructor": "507f1f77bcf86cd799439010",
  "semester": "Spring 2024",
  "category": "Software Engineering",
  "description": "Advanced concepts in web development"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Course created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439020",
    "name": "Advanced Web Development",
    "code": "SE301",
    "instructor": "507f1f77bcf86cd799439010",
    "semester": "Spring 2024",
    "category": "Software Engineering"
  }
}
```

### 5.4 Update Course
**Endpoint:** `PUT /api/admin/courses/:id`

**Description:** Update course information.

**Request Body:**
```json
{
  "status": "Completed",
  "semester": "Fall 2024"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Course updated successfully",
  "data": {
    "id": "507f1f77bcf86cd799439020",
    "name": "Advanced Web Development",
    "code": "SE301",
    "status": "Completed",
    "semester": "Fall 2024"
  }
}
```

### 5.5 Delete Course
**Endpoint:** `DELETE /api/admin/courses/:id`

**Description:** Delete a course.

**Response:**
```json
{
  "success": true,
  "message": "Course deleted successfully"
}
```

---

## 6. Assignments Management APIs

### 6.1 Get All Assignments
**Endpoint:** `GET /api/admin/assignments`

**Description:** Get list of all assignments.

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 20)
- `search`: string
- `status`: 'Active' | 'Completed' | 'Archived'
- `course`: string

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439021",
      "title": "Programming Fundamentals Assignment 1",
      "subject": "CS101",
      "description": "Complete exercises on variables, data types, and control structures",
      "deadline": "2024-03-20",
      "totalMarks": 100,
      "uploadedDate": "2024-03-01",
      "submissions": 72,
      "totalStudents": 85,
      "status": "Active",
      "course": {
        "id": "507f1f77bcf86cd799439019",
        "name": "Introduction to Programming"
      },
      "instructor": {
        "id": "507f1f77bcf86cd799439010",
        "name": "Ahmed Khan"
      }
    }
  ],
  "pagination": {
    "total": 250,
    "page": 1,
    "limit": 20,
    "pages": 13
  }
}
```

### 6.2 Get Assignment by ID
**Endpoint:** `GET /api/admin/assignments/:id`

**Description:** Get detailed information about a specific assignment.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439021",
    "title": "Programming Fundamentals Assignment 1",
    "subject": "CS101",
    "description": "Complete exercises on variables, data types, and control structures",
    "deadline": "2024-03-20",
    "totalMarks": 100,
    "uploadedDate": "2024-03-01",
    "submissions": 72,
    "totalStudents": 85,
    "status": "Active",
    "course": "507f1f77bcf86cd799439019",
    "instructor": "507f1f77bcf86cd799439010",
    "createdAt": "2024-03-01T00:00:00Z",
    "updatedAt": "2024-03-15T10:30:00Z"
  }
}
```

### 6.3 Create Assignment
**Endpoint:** `POST /api/admin/assignments`

**Description:** Create a new assignment.

**Request Body:**
```json
{
  "title": "New Assignment",
  "subject": "CS201",
  "description": "Assignment description",
  "deadline": "2024-04-01",
  "totalMarks": 100,
  "course": "507f1f77bcf86cd799439019",
  "instructor": "507f1f77bcf86cd799439010"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Assignment created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439022",
    "title": "New Assignment",
    "subject": "CS201",
    "deadline": "2024-04-01",
    "totalMarks": 100
  }
}
```

### 6.4 Update Assignment
**Endpoint:** `PUT /api/admin/assignments/:id`

**Description:** Update assignment information.

**Request Body:**
```json
{
  "status": "Completed",
  "deadline": "2024-04-05"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Assignment updated successfully",
  "data": {
    "id": "507f1f77bcf86cd799439022",
    "title": "New Assignment",
    "status": "Completed",
    "deadline": "2024-04-05"
  }
}
```

### 6.5 Delete Assignment
**Endpoint:** `DELETE /api/admin/assignments/:id`

**Description:** Delete an assignment.

**Response:**
```json
{
  "success": true,
  "message": "Assignment deleted successfully"
}
```

---

## 7. Learning Materials Management APIs

### 7.1 Get All Materials
**Endpoint:** `GET /api/admin/materials`

**Description:** Get list of all learning materials.

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 20)
- `search`: string
- `type`: 'PDF' | 'Video' | 'Slides' | 'Document'
- `course`: string

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439023",
      "title": "Introduction to Programming - Lecture 1",
      "type": "PDF",
      "course": {
        "id": "507f1f77bcf86cd799439019",
        "name": "Introduction to Programming",
        "code": "CS101"
      },
      "uploadedBy": {
        "id": "507f1f77bcf86cd799439010",
        "name": "Ahmed Khan"
      },
      "uploadedDate": "2024-02-15",
      "downloads": 156,
      "size": "2.4 MB"
    }
  ],
  "pagination": {
    "total": 450,
    "page": 1,
    "limit": 20,
    "pages": 23
  }
}
```

### 7.2 Get Material by ID
**Endpoint:** `GET /api/admin/materials/:id`

**Description:** Get detailed information about a specific material.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439023",
    "title": "Introduction to Programming - Lecture 1",
    "type": "PDF",
    "course": "507f1f77bcf86cd799439019",
    "uploadedBy": "507f1f77bcf86cd799439010",
    "uploadedDate": "2024-02-15",
    "downloads": 156,
    "size": "2.4 MB",
    "fileUrl": "https://storage.example.com/materials/lecture1.pdf",
    "createdAt": "2024-02-15T00:00:00Z",
    "updatedAt": "2024-03-15T10:30:00Z"
  }
}
```

### 7.3 Create Material
**Endpoint:** `POST /api/admin/materials`

**Description:** Create a new learning material.

**Request Body:**
```json
{
  "title": "Advanced Topics - Lecture 5",
  "type": "Video",
  "course": "507f1f77bcf86cd799439019",
  "uploadedBy": "507f1f77bcf86cd799439010",
  "size": "500 MB",
  "fileUrl": "https://storage.example.com/materials/lecture5.mp4"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Material created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439024",
    "title": "Advanced Topics - Lecture 5",
    "type": "Video",
    "course": "507f1f77bcf86cd799439019"
  }
}
```

### 7.4 Update Material
**Endpoint:** `PUT /api/admin/materials/:id`

**Description:** Update material information.

**Request Body:**
```json
{
  "title": "Advanced Topics - Lecture 5 (Updated)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Material updated successfully",
  "data": {
    "id": "507f1f77bcf86cd799439024",
    "title": "Advanced Topics - Lecture 5 (Updated)",
    "type": "Video"
  }
}
```

### 7.5 Delete Material
**Endpoint:** `DELETE /api/admin/materials/:id`

**Description:** Delete a learning material.

**Response:**
```json
{
  "success": true,
  "message": "Material deleted successfully"
}
```

---

## 8. Activity Logs APIs

### 8.1 Get Activity Logs
**Endpoint:** `GET /api/admin/activity-logs`

**Description:** Get system activity logs with filtering.

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 20)
- `search`: string
- `action`: string
- `role`: 'Student' | 'Instructor' | 'Admin' | 'System'
- `startDate`: ISO date string
- `endDate`: ISO date string

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439025",
      "user": "Ahmed Khan",
      "role": "Instructor",
      "action": "Login",
      "target": "Admin Dashboard",
      "timestamp": "2024-03-15T10:30:00Z",
      "ipAddress": "192.168.1.101"
    }
  ],
  "pagination": {
    "total": 50000,
    "page": 1,
    "limit": 20,
    "pages": 2500
  }
}
```

### 8.2 Get Activity Log Statistics
**Endpoint:** `GET /api/admin/activity-logs/stats`

**Description:** Get activity log statistics.

**Query Parameters:**
- `period`: 'day' | 'week' | 'month' (default: 'month')

**Response:**
```json
{
  "success": true,
  "data": {
    "totalActivities": 50000,
    "loginCount": 12500,
    "submissionCount": 8900,
    "createdCount": 5600,
    "updatedCount": 22000,
    "activityByRole": {
      "Student": 25000,
      "Instructor": 20000,
      "Admin": 4500,
      "System": 500
    },
    "topActions": [
      { "action": "Login", "count": 12500 },
      { "action": "Updated", "count": 22000 },
      { "action": "Submitted", "count": 8900 }
    ]
  }
}
```

### 8.3 Export Activity Logs
**Endpoint:** `GET /api/admin/activity-logs/export`

**Description:** Export activity logs as CSV.

**Query Parameters:**
- `format`: 'csv' | 'json' (default: 'csv')
- `startDate`: ISO date string
- `endDate`: ISO date string

**Response:** CSV or JSON file download

---

## 9. Notifications APIs

### 9.1 Get All Notifications
**Endpoint:** `GET /api/admin/notifications`

**Description:** Get list of all notifications.

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 20)
- `type`: 'assignment' | 'submission' | 'deadline' | 'grade' | 'system'
- `read`: boolean

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439026",
      "type": "assignment",
      "title": "New Assignment Posted",
      "message": "Programming Fundamentals Assignment 2 has been posted",
      "timestamp": "2024-03-15T10:30:00Z",
      "read": false
    }
  ],
  "pagination": {
    "total": 5000,
    "page": 1,
    "limit": 20,
    "pages": 250
  }
}
```

### 9.2 Create Notification
**Endpoint:** `POST /api/admin/notifications`

**Description:** Create a new notification.

**Request Body:**
```json
{
  "type": "system",
  "title": "System Maintenance",
  "message": "LMS will be under maintenance on Sunday from 2-4 AM",
  "recipients": ["all"] // or specific user IDs
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439027",
    "type": "system",
    "title": "System Maintenance",
    "message": "LMS will be under maintenance on Sunday from 2-4 AM"
  }
}
```

### 9.3 Mark Notification as Read
**Endpoint:** `PUT /api/admin/notifications/:id/read`

**Description:** Mark a notification as read.

**Response:**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

### 9.4 Delete Notification
**Endpoint:** `DELETE /api/admin/notifications/:id`

**Description:** Delete a notification.

**Response:**
```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

---

## 10. Instructor Activities APIs

### 10.1 Get Instructor Activities
**Endpoint:** `GET /api/admin/instructor-activities`

**Description:** Get instructor activity data for admin monitoring.

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 20)
- `search`: string (search by instructor name)
- `status`: 'Completed' | 'Pending' | 'In Progress'
- `startDate`: ISO date string
- `endDate`: ISO date string

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439028",
      "instructorName": "Ahmed Khan",
      "instructorId": "507f1f77bcf86cd799439010",
      "mdbReplies": 45,
      "gdbMarking": 28,
      "assignmentUploads": 12,
      "assignmentMarking": 156,
      "ticketHandling": 8,
      "emailResponses": 34,
      "status": "Completed",
      "date": "2024-03-15"
    }
  ],
  "pagination": {
    "total": 156,
    "page": 1,
    "limit": 20,
    "pages": 8
  }
}
```

### 10.2 Get Instructor Activities Summary
**Endpoint:** `GET /api/admin/instructor-activities/summary`

**Description:** Get summary statistics for instructor activities.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalMdbReplies": 5400,
    "totalGdbMarking": 3200,
    "totalAssignmentUploads": 1500,
    "totalAssignmentMarking": 18900,
    "totalTicketHandling": 900,
    "totalEmailResponses": 4200,
    "chartData": [
      {
        "name": "Ahmed",
        "mdbReplies": 45,
        "assignmentMarking": 156,
        "emailResponses": 34
      }
    ]
  }
}
```

---

## 11. Student Activities APIs

### 11.1 Get Student Activities
**Endpoint:** `GET /api/admin/student-activities`

**Description:** Get student activity data for admin monitoring.

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 20)
- `search`: string (search by student name)
- `status`: 'Active' | 'Inactive'
- `startDate`: ISO date string
- `endDate`: ISO date string

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439029",
      "studentName": "Fatima Ali",
      "studentId": "507f1f77bcf86cd799439016",
      "assignmentSubmission": 18,
      "attendance": 92,
      "materialDownloads": 34,
      "quizAttempts": 8,
      "status": "Active",
      "date": "2024-03-15"
    }
  ],
  "pagination": {
    "total": 2691,
    "page": 1,
    "limit": 20,
    "pages": 135
  }
}
```

### 11.2 Get Student Activities Summary
**Endpoint:** `GET /api/admin/student-activities/summary`

**Description:** Get summary statistics for student activities.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSubmissions": 48000,
    "averageAttendance": 87,
    "totalDownloads": 92000,
    "totalQuizAttempts": 18500,
    "chartData": [
      {
        "name": "Fatima",
        "submissions": 18,
        "downloads": 34,
        "quizAttempts": 8
      }
    ]
  }
}
```

---

## 12. Reports APIs

### 12.1 Get Reports
**Endpoint:** `GET /api/admin/reports`

**Description:** Get list of generated reports.

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 20)
- `type`: 'Weekly' | 'Monthly' | 'Custom'
- `period`: string

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439030",
      "title": "Weekly Performance Report",
      "type": "Weekly",
      "generatedBy": {
        "id": "507f1f77bcf86cd799439011",
        "name": "Admin User"
      },
      "generatedDate": "2024-03-15T10:30:00Z",
      "period": "Week 11, 2024",
      "data": {
        "activities": 1200,
        "submissions": 450,
        "performance": 82
      }
    }
  ],
  "pagination": {
    "total": 500,
    "page": 1,
    "limit": 20,
    "pages": 25
  }
}
```

### 12.2 Generate Report
**Endpoint:** `POST /api/admin/reports/generate`

**Description:** Generate a new report.

**Request Body:**
```json
{
  "type": "Monthly",
  "period": "March 2024",
  "includeData": ["instructorActivities", "studentSubmissions", "coursePerformance"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Report generated successfully",
  "data": {
    "id": "507f1f77bcf86cd799439031",
    "title": "Monthly Report - March 2024",
    "type": "Monthly",
    "generatedDate": "2024-03-15T10:30:00Z",
    "downloadUrl": "/api/admin/reports/507f1f77bcf86cd799439031/download"
  }
}
```

### 12.3 Get Report by ID
**Endpoint:** `GET /api/admin/reports/:id`

**Description:** Get detailed report information.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439031",
    "title": "Monthly Report - March 2024",
    "type": "Monthly",
    "generatedBy": "507f1f77bcf86cd799439011",
    "generatedDate": "2024-03-15T10:30:00Z",
    "period": "March 2024",
    "data": {
      "instructorActivities": 5400,
      "studentSubmissions": 12000,
      "coursePerformance": 82.5
    }
  }
}
```

### 12.4 Download Report
**Endpoint:** `GET /api/admin/reports/:id/download`

**Description:** Download report as PDF or CSV.

**Query Parameters:**
- `format`: 'pdf' | 'csv' (default: 'pdf')

**Response:** File download

---

## 13. Settings APIs

### 13.1 Get Settings
**Endpoint:** `GET /api/admin/settings`

**Description:** Get admin system settings.

**Response:**
```json
{
  "success": true,
  "data": {
    "general": {
      "platformName": "EduHub LMS",
      "platformUrl": "https://eduhub.university.edu",
      "adminEmail": "admin@university.edu",
      "supportEmail": "support@university.edu",
      "timezone": "PKT",
      "language": "en",
      "description": "EduHub is a comprehensive Learning Management System"
    },
    "email": {
      "smtpServer": "smtp.gmail.com",
      "smtpPort": 587,
      "smtpUsername": "noreply@university.edu",
      "smtpSecure": true
    },
    "notifications": {
      "emailNotifications": true,
      "pushNotifications": true,
      "assignmentNotifications": true,
      "submissionNotifications": true,
      "systemNotifications": false,
      "reportNotifications": true
    }
  }
}
```

### 13.2 Update Settings
**Endpoint:** `PUT /api/admin/settings`

**Description:** Update admin system settings.

**Request Body:**
```json
{
  "general": {
    "platformName": "EduHub LMS Updated",
    "timezone": "UTC",
    "language": "ur"
  },
  "notifications": {
    "systemNotifications": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Settings updated successfully",
  "data": {
    "general": {
      "platformName": "EduHub LMS Updated",
      "timezone": "UTC",
      "language": "ur"
    }
  }
}
```

### 13.3 Get Admin Profile
**Endpoint:** `GET /api/admin/profile`

**Description:** Get current admin user profile.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Admin User",
    "email": "admin@university.edu",
    "role": "Admin",
    "phone": "+92 300 0000000",
    "department": "Administration",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
  }
}
```

### 13.4 Update Admin Profile
**Endpoint:** `PUT /api/admin/profile`

**Description:** Update admin user profile.

**Request Body:**
```json
{
  "name": "Admin User Updated",
  "phone": "+92 300 1111111",
  "department": "IT Administration"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Admin User Updated",
    "email": "admin@university.edu",
    "phone": "+92 300 1111111",
    "department": "IT Administration"
  }
}
```

### 13.5 Change Admin Password
**Endpoint:** `PUT /api/admin/change-password`

**Description:** Change admin password.

**Request Body:**
```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword123",
  "confirmPassword": "NewPassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## Error Handling

All endpoints return error responses in the following format:

```json
{
  "success": false,
  "message": "Error message describing what went wrong",
  "error": "ERROR_CODE"
}
```

### Common HTTP Status Codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

### Common Error Codes:
- `INVALID_REQUEST`: Invalid request parameters
- `UNAUTHORIZED`: User not authenticated
- `FORBIDDEN`: User does not have permission
- `NOT_FOUND`: Resource not found
- `DUPLICATE_ENTRY`: Duplicate entry exists
- `VALIDATION_ERROR`: Validation failed
- `SERVER_ERROR`: Internal server error

---

## Rate Limiting

All API endpoints are rate-limited to prevent abuse:
- **Default**: 100 requests per minute per IP
- **Authenticated**: 500 requests per minute per user

---

## Pagination

List endpoints support pagination with the following parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

Response includes pagination metadata:
```json
{
  "pagination": {
    "total": 2847,
    "page": 1,
    "limit": 20,
    "pages": 143
  }
}
```

---

## Sorting

List endpoints support sorting with the following parameters:
- `sortBy`: Field to sort by
- `sortOrder`: 'asc' | 'desc' (default: 'asc')

Example: `GET /api/admin/users?sortBy=joinedDate&sortOrder=desc`

---

## Filtering

Most list endpoints support advanced filtering:
- Text search across multiple fields
- Status filtering
- Date range filtering
- Category/Department filtering

---

## Version History

**v1.0** - Initial release with all core admin APIs

---

## Support

For API issues or questions, contact: api-support@university.edu
