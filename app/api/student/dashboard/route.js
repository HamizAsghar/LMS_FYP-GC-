import dbConnect from '@/dbConnect';
import Course from '@/models/Course';
import Assignment from '@/models/Assignment';
import Submission from '@/models/Submission';
import Notification from '@/models/Notification';
import LearningMaterial from '@/models/LearningMaterial';
import Student from '@/models/Student';
import StudentActivity from '@/models/StudentActivity';
import Schedule from '@/models/Schedule';
import User from '@/models/User';
import { studentAuthMiddleware, errorResponse, successResponse } from '@/middleware/student';

export async function GET(req) {
  try {
    const authResult = await studentAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    const studentId = authResult.user.id;
    await dbConnect();

    const user = await User.findById(studentId).select('name email').lean();

    const profile = await Student.findOne({ userId: studentId });
    const courseIds = profile?.courses?.length ? profile.courses : [];

    const courseFilter = courseIds.length ? { _id: { $in: courseIds } } : {};
    const assignmentFilter = {
      status: 'Active',
      ...(courseIds.length ? { course: { $in: courseIds } } : {}),
    };

    const [
      totalCourses,
      assignments,
      submissions,
      notifications,
      downloadCount,
    ] = await Promise.all([
      Course.countDocuments({ ...courseFilter, status: 'Active' }),
      Assignment.find(assignmentFilter).sort({ deadline: 1 }).limit(10).lean(),
      Submission.find({ student: studentId }).lean(),
      Notification.find({ user: studentId }).sort({ timestamp: -1 }).limit(5).lean(),
      StudentActivity.countDocuments({
        student: studentId,
        activityType: 'Material Download',
      }),
    ]);

    const submittedIds = new Set(submissions.map((s) => s.assignment.toString()));
    const pendingAssignments = assignments.filter((a) => !submittedIds.has(a._id.toString()));

    const stats = {
      totalCourses,
      pendingAssignments: pendingAssignments.length,
      submittedAssignments: submissions.length,
      downloadedMaterials: downloadCount,
      overallProgress: profile?.attendance || 0,
      attendance: profile?.attendance || 0,
    };

    const enrolledCourses = await Course.find(courseFilter)
      .populate('instructor', 'name')
      .limit(4)
      .lean();

    const upcomingDeadlines = assignments.slice(0, 4).map((a) => ({
      id: a._id,
      title: a.title,
      course: a.subject,
      deadline: a.deadline,
      urgent: new Date(a.deadline) - new Date() < 86400000,
    }));

    const recentMaterials = courseIds.length
      ? await LearningMaterial.find({ course: { $in: courseIds } })
          .sort({ uploadedDate: -1 })
          .limit(4)
          .populate('course', 'code')
          .lean()
      : [];

    const progressData = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - i * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      const weekSubs = submissions.filter(
        (s) => new Date(s.submittedDate) >= weekStart && new Date(s.submittedDate) < weekEnd
      );
      progressData.push({
        name: `Week ${4 - i}`,
        progress: Math.min(100, weekSubs.length * 25),
      });
    }

    const allEnrolledCourses = await Course.find(courseFilter).lean();
    const totalEnrolled = allEnrolledCourses.length;
    const completedCount = allEnrolledCourses.filter(c => c.status === 'Completed').length;
    const activeCount = allEnrolledCourses.filter(c => c.status === 'Active').length;
    const archivedCount = allEnrolledCourses.filter(c => c.status === 'Archived').length;

    const courseCompletionData = [
      { name: 'Completed', value: totalEnrolled ? Math.round((completedCount / totalEnrolled) * 100) : 0, color: '#22c55e' },
      { name: 'In Progress', value: totalEnrolled ? Math.round((activeCount / totalEnrolled) * 100) : 0, color: '#3b82f6' },
      { name: 'Archived', value: totalEnrolled ? Math.round((archivedCount / totalEnrolled) * 100) : 0, color: '#94a3b8' },
    ];

    const schedules = await Schedule.find({
      course: { $in: courseIds },
      startTime: { $gt: new Date() }
    }).sort({ startTime: 1 }).lean();

    return successResponse(
      {
        user,
        stats,
        progressData,
        courseCompletionData,
        enrolledCourses: enrolledCourses.map((c) => {
          const nextClass = schedules.find(s => s.course.toString() === c._id.toString());
          return {
            id: c._id,
            code: c.code,
            name: c.name,
            instructor: c.instructor?.name || 'Unknown',
            progress: stats.overallProgress,
            nextClass: nextClass ? new Date(nextClass.startTime).toLocaleString() : 'No upcoming class',
          };
        }),
        upcomingDeadlines,
        recentNotifications: notifications,
        recentMaterials,
        recentAssignments: assignments.slice(0, 5),
      },
      'Student dashboard data retrieved successfully'
    );
  } catch (error) {
    return errorResponse('Failed to retrieve student dashboard', 'SERVER_ERROR', 500);
  }
}
