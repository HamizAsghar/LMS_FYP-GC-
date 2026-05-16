import dbConnect from '@/dbConnect';
import Assignment from '@/models/Assignment';
import Submission from '@/models/Submission';
import { studentAuthMiddleware, errorResponse, successResponse } from '@/middleware/student';

export async function GET(req) {
  try {
    const authResult = await studentAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    const studentId = authResult.user.id;
    await dbConnect();
    const Student = (await import('@/models/Student')).default;
    const studentProfile = await Student.findOne({ userId: studentId });
    const enrolledCourseIds = studentProfile?.courses || [];

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');

    const query = { 
      status: 'Active',
      course: courseId ? courseId : { $in: enrolledCourseIds }
    };

    const assignments = await Assignment.find(query)
      .populate('course', 'name code')
      .populate('instructor', 'name')
      .sort({ dueDate: 1 });

    // Check submission status for each assignment
    const assignmentsWithStatus = await Promise.all(assignments.map(async (assignment) => {
      const submission = await Submission.findOne({
        assignment: assignment._id,
        student: studentId
      });

      return {
        ...assignment.toObject(),
        submissionStatus: submission ? submission.status : 'Not Submitted',
        marksObtained: submission ? submission.marks : null,
        feedback: submission ? submission.feedback : null
      };
    }));

    return successResponse(assignmentsWithStatus, 'Assignments retrieved successfully');
  } catch (error) {
    console.error('Student assignments error:', error);
    return errorResponse('Failed to retrieve assignments', 'SERVER_ERROR', 500);
  }
}
