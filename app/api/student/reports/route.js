import dbConnect from '@/dbConnect';
import Course from '@/models/Course';
import Assignment from '@/models/Assignment';
import Submission from '@/models/Submission';
import Student from '@/models/Student';
import AssignedClass from '@/models/AssignedClass';
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

    // Fetch both regular Course and section-specific AssignedClass entries
    const [courses, assignedClasses] = await Promise.all([
      Course.find({ _id: { $in: enrolledCourseIds } })
        .populate('instructor', 'name')
        .lean(),
      AssignedClass.find({ _id: { $in: enrolledCourseIds } })
        .populate('teacherId', 'name')
        .populate('classId', 'program className semester')
        .lean(),
    ]);

    // Consolidate into a unified format
    const unifiedCourses = [
      ...courses.map(c => ({
        _id: c._id,
        code: c.code,
        name: c.name,
        instructor: c.instructor?.name || 'Instructor'
      })),
      ...assignedClasses.map(ac => ({
        _id: ac._id,
        code: ac.classId ? `${ac.classId.program} Sec ${ac.section}` : `Sec ${ac.section}`,
        name: ac.subject,
        instructor: ac.teacherId?.name || 'Instructor'
      }))
    ];

    // Get all submissions for the student (populating assignment with totalMarks, deadline, and course)
    const submissions = await Submission.find({ student: studentId })
      .populate('assignment', 'title totalMarks deadline course')
      .populate('course', 'name code')
      .sort({ createdAt: -1 })
      .lean();

    // 1. Course Progress Summary
    const courseSummary = await Promise.all(unifiedCourses.map(async (course) => {
      const totalAssignments = await Assignment.countDocuments({ course: course._id, status: 'Active' });
      const completedSubmissions = submissions.filter(s => 
        (s.assignment?.course?.toString() === course._id.toString()) || 
        (s.course?.toString() === course._id.toString())
      );

      // Average grade for this course (only count graded submissions for fairness)
      const gradedSubs = completedSubmissions.filter(s => s.status.toLowerCase() === 'graded');
      const totalMarks = gradedSubs.reduce((sum, s) => sum + (s.marks || 0), 0);
      const possibleMarks = gradedSubs.reduce((sum, s) => sum + (s.assignment?.totalMarks || 100), 0);
      const percentage = possibleMarks > 0 ? (totalMarks / possibleMarks) * 100 : 0;

      let grade = 'N/A';
      if (percentage >= 90) grade = 'A';
      else if (percentage >= 80) grade = 'B';
      else if (percentage >= 70) grade = 'C';
      else if (percentage >= 60) grade = 'D';
      else if (gradedSubs.length > 0) grade = 'F';

      return {
        course: course.code,
        name: course.name,
        progress: totalAssignments > 0 ? Math.min(100, Math.round((completedSubmissions.length / totalAssignments) * 100)) : 0,
        grade,
        assignments: totalAssignments,
        completed: completedSubmissions.length
      };
    }));

    // 2. Submission History
    const history = submissions.map(s => {
      let courseCode = 'N/A';
      if (s.assignment?.course) {
        const found = unifiedCourses.find(c => c._id.toString() === s.assignment.course.toString());
        if (found) courseCode = found.code;
      }
      if (courseCode === 'N/A' && s.course) {
        const found = unifiedCourses.find(c => c._id.toString() === s.course.toString() || c._id.toString() === s.course._id?.toString());
        if (found) courseCode = found.code;
      }

      return {
        id: s._id,
        title: s.assignment?.title || 'Unknown Assignment',
        course: courseCode,
        submitted: new Date(s.submittedDate || s.createdAt).toLocaleDateString(),
        grade: s.marks !== null ? `${s.marks}/${s.assignment?.totalMarks || 100}` : '-',
        status: s.status.toLowerCase()
      };
    });

    // 3. Overall Stats
    const gradedSubmissions = submissions.filter(s => s.status.toLowerCase() === 'graded');
    const totalPossible = gradedSubmissions.reduce((sum, s) => sum + (s.assignment?.totalMarks || 100), 0);
    const totalObtained = gradedSubmissions.reduce((sum, s) => sum + (s.marks || 0), 0);
    const avgGrade = totalPossible > 0 ? Math.round((totalObtained / totalPossible) * 100) : 0;

    const onTimeSubmissions = submissions.filter(s => {
      if (!s.assignment?.deadline) return true;
      return new Date(s.submittedDate || s.createdAt) <= new Date(s.assignment.deadline);
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

      const mGraded = monthSubmissions.filter(s => s.status.toLowerCase() === 'graded');
      const mTotal = mGraded.reduce((sum, s) => sum + (s.marks || 0), 0);
      const mPossible = mGraded.reduce((sum, s) => sum + (s.assignment?.totalMarks || 100), 0);
      
      let score = 0;
      if (mPossible > 0) {
        score = Math.round((mTotal / mPossible) * 100);
      } else if (trend.length > 0) {
        score = trend[trend.length - 1].score;
      } else {
        score = avgGrade; // Fallback to overall avgGrade for consistent visuals
      }

      trend.push({
        month: months[d.getMonth()],
        score
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
