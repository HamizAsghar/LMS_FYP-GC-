import dbConnect from '@/dbConnect';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { authMiddleware, errorResponse, successResponse } from '@/middleware/auth';

export async function POST(req) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword) {
      return errorResponse('Current and new passwords are required', 'VALIDATION_ERROR', 400);
    }

    await dbConnect();
    const user = await User.findById(authResult.user.id);
    if (!user) return errorResponse('User not found', 'NOT_FOUND', 404);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return errorResponse('Incorrect current password', 'INVALID_CREDENTIALS', 401);
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return successResponse(null, 'Password updated successfully');
  } catch (error) {
    console.error('Change password error:', error);
    return errorResponse('Failed to change password', 'SERVER_ERROR', 500);
  }
}
