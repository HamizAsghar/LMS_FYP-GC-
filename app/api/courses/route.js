import dbConnect from '@/dbConnect';
import Course from '@/models/Course';
import { successResponse, errorResponse } from '@/middleware/student';

export async function GET(req) {
  try {
    await dbConnect();
    const courses = await Course.find({ status: 'Active' })
      .populate('instructor', 'name')
      .lean();
      
    return successResponse(courses, 'All active courses retrieved successfully');
  } catch (error) {
    console.error('All courses API error:', error);
    return errorResponse('Failed to retrieve all courses', 'SERVER_ERROR', 500);
  }
}
