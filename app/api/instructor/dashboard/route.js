import dbConnect from '@/dbConnect';
import Course from '@/models/Course';
import Assignment from '@/models/Assignment';
import Submission from '@/models/Submission';
import InstructorActivity from '@/models/InstructorActivity';
import Schedule from '@/models/Schedule';
import Instructor from '@/models/Instructor';
import User from '@/models/User';
import { instructorAuthMiddleware, errorResponse, successResponse } from '@/middleware/instructor';

export async function GET(req) {
  try {
    // 1. Verify authentication
    const authResult = await instructorAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    const instructorId = authResult.user.id;
    const user = await User.findById(instructorId).select('name email').lean();

    await dbConnect();

    // 2. Get Stats for Grid
    // We'll aggregate data specifically for this instructor
    const [
      totalActivities,
      completedTasks,
      pendingTasks,
      uploadedAssignments,
      totalStudentsCount,
      instructorProfile
    ] = await Promise.all([
      InstructorActivity.countDocuments({ instructor: instructorId }),
      InstructorActivity.countDocuments({ instructor: instructorId, status: 'Completed' }),
      InstructorActivity.countDocuments({ instructor: instructorId, status: 'Pending' }),
      Assignment.countDocuments({ instructor: instructorId }),
      Course.aggregate([
        { $match: { instructor: instructorId } },
        { $group: { _id: null, total: { $sum: "$students" } } }
      ]),
      Instructor.findOne({ userId: instructorId })
    ]);

    const stats = {
      totalActivities,
      completedTasks,
      pendingTasks,
      uploadedAssignments,
      totalStudents: totalStudentsCount[0]?.total || 0,
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
    const myCourses = await Promise.all(courses.map(async (course) => {
      const assignmentCount = await Assignment.countDocuments({ course: course._id });
      return {
        id: course._id,
        name: `${course.code} - ${course.name}`,
        students: course.students,
        assignments: assignmentCount,
        progress: 0 // Progress calculation logic would go here
      };
    }));

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
        submitted: s.submittedDate
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
