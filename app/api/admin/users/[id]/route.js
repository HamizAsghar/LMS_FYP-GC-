import dbConnect from '@/dbConnect';
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
    const user = await User.findById(id).select('-password').lean();
    if (!user) return errorResponse('User not found', 'NOT_FOUND', 404);

    return successResponse(user, 'User retrieved successfully');
  } catch (error) {
    return errorResponse('Failed to retrieve user', 'SERVER_ERROR', 500);
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

    const user = await User.findById(id);
    if (!user) return errorResponse('User not found', 'NOT_FOUND', 404);

    if (body.action === 'approve' && user.role === 'Instructor') {
      user.approvalStatus = 'Approved';
      user.isVerified = true;
      user.status = 'Active';
    } else if (body.action === 'reject' && user.role === 'Instructor') {
      user.approvalStatus = 'Rejected';
      user.status = 'Inactive';
    } else {
      if (body.status) user.status = body.status;
      if (body.approvalStatus) user.approvalStatus = body.approvalStatus;
      if (body.department !== undefined) user.department = body.department;
      if (body.name) user.name = body.name;
    }

    await user.save();
    const safe = await User.findById(id).select('-password').lean();
    return successResponse(safe, 'User updated successfully');
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
    const user = await User.findByIdAndDelete(id);
    if (!user) return errorResponse('User not found', 'NOT_FOUND', 404);

    return successResponse(null, 'User deleted successfully');
  } catch (error) {
    return errorResponse('Failed to delete user', 'SERVER_ERROR', 500);
  }
}
