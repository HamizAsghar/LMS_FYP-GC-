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

    // Get student profile to find enrolled courses
    const studentProfile = await Student.findOne({ userId: studentId });
    const enrolledCourseIds = studentProfile?.courses || [];

    if (enrolledCourseIds.length === 0) {
      return successResponse({ courses: [], stats: { gpa: 0, avgPercentage: 0, totalCredits: 0 } }, 'No courses found');
    }

    // Get courses
    const courses = await Course.find({ _id: { $in: enrolledCourseIds } })
      .populate('instructor', 'name')
      .lean();

    // Get all submissions for this student
    const submissions = await Submission.find({ student: studentId })
      .populate('assignment', 'title totalPoints dueDate')
      .lean();

    // Map submissions to courses
    const coursesWithGrades = courses.map(course => {
      const courseSubmissions = submissions.filter(s => 
        s.course?.toString() === course._id.toString() || 
        s.assignment?.course?.toString() === course._id.toString()
      );

      const assignments = courseSubmissions.map(s => ({
        name: s.assignment?.title || 'Unknown Assignment',
        score: s.marks || 0,
        total: s.assignment?.totalPoints || 100,
        date: new Date(s.submittedAt || s.createdAt).toLocaleDateString(),
        status: s.status
      }));

      // Calculate course percentage
      const totalScore = courseSubmissions.reduce((sum, s) => sum + (s.marks || 0), 0);
      const totalPossible = courseSubmissions.reduce((sum, s) => sum + (s.assignment?.totalPoints || 100), 0);
      const percentage = totalPossible > 0 ? (totalScore / totalPossible) * 100 : 0;

      // Determine grade based on percentage
      let grade = 'N/A';
      if (courseSubmissions.length > 0) {
        if (percentage >= 90) grade = 'A';
        else if (percentage >= 80) grade = 'B';
        else if (percentage >= 70) grade = 'C';
        else if (percentage >= 60) grade = 'D';
        else grade = 'F';
      }

      return {
        id: course._id,
        course: `${course.code} - ${course.name}`,
        instructor: course.instructor?.name || 'Instructor',
        assignments,
        overallGrade: grade,
        percentage: percentage.toFixed(1),
        credits: course.credits || 3
      };
    });

    // Calculate overall stats
    const gradedCourses = coursesWithGrades.filter(c => c.assignments.length > 0);
    const avgPercentage = gradedCourses.length > 0 
      ? gradedCourses.reduce((sum, c) => sum + parseFloat(c.percentage), 0) / gradedCourses.length 
      : 0;
    
    // Simple GPA calculation for demo purposes
    const gpaMap = { 'A': 4.0, 'B': 3.0, 'C': 2.0, 'D': 1.0, 'F': 0.0, 'N/A': 0.0 };
    const totalGpaPoints = gradedCourses.reduce((sum, c) => sum + gpaMap[c.overallGrade], 0);
    const overallGPA = gradedCourses.length > 0 ? (totalGpaPoints / gradedCourses.length).toFixed(2) : '0.00';

    return successResponse({
      courses: coursesWithGrades,
      stats: {
        overallGPA,
        averagePercentage: avgPercentage.toFixed(1),
        totalCredits: courses.reduce((sum, c) => sum + (c.credits || 3), 0),
        activeCourses: courses.length
      }
    }, 'Grades retrieved successfully');
  } catch (error) {
    console.error('Grades API error:', error);
    return errorResponse('Failed to retrieve grades', 'SERVER_ERROR', 500);
  }
}
