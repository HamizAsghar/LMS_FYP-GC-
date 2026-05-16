import dbConnect from '@/dbConnect';
import Notification from '@/models/Notification';
import { studentAuthMiddleware, errorResponse, successResponse } from '@/middleware/student';

export async function GET(req) {
  try {
    const authResult = await studentAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    const studentId = authResult.user.id;
    await dbConnect();

    const notifications = await Notification.find({ user: studentId })
      .sort({ timestamp: -1 })
      .lean();

    const unreadCount = notifications.filter((n) => !n.read).length;
    return successResponse({ notifications, unreadCount }, 'Notifications retrieved successfully');
  } catch (error) {
    console.error('Student notifications error:', error);
    return errorResponse('Failed to retrieve notifications', 'SERVER_ERROR', 500);
  }
}

export async function PUT(req) {
  try {
    const authResult = await studentAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    const { notificationId, markAll } = await req.json();
    await dbConnect();

    if (markAll) {
      await Notification.updateMany(
        { user: authResult.user.id, read: false },
        { $set: { read: true } }
      );
      return successResponse(null, 'All notifications marked as read');
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: authResult.user.id },
      { $set: { read: true } },
      { new: true }
    );

    if (!notification) {
      return errorResponse('Notification not found', 'NOT_FOUND', 404);
    }

    return successResponse(notification, 'Notification marked as read');
  } catch (error) {
    console.error('Update notification error:', error);
    return errorResponse('Failed to update notification', 'SERVER_ERROR', 500);
  }
}

export async function DELETE(req) {
  try {
    const authResult = await studentAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    const { searchParams } = new URL(req.url);
    const notificationId = searchParams.get('id');
    if (!notificationId) {
      return errorResponse('Notification id required', 'VALIDATION_ERROR', 400);
    }

    await dbConnect();
    await Notification.findOneAndDelete({
      _id: notificationId,
      user: authResult.user.id,
    });

    return successResponse(null, 'Notification deleted successfully');
  } catch (error) {
    return errorResponse('Failed to delete notification', 'SERVER_ERROR', 500);
  }
}
