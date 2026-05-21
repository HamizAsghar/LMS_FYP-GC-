import dbConnect from '@/dbConnect';
import Submission from '@/models/Submission';
import Assignment from '@/models/Assignment';
import AssignedClass from '@/models/AssignedClass';
import Class from '@/models/Class';
import { instructorAuthMiddleware, errorResponse, successResponse } from '@/middleware/instructor';

export async function GET(req) {
  try {
    const authResult = await instructorAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    const instructorId = authResult.user.id;
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    // Find all assignments by this instructor
    const instructorAssignments = await Assignment.find({ instructor: instructorId }).select('_id');
    const assignmentIds = instructorAssignments.map(a => a._id);

    const query = { assignment: { $in: assignmentIds } };
    if (status) query.status = status;

    const submissions = await Submission.find(query)
      .populate('student', 'name email')
      .populate({
        path: 'assignment',
        select: 'title subject totalMarks course',
        populate: {
          path: 'course',
          select: 'subject section classId',
          populate: { path: 'classId', select: 'program className semester' }
        }
      })
      .sort({ submittedDate: -1 });

    const user = await (await import('@/models/User')).default.findById(instructorId).select('name email').lean();
    const courses = await (await import('@/models/Course')).default.find({ instructor: instructorId }).select('code name').lean();

    return successResponse({ submissions, user, courses }, 'Submissions retrieved successfully');
  } catch (error) {
    console.error('Instructor submissions error:', error);
    return errorResponse('Failed to retrieve submissions', 'SERVER_ERROR', 500);
  }
}

export async function PUT(req) {
  try {
    const authResult = await instructorAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    const instructorId = authResult.user.id;
    const { submissionId, marks, feedback } = await req.json();

    if (!submissionId) {
      return errorResponse('submissionId is required', 'VALIDATION_ERROR', 400);
    }

    await dbConnect();

    const submission = await Submission.findById(submissionId).populate('assignment');
    if (!submission || !submission.assignment) {
      return errorResponse('Submission not found', 'NOT_FOUND', 404);
    }

    if (submission.assignment.instructor.toString() !== instructorId) {
      return errorResponse('Not authorized to grade this submission', 'FORBIDDEN', 403);
    }

    const updatedSubmission = await Submission.findByIdAndUpdate(
      submissionId,
      { marks, feedback, status: 'Graded' },
      { new: true }
    )
      .populate('student', 'name email')
      .populate('assignment', 'title subject');

    // Create instructor activity log
    try {
      const InstructorActivity = (await import('@/models/InstructorActivity')).default;
      await InstructorActivity.create({
        instructor: instructorId,
        activityType: 'Assignment Marking',
        count: 1,
        status: 'Completed',
        remarks: `Graded submission for "${submission.assignment.title}"`,
        date: new Date()
      });
    } catch (actErr) {
      console.error('Failed to log instructor marking activity:', actErr);
    }

    // Notify student about the grade
    try {
      const Notification = (await import('@/models/Notification')).default;
      await Notification.create({
        student: submission.student,
        title: 'Assignment Graded',
        message: `Your submission for "${submission.assignment.title}" has been graded. Marks: ${marks}/${submission.assignment.totalMarks}`,
        type: 'grade',
        assignmentId: submission.assignment._id
      });
    } catch (notifyError) {
      console.error('Failed to create grade notification:', notifyError);
    }

    return successResponse(updatedSubmission, 'Submission graded successfully');
  } catch (error) {
    console.error('Grade submission error:', error);
    return errorResponse('Failed to grade submission', 'SERVER_ERROR', 500);
  }
}
