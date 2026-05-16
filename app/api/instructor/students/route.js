import dbConnect from '@/dbConnect';
import Student from '@/models/Student';
import Course from '@/models/Course';
import User from '@/models/User';
import Submission from '@/models/Submission';
import { instructorAuthMiddleware, errorResponse, successResponse } from '@/middleware/instructor';

export async function GET(req) {
  try {
    const authResult = await instructorAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    const instructorId = authResult.user.id;
    await dbConnect();

    // Fetch instructor's courses
    const courses = await Course.find({ instructor: instructorId }).select('_id code name').lean();
    const courseIds = courses.map(c => c._id);

    // Find students enrolled in any of these courses
    const students = await Student.find({ courses: { $in: courseIds } })
      .populate('userId', 'name email')
      .populate('courses', 'code name instructor')
      .lean();

    // Map and format student data
    const formattedStudents = await Promise.all(students.map(async (student) => {
      // Find which of the student's courses belong to this instructor
      const instructorCourses = student.courses.filter(
        c => c.instructor.toString() === instructorId.toString()
      );
      
      const courseStr = instructorCourses.map(c => `${c.code} - ${c.name}`).join(', ');

      // Count submissions for this student in this instructor's courses
      const instructorCourseIds = instructorCourses.map(c => c._id);
      
      // Need assignments for these courses
      const Assignment = (await import('@/models/Assignment')).default;
      const assignments = await Assignment.find({ course: { $in: instructorCourseIds } }).select('_id');
      const assignmentIds = assignments.map(a => a._id);

      const submittedCount = await Submission.countDocuments({
        student: student.userId._id, // student is userId in Submission
        assignment: { $in: assignmentIds }
      });
      
      const totalCount = assignmentIds.length;

      return {
        id: student._id,
        userId: student.userId._id,
        name: student.userId.name || 'Unknown Student',
        email: student.userId.email || 'No email',
        rollNo: student.userId._id.toString().substring(18, 24).toUpperCase(), // Fake roll no if none exists
        course: courseStr || 'N/A',
        attendance: student.attendance || 0,
        grade: 'N/A', // Compute actual grade if possible, else N/A
        assignments: {
          submitted: submittedCount,
          total: totalCount
        },
        status: (student.attendance < 75 || submittedCount < totalCount / 2) ? 'At Risk' : 'Active'
      };
    }));

    const user = await User.findById(instructorId).select('name email').lean();

    return successResponse({ 
      students: formattedStudents, 
      courses, 
      user 
    }, 'Students retrieved successfully');
  } catch (error) {
    console.error('Instructor students error:', error);
    return errorResponse('Failed to retrieve students', 'SERVER_ERROR', 500);
  }
}
