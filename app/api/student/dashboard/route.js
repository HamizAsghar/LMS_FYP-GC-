import dbConnect from '@/dbConnect';
import Course from '@/models/Course';
import Assignment from '@/models/Assignment';
import Submission from '@/models/Submission';
import Notification from '@/models/Notification';
import AssignedClass from '@/models/AssignedClass';
import Student from '@/models/Student';
import StudentActivity from '@/models/StudentActivity';
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
      courseIds.length
        ? Course.countDocuments({ _id: { $in: courseIds }, status: 'Active' })
        : Promise.resolve(0),
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

    const enrolledCoursesFromDb = courseIds.length
      ? await Course.find({ _id: { $in: courseIds } })
          .populate('instructor', 'name')
          .limit(4)
          .lean()
      : [];

    const assignedClasses = await AssignedClass.find({ enrolledStudents: studentId })
      .populate('classId')
      .populate('teacherId', 'name')
      .limit(4)
      .lean();

    const mappedAssignedClasses = assignedClasses.map(ac => ({
      _id: ac._id,
      id: ac._id,
      code: ac.classId ? `${ac.classId.program} Sec ${ac.section}` : `Sec ${ac.section}`,
      name: ac.subject,
      instructor: ac.teacherId?.name || 'Unknown',
      progress: 0,
      nextClass: 'No upcoming class',
      isAssignedClass: true,
    }));

    const mappedCourses = enrolledCoursesFromDb.map((c) => ({
      _id: c._id,
      id: c._id,
      code: c.code,
      name: c.name,
      instructor: c.instructor?.name || 'Unknown',
      progress: stats.overallProgress,
      nextClass: 'No upcoming class',
    }));

    const combinedEnrolledCourses = [...mappedAssignedClasses, ...mappedCourses].slice(0, 4);

    const totalCoursesWithAssigned = stats.totalCourses + assignedClasses.length;

    return successResponse(
      {
        user,
        stats: {
          ...stats,
          totalCourses: totalCoursesWithAssigned,
        },
        enrolledCourses: combinedEnrolledCourses,
        recentNotifications: notifications,
      },
      'Student dashboard data retrieved successfully'
    );
  } catch (error) {
    return errorResponse('Failed to retrieve student dashboard', 'SERVER_ERROR', 500);
  }
}
