import dbConnect from '@/dbConnect';
import Notification from '@/models/Notification';
import {
  instructorAuthMiddleware,
  errorResponse,
  successResponse,
} from '@/middleware/instructor';

export async function GET(req) {
  try {
    const authResult = await instructorAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();
    const notifications = await Notification.find({ user: authResult.user.id })
      .sort({ timestamp: -1 })
    const unreadCount = notifications.filter((n) => !n.read).length;
    const user = await (await import('@/models/User')).default.findById(authResult.user.id).select('name email').lean();

    return successResponse({ notifications, unreadCount, user }, 'Notifications retrieved successfully');
  } catch (error) {
    return errorResponse('Failed to retrieve notifications', 'SERVER_ERROR', 500);
  }
}

export async function PUT(req) {
  try {
    const authResult = await instructorAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();
    const { notificationId, markAll } = await req.json();

    if (markAll) {
      await Notification.updateMany(
        { user: authResult.user.id, read: false },
        { $set: { read: true } }
      );
      return successResponse(null, 'All notifications marked as read');
    }

    if (!notificationId) {
      return errorResponse('notificationId required', 'VALIDATION_ERROR', 400);
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: authResult.user.id },
      { $set: { read: true } },
      { new: true }
    );

    if (!notification) return errorResponse('Notification not found', 'NOT_FOUND', 404);
    return successResponse(notification, 'Notification marked as read');
  } catch (error) {
    return errorResponse('Failed to update notification', 'SERVER_ERROR', 500);
  }
}

export async function DELETE(req) {
  try {
    const authResult = await instructorAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const notificationId = searchParams.get('id');

    if (notificationId === 'all') {
      await Notification.deleteMany({ user: authResult.user.id });
      return successResponse(null, 'All notifications deleted successfully');
    }

    if (!notificationId) {
      return errorResponse('Notification id required', 'VALIDATION_ERROR', 400);
    }

    await Notification.findOneAndDelete({
      _id: notificationId,
      user: authResult.user.id,
    });

    return successResponse(null, 'Notification deleted successfully');
  } catch (error) {
    return errorResponse('Failed to delete notification', 'SERVER_ERROR', 500);
  }
}
