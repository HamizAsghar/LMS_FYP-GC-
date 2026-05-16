import dbConnect from '@/dbConnect';
import Course from '@/models/Course';
import Assignment from '@/models/Assignment';
import Submission from '@/models/Submission';
import Student from '@/models/Student';
import { studentAuthMiddleware, errorResponse, successResponse } from '@/middleware/student';

export async function GET(req) {
  try {
    const authResult = await studentAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();
    const studentId = authResult.user.id;

    // Get student profile
    const studentProfile = await Student.findOne({ userId: studentId });
    const enrolledCourseIds = studentProfile?.courses || [];

    // Get courses
    const courses = await Course.find({ _id: { $in: enrolledCourseIds } }).lean();

    // Get submissions
    const submissions = await Submission.find({ student: studentId })
      .populate('assignment', 'title totalPoints dueDate')
      .populate('course', 'name code')
      .sort({ createdAt: -1 })
      .lean();

    // 1. Course Progress Summary
    const courseSummary = await Promise.all(courses.map(async (course) => {
      const totalAssignments = await Assignment.countDocuments({ course: course._id, status: 'Active' });
      const completedSubmissions = submissions.filter(s => 
        s.assignment?.course?.toString() === course._id.toString() || 
        s.course?.toString() === course._id.toString()
      );

      // Average grade for this course
      const totalMarks = completedSubmissions.reduce((sum, s) => sum + (s.marks || 0), 0);
      const possibleMarks = completedSubmissions.reduce((sum, s) => sum + (s.assignment?.totalPoints || 100), 0);
      const percentage = possibleMarks > 0 ? (totalMarks / possibleMarks) * 100 : 0;

      let grade = 'N/A';
      if (percentage >= 90) grade = 'A';
      else if (percentage >= 80) grade = 'B';
      else if (percentage >= 70) grade = 'C';
      else if (percentage >= 60) grade = 'D';
      else if (completedSubmissions.length > 0) grade = 'F';

      return {
        course: course.code,
        name: course.name,
        progress: totalAssignments > 0 ? Math.round((completedSubmissions.length / totalAssignments) * 100) : 0,
        grade,
        assignments: totalAssignments,
        completed: completedSubmissions.length
      };
    }));

    // 2. Submission History
    const history = submissions.map(s => ({
      id: s._id,
      title: s.assignment?.title || 'Unknown Assignment',
      course: s.assignment?.course?.code || s.course?.code || 'N/A',
      submitted: new Date(s.submittedDate || s.createdAt).toLocaleDateString(),
      grade: s.marks !== null ? `${s.marks}/${s.assignment?.totalPoints || 100}` : '-',
      status: s.status.toLowerCase()
    }));

    // 3. Overall Stats
    const totalPossible = submissions.reduce((sum, s) => sum + (s.assignment?.totalPoints || 100), 0);
    const totalObtained = submissions.reduce((sum, s) => sum + (s.marks || 0), 0);
    const avgGrade = totalPossible > 0 ? Math.round((totalObtained / totalPossible) * 100) : 0;

    const onTimeSubmissions = submissions.filter(s => {
      if (!s.assignment?.dueDate) return true;
      return new Date(s.submittedDate || s.createdAt) <= new Date(s.assignment.dueDate);
    }).length;

    // 4. Performance Trend (last 5 months)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trend = [];
    const now = new Date();
    for (let i = 4; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthSubmissions = submissions.filter(s => {
        const sDate = new Date(s.submittedDate || s.createdAt);
        return sDate.getMonth() === d.getMonth() && sDate.getFullYear() === d.getFullYear();
      });

      const mTotal = monthSubmissions.reduce((sum, s) => sum + (s.marks || 0), 0);
      const mPossible = monthSubmissions.reduce((sum, s) => sum + (s.assignment?.totalPoints || 100), 0);
      trend.push({
        month: months[d.getMonth()],
        score: mPossible > 0 ? Math.round((mTotal / mPossible) * 100) : (trend.length > 0 ? trend[trend.length-1].score : 0)
      });
    }

    return successResponse({
      courseProgress: courseSummary,
      submissionHistory: history,
      performanceTrend: trend,
      stats: {
        avgGrade,
        totalSubmissions: submissions.length,
        onTimeSubmissions,
        activeCourses: enrolledCourseIds.length
      }
    }, 'Reports data retrieved successfully');
  } catch (error) {
    console.error('Reports API error:', error);
    return errorResponse('Failed to retrieve reports', 'SERVER_ERROR', 500);
  }
}
