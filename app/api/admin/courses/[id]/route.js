import dbConnect from '@/dbConnect';
import Course from '@/models/Course';
import User from '@/models/User';
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
    const course = await Course.findById(id)
      .populate('instructor', 'name email department')
      .lean();
    if (!course) return errorResponse('Course not found', 'NOT_FOUND', 404);
    return successResponse(course, 'Course retrieved successfully');
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

    if (body.instructor) {
      const instructor = await User.findById(body.instructor);
      if (!instructor || instructor.role !== 'Instructor') {
        return errorResponse('Invalid instructor', 'NOT_FOUND', 404);
      }
    }

    const course = await Course.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).populate('instructor', 'name email');

    if (!course) return errorResponse('Course not found', 'NOT_FOUND', 404);
    return successResponse(course, 'Course updated successfully');
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
    const course = await Course.findByIdAndDelete(id);
    if (!course) return errorResponse('Course not found', 'NOT_FOUND', 404);
    return successResponse(null, 'Course deleted successfully');
  } catch (error) {
    const dbError = handleDbError(error);
    return errorResponse(dbError.message, dbError.error, dbError.status);
  }
}
