# EduHub LMS - Complete Backend API

Base URL: `http://localhost:3000/api`

All protected routes require: `Authorization: Bearer <token>`

## Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Register Student/Instructor |
| POST | `/auth/login` | Login (optional `role` in body) |
| POST | `/auth/forgot-password` | Send reset email |
| POST | `/auth/reset-password` | Reset with token |
| POST | `/auth/verify-email` | Verify email token |

## Admin (`role: Admin`)

| Method | Endpoint |
|--------|----------|
| GET | `/admin/dashboard` |
| GET | `/admin/dashboard/stats` |
| GET/POST | `/admin/users` |
| GET/PUT/DELETE | `/admin/users/[id]` |
| GET/POST | `/admin/courses` |
| GET/PUT/DELETE | `/admin/courses/[id]` |
| GET/POST | `/admin/assignments` |
| GET/PUT/DELETE | `/admin/assignments/[id]` |
| GET | `/admin/instructor-activities` |
| GET | `/admin/instructor-activities/summary` |
| GET | `/admin/student-activities` |
| GET | `/admin/student-activities/summary` |
| GET/POST | `/admin/materials` |
| GET/DELETE | `/admin/materials/[id]` |
| GET/POST | `/admin/reports?analytics=true&period=monthly` |
| GET/POST | `/admin/notifications` |
| PUT/DELETE | `/admin/notifications/[id]` |
| POST | `/admin/notifications/mark-all-read` |
| GET | `/admin/activity-logs` |
| GET/PUT | `/admin/settings` |
| GET/PUT | `/admin/settings/profile` |
| PUT | `/admin/settings/password` |

## Instructor

| Method | Endpoint |
|--------|----------|
| GET | `/instructor/dashboard` |
| GET | `/instructor/courses` |
| GET/POST | `/instructor/assignments` |
| GET/PUT | `/instructor/submissions` |
| GET/POST | `/instructor/schedule` |
| GET/POST | `/instructor/activities` |
| PUT/DELETE | `/instructor/activities/[id]` |
| GET/POST | `/instructor/materials` |
| GET/PUT/DELETE | `/instructor/notifications` |
| GET | `/instructor/reports?period=weekly` |

## Student

| Method | Endpoint |
|--------|----------|
| GET | `/student/dashboard` |
| GET | `/student/courses` |
| GET | `/student/assignments` |
| GET/POST | `/student/submissions` |
| GET/POST | `/student/materials` |
| GET/PUT/DELETE | `/student/notifications` |
| GET | `/student/reports` |

## Shared (any role)

| Method | Endpoint |
|--------|----------|
| GET/PUT | `/profile` |
| GET/PUT | `/settings` |
| PUT | `/settings/password` |

## Setup

1. Copy `.env.example` to `.env.local` and set `MONGODB_URI`, `JWT_SECRET`
2. `npm install`
3. `npm run seed` — creates demo users
4. `npm run dev`
