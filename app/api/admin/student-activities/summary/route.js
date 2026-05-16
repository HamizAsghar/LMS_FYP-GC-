import dbConnect from '@/dbConnect';
import StudentActivity from '@/models/StudentActivity';
import {
  adminAuthMiddleware,
  errorResponse,
  successResponse,
} from '@/middleware/admin';

export async function GET(req) {
  try {
    const authResult = await adminAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();
    const activities = await StudentActivity.find().populate('student', 'name').lean();

    let totalSubmissions = 0;
    let totalAttendance = 0;
    let attendanceCount = 0;
    let totalDownloads = 0;
    let totalQuizAttempts = 0;

    activities.forEach((a) => {
      const val = Number(a.value) || 0;
      switch (a.activityType) {
        case 'Assignment Submission':
          totalSubmissions += val;
          break;
        case 'Attendance':
          totalAttendance += val;
          attendanceCount++;
          break;
        case 'Material Download':
          totalDownloads += val;
          break;
        case 'Quiz Attempt':
          totalQuizAttempts += val;
          break;
      }
    });

    const studentIds = [...new Set(activities.map((a) => a.student?._id?.toString()).filter(Boolean))];
    const chartData = studentIds.map((id) => {
      const acts = activities.filter((a) => a.student?._id?.toString() === id);
      return {
        name: acts[0]?.student?.name?.split(' ')[0] || 'Unknown',
        submissions: acts
          .filter((a) => a.activityType === 'Assignment Submission')
          .reduce((s, a) => s + (Number(a.value) || 0), 0),
        downloads: acts
          .filter((a) => a.activityType === 'Material Download')
          .reduce((s, a) => s + (Number(a.value) || 0), 0),
        quizAttempts: acts
          .filter((a) => a.activityType === 'Quiz Attempt')
          .reduce((s, a) => s + (Number(a.value) || 0), 0),
      };
    });

    return successResponse(
      {
        totalSubmissions,
        averageAttendance: attendanceCount ? Math.round(totalAttendance / attendanceCount) : 0,
        totalDownloads,
        totalQuizAttempts,
        chartData,
      },
      'Student activities summary retrieved successfully'
    );
  } catch (error) {
    return errorResponse('Failed to retrieve summary', 'SERVER_ERROR', 500);
  }
}
