import dbConnect from '@/dbConnect';
import Notification from '@/models/Notification';
import { adminAuthMiddleware, errorResponse, successResponse } from '@/middleware/admin';

export async function POST(req) {
  try {
    const authResult = await adminAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();
    const result = await Notification.updateMany({ read: false }, { $set: { read: true } });
    return successResponse(
      { modifiedCount: result.modifiedCount },
      `${result.modifiedCount} notification(s) marked as read`
    );
  } catch (error) {
    return errorResponse('Failed to mark notifications as read', 'SERVER_ERROR', 500);
  }
}
