import dbConnect from '@/dbConnect';
import Course from '@/models/Course';
import AssignedClass from '@/models/AssignedClass';
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

    // Get student profile to find enrolled courses and assigned classes
    const studentProfile = await Student.findOne({ userId: studentId });
    const enrolledIds = studentProfile?.courses || [];

    const [courses, assignedClasses, allSubmissions] = await Promise.all([
      Course.find({ _id: { $in: enrolledIds }, status: 'Active' })
        .populate('instructor', 'name')
        .lean(),
      AssignedClass.find({ _id: { $in: enrolledIds } })
        .populate('teacherId', 'name')
        .populate('classId', 'program className semester')
        .lean(),
      Submission.find({ student: studentId })
        .populate('assignment', 'title totalMarks deadline course')
        .sort({ submittedAt: -1 })
        .lean(),
    ]);

    // Build a lookup of assignment IDs per enrolled class/course
    // (both Course._id and AssignedClass._id can appear in Assignment.course)
    const assignmentsForStudent = await Assignment.find({
      course: { $in: [...courses.map(c => c._id), ...assignedClasses.map(ac => ac._id)] }
    }).select('_id course').lean();
    const assignmentIdStrings = assignmentsForStudent.map(a => a._id.toString());

    // Filter submissions to only those for this student's enrolled context
    const enrolledSubmissions = allSubmissions.filter(
      s => s.assignment && assignmentIdStrings.includes(s.assignment._id.toString())
    );

    // Map regular Course entries for grades display
    const coursesWithGrades = courses.map(course => {
      const courseSubmissions = enrolledSubmissions.filter(s =>
        s.assignment?.course?.toString() === course._id.toString()
      );

      return buildGradeEntry(course, courseSubmissions, 'Course');
    });

    // Map AssignedClass entries for grades display
    const assignedWithGrades = assignedClasses.map(ac => {
      const acSubmissions = enrolledSubmissions.filter(s =>
        s.assignment?.course?.toString() === ac._id.toString()
      );
      return buildAssignedGradeEntry(ac, acSubmissions);
    });

    const allGrades = [...coursesWithGrades, ...assignedWithGrades];

    // Calculate overall stats across all entries
    const gradedCourses = allGrades.filter(c => c.assignments.length > 0);
    const avgPercentage = gradedCourses.length > 0
      ? gradedCourses.reduce((sum, c) => sum + parseFloat(c.percentage), 0) / gradedCourses.length
      : 0;

    const gpaMap = { 'A': 4.0, 'B': 3.0, 'C': 2.0, 'D': 1.0, 'F': 0.0, 'N/A': 0.0 };
    const totalGpaPoints = gradedCourses.reduce((sum, c) => sum + gpaMap[c.overallGrade], 0);
    const overallGPA = gradedCourses.length > 0 ? (totalGpaPoints / gradedCourses.length).toFixed(2) : '0.00';

    return successResponse({
      courses: allGrades,
      stats: {
        overallGPA,
        averagePercentage: avgPercentage.toFixed(1),
        totalCredits: courses.reduce((sum, c) => sum + (c.credits || 3), 0),
        activeCourses: allGrades.length
      }
    }, 'Grades retrieved successfully');
  } catch (error) {
    console.error('Grades API error:', error);
    return errorResponse('Failed to retrieve grades', 'SERVER_ERROR', 500);
  }
}

// ── Build grade entry for a regular Course ─────────────────────────────────────
function buildGradeEntry(course, submissions, type) {
  const assignments = submissions.map(s => ({
    name: s.assignment?.title || 'Unknown Assignment',
    score: s.marks || 0,
    total: s.assignment?.totalMarks || 100,
    date: new Date(s.submittedDate || s.createdAt).toLocaleDateString(),
    status: s.status
  }));

  const gradedSubs = submissions.filter(s => s.status === 'Graded');
  const totalScore = gradedSubs.reduce((sum, s) => sum + (s.marks || 0), 0);
  const totalPossible = gradedSubs.reduce((sum, s) => sum + (s.assignment?.totalMarks || 100), 0);
  const percentage = totalPossible > 0 ? (totalScore / totalPossible) * 100 : 0;
  const grade = percentage >= 90 ? 'A' : percentage >= 80 ? 'B' : percentage >= 70 ? 'C' : percentage >= 60 ? 'D' : gradedSubs.length > 0 ? 'F' : 'N/A';

  return {
    id: course._id,
    course: `${course.code} - ${course.name}`,
    instructor: course.instructor?.name || 'Instructor',
    assignments,
    overallGrade: grade,
    percentage: percentage.toFixed(1),
    credits: course.credits || 3,
    type,
  };
}

// ── Build grade entry for an AssignedClass ─────────────────────────────────────
function buildAssignedGradeEntry(ac, submissions) {
  const classInfo = ac.classId;
  const program = classInfo?.program || '';
  const section = ac.section || '';
  const subject = ac.subject || '';
  const teacherName = ac.teacherId?.name || 'Instructor';

  const assignments = submissions.map(s => ({
    name: s.assignment?.title || 'Unknown Assignment',
    score: s.marks || 0,
    total: s.assignment?.totalMarks || 100,
    date: new Date(s.submittedDate || s.createdAt).toLocaleDateString(),
    status: s.status
  }));

  const gradedSubs = submissions.filter(s => s.status === 'Graded');
  const totalScore = gradedSubs.reduce((sum, s) => sum + (s.marks || 0), 0);
  const totalPossible = gradedSubs.reduce((sum, s) => sum + (s.assignment?.totalMarks || 100), 0);
  const percentage = totalPossible > 0 ? (totalScore / totalPossible) * 100 : 0;
  const grade = percentage >= 90 ? 'A' : percentage >= 80 ? 'B' : percentage >= 70 ? 'C' : percentage >= 60 ? 'D' : gradedSubs.length > 0 ? 'F' : 'N/A';

  return {
    id: ac._id,
    course: `${program} Sec ${section} - ${subject}`,
    instructor: teacherName,
    assignments,
    overallGrade: grade,
    percentage: percentage.toFixed(1),
    credits: 3,
    type: 'AssignedClass',
  };
}
