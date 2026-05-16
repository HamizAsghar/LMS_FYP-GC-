# Instructor Dashboard API Documentation

This document outlines the newly created APIs for the Instructor Dashboard. All endpoints are protected and require a valid JWT token with the `Instructor` role.

## Base URL
`/api/instructor`

## Authentication
All requests must include the JWT token in the Authorization header:
`Authorization: Bearer <your_token>`

---

## 1. Dashboard Summary
**Endpoint:** `GET /dashboard`  
**Description:** Retrieves all data required for the main instructor dashboard page.

**Response Data:**
- `stats`: Overview counts (activities, tasks, assignments, students, rating).
- `weeklyPerformance`: Chart data for activities and grading.
- `todaySchedule`: List of classes/meetings for the current day.
- `myCourses`: List of courses managed by the instructor.
- `recentActivities`: Latest actions taken by the instructor.
- `pendingSubmissions`: Recent student submissions awaiting review.

---

## 2. Courses
**Endpoint:** `GET /courses`  
**Description:** Retrieves all courses assigned to the instructor.

---

## 3. Assignments
**Endpoint:** `GET /assignments`  
**Method:** `GET` | `POST`  
**Description:** 
- `GET`: List all assignments (filter by `courseId`).
- `POST`: Create a new assignment.

---

## 4. Submissions & Grading
**Endpoint:** `GET /submissions`  
**Method:** `GET` | `PUT`  
**Description:**
- `GET`: List student submissions (filter by `status`).
- `PUT`: Grade a submission (requires `submissionId`, `marks`, `feedback`).

---

## 5. Schedule
**Endpoint:** `GET /schedule`  
**Method:** `GET` | `POST`  
**Description:**
- `GET`: Retrieve schedule items (filter by `date`).
- `POST`: Create a new schedule entry.

---

## Middleware & Utilities
The implementation includes `middleware/instructor.js` which provides:
- `instructorAuthMiddleware`: Validates JWT and checks for the `Instructor` role.
- `successResponse`: Standardized success JSON response.
- `errorResponse`: Standardized error JSON response.
