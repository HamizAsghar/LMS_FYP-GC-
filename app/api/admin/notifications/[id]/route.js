import dbConnect from '@/dbConnect';
import Notification from '@/models/Notification';
import {
  adminAuthMiddleware,
  errorResponse,
  successResponse,
  handleDbError,
} from '@/middleware/admin';

export async function PUT(req, { params }) {
  try {
    const authResult = await adminAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();
    const { id } = await params;
    const notification = await Notification.findByIdAndUpdate(
      id,
      { $set: { read: true } },
      { new: true }
    );
    if (!notification) return errorResponse('Notification not found', 'NOT_FOUND', 404);
    return successResponse(notification, 'Notification marked as read');
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
    const notification = await Notification.findByIdAndDelete(id);
    if (!notification) return errorResponse('Notification not found', 'NOT_FOUND', 404);
    return successResponse(null, 'Notification deleted successfully');
  } catch (error) {
    const dbError = handleDbError(error);
    return errorResponse(dbError.message, dbError.error, dbError.status);
  }
}
