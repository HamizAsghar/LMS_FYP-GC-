import dbConnect from '@/dbConnect';
import Assignment from '@/models/Assignment';
import Submission from '@/models/Submission';
import {
  adminAuthMiddleware,
  errorResponse,
  successResponse,
  handleDbError,
} from '@/middleware/admin';

export async function GET(req, { params }) {
  try {
    const authResult = await adminAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();
    const { id } = await params;
    const assignment = await Assignment.findById(id)
      .populate('course', 'name code')
      .populate('instructor', 'name email')
      .lean();

    if (!assignment) return errorResponse('Assignment not found', 'NOT_FOUND', 404);

    assignment.submissionsCount = await Submission.countDocuments({ assignment: id });
    return successResponse(assignment, 'Assignment retrieved successfully');
  } catch (error) {
    const dbError = handleDbError(error);
    return errorResponse(dbError.message, dbError.error, dbError.status);
  }
}

export async function PUT(req, { params }) {
  try {
    const authResult = await adminAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    if (body.deadline) body.deadline = new Date(body.deadline);

    const assignment = await Assignment.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    )
      .populate('course', 'name code')
      .populate('instructor', 'name email');

    if (!assignment) return errorResponse('Assignment not found', 'NOT_FOUND', 404);
    return successResponse(assignment, 'Assignment updated successfully');
  } catch (error) {
    const dbError = handleDbError(error);
    return errorResponse(dbError.message, dbError.error, dbError.status);
  }
}

export async function DELETE(req, { params }) {
  try {
    const authResult = await adminAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();
    const { id } = await params;
    await Submission.deleteMany({ assignment: id });
    const assignment = await Assignment.findByIdAndDelete(id);
    if (!assignment) return errorResponse('Assignment not found', 'NOT_FOUND', 404);
    return successResponse(null, 'Assignment deleted successfully');
  } catch (error) {
    const dbError = handleDbError(error);
    return errorResponse(dbError.message, dbError.error, dbError.status);
  }
}
