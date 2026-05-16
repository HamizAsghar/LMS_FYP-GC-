# Student Dashboard API Documentation

This document outlines the APIs for the Student Dashboard. All endpoints require a valid JWT token with the `Student` role.

## Base URL
`/api/student`

## Authentication
`Authorization: Bearer <your_token>`

---

## 1. Dashboard Summary
**Endpoint:** `GET /dashboard`  
**Description:** Retrieves summary data for the student dashboard.

**Response Data:**
- `stats`: Course counts, pending assignments, submitted count, materials, progress, and attendance.
- `progressData`: Weekly learning progress chart data.
- `enrolledCourses`: List of top enrolled courses.
- `upcomingDeadlines`: Assignments with upcoming deadlines.
- `recentNotifications`: Latest 3 notifications.

---

## 2. Courses
**Endpoint:** `GET /courses`  
**Description:** List all enrolled courses with instructor details.

---

## 3. Assignments
**Endpoint:** `GET /assignments`  
**Description:** List all active assignments with submission status, marks, and feedback.
- Optional query param: `?courseId=ID`

---

## 4. Submissions
**Endpoint:** `POST /submissions` | `GET /submissions`  
**Description:**
- `POST`: Submit an assignment (requires `assignmentId`, `fileUrl`).
- `GET`: View all your previous submissions.

---

## 5. Notifications
**Endpoint:** `GET /notifications` | `PUT /notifications`  
**Description:**
- `GET`: List all notifications.
- `PUT`: Mark a notification as read (requires `notificationId`).
