import dbConnect from '@/dbConnect';
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
    const submissions = await Submission.find({ student: authResult.user.id })
      .populate('assignment', 'title totalPoints')
      .populate('course', 'name code')
      .sort({ submittedAt: -1 })
      .lean();

    return successResponse(submissions, 'Submissions retrieved successfully');
  } catch (error) {
    console.error('Submissions GET error:', error);
    return errorResponse('Failed to retrieve submissions', 'SERVER_ERROR', 500);
  }
}

export async function POST(req) {
  try {
    const authResult = await studentAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    const { assignmentId, fileUrl, notes } = await req.json();

    if (!assignmentId || !fileUrl) {
      return errorResponse('Missing required fields', 'BAD_REQUEST', 400);
    }

    await dbConnect();

    // Verify assignment exists and get its course
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return errorResponse('Assignment not found', 'NOT_FOUND', 404);
    }

    // Check if already submitted
    const existingSubmission = await Submission.findOne({
      assignment: assignmentId,
      student: authResult.user.id
    });

    if (existingSubmission) {
      return errorResponse('Assignment already submitted', 'ALREADY_SUBMITTED', 400);
    }

    const submission = await Submission.create({
      assignment: assignmentId,
      student: authResult.user.id,
      course: assignment.course,
      fileUrl,
      feedback: notes || '', // Using feedback field for student notes temporarily or adding a new field
      status: 'Submitted',
      submittedAt: new Date()
    });

    return successResponse(submission, 'Assignment submitted successfully');
  } catch (error) {
    console.error('Submissions POST error:', error);
    return errorResponse('Failed to submit assignment', 'SERVER_ERROR', 500);
  }
}
