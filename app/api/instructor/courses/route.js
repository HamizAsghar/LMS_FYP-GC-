import dbConnect from '@/dbConnect';
import Course from '@/models/Course';
import Assignment from '@/models/Assignment';
import User from '@/models/User';
import { instructorAuthMiddleware, errorResponse, successResponse } from '@/middleware/instructor';

export async function GET(req) {
  try {
    const authResult = await instructorAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    const instructorId = authResult.user.id;
    await dbConnect();

    const [user, courses] = await Promise.all([
      User.findById(instructorId).select('name email').lean(),
      Course.find({ instructor: instructorId }).sort({ createdAt: -1 })
    ]);
    
    const coursesWithDetails = await Promise.all(courses.map(async (course) => {
      const assignmentCount = await Assignment.countDocuments({ course: course._id });
      return {
        ...course.toObject(),
        assignmentCount
      };
    }));

    return successResponse({
      user,
      courses: coursesWithDetails
    }, 'Instructor courses retrieved successfully');
  } catch (error) {
    console.error('Instructor courses error:', error);
    return errorResponse('Failed to retrieve instructor courses', 'SERVER_ERROR', 500);
  }
}
export async function POST(req) {
  try {
    const authResult = await instructorAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    const instructorId = authResult.user.id;
    const body = await req.json();
    const { name, code, description, semester } = body;

    if (!name || !code) {
      return errorResponse('Course name and code are required', 'BAD_REQUEST', 400);
    }

    await dbConnect();

    const existingCourse = await Course.findOne({ code });
    if (existingCourse) {
      return errorResponse('Course with this code already exists', 'BAD_REQUEST', 400);
    }

    const newCourse = await Course.create({
      name,
      code,
      description,
      semester,
      instructor: instructorId,
      status: 'Active',
      students: 0
    });

    return successResponse(newCourse, 'Course created successfully', 201);
  } catch (error) {
    console.error('Course creation error:', error);
    return errorResponse('Failed to create course', 'SERVER_ERROR', 500);
  }
}
