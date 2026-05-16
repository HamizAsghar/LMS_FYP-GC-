import dbConnect from '@/dbConnect';
import StudentActivity from '@/models/StudentActivity';
import User from '@/models/User';
import {
  adminAuthMiddleware,
  errorResponse,
  successResponse,
  parseQueryParams,
  calculatePagination,
} from '@/middleware/admin';

export async function GET(req) {
  try {
    const authResult = await adminAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const { page, limit, search, sortBy, sortOrder } = parseQueryParams(searchParams);

    const filter = {};
    const status = searchParams.get('status');
    if (status) filter.status = status;

    if (search) {
      const students = await User.find({
        name: { $regex: search, $options: 'i' },
        role: 'Student',
      }).select('_id');
      filter.student = { $in: students.map((s) => s._id) };
    }

    const total = await StudentActivity.countDocuments(filter);
    const rows = await StudentActivity.find(filter)
      .populate('student', 'name email')
      .sort({ [sortBy]: sortOrder })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    const activities = rows.map((activity) => ({
      id: activity._id,
      studentName: activity.student?.name || 'Unknown',
      studentId: activity.student?._id,
      activityType: activity.activityType,
      assignmentSubmission:
        activity.activityType === 'Assignment Submission' ? activity.value : 0,
      attendance: activity.activityType === 'Attendance' ? activity.value : 0,
      materialDownloads: activity.activityType === 'Material Download' ? activity.value : 0,
      quizAttempts: activity.activityType === 'Quiz Attempt' ? activity.value : 0,
      status: activity.status,
      date: activity.date,
      remarks: activity.remarks,
    }));

    return successResponse(
      { activities, pagination: calculatePagination(total, page, limit) },
      'Student activities retrieved successfully'
    );
  } catch (error) {
    return errorResponse('Failed to retrieve student activities', 'SERVER_ERROR', 500);
  }
}
