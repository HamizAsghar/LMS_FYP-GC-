import dbConnect from '@/dbConnect';
import Course from '@/models/Course';
import AssignedClass from '@/models/AssignedClass';
import Assignment from '@/models/Assignment';
import Material from '@/models/Material';
import Submission from '@/models/Submission';
import { studentAuthMiddleware, errorResponse, successResponse } from '@/middleware/student';

export async function GET(req, { params }) {
  try {
    const authResult = await studentAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();
    const { id } = params;

    let course = await Course.findById(id)
      .populate('instructor', 'name email department')
      .lean();

    if (!course) {
      const assignedClass = await AssignedClass.findById(id)
        .populate('teacherId', 'name email department')
        .populate('classId', 'program className semester')
        .lean();
      
      if (assignedClass) {
        course = {
          _id: assignedClass._id,
          name: assignedClass.subject,
          code: assignedClass.classId?.className || 'CLASS',
          semester: assignedClass.classId?.semester || 'Semester',
          instructor: assignedClass.teacherId,
          description: `Assigned Class for program ${assignedClass.classId?.program || ''}, section ${assignedClass.section || ''}`,
          updatedAt: assignedClass.updatedAt
        };
      }
    }

    if (!course) {
      return errorResponse('Course not found', 'NOT_FOUND', 404);
    }

    const [assignments, materials, submissions] = await Promise.all([
      Assignment.find({ course: id }).sort({ dueDate: 1 }).lean(),
      Material.find({ course: id }).sort({ createdAt: -1 }).lean(),
      Submission.find({ course: id, student: authResult.user.id }).lean(),
    ]);

    // Map submissions to assignments
    const assignmentsWithStatus = assignments.map(assignment => {
      const submission = submissions.find(s => s.assignment.toString() === assignment._id.toString());
      return {
        ...assignment,
        submissionStatus: submission ? (submission.status || 'Submitted') : 'Pending',
        grade: submission?.grade || null,
        submittedAt: submission?.submittedAt || null
      };
    });

    return successResponse({
      course,
      assignments: assignmentsWithStatus,
      materials
    }, 'Course details retrieved successfully');
  } catch (error) {
    console.error('Course details API error:', error);
    return errorResponse('Failed to retrieve course details', 'SERVER_ERROR', 500);
  }
}
