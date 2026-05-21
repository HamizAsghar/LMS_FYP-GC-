import dbConnect from '@/dbConnect';
import Course from '@/models/Course';
import Assignment from '@/models/Assignment';
import Submission from '@/models/Submission';
import InstructorActivity from '@/models/InstructorActivity';
import Schedule from '@/models/Schedule';
import Instructor from '@/models/Instructor';
import User from '@/models/User';
import AssignedClass from '@/models/AssignedClass';
import Class from '@/models/Class';
import Student from '@/models/Student';
import { instructorAuthMiddleware, errorResponse, successResponse } from '@/middleware/instructor';

export async function GET(req) {
  try {
    // 1. Verify authentication
    const authResult = await instructorAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    const instructorId = authResult.user.id;

    await dbConnect();

    const user = await User.findById(instructorId).select('name email').lean();

    // 2. Get Stats for Grid
    // We'll aggregate data specifically for this instructor
    const [
      totalActivities,
      completedTasks,
      pendingTasks,
      uploadedAssignments,
      coursesList,
      assignedClassesList,
      instructorProfile
    ] = await Promise.all([
      InstructorActivity.countDocuments({ instructor: instructorId }),
      InstructorActivity.countDocuments({ instructor: instructorId, status: 'Completed' }),
      InstructorActivity.countDocuments({ instructor: instructorId, status: 'Pending' }),
      Assignment.countDocuments({ instructor: instructorId }),
      Course.find({ instructor: instructorId }).select('_id').lean(),
      AssignedClass.find({ teacherId: instructorId }).select('enrolledStudents').lean(),
      Instructor.findOne({ userId: instructorId })
    ]);

    const courseIds = coursesList.map(c => c._id);
    const totalStudentsFromCourses = await Student.countDocuments({ courses: { $in: courseIds } });
    const totalStudentsFromAssigned = assignedClassesList.reduce((sum, ac) => sum + (ac.enrolledStudents?.length || 0), 0);

    const stats = {
      totalActivities,
      completedTasks,
      pendingTasks,
      uploadedAssignments,
      totalStudents: totalStudentsFromCourses + totalStudentsFromAssigned,
      avgRating: instructorProfile?.rating || 0
    };

    // 3. Weekly Performance Data (Last 5 days)
    // This is a simplified version. In a real app, you'd aggregate by day.
    const weeklyPerformance = []; // Dynamic calculation would be added here

    // 4. Today's Schedule
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const schedule = await Schedule.find({
      scheduledBy: instructorId,
      startTime: { $gte: today, $lt: tomorrow }
    }).sort({ startTime: 1 });

    const todaySchedule = schedule.map(item => ({
      id: item._id,
      course: item.title, // Assuming title stores course info or linked
      time: `${new Date(item.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${new Date(item.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
      room: item.location,
      type: item.type
    }));

    // 5. My Courses Overview
    const courses = await Course.find({ instructor: instructorId }).limit(4);
    const assignedClasses = await AssignedClass.find({ teacherId: instructorId }).populate('classId').limit(4);

    const mappedCourses = await Promise.all(courses.map(async (course) => {
      const assignmentCount = await Assignment.countDocuments({ course: course._id });
      const enrolledCount = await Student.countDocuments({ courses: course._id });
      return {
        _id: course._id,
        id: course._id,
        name: `${course.code} - ${course.name}`,
        students: enrolledCount,
        assignments: assignmentCount,
        progress: 0
      };
    }));

    const mappedAssigned = await Promise.all(assignedClasses.map(async (ac) => {
      const assignmentCount = await Assignment.countDocuments({ course: ac._id });
      return {
        _id: ac._id,
        id: ac._id,
        name: ac.classId ? `${ac.classId.program} Sec ${ac.section} - ${ac.subject}` : ac.subject,
        students: ac.enrolledStudents?.length || 0,
        assignments: assignmentCount,
        progress: 0
      };
    }));

    const myCourses = [...mappedAssigned, ...mappedCourses].slice(0, 4);

    // 6. Recent Activities
    const recentActivities = await InstructorActivity.find({ instructor: instructorId })
      .sort({ date: -1 })
      .limit(4);

    // 7. Recent Submissions to Review
    const submissions = await Submission.find()
      .populate({
        path: 'assignment',
        match: { instructor: instructorId }
      })
      .populate('student', 'name')
      .sort({ submittedDate: -1 })
      .limit(4);

    // Filter out submissions where assignment didn't match instructor
    const pendingSubmissions = submissions
      .filter(s => s.assignment)
      .map(s => ({
        id: s._id,
        student: s.student.name,
        assignment: s.assignment.title,
        course: s.assignment.subject, // Or course code
        submitted: s.submittedAt || s.submittedDate || s.createdAt
      }));

    const dashboardData = {
      user,
      stats,
      weeklyPerformance,
      todaySchedule,
      myCourses,
      recentActivities,
      pendingSubmissions
    };

    return successResponse(dashboardData, 'Instructor dashboard data retrieved successfully');
  } catch (error) {
    console.error('Instructor dashboard error:', error);
    return errorResponse('Failed to retrieve instructor dashboard data', 'SERVER_ERROR', 500);
  }
}
