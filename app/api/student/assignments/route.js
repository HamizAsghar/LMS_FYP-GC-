import dbConnect from '@/dbConnect';
import Assignment from '@/models/Assignment';
import AssignedClass from '@/models/AssignedClass';
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
      .populate({
        path: 'course',
        select: 'subject section classId',
        populate: { path: 'classId', select: 'program className semester' }
      })
      .populate('instructor', 'name')
      .sort({ deadline: 1 });

    // Enrich each assignment with a stable `course.code` and `course.name`
    // derived from the AssignedClass → Class chain
    const enrichedAssignments = assignments.map(a => {
      const assignedClass = a.course;
      const classInfo = assignedClass?.classId;
      const program = classInfo?.program || '';
      const section = assignedClass?.section || '';
      const subject = assignedClass?.subject || '';

      return {
        ...(a.toObject ? a.toObject() : a),
        course: {
          _id: assignedClass?._id || null,
          code: program && section ? `${program} Sec ${section}` : 'N/A',
          name: subject || classInfo?.className || 'N/A',
          subject,
          section,
        },
      };
    });

    // Check submission status for each assignment
    const assignmentsWithStatus = await Promise.all(enrichedAssignments.map(async (assignment) => {
      const submission = await Submission.findOne({
        assignment: assignment._id,
        student: studentId
      });

      return {
        ...assignment,
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
