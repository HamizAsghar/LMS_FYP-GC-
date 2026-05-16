import dbConnect from '@/dbConnect';
import User from '@/models/User';
import Course from '@/models/Course';
import Assignment from '@/models/Assignment';
import Submission from '@/models/Submission';
import ActivityLog from '@/models/ActivityLog';
import InstructorActivity from '@/models/InstructorActivity';
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

    const [
      totalUsers,
      totalInstructors,
      totalStudents,
      activeUsers,
      totalCourses,
      activeCourses,
      totalAssignments,
      totalSubmissions,
      submittedSubmissions,
      gradedSubmissions,
      pendingSubmissions,
      lateSubmissions,
      totalActivities,
      pendingTasks,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'Instructor' }),
      User.countDocuments({ role: 'Student' }),
      User.countDocuments({ status: 'Active' }),
      Course.countDocuments(),
      Course.countDocuments({ status: 'Active' }),
      Assignment.countDocuments(),
      Submission.countDocuments(),
      Submission.countDocuments({ status: 'Submitted' }),
      Submission.countDocuments({ status: 'Graded' }),
      Submission.countDocuments({ status: 'Pending' }),
      Submission.countDocuments({ status: 'Late' }),
      ActivityLog.countDocuments(),
      InstructorActivity.countDocuments({ status: 'Pending' }),
    ]);

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const thisMonthActivities = await ActivityLog.countDocuments({
      timestamp: { $gte: monthStart },
    });

    const stats = {
      totalUsers,
      totalInstructors,
      totalStudents,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      totalCourses,
      activeCourses,
      totalAssignments,
      totalActivities,
      pendingTasks,
      totalSubmissions,
      submittedSubmissions,
      gradedSubmissions,
      pendingSubmissions,
      lateSubmissions,
      submissionRate:
        totalSubmissions > 0
          ? Math.round(((gradedSubmissions + submittedSubmissions) / totalSubmissions) * 100)
          : 0,
      thisMonthActivities,
    };

    return successResponse(stats, 'Dashboard statistics retrieved successfully');
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return errorResponse('Failed to retrieve dashboard statistics', 'SERVER_ERROR', 500);
  }
}
