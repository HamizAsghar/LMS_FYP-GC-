# Admin Panel API Implementation Guide

## Overview
This guide explains how to integrate all the Admin Panel APIs into your existing Next.js project.

---

## Project Structure

Your project should have the following directory structure for the APIs:

```
project/
├── app/
│   ├── api/
│   │   ├── admin/
│   │   │   ├── dashboard/
│   │   │   │   ├── stats/
│   │   │   │   │   └── route.js
│   │   │   │   ├── charts/
│   │   │   │   │   └── route.js
│   │   │   │   └── top-instructors/
│   │   │   │       └── route.js
│   │   │   ├── users/
│   │   │   │   ├── route.js
│   │   │   │   └── [id]/
│   │   │   │       └── route.js
│   │   │   ├── instructors/
│   │   │   │   ├── route.js
│   │   │   │   └── [id]/
│   │   │   │       └── route.js
│   │   │   ├── students/
│   │   │   │   ├── route.js
│   │   │   │   └── [id]/
│   │   │   │       └── route.js
│   │   │   ├── courses/
│   │   │   │   ├── route.js
│   │   │   │   └── [id]/
│   │   │   │       └── route.js
│   │   │   ├── assignments/
│   │   │   │   ├── route.js
│   │   │   │   └── [id]/
│   │   │   │       └── route.js
│   │   │   ├── materials/
│   │   │   │   ├── route.js
│   │   │   │   └── [id]/
│   │   │   │       └── route.js
│   │   │   ├── activity-logs/
│   │   │   │   ├── route.js
│   │   │   │   └── export/
│   │   │   │       └── route.js
│   │   │   ├── notifications/
│   │   │   │   ├── route.js
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── route.js
│   │   │   │   │   └── read/
│   │   │   │   │       └── route.js
│   │   │   │   ├── mark-all-read/
│   │   │   │   │   └── route.js
│   │   │   │   └── clear-all/
│   │   │   │       └── route.js
│   │   │   ├── instructor-activities/
│   │   │   │   ├── route.js
│   │   │   │   └── summary/
│   │   │   │       └── route.js
│   │   │   ├── student-activities/
│   │   │   │   ├── route.js
│   │   │   │   └── summary/
│   │   │   │       └── route.js
│   │   │   ├── reports/
│   │   │   │   ├── route.js
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── route.js
│   │   │   │   │   └── download/
│   │   │   │   │       └── route.js
│   │   │   │   └── generate/
│   │   │   │       └── route.js
│   │   │   └── settings/
│   │   │       ├── route.js
│   │   │       ├── profile/
│   │   │       │   └── route.js
│   │   │       ├── password/
│   │   │       │   └── route.js
│   │   │       ├── notifications/
│   │   │       │   └── route.js
│   │   │       └── test-email/
│   │   │           └── route.js
│   │   └── auth/
│   │       └── ... (existing auth routes)
│   └── ... (existing pages)
├── middleware/
│   └── admin.js
├── models/
│   ├── User.js
│   ├── Course.js
│   ├── Assignment.js
│   ├── Submission.js
│   ├── ActivityLog.js
│   ├── Notification.js
│   ├── Student.js
│   ├── Instructor.js
│   ├── StudentActivity.js
│   ├── InstructorActivity.js
│   ├── LearningMaterial.js
│   └── Report.js
├── dbConnect.js
└── ... (existing files)
```

---

## Step-by-Step Implementation

### Step 1: Copy Middleware File

Copy the `middleware.js` file to your project:

```bash
cp middleware.js project/middleware/admin.js
```

### Step 2: Create Directory Structure

Create all the necessary API route directories:

```bash
mkdir -p project/app/api/admin/{dashboard,users,instructors,students,courses,assignments,materials,activity-logs,notifications,instructor-activities,student-activities,reports,settings}/{stats,charts,top-instructors,[id],read,summary,generate,download,profile,password,notifications,test-email,mark-all-read,clear-all,export}
```

### Step 3: Copy API Route Files

Copy each route file to its corresponding directory. Here's the mapping:

#### Dashboard APIs
```bash
cp dashboard-stats-route.js project/app/api/admin/dashboard/stats/route.js
```

#### Users Management
```bash
cp users-route.js project/app/api/admin/users/route.js
# For individual user endpoints, create [id]/route.js with GET, PUT, DELETE methods
```

#### Courses Management
```bash
cp courses-route.js project/app/api/admin/courses/route.js
# For individual course endpoints, create [id]/route.js
```

#### Assignments Management
```bash
cp assignments-route.js project/app/api/admin/assignments/route.js
# For individual assignment endpoints, create [id]/route.js
```

#### Activity Logs
```bash
cp activity-logs-route.js project/app/api/admin/activity-logs/route.js
# For export endpoint, create export/route.js
```

#### Notifications
```bash
cp notifications-route.js project/app/api/admin/notifications/route.js
# For individual notification endpoints, create [id]/route.js
# For read endpoint, create [id]/read/route.js
# For mark all read, create mark-all-read/route.js
# For clear all, create clear-all/route.js
```

#### Activities
```bash
cp activities-route.js project/app/api/admin/instructor-activities/route.js
cp activities-route.js project/app/api/admin/student-activities/route.js
# For summary endpoints, create summary/route.js
```

#### Settings
```bash
cp settings-route.js project/app/api/admin/settings/route.js
# For profile, create profile/route.js
# For password, create password/route.js
# For notifications, create notifications/route.js
# For test-email, create test-email/route.js
```

### Step 4: Update Imports

In each route file, update the imports to match your project structure:

```javascript
// Update these imports based on your project structure
import dbConnect from '@/dbConnect';
import User from '@/models/User';
import Course from '@/models/Course';
// ... etc
```

### Step 5: Environment Variables

Add the following environment variables to your `.env.local`:

```env
# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name

# Email Configuration (for settings API)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=true
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

FROM_NAME=EduHub LMS
FROM_EMAIL=noreply@eduhub.university.edu
```

### Step 6: Update Frontend Components

Update your admin panel pages to call the APIs instead of using dummy data.

#### Example: Users Page

**Before (using dummy data):**
```javascript
import { users } from '@/lib/dummy-data'

export default function ManageUsersPage() {
  const [users, setUsers] = useState([])
  // ... rest of component
}
```

**After (using API):**
```javascript
import { useState, useEffect } from 'react'

export default function ManageUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (data.success) {
        setUsers(data.data.users)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  // ... rest of component
}
```

### Step 7: Create API Client Utility

Create a utility file for API calls to avoid repetition:

```javascript
// lib/api.js
export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token')
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }

  const response = await fetch(endpoint, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  })

  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.message || 'API request failed')
  }

  return data
}

// Usage in components
import { apiCall } from '@/lib/api'

const users = await apiCall('/api/admin/users')
const newUser = await apiCall('/api/admin/users', {
  method: 'POST',
  body: JSON.stringify(userData)
})
```

---

## Authentication

All API endpoints require a valid JWT token in the Authorization header:

```javascript
const response = await fetch('/api/admin/users', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

The token is obtained from the login endpoint and should be stored in localStorage or a secure cookie.

---

## Error Handling

All endpoints return a consistent error response format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE"
}
```

Implement error handling in your components:

```javascript
try {
  const data = await apiCall('/api/admin/users')
  // Handle success
} catch (error) {
  console.error('Error:', error.message)
  // Show error to user
}
```

---

## Testing the APIs

### Using cURL

```bash
# Get all users
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/admin/users

# Create a new user
curl -X POST http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "Student",
    "department": "Computer Science"
  }'
```

### Using Postman

1. Create a new collection for Admin APIs
2. Set the Authorization header with Bearer token
3. Create requests for each endpoint
4. Use the examples from the API documentation

---

## Performance Optimization

### 1. Pagination

Always use pagination for list endpoints:

```javascript
const response = await apiCall('/api/admin/users?page=1&limit=20')
```

### 2. Filtering

Use filters to reduce data transfer:

```javascript
const response = await apiCall('/api/admin/users?search=Ahmed&role=Instructor&status=Active')
```

### 3. Caching

Implement caching for frequently accessed data:

```javascript
const cache = new Map()

const fetchWithCache = async (endpoint) => {
  if (cache.has(endpoint)) {
    return cache.get(endpoint)
  }
  
  const data = await apiCall(endpoint)
  cache.set(endpoint, data)
  return data
}
```

---

## Common Issues and Solutions

### Issue 1: Authentication Fails
**Solution:** Ensure the JWT token is valid and not expired. Implement token refresh logic.

### Issue 2: CORS Errors
**Solution:** Add CORS headers to your API routes if needed:

```javascript
export async function GET(req) {
  const response = NextResponse.json({ ... })
  response.headers.set('Access-Control-Allow-Origin', '*')
  return response
}
```

### Issue 3: Database Connection Fails
**Solution:** Verify MongoDB URI in environment variables and ensure database is accessible.

### Issue 4: Validation Errors
**Solution:** Check request body format matches the schema defined in the API documentation.

---

## Database Models

Ensure all required models are created in your project:

- `User.js` - User model with authentication
- `Course.js` - Course model
- `Assignment.js` - Assignment model
- `Submission.js` - Student submission model
- `ActivityLog.js` - System activity logging
- `Notification.js` - User notifications
- `Student.js` - Student profile model
- `Instructor.js` - Instructor profile model
- `StudentActivity.js` - Student activity tracking
- `InstructorActivity.js` - Instructor activity tracking
- `LearningMaterial.js` - Learning materials model
- `Report.js` - Report generation model

---

## Next Steps

1. **Implement all API routes** following the structure provided
2. **Update frontend components** to use the APIs
3. **Add error handling** and loading states
4. **Implement authentication** with token management
5. **Test all endpoints** thoroughly
6. **Deploy to production** with proper security measures

---

## Support

For issues or questions about the API implementation, refer to:
- API Documentation: `ADMIN_API_DOCUMENTATION.md`
- Middleware Reference: `middleware.js`
- Example Routes: All `*-route.js` files

---

## Version

**API Version:** 1.0
**Last Updated:** March 2024
