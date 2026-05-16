import dbConnect from '@/dbConnect';
import User from '@/models/User';
import { adminAuthMiddleware, errorResponse, successResponse } from '@/middleware/admin';

export async function PUT(req) {
  try {
    const authResult = await adminAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();
    const { currentPassword, newPassword, confirmPassword } = await req.json();

    if (!currentPassword || !newPassword || !confirmPassword) {
      return errorResponse('All password fields are required', 'VALIDATION_ERROR', 400);
    }
    if (newPassword !== confirmPassword) {
      return errorResponse('Passwords do not match', 'VALIDATION_ERROR', 400);
    }
    if (newPassword.length < 6) {
      return errorResponse('Password must be at least 6 characters', 'VALIDATION_ERROR', 400);
    }

    const user = await User.findById(authResult.user.id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return errorResponse('Current password is incorrect', 'UNAUTHORIZED', 401);
    }

    user.password = newPassword;
    await user.save();

    return successResponse(null, 'Password updated successfully');
  } catch (error) {
    return errorResponse('Failed to update password', 'SERVER_ERROR', 500);
  }
}
