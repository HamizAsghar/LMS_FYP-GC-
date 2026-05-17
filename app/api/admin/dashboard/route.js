import dbConnect from '@/dbConnect';
import User from '@/models/User';
import Course from '@/models/Course';
import AssignedClass from '@/models/AssignedClass';
import Assignment from '@/models/Assignment';
import Submission from '@/models/Submission';
import ActivityLog from '@/models/ActivityLog';
import Notification from '@/models/Notification';
import InstructorActivity from '@/models/InstructorActivity';
import Instructor from '@/models/Instructor';
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
      totalCourses,
      totalAssignedClasses,
      totalActivities,
      pendingTasks,
      recentLogs,
      notifications,
      topInstructors,
      submissionStats,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'Instructor' }),
      User.countDocuments({ role: 'Student' }),
      Course.countDocuments(),
      AssignedClass.countDocuments(),
      ActivityLog.countDocuments(),
      InstructorActivity.countDocuments({ status: 'Pending' }),
      ActivityLog.find().sort({ timestamp: -1 }).limit(8).populate('user', 'name role').lean(),
      Notification.find().sort({ timestamp: -1 }).limit(6).populate('user', 'name').lean(),
      Instructor.find()
        .populate('userId', 'name email department')
        .sort({ rating: -1 })
        .limit(5)
        .lean(),
      Submission.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const monthlyPerformance = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date();
      start.setMonth(start.getMonth() - i);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      const count = await ActivityLog.countDocuments({
        timestamp: { $gte: start, $lt: end },
      });
      monthlyPerformance.push({
        month: start.toLocaleString('default', { month: 'short' }),
        activities: count,
        submissions: await Submission.countDocuments({
          submittedDate: { $gte: start, $lt: end },
        }),
      });
    }

    const submissionOverview = {
      submitted: 0,
      graded: 0,
      pending: 0,
      late: 0,
    };
    submissionStats.forEach((s) => {
      const key = (s._id || '').toLowerCase();
      if (key in submissionOverview) submissionOverview[key] = s.count;
      else submissionOverview[key] = s.count;
    });

    return successResponse(
      {
        cards: {
          totalUsers,
          totalInstructors,
          totalStudents,
          totalCourses,
          totalAssignedClasses,
          totalActivities,
          pendingTasks,
        },
        assignmentSubmissionStats: submissionOverview,
        monthlyPerformance,
        recentActivityLogs: recentLogs.map((log) => ({
          id: log._id,
          user: log.user?.name || 'System',
          role: log.role,
          action: log.action,
          target: log.target,
          timestamp: log.timestamp,
        })),
        notifications,
        topPerformingInstructors: topInstructors.map((inst) => ({
          id: inst._id,
          name: inst.userId?.name,
          email: inst.userId?.email,
          department: inst.userId?.department,
          rating: inst.rating,
          courses: inst.courses,
          students: inst.students,
        })),
        studentSubmissionOverview: submissionOverview,
        calendarPlaceholder: { message: 'Calendar widget integration ready' },
      },
      'Admin dashboard data retrieved successfully'
    );
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return errorResponse('Failed to retrieve admin dashboard', 'SERVER_ERROR', 500);
  }
}
