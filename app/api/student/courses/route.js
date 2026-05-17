import dbConnect from '@/dbConnect';
import Course from '@/models/Course';
import Student from '@/models/Student';
import { studentAuthMiddleware, errorResponse, successResponse } from '@/middleware/student';

export async function GET(req) {
  try {
    const authResult = await studentAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();
    const profile = await Student.findOne({ userId: authResult.user.id });

    const filter =
      profile?.courses?.length > 0
        ? { _id: { $in: profile.courses }, status: 'Active' }
        : { _id: { $in: [] }, status: 'Active' };

    const courses = await Course.find(filter)
      .populate('instructor', 'name email department')
      .lean();

    return successResponse(courses, 'Enrolled courses retrieved successfully');
  } catch (error) {
    return errorResponse('Failed to retrieve courses', 'SERVER_ERROR', 500);
  }
}
