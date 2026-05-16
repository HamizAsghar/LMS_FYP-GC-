# Admin Panel APIs - Complete Implementation Package

## 📋 Overview

This package contains all the necessary API routes and middleware for implementing a complete Admin Panel for the EduHub LMS. The APIs handle user management, course management, assignments, activity logging, notifications, and system settings.

## 📁 Files Included

### Documentation Files
1. **ADMIN_API_DOCUMENTATION.md** - Complete API documentation with all endpoints, request/response examples, and error handling
2. **IMPLEMENTATION_GUIDE.md** - Step-by-step guide for integrating APIs into your Next.js project
3. **README.md** - This file

### Core Files
1. **middleware.js** - Authentication, validation, and error handling middleware
2. **dashboard-stats-route.js** - Dashboard statistics and overview endpoints
3. **users-route.js** - User management CRUD operations
4. **courses-route.js** - Course management CRUD operations
5. **assignments-route.js** - Assignment management CRUD operations
6. **activity-logs-route.js** - Activity logging and statistics
7. **notifications-route.js** - Notification management
8. **activities-route.js** - Instructor and student activity tracking
9. **settings-route.js** - System settings and admin profile management

## 🚀 Quick Start

### 1. Copy Files to Your Project

```bash
# Copy middleware
cp middleware.js your-project/middleware/admin.js

# Copy API routes to appropriate directories
cp dashboard-stats-route.js your-project/app/api/admin/dashboard/stats/route.js
cp users-route.js your-project/app/api/admin/users/route.js
# ... and so on for other routes
```

### 2. Set Environment Variables

Add to your `.env.local`:

```env
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
MONGODB_URI=your_mongodb_connection_string
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

### 3. Update Frontend Components

Replace dummy data imports with API calls:

```javascript
// Before
import { users } from '@/lib/dummy-data'

// After
const response = await fetch('/api/admin/users', {
  headers: { 'Authorization': `Bearer ${token}` }
})
const { data } = await response.json()
```

## 📚 API Endpoints Summary

### Dashboard
- `GET /api/admin/dashboard/stats` - Get dashboard statistics
- `GET /api/admin/dashboard/charts` - Get chart data
- `GET /api/admin/dashboard/top-instructors` - Get top performing instructors

### Users Management
- `GET /api/admin/users` - List all users
- `POST /api/admin/users` - Create new user
- `GET /api/admin/users/:id` - Get user details
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user

### Instructors Management
- `GET /api/admin/instructors` - List all instructors
- `POST /api/admin/instructors` - Create new instructor
- `GET /api/admin/instructors/:id` - Get instructor details
- `PUT /api/admin/instructors/:id` - Update instructor
- `DELETE /api/admin/instructors/:id` - Delete instructor

### Students Management
- `GET /api/admin/students` - List all students
- `POST /api/admin/students` - Create new student
- `GET /api/admin/students/:id` - Get student details
- `PUT /api/admin/students/:id` - Update student
- `DELETE /api/admin/students/:id` - Delete student

### Courses Management
- `GET /api/admin/courses` - List all courses
- `POST /api/admin/courses` - Create new course
- `GET /api/admin/courses/:id` - Get course details
- `PUT /api/admin/courses/:id` - Update course
- `DELETE /api/admin/courses/:id` - Delete course

### Assignments Management
- `GET /api/admin/assignments` - List all assignments
- `POST /api/admin/assignments` - Create new assignment
- `GET /api/admin/assignments/:id` - Get assignment details
- `PUT /api/admin/assignments/:id` - Update assignment
- `DELETE /api/admin/assignments/:id` - Delete assignment

### Learning Materials
- `GET /api/admin/materials` - List all materials
- `POST /api/admin/materials` - Upload new material
- `GET /api/admin/materials/:id` - Get material details
- `PUT /api/admin/materials/:id` - Update material
- `DELETE /api/admin/materials/:id` - Delete material

### Activity Logs
- `GET /api/admin/activity-logs` - List activity logs
- `GET /api/admin/activity-logs/stats` - Get activity statistics
- `GET /api/admin/activity-logs/export` - Export logs as CSV

### Notifications
- `GET /api/admin/notifications` - List all notifications
- `POST /api/admin/notifications` - Create new notification
- `GET /api/admin/notifications/:id` - Get notification details
- `PUT /api/admin/notifications/:id/read` - Mark as read
- `DELETE /api/admin/notifications/:id` - Delete notification
- `POST /api/admin/notifications/mark-all-read` - Mark all as read
- `DELETE /api/admin/notifications/clear-all` - Clear all notifications

### Instructor Activities
- `GET /api/admin/instructor-activities` - List instructor activities
- `GET /api/admin/instructor-activities/summary` - Get summary statistics

### Student Activities
- `GET /api/admin/student-activities` - List student activities
- `GET /api/admin/student-activities/summary` - Get summary statistics

### Reports
- `GET /api/admin/reports` - List all reports
- `POST /api/admin/reports/generate` - Generate new report
- `GET /api/admin/reports/:id` - Get report details
- `GET /api/admin/reports/:id/download` - Download report

### Settings
- `GET /api/admin/settings` - Get system settings
- `PUT /api/admin/settings` - Update system settings
- `GET /api/admin/profile` - Get admin profile
- `PUT /api/admin/profile` - Update admin profile
- `PUT /api/admin/change-password` - Change admin password
- `GET /api/admin/notifications` - Get notification preferences
- `PUT /api/admin/notifications` - Update notification preferences

## 🔐 Authentication

All endpoints require a JWT token in the Authorization header:

```javascript
const response = await fetch('/api/admin/users', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

## 📊 Features

### User Management
- Create, read, update, delete users
- Filter by role, status, department
- Search by name or email
- Pagination support

### Course Management
- Full CRUD operations
- Instructor assignment
- Status tracking (Active, Completed, Archived)
- Category organization

### Assignment Management
- Create and manage assignments
- Track submissions
- Deadline management
- Marks and grading

### Activity Monitoring
- Track user activities
- Generate activity reports
- Filter by action, role, date range
- Export logs as CSV

### Notification System
- Send notifications to users
- Mark as read/unread
- Filter by type and status
- Bulk operations

### System Settings
- Configure platform settings
- Manage email configuration
- Notification preferences
- Admin profile management

## 🛠️ Middleware Features

The `middleware.js` file provides:

- **Authentication** - JWT token verification
- **Validation** - Request body validation with schema
- **Error Handling** - Consistent error responses
- **Pagination** - Automatic pagination calculation
- **Database Error Handling** - Specific error messages for DB issues
- **Async Handler** - Wrapper for error handling in routes

## 📝 Request/Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE"
}
```

## 🔍 Filtering and Pagination

### Pagination
```
GET /api/admin/users?page=1&limit=20
```

### Filtering
```
GET /api/admin/users?search=Ahmed&role=Instructor&status=Active
```

### Sorting
```
GET /api/admin/users?sortBy=joinedDate&sortOrder=desc
```

## 🚨 Error Codes

- `UNAUTHORIZED` - Missing or invalid token
- `FORBIDDEN` - User doesn't have permission
- `NOT_FOUND` - Resource not found
- `DUPLICATE_ENTRY` - Duplicate entry exists
- `VALIDATION_ERROR` - Request validation failed
- `SERVER_ERROR` - Internal server error

## 📦 Dependencies

Required npm packages:
- `jsonwebtoken` - JWT token handling
- `bcryptjs` - Password hashing
- `mongoose` - MongoDB ODM
- `next` - Next.js framework
- `nodemailer` - Email sending (for settings API)

Install with:
```bash
npm install jsonwebtoken bcryptjs mongoose nodemailer
```

## 🔄 Integration Workflow

1. **Copy files** to your project
2. **Set environment variables**
3. **Create API routes** in correct directories
4. **Update models** if needed
5. **Update frontend components** to use APIs
6. **Test all endpoints**
7. **Deploy to production**

## 📖 Documentation

- **ADMIN_API_DOCUMENTATION.md** - Complete API reference
- **IMPLEMENTATION_GUIDE.md** - Step-by-step integration guide
- Each route file contains inline comments explaining functionality

## 🧪 Testing

### Test with cURL
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/admin/users
```

### Test with Postman
1. Create collection for Admin APIs
2. Set Authorization header with Bearer token
3. Use examples from documentation

## 🚀 Production Deployment

Before deploying to production:

1. ✅ Set secure environment variables
2. ✅ Enable HTTPS
3. ✅ Implement rate limiting
4. ✅ Add request logging
5. ✅ Set up database backups
6. ✅ Test all endpoints thoroughly
7. ✅ Implement monitoring and alerts

## 📞 Support

For issues or questions:
1. Check the API documentation
2. Review the implementation guide
3. Check inline comments in route files
4. Test endpoints with Postman

## 📄 License

This API package is part of the EduHub LMS project.

## 🔄 Version History

**v1.0** - Initial release
- All core admin APIs
- Complete documentation
- Implementation guide
- Middleware and utilities

---

## 📋 Checklist for Implementation

- [ ] Copy all files to project
- [ ] Set environment variables
- [ ] Create directory structure
- [ ] Copy route files to correct locations
- [ ] Update imports in route files
- [ ] Update frontend components
- [ ] Test all endpoints
- [ ] Implement error handling
- [ ] Add loading states
- [ ] Deploy to production

---

**Last Updated:** March 2024
**API Version:** 1.0
**Status:** Production Ready
